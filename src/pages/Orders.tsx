import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, FileText, Download, Eye, Calendar } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface OrderSummary {
  id: string;
  supplier_id: string;
  supplier_name: string;
  order_date: string;
  total_cost: number;
  status: string;
  item_count: number;
  notes?: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("30");
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [orderDetails, setOrderDetails] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const { toast } = useToast();

  const supplierNames = {
    'heineken': 'Star Pubs-Heineken',
    'st-austell': 'St Austell',
    'salvo-charles': 'Salvo & Charles',
    'cormack': 'Cormack Commercial'
  };

  useEffect(() => {
    fetchOrders();
  }, [dateRange]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const daysBack = parseInt(dateRange);
      const startDate = startOfDay(subDays(new Date(), daysBack));
      const endDate = endOfDay(new Date());

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          supplier_id,
          order_date,
          total_cost,
          status,
          notes,
          order_items (
            id,
            quantity
          )
        `)
        .gte('order_date', format(startDate, 'yyyy-MM-dd'))
        .lte('order_date', format(endDate, 'yyyy-MM-dd'))
        .order('order_date', { ascending: false });

      if (error) throw error;

      const orderSummaries: OrderSummary[] = ordersData?.map(order => ({
        id: order.id,
        supplier_id: order.supplier_id,
        supplier_name: supplierNames[order.supplier_id] || order.supplier_id,
        order_date: order.order_date,
        total_cost: order.total_cost,
        status: order.status,
        item_count: order.order_items?.length || 0,
        notes: order.notes
      })) || [];

      setOrders(orderSummaries);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const fetchOrderDetails = async (orderId: string) => {
    setDetailsLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          unit_price,
          total_price,
          products (
            name,
            unit
          )
        `)
        .eq('order_id', orderId);

      if (error) throw error;
      setOrderDetails(data || []);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to load order details.",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewOrder = (order: OrderSummary) => {
    setSelectedOrder(order);
    fetchOrderDetails(order.id);
  };

  const exportOrderCSV = (order: OrderSummary) => {
    const headers = ["Product Name", "Quantity", "Unit Price", "Total Price", "Unit"];
    const csvContent = [
      `Order Summary - ${order.supplier_name}`,
      `Order ID: ${order.id}`,
      `Date: ${format(new Date(order.order_date), 'dd/MM/yyyy')}`,
      `Status: ${order.status}`,
      `Total: £${order.total_cost.toFixed(2)}`,
      "",
      headers.join(","),
      ...orderDetails.map(item =>
        `"${item.products?.name || 'Unknown'}", ${item.quantity}, £${item.unit_price.toFixed(2)}, £${item.total_price.toFixed(2)}, "${item.products?.unit || ''}"`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `order-${order.id}-${order.order_date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Order exported successfully as CSV.",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'submitted': return 'default';
      case 'delivered': return 'secondary';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const totalValue = filteredOrders.reduce((sum, order) => sum + order.total_cost, 0);
  const totalItems = filteredOrders.reduce((sum, order) => sum + order.item_count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">
          View and manage orders from all suppliers
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Date Range</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders by supplier, status, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">Loading orders...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found for the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.supplier_name}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.order_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {order.item_count} items
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        £{order.total_cost.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <AlertDialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Order Details - {selectedOrder?.supplier_name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Order ID: {selectedOrder?.id} | Date: {selectedOrder?.order_date && format(new Date(selectedOrder.order_date), 'dd/MM/yyyy')} | Total: £{selectedOrder?.total_cost.toFixed(2)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {detailsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">Loading order details...</div>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Unit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderDetails.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.products?.name || 'Unknown Product'}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>£{item.unit_price.toFixed(2)}</TableCell>
                      <TableCell className="font-medium">
                        £{item.total_price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.products?.unit || ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                onClick={() => selectedOrder && exportOrderCSV(selectedOrder)}
                disabled={detailsLoading || orderDetails.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}