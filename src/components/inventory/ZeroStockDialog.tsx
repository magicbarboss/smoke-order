import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ZeroStockDialogProps {
  supplierId: string;
  supplierName: string;
  productCount: number;
  onComplete: () => void;
}

export function ZeroStockDialog({ 
  supplierId, 
  supplierName, 
  productCount, 
  onComplete 
}: ZeroStockDialogProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleZeroStock = async () => {
    if (!isConfirmed) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm that you understand this action will zero all stock counts.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get all products for this supplier
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('supplier_id', supplierId);

      if (productsError) throw productsError;

      if (!products || products.length === 0) {
        toast({
          title: "No Products Found",
          description: "No products found for this supplier.",
        });
        return;
      }

      const productIds = products.map(p => p.id);

      // Zero all stock levels for these products
      const { error: updateError } = await supabase
        .from('stock_levels')
        .update({ quantity: 0 })
        .in('product_id', productIds);

      if (updateError) throw updateError;

      toast({
        title: "Stock Counts Zeroed",
        description: `Successfully zeroed all stock counts for ${productCount} ${supplierName} products across all locations.`,
      });

      onComplete();
      setIsConfirmed(false);
    } catch (error) {
      console.error('Error zeroing stock:', error);
      toast({
        title: "Error",
        description: "Failed to zero stock counts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <RotateCcw className="h-4 w-4 mr-2" />
          Zero All Stock
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Zero All Stock Counts</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              <strong>Warning:</strong> This action will set all stock levels to zero for <strong>{productCount}</strong> products from <strong>{supplierName}</strong>.
            </p>
            <p>
              This will affect stock levels across all locations (Bar, Cellar, Holding) and cannot be undone.
            </p>
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="confirm-zero"
                checked={isConfirmed}
                onCheckedChange={(checked) => setIsConfirmed(checked === true)}
              />
              <label htmlFor="confirm-zero" className="text-sm">
                I understand this will zero all stock counts and cannot be undone
              </label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleZeroStock}
            disabled={!isConfirmed || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Zeroing..." : "Zero All Stock"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}