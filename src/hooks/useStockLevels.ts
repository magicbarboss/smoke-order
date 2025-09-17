import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

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
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, StockLocation>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Debounce the pending updates to batch saves
  const debouncedUpdates = useDebounce(pendingUpdates, 1000);

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

  // Save debounced updates to database
  useEffect(() => {
    const saveUpdates = async () => {
      if (Object.keys(debouncedUpdates).length === 0) return;

      try {
        setIsSaving(true);
        
        // Prepare upsert data
        const upsertData = [];
        for (const [productId, levels] of Object.entries(debouncedUpdates)) {
          upsertData.push(
            {
              product_id: productId,
              location: 'bar',
              quantity: levels.bar
            },
            {
              product_id: productId,
              location: 'cellar', 
              quantity: levels.cellar
            }
          );
        }

        const { error } = await supabase
          .from('stock_levels')
          .upsert(upsertData, { 
            onConflict: 'product_id,location',
            ignoreDuplicates: false 
          });

        if (error) throw error;

        // Clear pending updates after successful save
        setPendingUpdates({});
        
        toast({
          title: "Stock Updated",
          description: "Stock levels saved successfully",
        });
      } catch (error) {
        console.error('Error saving stock levels:', error);
        toast({
          title: "Error",
          description: "Failed to save stock levels",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    };

    saveUpdates();
  }, [debouncedUpdates, toast]);

  const updateStock = useCallback((productId: string, location: 'bar' | 'cellar', quantity: number) => {
    // Update local state immediately for responsive UI
    setStockLevels(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [location]: quantity
      }
    }));

    // Queue for database save
    setPendingUpdates(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        bar: location === 'bar' ? quantity : prev[productId]?.bar ?? stockLevels[productId]?.bar ?? 0,
        cellar: location === 'cellar' ? quantity : prev[productId]?.cellar ?? stockLevels[productId]?.cellar ?? 0
      }
    }));
  }, [stockLevels]);

  return {
    stockLevels,
    updateStock,
    isLoading,
    isSaving
  };
}