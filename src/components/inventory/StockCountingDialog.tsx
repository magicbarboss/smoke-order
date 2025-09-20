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
      <DialogContent className="w-[95vw] max-w-4xl h-[85vh] flex flex-col">
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
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 md:pr-2" style={{ WebkitOverflowScrolling: 'touch' }}>
              {filteredProducts.map((product) => {
                const currentStock = stockLevels[product.id]?.[selectedLocation] || 0;
                const categoryGroup = getCategoryGroup(product.category, product.name);
                const isDecimal = categoryGroup === 'POST-MIX' || categoryGroup === 'DRAUGHT';

                return (
                  <Card key={product.id} className="border">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground text-sm sm:text-base leading-tight">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {categoryGroup}
                            </Badge>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {product.unit}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                          {/* Quick subtract buttons */}
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickAdd(product.id, -10)}
                              disabled={currentStock < 10}
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs"
                            >
                              -10
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickAdd(product.id, -1)}
                              disabled={currentStock < 1}
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            >
                              <Minus className="h-2 w-2 sm:h-3 sm:w-3" />
                            </Button>
                          </div>

                          {/* Stock input */}
                          <div className="text-center">
                            <Input
                              type="number"
                              value={currentStock}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0;
                                handleStockUpdate(product.id, value);
                              }}
                              className="w-14 sm:w-16 md:w-20 text-center text-sm sm:text-base md:text-lg font-bold"
                              step={isDecimal ? "0.1" : "1"}
                              min="0"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Stock
                            </p>
                          </div>

                          {/* Quick add buttons */}
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickAdd(product.id, 1)}
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                            >
                              <Plus className="h-2 w-2 sm:h-3 sm:w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickAdd(product.id, 10)}
                              className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs"
                            >
                              +10
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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