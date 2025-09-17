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
import { useRef } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  products: Product[];
  showLocations?: string[];
  onQuantityChange: (productId: string, quantity: number) => void;
  orderQuantities: Record<string, number>;
  onStockChange?: (productId: string, location: string, quantity: number) => void;
  stockLevels?: Record<string, { bar: number; cellar: number }>;
  orderHistory?: Record<string, { lastOrderDate: string; lastOrderQuantity: number; totalQuantityInPeriod: number; status: string } | null>;
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
  stockLevels,
  orderHistory
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
      case "medium": return "default";
      default: return "secondary";
    }
  };

  const getStockBadgeColor = (level: string) => {
    switch (level) {
      case "low": return "text-white bg-stock-low border-stock-low";
      case "medium": return "text-foreground bg-stock-medium/20 border-stock-medium";
      default: return "text-white bg-stock-high border-stock-high";
    }
  };

  const shouldUseDecimals = (product: Product) => {
    // All St Austell products use decimals (shot-based service)
    if (product.supplierId === 'st-austell') {
      return true;
    }
    
    // Category-based logic for Star Pubs and other suppliers
    const decimalCategories = [
      // Star Pubs keg categories (drawn from kegs)
      "DRAUGHT KEG",
      "CRAFT DRAUGHT KEG", 
      "CORDIALS/POST-MIX",
      // Wine categories
      "WINE", 
      "WHITE WINE", 
      "RED WINE", 
      "ROSE WINE", 
      "BUBBLES"
    ];
    
    return decimalCategories.some(category => 
      product.category.toUpperCase().includes(category.toUpperCase())
    );
  };

  const getStockStep = (product: Product) => shouldUseDecimals(product) ? 0.1 : 1;
  const getStockIncrement = (product: Product) => shouldUseDecimals(product) ? 0.1 : 1;

  // Get quick entry presets based on product category/unit - FIXED for case-based products
  const getQuickEntryPresets = (product: Product) => {
    const name = product.name.toLowerCase();
    const category = product.category.toLowerCase();
    const unit = product.unit.toLowerCase();
    
    // Case-based products (like Speckled Hen £19.14 for 8 bottles)
    // Look for patterns that indicate case/pack products
    if (unit.includes('case') || unit.includes('box') || unit.includes('pack') || 
        name.includes('case') || name.includes('box') || name.includes('pack') ||
        (unit.includes('bottle') && (name.includes('8') || name.includes('12') || name.includes('24')))) {
      return [1, 2, 3, 5]; // Cases/packs
    }
    
    // Individual bottles/cans (sold individually)
    if ((unit.includes('bottle') || unit.includes('can')) && 
        !name.includes('case') && !name.includes('pack') && !name.includes('box')) {
      return [6, 12, 18, 24]; // Individual bottles
    }
    
    // Kegs (common quantities)
    if (unit.includes('keg') || category.includes('keg') || category.includes('draught')) {
      return [1, 2, 3, 5];
    }
    
    // Wine bottles (typically ordered individually or by 6/12)
    if (category.includes('wine') || category.includes('bubbles')) {
      return [1, 6, 12, 24];
    }
    
    // Spirits (typically ordered by bottle)
    if (category.includes('spirit') || category.includes('whisky') || category.includes('gin') || category.includes('vodka')) {
      return [1, 2, 3, 6];
    }
    
    // Default presets for other products
    return [1, 5, 10, 20];
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            {showLocations.includes("bar") && <TableHead className="text-center">Bar Stock</TableHead>}
            {showLocations.includes("cellar") && <TableHead className="text-center">Cellar Stock</TableHead>}
            {showLocations.includes("holding") && <TableHead className="text-center">Holding</TableHead>}
            {showLocations.includes("comingMon") && <TableHead className="text-center">Coming Mon</TableHead>}
            <TableHead className="text-center">Total Stock</TableHead>
            <TableHead className="text-center">Stock Level</TableHead>
            <TableHead>Unit Cost & Info</TableHead>
            <TableHead>Reorder Point</TableHead>
            <TableHead>Last Ordered</TableHead>
            <TableHead>Order Qty</TableHead>
            <TableHead>Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => {
            const stockLevel = getStockLevel(product);
            const currentStock = stockLevels?.[product.id] || product.stock;
            const barStock = Number(currentStock?.bar) || 0;
            const cellarStock = Number(currentStock?.cellar) || 0;
            const total = shouldUseDecimals(product) ? roundToOneDecimal(barStock + cellarStock) : barStock + cellarStock;
            const orderQty = orderQuantities[product.id] || 0;
            const orderCost = orderQty * product.costPerUnit;
            const isEvenRow = index % 2 === 0;

            return (
              <TableRow 
                key={product.id} 
                className={cn(
                  isEvenRow && "bg-table-row-even",
                  "hover:bg-table-row-hover transition-colors"
                )}
              >
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
                          className="w-20 text-center"
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
                          className="w-20 text-center"
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
                <TableCell className="text-center font-medium">
                  <div className="space-y-1">
                    <div className={cn("text-lg font-bold",
                      stockLevel === "low" && "text-stock-low",
                      stockLevel === "medium" && "text-stock-medium", 
                      stockLevel === "high" && "text-stock-high"
                    )}>
                      {shouldUseDecimals(product) ? roundToOneDecimal(total).toFixed(1) : total}
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={cn("h-2 rounded-full transition-all duration-300",
                          stockLevel === "low" && "bg-stock-low",
                          stockLevel === "medium" && "bg-stock-medium",
                          stockLevel === "high" && "bg-stock-high"
                        )}
                        style={{ 
                          width: `${Math.min((total / Math.max(product.reorderPoint * 2, 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant="outline"
                    className={cn("font-medium border-2", getStockBadgeColor(stockLevel))}
                  >
                    <div className="flex items-center gap-1">
                      <div className={cn("w-2 h-2 rounded-full",
                        stockLevel === "low" && "bg-stock-low",
                        stockLevel === "medium" && "bg-stock-medium", 
                        stockLevel === "high" && "bg-stock-high"
                      )} />
                      {stockLevel.toUpperCase()}
                    </div>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">£{product.costPerUnit.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{product.unit}</div>
                  </div>
                </TableCell>
                <TableCell>{product.reorderPoint}</TableCell>
                <TableCell>
                  {orderHistory?.[product.id] ? (
                    <div className="text-xs">
                      <div className="font-medium">
                        {orderHistory[product.id]!.lastOrderQuantity} on{' '}
                        {format(new Date(orderHistory[product.id]!.lastOrderDate), 'MMM d')}
                      </div>
                      <div className="text-muted-foreground">
                        {orderHistory[product.id]!.totalQuantityInPeriod} total last 7d
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">No recent orders</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    {/* Main input controls */}
                    <div className="flex items-center space-x-1">
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
                        value={orderQty || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            onQuantityChange(product.id, 0);
                          } else {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue)) {
                              onQuantityChange(product.id, Math.max(0, numValue));
                            }
                          }
                        }}
                        onFocus={(e) => {
                          setTimeout(() => e.target.select(), 0);
                        }}
                        onClick={(e) => {
                          setTimeout(() => e.currentTarget.select(), 0);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const nextInput = e.currentTarget.closest('tr')?.nextElementSibling?.querySelector('input[type="number"]') as HTMLInputElement;
                            if (nextInput) {
                              nextInput.focus();
                              setTimeout(() => nextInput.select(), 0);
                            }
                          }
                        }}
                        className="w-20 text-center"
                        min="0"
                        step="1"
                        placeholder="0"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onQuantityChange(product.id, orderQty + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Quick entry presets */}
                    <div className="flex flex-wrap gap-1 justify-center">
                      {getQuickEntryPresets(product).map((preset) => (
                        <Button
                          key={preset}
                          variant="ghost"
                          size="sm"
                          onClick={() => onQuantityChange(product.id, preset)}
                          className="h-7 px-3 text-xs bg-muted/30 hover:bg-primary/10 border border-muted-foreground/20 hover:border-primary/30 font-medium"
                        >
                          {preset}
                        </Button>
                      ))}
                    </div>
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