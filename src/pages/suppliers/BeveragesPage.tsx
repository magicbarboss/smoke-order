import { useState } from "react";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/inventory";
import { ShoppingCart, Clock, Building } from "lucide-react";

// Star Pubs-Heineken inventory from uploaded data
const mockProducts: Product[] = [
  // Cordials/Post-Mix
  {
    id: "cord-1",
    name: "Diet Coke Box",
    category: "Cordials/Post-Mix",
    unit: "case",
    costPerUnit: 72.21,
    stock: { bar: 1, cellar: 2, holding: 0, comingMon: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  {
    id: "cord-2",
    name: "Sweppes Lemon Box",
    category: "Cordials/Post-Mix",
    unit: "case",
    costPerUnit: 78.46,
    stock: { bar: 0, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "cord-3",
    name: "Coke Zero Box",
    category: "Cordials/Post-Mix",
    unit: "case",
    costPerUnit: 61.67,
    stock: { bar: 1, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "cord-4",
    name: "Blackcurrent 12Pack",
    category: "Cordials/Post-Mix",
    unit: "case",
    costPerUnit: 25.07,
    stock: { bar: 2, cellar: 4, holding: 0, comingMon: 0 },
    reorderPoint: 3,
    supplierId: "star-pubs"
  },
  {
    id: "cord-5",
    name: "Lime 12Pack",
    category: "Cordials/Post-Mix",
    unit: "case",
    costPerUnit: 24.19,
    stock: { bar: 1, cellar: 3, holding: 0, comingMon: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  // Soft Bottles Single Serve
  {
    id: "soft-1",
    name: "J20 Apple & Rasp",
    category: "Soft Bottles Single Serve",
    unit: "case",
    costPerUnit: 25.83,
    stock: { bar: 2, cellar: 6, holding: 0, comingMon: 1 },
    reorderPoint: 4,
    supplierId: "star-pubs"
  },
  {
    id: "soft-2",
    name: "J20 Apple & Mango",
    category: "Soft Bottles Single Serve",
    unit: "case",
    costPerUnit: 24.89,
    stock: { bar: 3, cellar: 5, holding: 0, comingMon: 0 },
    reorderPoint: 4,
    supplierId: "star-pubs"
  },
  {
    id: "soft-3",
    name: "J20 Orange & Passionfruit",
    category: "Soft Bottles Single Serve",
    unit: "case",
    costPerUnit: 25.83,
    stock: { bar: 1, cellar: 4, holding: 0, comingMon: 0 },
    reorderPoint: 3,
    supplierId: "star-pubs"
  },
  {
    id: "soft-4",
    name: "Britvic 55",
    category: "Soft Bottles Single Serve",
    unit: "case",
    costPerUnit: 24.15,
    stock: { bar: 2, cellar: 3, holding: 0, comingMon: 0 },
    reorderPoint: 3,
    supplierId: "star-pubs"
  },
  {
    id: "soft-5",
    name: "Harrogate Water PET",
    category: "Soft Bottles Single Serve",
    unit: "case",
    costPerUnit: 7.70,
    stock: { bar: 5, cellar: 12, holding: 0, comingMon: 2 },
    reorderPoint: 8,
    supplierId: "star-pubs"
  },
  {
    id: "soft-6",
    name: "Kingsdown Still 24Pack",
    category: "Soft Bottles Single Serve",
    unit: "case",
    costPerUnit: 11.61,
    stock: { bar: 3, cellar: 8, holding: 0, comingMon: 1 },
    reorderPoint: 6,
    supplierId: "star-pubs"
  },
  {
    id: "soft-7",
    name: "Kingsdown Spark 24Pack",
    category: "Soft Bottles Single Serve",
    unit: "case",
    costPerUnit: 11.61,
    stock: { bar: 2, cellar: 6, holding: 0, comingMon: 0 },
    reorderPoint: 5,
    supplierId: "star-pubs"
  },
  {
    id: "soft-8",
    name: "Red Bull 24Pack",
    category: "Soft Bottles Single Serve",
    unit: "case",
    costPerUnit: 31.65,
    stock: { bar: 1, cellar: 2, holding: 0, comingMon: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  // Mixers
  {
    id: "mix-1",
    name: "Schweppes Orange Juice 24Pack",
    category: "Mixers",
    unit: "case",
    costPerUnit: 15.83,
    stock: { bar: 1, cellar: 3, holding: 0, comingMon: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  {
    id: "mix-2",
    name: "Schweppes Ginger Beer 24Pack",
    category: "Mixers",
    unit: "case",
    costPerUnit: 14.05,
    stock: { bar: 2, cellar: 4, holding: 0, comingMon: 0 },
    reorderPoint: 3,
    supplierId: "star-pubs"
  },
  {
    id: "mix-3",
    name: "Canada Dry Ales 24Pack",
    category: "Mixers",
    unit: "case",
    costPerUnit: 14.05,
    stock: { bar: 1, cellar: 2, holding: 0, comingMon: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  {
    id: "mix-4",
    name: "Schweppes Tonic",
    category: "Mixers",
    unit: "case",
    costPerUnit: 15.36,
    stock: { bar: 2, cellar: 5, holding: 0, comingMon: 1 },
    reorderPoint: 4,
    supplierId: "star-pubs"
  },
  {
    id: "mix-5",
    name: "Schweppes Slimline Tonic",
    category: "Mixers",
    unit: "case",
    costPerUnit: 15.36,
    stock: { bar: 1, cellar: 4, holding: 0, comingMon: 0 },
    reorderPoint: 3,
    supplierId: "star-pubs"
  },
  {
    id: "mix-6",
    name: "Sunpride Cranberry 12Pack",
    category: "Mixers",
    unit: "case",
    costPerUnit: 14.70,
    stock: { bar: 0, cellar: 2, holding: 0, comingMon: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  // Bottled Lager
  {
    id: "lager-1",
    name: "Sol 24Pack",
    category: "Bottled Lager",
    unit: "case",
    costPerUnit: 25.75,
    stock: { bar: 1, cellar: 2, holding: 0, comingMon: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  {
    id: "lager-2",
    name: "Estrella 24Pack",
    category: "Bottled Lager",
    unit: "case",
    costPerUnit: 35.54,
    stock: { bar: 0, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "lager-3",
    name: "CruzCampo",
    category: "Bottled Lager",
    unit: "case",
    costPerUnit: 30.35,
    stock: { bar: 1, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "lager-4",
    name: "Birra Moretti 24Pack",
    category: "Bottled Lager",
    unit: "case",
    costPerUnit: 32.15,
    stock: { bar: 0, cellar: 2, holding: 0, comingMon: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  {
    id: "lager-5",
    name: "Desperados 24Pack",
    category: "Bottled Lager",
    unit: "case",
    costPerUnit: 34.51,
    stock: { bar: 1, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  // No & Low Bottles
  {
    id: "nolow-1",
    name: "Birra Moretti Zero 24Pack",
    category: "No & Low Bottles",
    unit: "case",
    costPerUnit: 22.16,
    stock: { bar: 1, cellar: 2, holding: 0, comingMon: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  {
    id: "nolow-2",
    name: "Heineken Zero 24Pack",
    category: "No & Low Bottles",
    unit: "case",
    costPerUnit: 20.37,
    stock: { bar: 2, cellar: 3, holding: 0, comingMon: 0 },
    reorderPoint: 3,
    supplierId: "star-pubs"
  },
  {
    id: "nolow-3",
    name: "Old Mout Berries 0.0%",
    category: "No & Low Bottles",
    unit: "case",
    costPerUnit: 22.27,
    stock: { bar: 0, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "nolow-4",
    name: "Old M Pine Rasp 0.0%",
    category: "No & Low Bottles",
    unit: "case",
    costPerUnit: 22.27,
    stock: { bar: 1, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  // Fruity Cider
  {
    id: "cider-1",
    name: "Old M Kiwi & Lime 12Pack",
    category: "Fruity Cider",
    unit: "case",
    costPerUnit: 28.17,
    stock: { bar: 0, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "cider-2",
    name: "Old M Berry & Cherry 12Pack",
    category: "Fruity Cider",
    unit: "case",
    costPerUnit: 28.17,
    stock: { bar: 1, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "cider-3",
    name: "Old M Pineapple & Raspberry",
    category: "Fruity Cider",
    unit: "case",
    costPerUnit: 27.77,
    stock: { bar: 0, cellar: 2, holding: 0, comingMon: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  // Bottled Beer
  {
    id: "beer-1",
    name: "Sharpes Doom Bar 8Pack",
    category: "Bottled Beer",
    unit: "case",
    costPerUnit: 16.69,
    stock: { bar: 1, cellar: 3, holding: 0, comingMon: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  {
    id: "beer-2",
    name: "Rev James",
    category: "Bottled Beer",
    unit: "case",
    costPerUnit: 20.47,
    stock: { bar: 0, cellar: 2, holding: 0, comingMon: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  {
    id: "beer-3",
    name: "Speckled Hen (GF) 8Pack",
    category: "Bottled Beer",
    unit: "case",
    costPerUnit: 19.14,
    stock: { bar: 1, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  // Bottled Cider
  {
    id: "bcider-1",
    name: "Thatchers Katy 6Pack",
    category: "Bottled Cider",
    unit: "case",
    costPerUnit: 14.31,
    stock: { bar: 2, cellar: 4, holding: 0, comingMon: 0 },
    reorderPoint: 3,
    supplierId: "star-pubs"
  },
  {
    id: "bcider-2",
    name: "Thatchers Gold 6Pack",
    category: "Bottled Cider",
    unit: "case",
    costPerUnit: 14.31,
    stock: { bar: 1, cellar: 3, holding: 0, comingMon: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  {
    id: "bcider-3",
    name: "Thatchers Haze 6Pack",
    category: "Bottled Cider",
    unit: "case",
    costPerUnit: 12.32,
    stock: { bar: 2, cellar: 2, holding: 0, comingMon: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  // Draught Keg
  {
    id: "keg-1",
    name: "Guinness Stout 30l",
    category: "Draught Keg",
    unit: "keg",
    costPerUnit: 135.91,
    stock: { bar: 1, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "keg-2",
    name: "Guinness Stout 50l",
    category: "Draught Keg",
    unit: "keg",
    costPerUnit: 223.48,
    stock: { bar: 0, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "keg-3",
    name: "Amstel Lager 50L",
    category: "Draught Keg",
    unit: "keg",
    costPerUnit: 170.21,
    stock: { bar: 1, cellar: 0, holding: 0, comingMon: 1 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "keg-4",
    name: "San Miguel",
    category: "Draught Keg",
    unit: "keg",
    costPerUnit: 253.26,
    stock: { bar: 0, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "keg-5",
    name: "Inches Cider 50L",
    category: "Draught Keg",
    unit: "keg",
    costPerUnit: 159.68,
    stock: { bar: 1, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  // Craft Draught Keg
  {
    id: "craft-1",
    name: "B/town Neck Oil IPA 30L",
    category: "Craft Draught Keg",
    unit: "keg",
    costPerUnit: 131.47,
    stock: { bar: 1, cellar: 0, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "craft-2",
    name: "B/town Neck Oil IPA 50L",
    category: "Craft Draught Keg",
    unit: "keg",
    costPerUnit: 219.10,
    stock: { bar: 0, cellar: 1, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
  {
    id: "craft-3",
    name: "B/town GammaRay IPA 30L",
    category: "Craft Draught Keg",
    unit: "keg",
    costPerUnit: 147.79,
    stock: { bar: 1, cellar: 0, holding: 0, comingMon: 0 },
    reorderPoint: 1,
    supplierId: "star-pubs"
  },
];

export default function BeveragesPage() {
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