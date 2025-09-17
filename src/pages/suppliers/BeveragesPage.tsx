import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { AddProductDialog } from "@/components/inventory/AddProductDialog";
import { ZeroStockDialog } from "@/components/inventory/ZeroStockDialog";
import { ProductEditDialog } from "@/components/inventory/ProductEditDialog";
import { OrderHistoryDialog } from "@/components/inventory/OrderHistoryDialog";
import { StockCountingDialog } from "@/components/inventory/StockCountingDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Product, StockLocation } from "@/types/inventory";
import { ShoppingCart, Clock, Building, Search, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import { useStockLevels } from "@/hooks/useStockLevels";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BeveragesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { saveDraft, submitOrder, saving = false, submitting = false } = useOrders();
  const { orderHistory, getLastOrderInfo } = useOrderHistory('star-pubs');
  
  // Use the stock levels hook for auto-save functionality
  const productIds = products.map(p => p.id);
  const { stockLevels, updateStock, isLoading: stockLoading, isSaving } = useStockLevels(productIds);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('supplier_id', 'star-pubs');

        if (error) throw error;
        
        // Transform database products to match our Product interface
        const transformedProducts: Product[] = data.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category,
          unit: product.unit,
          costPerUnit: Number(product.current_price),
          stock: { bar: 0, cellar: 0, holding: 0, comingMon: 0 },
          reorderPoint: product.reorder_point || 0,
          supplierId: product.supplier_id
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  // Create category groupings - Updated based on actual product analysis
  const getCategoryGroup = (category: string, productName: string = ''): string => {
    const bottledCategories = ['Bottled Beer', 'Bottled Cider', 'Bottled Lager', 'Fruity Cider', 'No & Low Bottles'];
    const draughtCategories = ['Craft Draught Keg', 'Draught Keg'];
    const softDrinkCategories = ['Soft Bottles Single Serve'];
    
    if (bottledCategories.includes(category)) return 'BOTTLED';
    if (draughtCategories.includes(category)) return 'DRAUGHT';
    if (softDrinkCategories.includes(category)) return 'SOFT DRINKS';
    if (category === 'Mixers') return 'MIXERS';
    
    // Distinguish between Post-Mix (actual post-mix systems) and Mixers (cordials)
    if (category === 'Post-Mix' || productName.toLowerCase().includes('postmix')) {
      return 'POST-MIX';
    }
    if (category === 'Cordials/Post-Mix') {
      // Blackcurrent and Lime are mixers, not post-mix
      return 'MIXERS';
    }
    
    return category;
  };

  // Get product locations based on category
  const getProductLocations = (category: string, productName: string = ''): string[] => {
    const categoryGroup = getCategoryGroup(category, productName);
    
    // Post-Mix and Draught are cellar-only
    if (categoryGroup === 'POST-MIX' || categoryGroup === 'DRAUGHT') {
      return ['cellar'];
    }
    
    // All other products show both bar and cellar
    return ['bar', 'cellar'];
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setOrderQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  const handleStockChange = (productId: string, location: string, quantity: number) => {
    if (location === 'bar' || location === 'cellar') {
      updateStock(productId, location, quantity);
    }
  };

  // Get unique category groups for filter
  const categories = useMemo(() => {
    const categoryGroups = products.map(p => getCategoryGroup(p.category, p.name));
    return Array.from(new Set(categoryGroups)).sort();
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const productCategoryGroup = getCategoryGroup(product.category, product.name);
      const matchesCategory = selectedCategory === "all" || productCategoryGroup === selectedCategory;
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
    console.log('Save Draft clicked', { orderQuantities, totalItems });
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

    console.log('Items to save:', items);
    const result = await saveDraft('star-pubs', items, totalWithVAT);
    console.log('Save draft result:', result);
  };

  const handleSubmitOrder = async () => {
    console.log('Submit Order clicked', { orderQuantities, totalItems });
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

    console.log('Items to submit:', items);
    const result = await submitOrder('star-pubs', items, totalWithVAT);
    console.log('Submit order result:', result);
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
          <h1 className="text-3xl font-bold text-foreground">Star Pubs-Heineken</h1>
          <p className="text-muted-foreground">Bottled beers, ciders, ales, and minerals</p>
        </div>
        <div className="flex items-center gap-4">
          <StockCountingDialog
            products={products}
            stockLevels={stockLevels}
            onStockChange={handleStockChange}
            getCategoryGroup={getCategoryGroup}
            getProductLocations={getProductLocations}
            isSaving={isSaving}
          />
          <AddProductDialog
            supplierId="star-pubs"
            supplierName="Star Pubs & Bars"
            existingCategories={categories}
            onProductAdded={() => {}}
          />
          <ZeroStockDialog
            supplierId="star-pubs"
            supplierName="Star Pubs & Bars"
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
            supplierName="Star Pubs & Bars"
            existingCategories={categories}
            onProductsUpdated={() => {}}
          />
          <OrderHistoryDialog
            supplierId="star-pubs"
            supplierName="Star Pubs & Bars"
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
            <span className="font-medium">Deadline: Thursday 4pm</span>
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
              onClick={() => {
                console.log('Clear clicked');
                setOrderQuantities({});
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
          <CardTitle className="text-xl text-foreground">Beverages Inventory</CardTitle>
          <p className="text-sm text-muted-foreground">
            Bottled beers, ciders, ales, and minerals. Pack quantities automatically detected.
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