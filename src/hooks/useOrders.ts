import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export function useOrders() {
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const saveDraft = async (supplierId: string, items: OrderItem[], totalCost: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save drafts.",
        variant: "destructive",
      });
      return { success: false };
    }

    setSaving(true);
    try {
      // First, create or update the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .upsert({
          user_id: user.id,
          supplier_id: supplierId,
          status: 'draft',
          total_cost: totalCost,
          order_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Delete existing order items for this order
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', order.id);

      if (deleteError) throw deleteError;

      // Insert new order items
      if (items.length > 0) {
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Draft Saved",
        description: "Your order has been saved as a draft.",
      });

      return { success: true, orderId: order.id };
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  const submitOrder = async (supplierId: string, items: OrderItem[], totalCost: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit orders.",
        variant: "destructive",
      });
      return { success: false };
    }

    setSubmitting(true);
    try {
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          supplier_id: supplierId,
          status: 'submitted',
          total_cost: totalCost,
          order_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      if (items.length > 0) {
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Order Submitted",
        description: "Your order has been successfully submitted.",
      });

      return { success: true, orderId: order.id };
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    saveDraft,
    submitOrder,
    saving,
    submitting,
  };
}