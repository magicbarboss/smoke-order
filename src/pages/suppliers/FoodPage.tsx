import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { ProductEditDialog } from "@/components/inventory/ProductEditDialog";
import { OrderHistoryDialog } from "@/components/inventory/OrderHistoryDialog";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import { suppliers } from "@/data/suppliers";
import { Settings, History, ShoppingCart, CalendarClock } from "lucide-react";

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
}

export default function FoodPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const { submitOrder } = useOrders();
  const { orderHistory, getLastOrderInfo } = useOrderHistory("salvo-charles");

  const supplier = suppliers.find(s => s.id === "salvo-charles");

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', 'salvo-charles')
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

  const hasItems = Object.values(orderQuantities).some(qty => qty > 0);
  const totalCost = Object.entries(orderQuantities).reduce((total, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return total + (product ? quantity * product.current_price : 0);
  }, 0);

  const existingCategories = Array.from(new Set(products.map(p => p.category)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading food products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{supplier?.name}</h1>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarClock className="h-4 w-4" />
              Deadline: {supplier?.deadline}
            </div>
            <div>Account: {supplier?.account}</div>
            <div>Delivery: {supplier?.deliveryWindow}</div>
          </div>
          <p className="text-muted-foreground mt-1">
            Food ordering list - Via App by 8pm night before
          </p>
        </div>
        
        <div className="flex gap-2">
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
            existingCategories={existingCategories}
            onProductsUpdated={fetchProducts}
            trigger={
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Edit Products
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Food Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InventoryTable
              products={products}
              orderQuantities={orderQuantities}
              onQuantityChange={handleQuantityChange}
              showLocations={["holding"]}
              orderHistory={Object.fromEntries(
                products.map(product => [
                  product.id,
                  getLastOrderInfo(product.id)
                ])
              )}
            />
          </CardContent>
        </Card>

        {hasItems && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Summary</span>
                <Badge variant="secondary">
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
                      <div key={productId} className="flex justify-between text-sm">
                        <span>{product.name} x {quantity}</span>
                        <span>£{(quantity * product.current_price).toFixed(2)}</span>
                      </div>
                    );
                  })}
              </div>
              <Button onClick={handleCreateOrder} className="w-full">
                Create Order - £{totalCost.toFixed(2)}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}