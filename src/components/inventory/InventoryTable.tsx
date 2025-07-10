import { Product } from "@/types/inventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface InventoryTableProps {
  products: Product[];
  showLocations?: string[];
  onQuantityChange: (productId: string, quantity: number) => void;
  orderQuantities: Record<string, number>;
  onStockChange?: (productId: string, location: string, quantity: number) => void;
  stockLevels?: Record<string, { bar: number; cellar: number }>;
}

export function InventoryTable({ 
  products, 
  showLocations = ["bar", "cellar"], 
  onQuantityChange,
  orderQuantities,
  onStockChange,
  stockLevels
}: InventoryTableProps) {
  const getStockLevel = (product: Product) => {
    const currentStock = stockLevels?.[product.id] || product.stock;
    const barStock = currentStock?.bar || 0;
    const cellarStock = currentStock?.cellar || 0;
    const total = barStock + cellarStock;
    if (total <= product.reorderPoint) return "low";
    if (total <= product.reorderPoint * 1.5) return "medium";
    return "high";
  };

  const getStockBadgeVariant = (level: string) => {
    switch (level) {
      case "low": return "destructive";
      case "medium": return "outline";
      default: return "secondary";
    }
  };

  const shouldUseDecimals = (product: Product) => {
    const decimalCategories = [
      "Draught Keg", 
      "Craft Draught Keg", 
      "Spirits", 
      "Whiskey", 
      "Gin", 
      "Vodka", 
      "Rum", 
      "Wine",
      "Cordials/Post-Mix"
    ];
    return decimalCategories.some(category => 
      product.category.toLowerCase().includes(category.toLowerCase())
    );
  };

  const getStockStep = (product: Product) => shouldUseDecimals(product) ? 0.1 : 1;
  const getStockIncrement = (product: Product) => shouldUseDecimals(product) ? 0.1 : 1;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            {showLocations.includes("bar") && <TableHead>Bar</TableHead>}
            {showLocations.includes("cellar") && <TableHead>Cellar</TableHead>}
            {showLocations.includes("holding") && <TableHead>Holding</TableHead>}
            {showLocations.includes("comingMon") && <TableHead>Coming Mon</TableHead>}
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Unit Cost</TableHead>
            <TableHead>Order Qty</TableHead>
            <TableHead>Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const stockLevel = getStockLevel(product);
            const currentStock = stockLevels?.[product.id] || product.stock;
            const barStock = currentStock?.bar || 0;
            const cellarStock = currentStock?.cellar || 0;
            const total = barStock + cellarStock;
            const orderQty = orderQuantities[product.id] || 0;
            const orderCost = orderQty * product.costPerUnit;

            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                {showLocations.includes("bar") && (
                  <TableCell>
                    {onStockChange ? (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const increment = getStockIncrement(product);
                            const newValue = shouldUseDecimals(product) 
                              ? Math.max(0, Math.round((barStock - increment) * 10) / 10)
                              : Math.max(0, barStock - increment);
                            onStockChange(product.id, "bar", newValue);
                          }}
                          disabled={barStock <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={barStock}
                          onChange={(e) => {
                            const value = shouldUseDecimals(product) 
                              ? parseFloat(e.target.value) || 0
                              : parseInt(e.target.value) || 0;
                            onStockChange(product.id, "bar", Math.max(0, value));
                          }}
                          className="w-16 text-center"
                          min="0"
                          step={getStockStep(product)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const increment = getStockIncrement(product);
                            const newValue = shouldUseDecimals(product)
                              ? Math.round((barStock + increment) * 10) / 10
                              : barStock + increment;
                            onStockChange(product.id, "bar", newValue);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      barStock
                    )}
                  </TableCell>
                )}
                {showLocations.includes("cellar") && (
                  <TableCell>
                    {onStockChange ? (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const increment = getStockIncrement(product);
                            const newValue = shouldUseDecimals(product) 
                              ? Math.max(0, Math.round((cellarStock - increment) * 10) / 10)
                              : Math.max(0, cellarStock - increment);
                            onStockChange(product.id, "cellar", newValue);
                          }}
                          disabled={cellarStock <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={cellarStock}
                          onChange={(e) => {
                            const value = shouldUseDecimals(product) 
                              ? parseFloat(e.target.value) || 0
                              : parseInt(e.target.value) || 0;
                            onStockChange(product.id, "cellar", Math.max(0, value));
                          }}
                          className="w-16 text-center"
                          min="0"
                          step={getStockStep(product)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const increment = getStockIncrement(product);
                            const newValue = shouldUseDecimals(product)
                              ? Math.round((cellarStock + increment) * 10) / 10
                              : cellarStock + increment;
                            onStockChange(product.id, "cellar", newValue);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      cellarStock
                    )}
                  </TableCell>
                )}
                {showLocations.includes("holding") && <TableCell>{product.stock.holding || 0}</TableCell>}
                {showLocations.includes("comingMon") && <TableCell>{product.stock.comingMon || 0}</TableCell>}
                <TableCell className="font-medium">{total}</TableCell>
                <TableCell>
                  <Badge variant={getStockBadgeVariant(stockLevel)}>
                    {stockLevel.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>£{product.costPerUnit.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onQuantityChange(product.id, Math.max(0, orderQty - 1))}
                      disabled={orderQty <= 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={orderQty}
                      onChange={(e) => onQuantityChange(product.id, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 text-center"
                      min="0"
                      step="1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onQuantityChange(product.id, orderQty + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {orderCost > 0 ? `£${orderCost.toFixed(2)}` : "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}