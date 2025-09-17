import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface OrderHistoryItem {
  product_id: string;
  quantity: number;
  order_date: string;
  status: string;
}

export function useOrderHistory(supplierId: string, daysBack: number = 7) {
  const [orderHistory, setOrderHistory] = useState<Record<string, OrderHistoryItem[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplierId) {
      fetchOrderHistory();
    }
  }, [supplierId, daysBack]);

  const fetchOrderHistory = async () => {
    
    setLoading(true);
    try {
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
            product_id,
            quantity
          )
        `)
        .eq('supplier_id', supplierId)
        .gte('order_date', format(startDate, 'yyyy-MM-dd'))
        .lte('order_date', format(endDate, 'yyyy-MM-dd'))
        .order('order_date', { ascending: false });

      if (ordersError) throw ordersError;

      // Group by product ID
      const historyByProduct: Record<string, OrderHistoryItem[]> = {};
      
      ordersData?.forEach(order => {
        order.order_items?.forEach(item => {
          if (!historyByProduct[item.product_id]) {
            historyByProduct[item.product_id] = [];
          }
          historyByProduct[item.product_id].push({
            product_id: item.product_id,
            quantity: item.quantity,
            order_date: order.order_date,
            status: order.status,
          });
        });
      });

      setOrderHistory(historyByProduct);
    } catch (error) {
      console.error('Error fetching order history:', error);
      setOrderHistory({});
    } finally {
      setLoading(false);
    }
  };

  const getLastOrderInfo = (productId: string) => {
    const history = orderHistory[productId];
    if (!history || history.length === 0) return null;

    const lastOrder = history[0]; // Already sorted by date desc
    const totalQuantity = history.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      lastOrderDate: lastOrder.order_date,
      lastOrderQuantity: lastOrder.quantity,
      totalQuantityInPeriod: totalQuantity,
      status: lastOrder.status,
    };
  };

  return {
    orderHistory,
    loading,
    getLastOrderInfo,
    refetch: fetchOrderHistory,
  };
}