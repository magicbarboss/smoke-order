import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { useOrders } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Settings, ShoppingCart, Clock, Building } from "lucide-react";

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
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [stockLevels, setStockLevels] = useState<Record<string, StockLevel[]>>({});
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});

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
      
      // Initialize editing prices
      const initialPrices: Record<string, number> = {};
      productsData?.forEach(product => {
        initialPrices[product.id] = product.current_price;
      });
      setEditingPrices(initialPrices);
      
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
    console.log('🔄 Quantity change:', { productId, quantity, user: user?.id });
    setOrderQuantities(prev => {
      const newQuantities = {
        ...prev,
        [productId]: quantity,
      };
      console.log('📦 Updated order quantities:', newQuantities);
      return newQuantities;
    });
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
  
  console.log('📊 Order Summary:', { 
    orderQuantities, 
    orderItems: orderItems.length, 
    totalItems,
    user: user?.id
  });
  
  const subtotal = orderItems.reduce((sum, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return sum + (product ? product.current_price * quantity : 0);
  }, 0);
  
  const vatRate = 0.20;
  const vatAmount = subtotal * vatRate;
  const totalWithVAT = subtotal + vatAmount;

  const handleSaveDraft = async () => {
    console.log('💾 Save Draft clicked:', { 
      user: user?.id, 
      totalItems, 
      orderItems: orderItems.length,
      orderQuantities 
    });

    if (!user) {
      console.error('❌ No user authenticated');
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save orders.",
        variant: "destructive",
      });
      return;
    }

    const items = orderItems.map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      const item = {
        productId,
        quantity,
        unitPrice: product?.current_price || 0,
        totalPrice: (product?.current_price || 0) * quantity,
      };
      console.log('📝 Order item:', item, 'Product:', product?.name);
      return item;
    });

    console.log('📤 Sending draft order:', { items, totalWithVAT });
    
    try {
      const result = await saveDraft('st-austell', items, totalWithVAT);
      console.log('✅ Save draft result:', result);
      
      if (result.success) {
        setOrderQuantities({});
        toast({
          title: "Draft Saved",
          description: "Order draft saved successfully.",
        });
      } else {
        console.error('❌ Save draft failed:', result.error);
        toast({
          title: "Save Failed",
          description: result.error?.message || "Failed to save draft. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Save draft error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitOrder = async () => {
    console.log('🚀 Submit Order clicked:', { 
      user: user?.id, 
      totalItems, 
      orderItems: orderItems.length,
      orderQuantities 
    });

    if (!user) {
      console.error('❌ No user authenticated');
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit orders.",
        variant: "destructive",
      });
      return;
    }

    const items = orderItems.map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      const item = {
        productId,
        quantity,
        unitPrice: product?.current_price || 0,
        totalPrice: (product?.current_price || 0) * quantity,
      };
      console.log('📝 Order item:', item, 'Product:', product?.name);
      return item;
    });

    console.log('📤 Submitting order:', { items, totalWithVAT });
    
    try {
      const result = await submitOrder('st-austell', items, totalWithVAT);
      console.log('✅ Submit order result:', result);
      
      if (result.success) {
        setOrderQuantities({});
        toast({
          title: "Order Submitted",
          description: "Order submitted successfully.",
        });
      } else {
        console.error('❌ Submit order failed:', result.error);
        toast({
          title: "Submit Failed",
          description: result.error?.message || "Failed to submit order. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Submit order error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while submitting.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePrices = async () => {
    try {
      const updates = Object.entries(editingPrices).map(([productId, price]) => {
        const originalProduct = products.find(p => p.id === productId);
        if (originalProduct && originalProduct.current_price !== price) {
          return { id: productId, price: price, oldPrice: originalProduct.current_price };
        }
        return null;
      }).filter(Boolean);

      if (updates.length === 0) {
        toast({
          title: "No Changes",
          description: "No price changes to save.",
        });
        return;
      }

      // Update prices in database
      for (const update of updates) {
        if (update) {
          const { error } = await supabase
            .from('products')
            .update({ current_price: update.price })
            .eq('id', update.id);

          if (error) throw error;
        }
      }

      // Refresh products
      await fetchProducts();
      setIsPriceDialogOpen(false);

      toast({
        title: "Prices Updated",
        description: `Successfully updated ${updates.length} product prices.`,
      });
    } catch (error) {
      console.error('Error updating prices:', error);
      toast({
        title: "Error",
        description: "Failed to update prices. Please try again.",
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

  // Transform products to match InventoryTable format
  const transformedProducts = products.map(product => {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">St Austell</h1>
          <p className="text-muted-foreground">Account: 764145 | Spirits & Wines</p>
        </div>
        <div className="flex items-center space-x-4">
          <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Update Prices
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Update Product Prices</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                {products.map(product => (
                  <div key={product.id} className="grid grid-cols-3 gap-4 items-center">
                    <div>
                      <span className="text-sm font-medium">{product.name}</span>
                      <div className="text-xs text-muted-foreground">{product.category}</div>
                    </div>
                    <div className="text-sm">
                      Current: £{product.current_price.toFixed(2)}
                    </div>
                    <div>
                      <Label htmlFor={`price-${product.id}`} className="sr-only">
                        New price for {product.name}
                      </Label>
                      <Input
                        id={`price-${product.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingPrices[product.id] || 0}
                        onChange={(e) => setEditingPrices(prev => ({
                          ...prev,
                          [product.id]: parseFloat(e.target.value) || 0
                        }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsPriceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdatePrices}>
                    Update Prices
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Badge variant="destructive" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Deadline: Sunday 12pm
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Delivery: Monday 10am-2pm
          </Badge>
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
              <p className="text-sm text-muted-foreground">Bottles</p>
            </div>
            <div>
              <div className="text-2xl font-bold">£{subtotal.toFixed(2)}</div>
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
            <Button 
              variant="ghost" 
              disabled={totalItems === 0} 
              onClick={() => {
                console.log('🗑️ Clear button clicked');
                setOrderQuantities({});
                toast({
                  title: "Order Cleared",
                  description: "Order quantities have been cleared.",
                });
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Spirits & Wine Inventory</CardTitle>
          <p className="text-sm text-muted-foreground">
            Stock levels shown in bottles (decimals represent partial bottles in tenths)
          </p>
        </CardHeader>
        <CardContent>
          <InventoryTable
            products={transformedProducts}
            showLocations={["bar", "cellar"]}
            onQuantityChange={handleQuantityChange}
            orderQuantities={orderQuantities}
            onStockChange={handleStockChange}
            stockLevels={{}}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SpiritsPage;