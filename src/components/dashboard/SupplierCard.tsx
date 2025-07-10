import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Package, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Supplier } from "@/types/inventory";

interface SupplierCardProps {
  supplier: Supplier;
  url: string;
  pendingItems?: number;
  draftTotal?: number;
}

export function SupplierCard({ supplier, url, pendingItems = 0, draftTotal = 0 }: SupplierCardProps) {
  const getDeadlineStatus = (deadline: string) => {
    if (deadline === "Flexible" || deadline === "As needed") return "default";
    // For demo purposes, showing different statuses
    if (deadline.includes("Sunday")) return "destructive";
    if (deadline.includes("Thursday")) return "outline";
    return "secondary";
  };

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{supplier.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Account: {supplier.account}
            </p>
          </div>
          <Badge variant={getDeadlineStatus(supplier.deadline)}>
            <Clock className="h-3 w-3 mr-1" />
            {supplier.deadline}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Delivery: {supplier.deliveryWindow}
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-2 text-muted-foreground" />
            Pending Items
          </div>
          <span className="font-medium">{pendingItems}</span>
        </div>

        {draftTotal > 0 && (
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
              Draft Total
            </div>
            <span className="font-medium">£{draftTotal.toFixed(2)}</span>
          </div>
        )}

        <Button asChild className="w-full">
          <Link to={url}>
            Manage Orders
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}