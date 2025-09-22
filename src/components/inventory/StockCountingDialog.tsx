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
    handleStockUpdate(productId, currentStock + amount);
  };

  const resetLocation = () => {
    filteredProducts.forEach(product => {
      handleStockUpdate(product.id, 0);
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
      <DialogContent className="w-screen sm:w-[95vw] max-w-4xl h-[calc(100dvh-2rem)] sm:h-[85vh] p-0 sm:p-6 overflow-hidden flex flex-col">
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

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Location Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Location Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={selectedLocation} 
                onValueChange={(value: 'bar' | 'cellar') => setSelectedLocation(value)}
                className="flex gap-8"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cellar" id="cellar" />
                  <Label htmlFor="cellar" className="text-sm md:text-lg font-medium cursor-pointer">
                    Cellar
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bar" id="bar" />
                  <Label htmlFor="bar" className="text-sm md:text-lg font-medium cursor-pointer">
                    Bar
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Progress and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="px-3 py-1 text-xs">
                    {countedProducts.length} / {filteredProducts.length} counted
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetLocation}
                    className="text-muted-foreground hover:text-destructive text-xs sm:text-sm"
                  >
                    <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Reset {selectedLocation}
                  </Button>
                </div>
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="pb-3">
              <h3 className="text-base md:text-lg font-semibold">
                Products in {selectedLocation} ({filteredProducts.length})
              </h3>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 py-2 px-3 bg-muted/50 rounded-t-lg border text-xs sm:text-sm font-medium text-muted-foreground">
              <div className="col-span-5 sm:col-span-6">Product</div>
              <div className="col-span-2 text-center">Category</div>
              <div className="col-span-2 text-center">Unit</div>
              <div className="col-span-3 sm:col-span-2 text-center">Stock Count</div>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y border-x border-b rounded-b-lg" style={{ WebkitOverflowScrolling: 'touch' }}>
              {filteredProducts.map((product, index) => {
                const currentStock = stockLevels[product.id]?.[selectedLocation] || 0;
                const categoryGroup = getCategoryGroup(product.category, product.name);
                const isDecimal = categoryGroup === 'POST-MIX' || categoryGroup === 'DRAUGHT';

                return (
                  <div 
                    key={product.id} 
                    className={`grid grid-cols-12 gap-2 py-3 px-3 text-xs sm:text-sm border-b hover:bg-muted/30 ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                    }`}
                  >
                    {/* Product Name */}
                    <div className="col-span-5 sm:col-span-6 flex flex-col justify-center min-w-0">
                      <div className="font-medium text-foreground leading-tight truncate">
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
                    <div className="col-span-2 flex items-center justify-center text-muted-foreground text-xs">
                      {product.unit}
                    </div>

                    {/* Stock Controls */}
                    <div className="col-span-3 sm:col-span-2 flex items-center justify-center gap-1">
                      {/* Quick subtract */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAdd(product.id, -1)}
                        disabled={currentStock < 1}
                        className="h-6 w-6 p-0 rounded"
                      >
                        <Minus className="h-2 w-2" />
                      </Button>

                      {/* Stock input */}
                      <Input
                        type="number"
                        value={currentStock}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          handleStockUpdate(product.id, value);
                        }}
                        className="w-12 sm:w-14 h-6 text-center text-xs font-bold px-1"
                        step={isDecimal ? "0.1" : "1"}
                        min="0"
                      />

                      {/* Quick add */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAdd(product.id, 1)}
                        className="h-6 w-6 p-0 rounded"
                      >
                        <Plus className="h-2 w-2" />
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