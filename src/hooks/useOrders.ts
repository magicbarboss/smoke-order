import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000000';

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

  const saveDraft = async (supplierId: string, items: OrderItem[], totalCost: number) => {
    setSaving(true);
    console.log('Starting saveDraft:', { supplierId, itemsCount: items.length, totalCost });
    
    try {
      // Check for existing draft order for this supplier and user
      const { data: existingDraft } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', PUBLIC_USER_ID)
        .eq('supplier_id', supplierId)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1);

      let orderId: string;
      
      if (existingDraft && existingDraft.length > 0) {
        // Update existing draft
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            total_cost: totalCost,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDraft[0].id);

        if (updateError) throw updateError;
        orderId = existingDraft[0].id;
        console.log('Updated existing draft order:', orderId);
      } else {
        // Create new draft order
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: PUBLIC_USER_ID,
            supplier_id: supplierId,
            status: 'draft',
            total_cost: totalCost,
            order_date: new Date().toISOString().split('T')[0],
          })
          .select()
          .single();

        if (orderError) throw orderError;
        orderId = newOrder.id;
        console.log('Created new draft order:', orderId);
      }

      // Delete existing order items for this order
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (deleteError) throw deleteError;

      // Insert new order items
      if (items.length > 0) {
        console.log('Inserting order items:', items.length);
        const orderItems = items.map(item => ({
          order_id: orderId,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
        console.log('Successfully inserted order items');
      }

      toast({
        title: "Draft Saved",
        description: "Your order has been saved as a draft and synced across devices.",
      });

      return { success: true, orderId };
    } catch (error) {
      console.error('Error saving draft:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to save draft: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  const submitOrder = async (supplierId: string, items: OrderItem[], totalCost: number) => {
    setSubmitting(true);
    console.log('Starting submitOrder:', { supplierId, itemsCount: items.length, totalCost });
    
    try {
      // Validate order items
      if (!items || items.length === 0) {
        throw new Error('Cannot submit order with no items');
      }

      // Check if there's an existing draft to convert
      const { data: existingDraft } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', PUBLIC_USER_ID)
        .eq('supplier_id', supplierId)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1);

      let orderId: string;

      if (existingDraft && existingDraft.length > 0) {
        // Convert existing draft to submitted order
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'submitted',
            total_cost: totalCost,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDraft[0].id);

        if (updateError) throw updateError;
        orderId = existingDraft[0].id;
        console.log('Converted draft to submitted order:', orderId);
      } else {
        // Create new submitted order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: PUBLIC_USER_ID,
            supplier_id: supplierId,
            status: 'submitted',
            total_cost: totalCost,
            order_date: new Date().toISOString().split('T')[0],
          })
          .select()
          .single();

        if (orderError) throw orderError;
        orderId = order.id;
        console.log('Created new submitted order:', orderId);
      }

      // Ensure order items are up to date
      // Delete existing order items first
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (deleteError) throw deleteError;

      // Insert new order items
      console.log('Inserting order items for submission:', items.length);
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;
      console.log('Successfully submitted order with items');

      toast({
        title: "Order Submitted",
        description: `Your order has been successfully submitted with ${items.length} items totaling £${totalCost.toFixed(2)}.`,
      });

      return { success: true, orderId };
    } catch (error) {
      console.error('Error submitting order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to submit order: ${errorMessage}. Please check your items and try again.`,
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