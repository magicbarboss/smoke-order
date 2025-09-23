import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Search, Calculator, Plus, Minus, RotateCcw } from "lucide-react";
import { Product } from "@/types/inventory";

interface StockCountingDialogProps {
  products: Product[];
  stockLevels: Record<string, { bar: number; cellar: number }>;
  onStockChange: (productId: string, location: 'bar' | 'cellar', quantity: number) => void;
  getCategoryGroup: (category: string, productName?: string) => string;
  getProductLocations: (category: string, productName?: string) => string[];
  isSaving?: boolean;
}

export function StockCountingDialog({
  products,
  stockLevels,
  onStockChange,
  getCategoryGroup,
  getProductLocations,
  isSaving = false
}: StockCountingDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<'bar' | 'cellar'>('cellar');
  const [searchTerm, setSearchTerm] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const getKey = (id: string) => `${id}:${selectedLocation}`;
  // Filter products based on location and search
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const locations = getProductLocations(product.category, product.name);
      const hasLocation = locations.includes(selectedLocation);
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase());
      return hasLocation && matchesSearch;
    });
  }, [products, selectedLocation, searchTerm, getProductLocations]);

  // Count products that have been updated (non-zero stock)
  const countedProducts = filteredProducts.filter(product => {
    const stock = stockLevels[product.id]?.[selectedLocation] || 0;
    return stock > 0;
  });

  const handleStockUpdate = (productId: string, newQuantity: number) => {
    onStockChange(productId, selectedLocation, Math.max(0, newQuantity));
  };

  const handleQuickAdd = (productId: string, amount: number) => {
    const currentStock = stockLevels[productId]?.[selectedLocation] || 0;
    const next = Math.max(0, currentStock + amount);
    handleStockUpdate(productId, next);
    const key = getKey(productId);
    setDrafts((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };
  const commitDraft = (productId: string) => {
    const key = getKey(productId);
    const raw = drafts[key];
    const parsed = raw === "" || raw == null ? 0 : parseFloat(raw);
    const next = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    handleStockUpdate(productId, next);
    setDrafts((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const resetLocation = () => {
    filteredProducts.forEach(product => {
      handleStockUpdate(product.id, 0);
    });
    // Clear drafts for current location
    setDrafts((prev) => {
      const updated = { ...prev } as Record<string, string>;
      filteredProducts.forEach((p) => {
        const key = getKey(p.id);
        delete updated[key];
      });
      return updated;
    });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Stock Count
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl mx-auto p-4 sm:p-6 overflow-hidden flex h-full sm:h-auto flex-col rounded-none sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Stock Counting System
            {isSaving && (
              <Badge variant="secondary" className="ml-2">
                Saving...
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-3 overflow-hidden min-h-0">
          {/* Compact Location Selection */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-muted-foreground">Location:</span>
              <RadioGroup 
                value={selectedLocation} 
                onValueChange={(value: 'bar' | 'cellar') => setSelectedLocation(value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cellar" id="cellar" />
                  <Label htmlFor="cellar" className="text-sm font-medium cursor-pointer">
                    Cellar
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bar" id="bar" />
                  <Label htmlFor="bar" className="text-sm font-medium cursor-pointer">
                    Bar
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-2 py-1 text-xs">
                {countedProducts.length} / {filteredProducts.length}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetLocation}
                className="text-muted-foreground hover:text-destructive text-xs h-8 px-2"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Compact Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>

          {/* Product List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="pb-3">
              <h3 className="text-base md:text-lg font-semibold">
                Products in {selectedLocation} ({filteredProducts.length})
              </h3>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 py-2 px-3 bg-muted/50 rounded-t-lg border text-xs sm:text-sm font-medium text-muted-foreground">
              <div className="col-span-4 sm:col-span-5">Product</div>
              <div className="col-span-2 text-center">Category</div>
              <div className="col-span-1 text-center">Unit</div>
              <div className="col-span-5 sm:col-span-4 text-center">Stock Count</div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y border-x border-b rounded-b-lg" style={{ WebkitOverflowScrolling: 'touch' }}>
              {filteredProducts.map((product, index) => {
                const currentStock = stockLevels[product.id]?.[selectedLocation] || 0;
                const categoryGroup = getCategoryGroup(product.category, product.name);
                const isDecimal = categoryGroup === 'POST-MIX' || categoryGroup === 'DRAUGHT';
                const inputKey = getKey(product.id);
                return (
                  <div 
                    key={product.id} 
                    className={`grid grid-cols-12 gap-3 py-4 px-3 text-xs sm:text-sm border-b hover:bg-muted/30 ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                    }`}
                  >
                    {/* Product Name */}
                    <div className="col-span-4 sm:col-span-5 flex flex-col justify-center min-w-0">
                      <div className="font-medium text-foreground leading-tight">
                        {product.name}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-2 flex items-center justify-center">
                      <Badge variant="secondary" className="text-xs px-1 py-0.5 h-auto">
                        {categoryGroup}
                      </Badge>
                    </div>

                    {/* Unit */}
                    <div className="col-span-1 flex items-center justify-center text-muted-foreground text-xs">
                      {product.unit}
                    </div>

                    {/* Stock Controls */}
                    <div className="col-span-5 sm:col-span-4 flex items-center justify-center gap-2">
                      {/* Quick subtract */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAdd(product.id, -1)}
                        disabled={currentStock < 1}
                        className="h-10 w-10 p-0 rounded touch-manipulation active:scale-95 transition-transform"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      {/* Stock input */}
                      <Input
                        type="text"
                        value={drafts[inputKey] ?? (currentStock === 0 ? "" : currentStock.toString())}
                        onChange={(e) => setDrafts((d) => ({ ...d, [inputKey]: e.target.value }))}
                        onBlur={() => commitDraft(product.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            commitDraft(product.id)
                          }
                        }}
                        onFocus={(e) => e.currentTarget.select()}
                        placeholder="0"
                        className="w-20 sm:w-28 h-12 sm:h-14 text-center text-base sm:text-lg font-bold px-2 touch-manipulation"
                        inputMode={isDecimal ? "decimal" : "numeric"}
                        autoComplete="off"
                      />

                      {/* Quick add */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAdd(product.id, 1)}
                        className="h-10 w-10 p-0 rounded touch-manipulation active:scale-95 transition-transform"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No products found for {selectedLocation} location
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}