import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clock, Package, Calendar } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface OrderHistoryItem {
  id: string;
  product_name: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  order_date: string;
  status: string;
}

interface OrderHistoryDialogProps {
  supplierId: string;
  supplierName: string;
  onQuickReorder?: (productId: string, quantity: number) => void;
  trigger?: React.ReactNode;
}

export function OrderHistoryDialog({ 
  supplierId, 
  supplierName,
  onQuickReorder,
  trigger 
}: OrderHistoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("7"); // days
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      fetchOrderHistory();
    }
  }, [isOpen, user, dateRange, supplierId]);

  const fetchOrderHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const daysBack = parseInt(dateRange);
      const startDate = startOfDay(subDays(new Date(), daysBack));
      const endDate = endOfDay(new Date());

      // Fetch orders with items for this supplier and date range
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_date,
          status,
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            products (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('supplier_id', supplierId)
        .gte('order_date', format(startDate, 'yyyy-MM-dd'))
        .lte('order_date', format(endDate, 'yyyy-MM-dd'))
        .order('order_date', { ascending: false });

      if (ordersError) throw ordersError;

      // Flatten the data to show individual items
      const historyItems: OrderHistoryItem[] = [];
      ordersData?.forEach(order => {
        order.order_items?.forEach(item => {
          historyItems.push({
            id: item.id,
            product_name: item.products?.name || 'Unknown Product',
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            order_date: order.order_date,
            status: order.status,
          });
        });
      });

      setOrderHistory(historyItems);
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast({
        title: "Error",
        description: "Failed to load order history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReorder = (productId: string, quantity: number) => {
    if (onQuickReorder) {
      onQuickReorder(productId, quantity);
      toast({
        title: "Added to Order",
        description: `Added ${quantity} items to your current order.`,
      });
      setIsOpen(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'submitted': return 'default';
      case 'delivered': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  // Group items by date
  const groupedHistory = orderHistory.reduce((acc, item) => {
    const date = item.order_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, OrderHistoryItem[]>);

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Clock className="h-4 w-4 mr-2" />
      Order History
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order History - {supplierName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Date Range Filter */}
          <div className="flex gap-2">
            <Button
              variant={dateRange === "7" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("7")}
            >
              Last 7 days
            </Button>
            <Button
              variant={dateRange === "30" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("30")}
            >
              Last 30 days
            </Button>
            <Button
              variant={dateRange === "90" ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange("90")}
            >
              Last 90 days
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">Loading order history...</div>
            </div>
          )}

          {/* Order History */}
          {!loading && Object.keys(groupedHistory).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No orders found for the selected time period.
            </div>
          )}

          {!loading && Object.keys(groupedHistory).length > 0 && (
            <div className="space-y-4">
              {Object.entries(groupedHistory)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, items]) => (
                  <Card key={date}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">
                          {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                        </span>
                        <Badge variant={getStatusBadgeVariant(items[0]?.status)}>
                          {items[0]?.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex items-center justify-between p-2 bg-muted/50 rounded"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{item.product_name}</div>
                              <div className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} • 
                                Unit Price: £{item.unit_price.toFixed(2)} • 
                                Total: £{item.total_price.toFixed(2)}
                              </div>
                            </div>
                            {onQuickReorder && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuickReorder(item.product_id, item.quantity)}
                              >
                                Reorder
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}