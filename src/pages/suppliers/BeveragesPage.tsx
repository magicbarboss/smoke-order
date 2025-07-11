import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { AddProductDialog } from "@/components/inventory/AddProductDialog";
import { ZeroStockDialog } from "@/components/inventory/ZeroStockDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product, StockLocation } from "@/types/inventory";
import { ShoppingCart, Clock, Building } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function BeveragesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [stockLevels, setStockLevels] = useState<Record<string, { bar: number; cellar: number }>>({});
  const { user, loading: authLoading } = useAuth();
  const { saveDraft, submitOrder, saving, submitting } = useOrders();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch products from database
  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Fetch products for Star Pubs supplier only
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', 'star-pubs')
        .order('category', { ascending: true });

      if (productsError) {
        console.error('Error fetching products:', productsError);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
        return;
      }

      // Fetch stock levels
      const { data: stockData, error: stockError } = await supabase
        .from('stock_levels')
        .select('*');

      if (stockError) {
        console.error('Error fetching stock levels:', stockError);
        toast({
          title: "Error", 
          description: "Failed to load stock levels",
          variant: "destructive",
        });
        return;
      }

      // Transform data to match Product interface
      const transformedProducts: Product[] = productsData.map(product => {
        // Find stock levels for this product
        const productStocks = stockData.filter(stock => stock.product_id === product.id);
        
        const stock: StockLocation = {
          bar: productStocks.find(s => s.location === 'bar')?.quantity || 0,
          cellar: productStocks.find(s => s.location === 'cellar')?.quantity || 0,
          holding: productStocks.find(s => s.location === 'holding')?.quantity || 0,
        };

        return {
          id: product.id,
          name: product.name,
          category: product.category,
          unit: product.unit,
          costPerUnit: Number(product.current_price),
          stock,
          reorderPoint: product.reorder_point || 0,
          supplierId: product.supplier_id,
        };
      });

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    const result = await saveDraft('beverages-supplier', items, totalWithVAT);
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
    const result = await submitOrder('beverages-supplier', items, totalWithVAT);
    console.log('Submit order result:', result);
    if (result.success) {
      setOrderQuantities({});
    }
  };

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Star Pubs & Bars</h1>
          <p className="text-muted-foreground">Premium beverages and bar supplies</p>
        </div>
        <div className="flex items-center gap-4">
          <AddProductDialog
            supplierId="star-pubs"
            supplierName="Star Pubs & Bars"
            existingCategories={Array.from(new Set(products.map(p => p.category)))}
            onProductAdded={fetchProducts}
          />
          <ZeroStockDialog
            supplierId="star-pubs"
            supplierName="Star Pubs & Bars"
            productCount={products.length}
            onComplete={fetchProducts}
          />
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Deadline: Thursday 4pm
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Delivery: Monday 10am-2pm
            </Badge>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Current Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-sm text-muted-foreground">Items</p>
            </div>
            <div>
              <div className="text-2xl font-bold">£{totalCost.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Subtotal</p>
            </div>
            <div>
              <div className="text-2xl font-bold">£{vatAmount.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">VAT (20%)</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">£{totalWithVAT.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button 
              disabled={totalItems === 0 || submitting} 
              onClick={handleSubmitOrder}
            >
              {submitting ? 'Submitting...' : 'Submit Order'}
            </Button>
            <Button 
              variant="outline" 
              disabled={totalItems === 0 || saving}
              onClick={handleSaveDraft}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button variant="ghost" disabled={totalItems === 0} onClick={() => {
              console.log('Clear clicked');
              setOrderQuantities({});
            }}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Beverages Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryTable
            products={products}
            showLocations={["bar", "cellar"]}
            onQuantityChange={handleQuantityChange}
            orderQuantities={orderQuantities}
            onStockChange={handleStockChange}
            stockLevels={stockLevels}
          />
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}