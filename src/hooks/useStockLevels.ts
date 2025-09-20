import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';


interface StockLocation {
  bar: number;
  cellar: number;
}

interface UseStockLevelsReturn {
  stockLevels: Record<string, StockLocation>;
  updateStock: (productId: string, location: 'bar' | 'cellar', quantity: number) => void;
  isLoading: boolean;
  isSaving: boolean;
}

export function useStockLevels(productIds: string[]): UseStockLevelsReturn {
  const [stockLevels, setStockLevels] = useState<Record<string, StockLocation>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load initial stock levels
  useEffect(() => {
    const loadStockLevels = async () => {
      if (productIds.length === 0) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('stock_levels')
          .select('product_id, location, quantity')
          .in('product_id', productIds);

        if (error) throw error;

        // Transform the data into our format
        const levels: Record<string, StockLocation> = {};
        productIds.forEach(id => {
          levels[id] = { bar: 0, cellar: 0 };
        });

        data?.forEach(item => {
          if (!levels[item.product_id]) {
            levels[item.product_id] = { bar: 0, cellar: 0 };
          }
          if (item.location === 'bar' || item.location === 'cellar') {
            levels[item.product_id][item.location] = Number(item.quantity) || 0;
          }
        });

        setStockLevels(levels);
      } catch (error) {
        console.error('Error loading stock levels:', error);
        toast({
          title: "Error",
          description: "Failed to load stock levels",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStockLevels();
  }, [productIds.join(','), toast]);


  const updateStock = useCallback((productId: string, location: 'bar' | 'cellar', quantity: number) => {
    // Update local state immediately for responsive UI
    setStockLevels(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [location]: quantity
      }
    }));

    // Save immediately to the database (no debounce, no local storage)
    (async () => {
      try {
        setIsSaving(true);
        const { error } = await supabase
          .from('stock_levels')
          .upsert(
            { product_id: productId, location, quantity },
            { onConflict: 'product_id,location', ignoreDuplicates: false }
          );
        if (error) throw error;
      } catch (error) {
        console.error('Error saving stock level:', error);
        toast({
          title: 'Error',
          description: 'Failed to save stock level',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
    })();
  }, [stockLevels, toast]);

  return {
    stockLevels,
    updateStock,
    isLoading,
    isSaving
  };
}