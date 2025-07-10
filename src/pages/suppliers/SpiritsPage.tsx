import { useState } from "react";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/inventory";
import { ShoppingCart, Clock, Building } from "lucide-react";
import { stAustellProducts } from "@/data/st-austell-products";

export default function SpiritsPage() {
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [stockLevels, setStockLevels] = useState<Record<string, { bar: number; cellar: number }>>({});

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
  const totalCost = stAustellProducts.reduce((sum, product) => {
    const qty = orderQuantities[product.id] || 0;
    return sum + (qty * product.costPerUnit);
  }, 0);

  const vatAmount = totalCost * 0.2;
  const totalWithVAT = totalCost + vatAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">St Austell</h1>
          <p className="text-muted-foreground">Account: 764145 | Spirits & Wines</p>
        </div>
        <div className="flex items-center space-x-4">
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
            <Button disabled={totalItems === 0}>
              Submit Order
            </Button>
            <Button variant="outline" disabled={totalItems === 0}>
              Save Draft
            </Button>
            <Button variant="ghost" disabled={totalItems === 0} onClick={() => setOrderQuantities({})}>
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
            products={stAustellProducts}
            showLocations={["bar", "cellar"]}
            onQuantityChange={handleQuantityChange}
            orderQuantities={orderQuantities}
            onStockChange={handleStockChange}
            stockLevels={stockLevels}
          />
        </CardContent>
      </Card>
    </div>
  );
}