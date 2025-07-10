import { useState } from "react";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/inventory";
import { ShoppingCart, Clock, Building } from "lucide-react";

// Mock data for St Austell spirits with bottle/tenth tracking
const mockProducts: Product[] = [
  {
    id: "whiskey-1",
    name: "Jameson Irish Whiskey 70cl",
    category: "Whiskey",
    unit: "bottle",
    costPerUnit: 24.50,
    stock: { bar: 0.3, cellar: 2.1, holding: 0 },
    reorderPoint: 1.5,
    supplierId: "st-austell"
  },
  {
    id: "gin-1", 
    name: "Tanqueray London Dry 70cl",
    category: "Gin",
    unit: "bottle",
    costPerUnit: 28.90,
    stock: { bar: 0.7, cellar: 1.2, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "vodka-1",
    name: "Grey Goose 70cl",
    category: "Vodka", 
    unit: "bottle",
    costPerUnit: 45.30,
    stock: { bar: 0.2, cellar: 0.8, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "rum-1",
    name: "Bacardi Carta Blanca 70cl",
    category: "Rum",
    unit: "bottle",
    costPerUnit: 22.40,
    stock: { bar: 0.9, cellar: 2.3, holding: 0 },
    reorderPoint: 1.5,
    supplierId: "st-austell"
  },
  {
    id: "wine-1",
    name: "Sauvignon Blanc 75cl",
    category: "White Wine",
    unit: "bottle",
    costPerUnit: 12.80,
    stock: { bar: 2, cellar: 8, holding: 0 },
    reorderPoint: 6,
    supplierId: "st-austell"
  },
];

export default function SpiritsPage() {
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (productId: string, quantity: number) => {
    setOrderQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  const totalItems = Object.values(orderQuantities).reduce((sum, qty) => sum + qty, 0);
  const totalCost = mockProducts.reduce((sum, product) => {
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
            products={mockProducts}
            showLocations={["bar", "cellar"]}
            onQuantityChange={handleQuantityChange}
            orderQuantities={orderQuantities}
          />
        </CardContent>
      </Card>
    </div>
  );
}