import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { AddProductDialog } from "@/components/inventory/AddProductDialog";
import { ZeroStockDialog } from "@/components/inventory/ZeroStockDialog";
import { useOrders } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { stAustellProducts } from "@/data/st-austell-products";
import { Navigate } from "react-router-dom";
import { Settings, ShoppingCart, Clock, Building, Search, Filter } from "lucide-react";
import { ProductEditDialog } from "@/components/inventory/ProductEditDialog";
import { OrderHistoryDialog } from "@/components/inventory/OrderHistoryDialog";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_price: number;
  reorder_point: number;
  supplier_id: string;
}

interface StockLevel {
  location: string;
  quantity: number;
}

const SpiritsPage = () => {
  const { user, loading } = useAuth();
  const { saveDraft, submitOrder, saving, submitting } = useOrders();
  const { orderHistory, getLastOrderInfo } = useOrderHistory('st-austell', 7);
  const { toast } = useToast();
  
  const [products] = useState<Product[]>(stAustellProducts);
  const [stockLevels, setStockLevels] = useState<Record<string, StockLevel[]>>({});
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', 'st-austell')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (productsError) throw productsError;

      // Fetch stock levels
      const { data: stockData, error: stockError } = await supabase
        .from('stock_levels')
        .select('product_id, location, quantity')
        .in('product_id', productsData?.map(p => p.id) || []);

      if (stockError) throw stockError;

      // Group stock levels by product
      const stockByProduct: Record<string, StockLevel[]> = {};
      stockData?.forEach(stock => {
        if (!stockByProduct[stock.product_id]) {
          stockByProduct[stock.product_id] = [];
        }
        stockByProduct[stock.product_id].push({
          location: stock.location,
          quantity: stock.quantity
        });
      });

      setProducts(productsData || []);
      setStockLevels(stockByProduct);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setOrderQuantities(prev => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  const handleStockChange = async (productId: string, location: string, quantity: number) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('stock_levels')
        .update({ quantity })
        .eq('product_id', productId)
        .eq('location', location);

      if (error) throw error;

      // Update local state
      setStockLevels(prev => ({
        ...prev,
        [productId]: prev[productId]?.map(stock => 
          stock.location === location 
            ? { ...stock, quantity }
            : stock
        ) || []
      }));

      toast({
        title: "Stock Updated",
        description: `${location} stock updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error",
        description: "Failed to update stock. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate order summary
  const orderItems = Object.entries(orderQuantities).filter(([_, quantity]) => quantity > 0);
  const totalItems = orderItems.reduce((sum, [_, quantity]) => sum + quantity, 0);
  
  const subtotal = orderItems.reduce((sum, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return sum + (product ? product.current_price * quantity : 0);
  }, 0);
  
  const vatRate = 0.20;
  const vatAmount = subtotal * vatRate;
  const totalWithVAT = subtotal + vatAmount;

  const handleSaveDraft = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save orders.",
        variant: "destructive",
      });
      return;
    }

    const items = orderItems.map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return {
        productId,
        quantity,
        unitPrice: product?.current_price || 0,
        totalPrice: (product?.current_price || 0) * quantity,
      };
    });
    
    try {
      const result = await saveDraft('st-austell', items, totalWithVAT);
      
      if (result.success) {
        toast({
          title: "Draft Saved",
          description: "Order draft saved successfully. Continue editing or submit when ready.",
        });
      } else {
        toast({
          title: "Save Failed",
          description: result.error?.message || "Failed to save draft. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit orders.",
        variant: "destructive",
      });
      return;
    }

    const items = orderItems.map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return {
        productId,
        quantity,
        unitPrice: product?.current_price || 0,
        totalPrice: (product?.current_price || 0) * quantity,
      };
    });
    
    try {
      const result = await submitOrder('st-austell', items, totalWithVAT);
      
      if (result.success) {
        setOrderQuantities({});
        toast({
          title: "Order Submitted",
          description: "Order submitted successfully.",
        });
      } else {
        toast({
          title: "Submit Failed",
          description: result.error?.message || "Failed to submit order. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while submitting.",
        variant: "destructive",
      });
    }
  };


  if (loading || isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    return uniqueCategories.sort();
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Transform products to match InventoryTable format
  const transformedProducts = filteredProducts.map(product => {
    const productStockLevels = stockLevels[product.id] || [];
    const stockByLocation = productStockLevels.reduce((acc, stock) => {
      acc[stock.location] = stock.quantity;
      return acc;
    }, {} as Record<string, number>);

    return {
      id: product.id,
      name: product.name,
      category: product.category,
      unit: product.unit,
      costPerUnit: product.current_price,
      stock: {
        bar: stockByLocation.bar || 0,
        cellar: stockByLocation.cellar || 0,
        holding: stockByLocation.holding || 0,
        comingMon: stockByLocation.comingMon || 0,
      },
      reorderPoint: product.reorder_point,
      supplierId: product.supplier_id,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">St Austell Brewery</h1>
          <p className="text-muted-foreground">Account: 764145 | Spirits & Wines</p>
        </div>
        <div className="flex items-center gap-4">
          <AddProductDialog
            supplierId="st-austell"
            supplierName="St Austell Brewery"
            existingCategories={categories}
            onProductAdded={() => {}}
          />
          <ZeroStockDialog
            supplierId="st-austell"
            supplierName="St Austell Brewery"
            productCount={products.length}
            onComplete={() => {}}
          />
          <ProductEditDialog
            products={products}
            supplierName="St Austell Brewery"
            existingCategories={categories}
            onProductsUpdated={() => {}}
          />
          <OrderHistoryDialog
            supplierId="st-austell"
            supplierName="St Austell Brewery"
            onQuickReorder={(productId, quantity) => {
              setOrderQuantities(prev => ({
                ...prev,
                [productId]: (prev[productId] || 0) + quantity,
              }));
            }}
          />
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium">Deadline: Sunday 12pm</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
            <Building className="h-4 w-4 text-primary" />
            <span className="font-medium">Delivery: Monday 10am-2pm</span>
          </Badge>
        </div>
      </div>

      {/* Order Summary */}
      <Card className="border-2 border-primary/10 bg-gradient-to-r from-background to-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Current Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalItems}</div>
              <p className="text-sm text-muted-foreground font-medium">Items</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">£{subtotal.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground font-medium">Subtotal</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground">£{vatAmount.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground font-medium">VAT (20%)</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">£{totalWithVAT.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground font-medium">Total</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-center">
            <Button 
              disabled={totalItems === 0 || submitting} 
              onClick={handleSubmitOrder}
              size="lg"
              className="px-8"
            >
              {submitting ? 'Submitting...' : 'Submit Order'}
            </Button>
            <Button 
              variant="outline" 
              disabled={totalItems === 0 || saving}
              onClick={handleSaveDraft}
              size="lg"
              className="px-8"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              variant="ghost" 
              disabled={totalItems === 0} 
              onClick={() => {
                setOrderQuantities({});
                toast({
                  title: "Order Cleared",
                  description: "Order quantities have been cleared.",
                });
              }}
              size="lg"
              className="px-8"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Filter className="h-5 w-5 text-primary" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-foreground">Spirits & Wine Inventory</CardTitle>
          <p className="text-sm text-muted-foreground">
            Stock levels shown in bottles. Case quantities automatically detected.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <InventoryTable
            products={transformedProducts}
            showLocations={["bar", "cellar"]}
            onQuantityChange={handleQuantityChange}
            orderQuantities={orderQuantities}
            onStockChange={handleStockChange}
            stockLevels={Object.fromEntries(
              Object.entries(stockLevels).map(([productId, stocks]) => [
                productId,
                {
                  bar: stocks.find(s => s.location === 'bar')?.quantity || 0,
                  cellar: stocks.find(s => s.location === 'cellar')?.quantity || 0,
                }
              ])
            )}
            orderHistory={Object.fromEntries(
              Object.entries(orderHistory).map(([productId, items]) => [
                productId,
                getLastOrderInfo(productId)
              ])
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SpiritsPage;