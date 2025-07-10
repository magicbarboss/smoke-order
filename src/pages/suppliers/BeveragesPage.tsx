import { useState } from "react";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/inventory";
import { ShoppingCart, Clock, Building } from "lucide-react";

// Mock data for Star Pubs-Heineken
const mockProducts: Product[] = [
  {
    id: "beer-1",
    name: "Heineken 50L Keg",
    category: "Lager",
    unit: "keg",
    costPerUnit: 145.50,
    stock: { bar: 1, cellar: 2, holding: 0, comingMon: 1 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  {
    id: "beer-2", 
    name: "John Smith's 11g Cask",
    category: "Bitter",
    unit: "cask",
    costPerUnit: 58.90,
    stock: { bar: 0, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "cider-1",
    name: "Strongbow 50L Keg",
    category: "Cider", 
    unit: "keg",
    costPerUnit: 125.30,
    stock: { bar: 0, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "bottles-1",
    name: "Heineken 24x330ml",
    category: "Bottles",
    unit: "case",
    costPerUnit: 28.40,
    stock: { bar: 3, cellar: 12, holding: 0, comingMon: 2 },
    reorderPoint: 8,
    supplierId: "star-pubs"
  },
];

export default function BeveragesPage() {
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
          <h1 className="text-3xl font-bold">Star Pubs-Heineken</h1>
          <p className="text-muted-foreground">Account: 525701</p>
        </div>
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
          <CardTitle>Beverages Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryTable
            products={mockProducts}
            showLocations={["bar", "cellar", "holding", "comingMon"]}
            onQuantityChange={handleQuantityChange}
            orderQuantities={orderQuantities}
          />
        </CardContent>
      </Card>
    </div>
  );
}