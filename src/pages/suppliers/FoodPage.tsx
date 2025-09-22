import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOrders } from "@/hooks/useOrders";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { ProductEditDialog } from "@/components/inventory/ProductEditDialog";
import { OrderHistoryDialog } from "@/components/inventory/OrderHistoryDialog";
import { StockCountingDialog } from "@/components/inventory/StockCountingDialog";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import { useStockLevels } from "@/hooks/useStockLevels";
import { suppliers } from "@/data/suppliers";
import { Settings, History, ShoppingCart, CalendarClock, Search, Filter, Clock, Building, Package, Calculator } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_price: number;
  reorder_point: number;
  supplier_id: string;
  // For compatibility with InventoryTable
  costPerUnit: number;
  stock: { bar: number; cellar: number; holding?: number; comingMon?: number };
  supplierId: string;
  reorderPoint: number;
  discontinued?: boolean;
}

export default function FoodPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  const { submitOrder } = useOrders();
  const { orderHistory, getLastOrderInfo } = useOrderHistory("salvo-charles");

  // Get product IDs for stock levels
  const productIds = products.map(p => p.id);
  const { stockLevels, updateStock } = useStockLevels(productIds);

  const supplier = suppliers.find(s => s.id === "salvo-charles");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('supplier_id', ['salvo-charles', 'salvo', 'charles-saunders'])
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      // Transform data to match InventoryTable expectations
      const transformedProducts = (data || []).map(product => ({
        ...product,
        costPerUnit: product.current_price,
        stock: { bar: 0, cellar: 0, holding: 0, comingMon: 0 },
        supplierId: product.supplier_id,
        reorderPoint: product.reorder_point,
        discontinued: product.discontinued || false
      }));
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setOrderQuantities(prev => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  const handleStockChange = (productId: string, location: string, quantity: number) => {
    updateStock(productId, location as 'bar' | 'cellar', quantity);
  };

  const handleCreateOrder = async () => {
    const itemsToOrder = Object.entries(orderQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return product ? {
          productId,
          quantity,
          unitPrice: product.current_price,
          totalPrice: quantity * product.current_price,
        } : null;
      })
      .filter(Boolean) as { productId: string; quantity: number; unitPrice: number; totalPrice: number; }[];

    if (itemsToOrder.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to order.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await submitOrder('salvo-charles', itemsToOrder, totalCost);
      if (result.success) {
        setOrderQuantities({});
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

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

  const hasItems = Object.values(orderQuantities).some(qty => qty > 0);
  const totalCost = Object.entries(orderQuantities).reduce((total, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return total + (product ? quantity * product.current_price : 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading food products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground">{supplier?.name}</h1>
          <p className="text-sm md:text-base text-muted-foreground">Food ordering list - Via App by 8pm night before</p>
        </div>
        <div className="flex gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <a href="/stock-count" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Full Stock Count
              </a>
            </Button>

          <OrderHistoryDialog 
            supplierId="salvo-charles"
            supplierName={supplier?.name || "Salvo & Charles"}
            trigger={
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                Order History
              </Button>
            }
          />
          
          <ProductEditDialog
            products={products}
            supplierName={supplier?.name || "Salvo & Charles"}
            existingCategories={categories}
            onProductsUpdated={fetchProducts}
            trigger={
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Edit Products
              </Button>
            }
          />
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium">Deadline: {supplier?.deadline}</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
            <Building className="h-4 w-4 text-primary" />
            <span className="font-medium">Account: {supplier?.account}</span>
          </Badge>
        </div>
      </div>

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

      <div className="grid gap-6">
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Food Products
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Track stock levels and place orders. Case quantities automatically detected.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <InventoryTable
              products={filteredProducts}
              orderQuantities={orderQuantities}
              onQuantityChange={handleQuantityChange}
              showLocations={["bar", "cellar"]}
              onStockChange={handleStockChange}
              stockLevels={Object.fromEntries(
                Object.entries(stockLevels).map(([id, levels]) => [
                  id,
                  { bar: levels.bar || 0, cellar: levels.cellar || 0 }
                ])
              )}
              orderHistory={Object.fromEntries(
                filteredProducts.map(product => [
                  product.id,
                  getLastOrderInfo(product.id)
                ])
              )}
            />
          </CardContent>
        </Card>

        {hasItems && (
          <Card className="border-2 border-primary/10 bg-gradient-to-r from-background to-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-foreground">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Order Summary
                </span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  £{totalCost.toFixed(2)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {Object.entries(orderQuantities)
                  .filter(([_, quantity]) => quantity > 0)
                  .map(([productId, quantity]) => {
                    const product = products.find(p => p.id === productId);
                    if (!product) return null;
                    
                    return (
                      <div key={productId} className="flex justify-between text-sm p-2 rounded-md bg-muted/50">
                        <span className="font-medium">{product.name} x {quantity}</span>
                        <span className="text-primary font-semibold">£{(quantity * product.current_price).toFixed(2)}</span>
                      </div>
                    );
                  })}
              </div>
              <Button onClick={handleCreateOrder} className="w-full" size="lg">
                Create Order - £{totalCost.toFixed(2)}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}