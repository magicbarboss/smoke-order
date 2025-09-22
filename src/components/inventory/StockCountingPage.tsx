import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Calculator, Plus, Minus, RotateCcw, Save, Scan } from "lucide-react";
import { Product } from "@/types/inventory";
import { useToast } from "@/hooks/use-toast";

interface StockCountingPageProps {
  products: Product[];
  stockLevels: Record<string, { bar: number; cellar: number }>;
  onStockChange: (productId: string, location: 'bar' | 'cellar', quantity: number) => void;
  getCategoryGroup: (category: string, productName?: string) => string;
  getProductLocations: (category: string, productName?: string) => string[];
  isSaving?: boolean;
  onSave?: () => Promise<void>;
}

export function StockCountingPage({
  products,
  stockLevels,
  onStockChange,
  getCategoryGroup,
  getProductLocations,
  isSaving = false,
  onSave
}: StockCountingPageProps) {
  const [selectedLocation, setSelectedLocation] = useState<'bar' | 'cellar'>('cellar');
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const { toast } = useToast();

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
    toast({
      title: "Location Reset",
      description: `All stock counts for ${selectedLocation} have been reset to 0.`,
    });
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    // Simple barcode simulation - find product by name or ID
    const foundProduct = filteredProducts.find(p => 
      p.name.toLowerCase().includes(barcodeInput.toLowerCase()) ||
      p.id.toLowerCase().includes(barcodeInput.toLowerCase())
    );

    if (foundProduct) {
      handleQuickAdd(foundProduct.id, 1);
      toast({
        title: "Product Scanned",
        description: `Added 1 ${foundProduct.name} to ${selectedLocation}`,
      });
    } else {
      toast({
        title: "Product Not Found",
        description: "No matching product found for this scan.",
        variant: "destructive",
      });
    }

    setBarcodeInput("");
  };

  const totalCountedValue = countedProducts.reduce((sum, product) => {
    const stock = stockLevels[product.id]?.[selectedLocation] || 0;
    return sum + (stock * product.costPerUnit);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Counting System</h1>
          <p className="text-muted-foreground">
            Professional inventory counting interface
          </p>
        </div>
        {onSave && (
          <Button onClick={onSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save All Changes"}
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{selectedLocation}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {countedProducts.length} / {filteredProducts.length}
            </div>
            <p className="text-xs text-muted-foreground">Products counted</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalCountedValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current count</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredProducts.length > 0 ? Math.round((countedProducts.length / filteredProducts.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Select Location</Label>
            <RadioGroup 
              value={selectedLocation} 
              onValueChange={(value: 'bar' | 'cellar') => setSelectedLocation(value)}
              className="flex gap-8"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cellar" id="cellar" />
                <Label htmlFor="cellar" className="text-lg font-medium cursor-pointer">
                  Cellar
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bar" id="bar" />
                <Label htmlFor="bar" className="text-lg font-medium cursor-pointer">
                  Bar
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Search and Barcode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Scan (Simulation)</Label>
              <form onSubmit={handleBarcodeSubmit} className="relative">
                <Scan className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Type product name to simulate scan..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="pl-10"
                />
              </form>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetLocation}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset {selectedLocation}
            </Button>
            <Badge variant="outline" className="px-3 py-1">
              {countedProducts.length} / {filteredProducts.length} counted
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Products in {selectedLocation} ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No products found for {selectedLocation} location
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-center">Quick Actions</TableHead>
                    <TableHead className="text-center">Stock Count</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const currentStock = stockLevels[product.id]?.[selectedLocation] || 0;
                    const categoryGroup = getCategoryGroup(product.category, product.name);
                    const isDecimal = categoryGroup === 'POST-MIX' || categoryGroup === 'DRAUGHT';
                    const value = currentStock * product.costPerUnit;

                    return (
                      <TableRow key={product.id} className={currentStock > 0 ? "bg-muted/30" : ""}>
                        <TableCell className="font-medium max-w-[200px]">
                          <div className="truncate" title={product.name}>
                            {product.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {categoryGroup}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {product.unit}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickAdd(product.id, -10)}
                              disabled={currentStock < 10}
                              className="h-7 w-7 p-0 text-xs"
                            >
                              -10
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickAdd(product.id, -1)}
                              disabled={currentStock < 1}
                              className="h-7 w-7 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickAdd(product.id, 1)}
                              className="h-7 w-7 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuickAdd(product.id, 10)}
                              className="h-7 w-7 p-0 text-xs"
                            >
                              +10
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={currentStock}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              handleStockUpdate(product.id, value);
                            }}
                            className="w-20 text-center font-bold"
                            step={isDecimal ? "0.1" : "1"}
                            min="0"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          £{value.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}