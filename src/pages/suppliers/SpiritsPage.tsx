import { useState, useMemo } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { AddProductDialog } from "@/components/inventory/AddProductDialog";
import { ZeroStockDialog } from "@/components/inventory/ZeroStockDialog";
import { ProductEditDialog } from "@/components/inventory/ProductEditDialog";
import { OrderHistoryDialog } from "@/components/inventory/OrderHistoryDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Product } from "@/types/inventory";
import { ShoppingCart, Clock, Building, Search, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { Toaster } from "@/components/ui/toaster";
import { stAustellProducts } from "@/data/st-austell-products";
import { toast } from "@/hooks/use-toast";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SpiritsPage() {
  const [products] = useState<Product[]>(stAustellProducts);
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [stockLevels, setStockLevels] = useState<Record<string, { bar: number; cellar: number }>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user, loading: authLoading } = useAuth();
  const { saveDraft, submitOrder, saving, submitting } = useOrders();
  const { orderHistory, getLastOrderInfo } = useOrderHistory('st-austell', 7);
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/auth" />;
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    setOrderQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  const handleStockChange = (productId: string, location: string, quantity: number) => {
    setStockLevels(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [location]: quantity
      }
    }));
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

  const totalItems = Object.values(orderQuantities).reduce((sum, qty) => sum + qty, 0);
  const totalCost = products.reduce((sum, product) => {
    const qty = orderQuantities[product.id] || 0;
    return sum + (qty * product.costPerUnit);
  }, 0);

  const vatAmount = totalCost * 0.2;
  const totalWithVAT = totalCost + vatAmount;

  const handleSaveDraft = async () => {
    const items = Object.entries(orderQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId)!;
        return {
          productId,
          quantity,
          unitPrice: product.costPerUnit,
          totalPrice: quantity * product.costPerUnit,
        };
      });

    await saveDraft('st-austell', items, totalWithVAT);
  };

  const handleSubmitOrder = async () => {
    const items = Object.entries(orderQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId)!;
        return {
          productId,
          quantity,
          unitPrice: product.costPerUnit,
          totalPrice: quantity * product.costPerUnit,
        };
      });

    const result = await submitOrder('st-austell', items, totalWithVAT);
    if (result.success) {
      setOrderQuantities({});
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">St Austell Brewery</h1>
          <p className="text-muted-foreground">Spirits and wines with new category structure</p>
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
            products={products.map(p => ({
              id: p.id,
              name: p.name,
              category: p.category,
              unit: p.unit,
              current_price: p.costPerUnit,
              reorder_point: p.reorderPoint,
              supplier_id: p.supplierId,
            }))}
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
              <div className="text-3xl font-bold text-foreground">£{totalCost.toFixed(2)}</div>
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
              onClick={() => setOrderQuantities({})}
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
          <CardTitle className="text-xl text-foreground">Spirits & Wines Inventory</CardTitle>
          <p className="text-sm text-muted-foreground">
            Spirits (25ml measures) and wines. Bottle quantities automatically detected.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <InventoryTable
            products={filteredProducts}
            showLocations={["bar", "cellar"]}
            onQuantityChange={handleQuantityChange}
            orderQuantities={orderQuantities}
            onStockChange={handleStockChange}
            stockLevels={stockLevels}
            orderHistory={Object.fromEntries(
              Object.entries(orderHistory).map(([productId, items]) => [
                productId,
                getLastOrderInfo(productId)
              ])
            )}
          />
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}