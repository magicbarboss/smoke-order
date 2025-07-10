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
}

export function InventoryTable({ 
  products, 
  showLocations = ["bar", "cellar"], 
  onQuantityChange,
  orderQuantities 
}: InventoryTableProps) {
  const getStockLevel = (product: Product) => {
    const total = product.stock.bar + product.stock.cellar;
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
            const total = product.stock.bar + product.stock.cellar;
            const orderQty = orderQuantities[product.id] || 0;
            const orderCost = orderQty * product.costPerUnit;

            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                {showLocations.includes("bar") && <TableCell>{product.stock.bar}</TableCell>}
                {showLocations.includes("cellar") && <TableCell>{product.stock.cellar}</TableCell>}
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
                      onClick={() => onQuantityChange(product.id, Math.max(0, Math.round((orderQty - 0.1) * 10) / 10))}
                      disabled={orderQty <= 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={orderQty}
                      onChange={(e) => onQuantityChange(product.id, Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-16 text-center"
                      min="0"
                      step="0.1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onQuantityChange(product.id, Math.round((orderQty + 0.1) * 10) / 10)}
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