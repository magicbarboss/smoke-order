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

// Helper function to properly round to one decimal place and avoid floating-point precision issues
const roundToOneDecimal = (value: number): number => {
  return Math.round(value * 10) / 10;
};

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
    const barStock = Number(currentStock?.bar) || 0;
    const cellarStock = Number(currentStock?.cellar) || 0;
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
            const barStock = Number(currentStock?.bar) || 0;
            const cellarStock = Number(currentStock?.cellar) || 0;
            const total = shouldUseDecimals(product) ? roundToOneDecimal(barStock + cellarStock) : barStock + cellarStock;
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
                              ? Math.max(0, roundToOneDecimal(barStock - increment))
                              : Math.max(0, barStock - increment);
                            onStockChange(product.id, "bar", newValue);
                          }}
                          disabled={barStock <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={shouldUseDecimals(product) ? roundToOneDecimal(barStock).toFixed(1) : barStock.toString()}
                          onChange={(e) => {
                            const value = shouldUseDecimals(product) 
                              ? roundToOneDecimal(parseFloat(e.target.value) || 0)
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
                              ? roundToOneDecimal(barStock + increment)
                              : barStock + increment;
                            onStockChange(product.id, "bar", newValue);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      shouldUseDecimals(product) ? roundToOneDecimal(barStock).toFixed(1) : barStock
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
                              ? Math.max(0, roundToOneDecimal(cellarStock - increment))
                              : Math.max(0, cellarStock - increment);
                            onStockChange(product.id, "cellar", newValue);
                          }}
                          disabled={cellarStock <= 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={shouldUseDecimals(product) ? roundToOneDecimal(cellarStock).toFixed(1) : cellarStock.toString()}
                          onChange={(e) => {
                            const value = shouldUseDecimals(product) 
                              ? roundToOneDecimal(parseFloat(e.target.value) || 0)
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
                              ? roundToOneDecimal(cellarStock + increment)
                              : cellarStock + increment;
                            onStockChange(product.id, "cellar", newValue);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      shouldUseDecimals(product) ? roundToOneDecimal(cellarStock).toFixed(1) : cellarStock
                    )}
                  </TableCell>
                )}
                {showLocations.includes("holding") && <TableCell>{product.stock.holding || 0}</TableCell>}
                {showLocations.includes("comingMon") && <TableCell>{product.stock.comingMon || 0}</TableCell>}
                <TableCell className="font-medium">
                  {shouldUseDecimals(product) ? roundToOneDecimal(total).toFixed(1) : total}
                </TableCell>
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
                      onClick={() => {
                        console.log(`[InventoryTable] Decrease button clicked for product ${product.id} (${product.name}), current qty: ${orderQty}`);
                        const newQty = Math.max(0, orderQty - 1);
                        console.log(`[InventoryTable] Calling onQuantityChange with productId: ${product.id}, newQty: ${newQty}`);
                        onQuantityChange(product.id, newQty);
                      }}
                      disabled={orderQty <= 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={orderQty}
                      onChange={(e) => {
                        console.log(`[InventoryTable] Input changed for product ${product.id} (${product.name}), input value: ${e.target.value}`);
                        const newQty = Math.max(0, parseInt(e.target.value) || 0);
                        console.log(`[InventoryTable] Calling onQuantityChange with productId: ${product.id}, newQty: ${newQty}`);
                        onQuantityChange(product.id, newQty);
                      }}
                      className="w-16 text-center"
                      min="0"
                      step="1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log(`[InventoryTable] Increase button clicked for product ${product.id} (${product.name}), current qty: ${orderQty}`);
                        const newQty = orderQty + 1;
                        console.log(`[InventoryTable] Calling onQuantityChange with productId: ${product.id}, newQty: ${newQty}`);
                        onQuantityChange(product.id, newQty);
                      }}
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