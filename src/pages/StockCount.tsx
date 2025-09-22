import React from "react";
import { StockCountingPage } from "@/components/inventory/StockCountingPage";
import { useStockLevels } from "@/hooks/useStockLevels";
import { stAustellProducts } from "@/data/st-austell-products";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Combined products from all suppliers for comprehensive stock counting
const allProducts = [
  ...stAustellProducts.map(p => ({
    ...p,
    category: p.category || 'MISC',
    unit: p.unit || 'each',
    costPerUnit: typeof p.costPerUnit === 'number' ? p.costPerUnit : 0,
    reorderPoint: p.reorderPoint || 0,
    supplierId: 'st-austell'
  }))
];

const productIds = allProducts.map(p => p.id);

export default function StockCount() {
  const navigate = useNavigate();
  const { stockLevels, updateStock, isLoading, isSaving } = useStockLevels(productIds);

  const handleStockChange = (productId: string, location: 'bar' | 'cellar', quantity: number) => {
    updateStock(productId, location, quantity);
  };

  const getCategoryGroup = (category: string, productName?: string): string => {
    // Enhanced category grouping logic
    if (category.includes('DRAUGHT') || category.includes('CASK')) return 'DRAUGHT';
    if (category.includes('POST-MIX') || category.includes('POSTMIX')) return 'POST-MIX';
    if (category.includes('SPIRIT')) return 'SPIRITS';
    if (category.includes('WINE')) return 'WINES';
    if (category.includes('BEER') || category.includes('LAGER')) return 'BEERS';
    if (category.includes('CIDER')) return 'CIDERS';
    if (category.includes('FOOD')) return 'FOOD';
    if (category.includes('MIXER') || category.includes('SOFT')) return 'MIXERS';
    return category.toUpperCase();
  };

  const getProductLocations = (category: string, productName?: string): string[] => {
    const categoryGroup = getCategoryGroup(category, productName);
    
    // Most products are available in both locations
    if (categoryGroup === 'DRAUGHT') return ['cellar'];
    if (categoryGroup === 'POST-MIX') return ['bar'];
    return ['bar', 'cellar'];
  };

  const handleSaveAll = async () => {
    // Stock changes are saved automatically via the hook
    // This is just for user feedback
    return Promise.resolve();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-muted-foreground">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <StockCountingPage
        products={allProducts}
        stockLevels={stockLevels}
        onStockChange={handleStockChange}
        getCategoryGroup={getCategoryGroup}
        getProductLocations={getProductLocations}
        isSaving={isSaving}
        onSave={handleSaveAll}
      />
    </div>
  );
}