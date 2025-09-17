import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditableSelect } from "@/components/ui/editable-select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Eye, EyeOff } from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_price: number;
  reorder_point: number;
  supplier_id: string;
  discontinued?: boolean;
  discontinued_at?: string;
  discontinued_by?: string;
}

interface ProductEditDialogProps {
  products: Product[];
  supplierName: string;
  existingCategories: string[];
  onProductsUpdated: () => void;
  trigger?: React.ReactNode;
}

interface EditingProduct {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_price: number;
  reorder_point: number;
  discontinued: boolean;
}

const commonUnits = [
  "bottle", "case", "keg", "can", "box", "pack", "litre", "ml", "unit"
];

export function ProductEditDialog({ 
  products, 
  supplierName, 
  existingCategories,
  onProductsUpdated,
  trigger 
}: ProductEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingProducts, setEditingProducts] = useState<Record<string, EditingProduct>>({});
  const [updating, setUpdating] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showDiscontinued, setShowDiscontinued] = useState(false);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (isOpen) {
      // Initialize editing state
      const initialEditingProducts: Record<string, EditingProduct> = {};
      products.forEach(product => {
        initialEditingProducts[product.id] = {
          id: product.id,
          name: product.name,
          category: product.category,
          unit: product.unit,
          current_price: product.current_price,
          reorder_point: product.reorder_point,
          discontinued: product.discontinued || false,
        };
      });
      setEditingProducts(initialEditingProducts);
    }
  }, [isOpen, products]);

  const updateEditingProduct = (productId: string, field: keyof EditingProduct, value: string | number | boolean) => {
    setEditingProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const hasChanges = () => {
    return Object.values(editingProducts).some(editingProduct => {
      const originalProduct = products.find(p => p.id === editingProduct.id);
      return originalProduct && (
        originalProduct.name !== editingProduct.name ||
        originalProduct.category !== editingProduct.category ||
        originalProduct.unit !== editingProduct.unit ||
        originalProduct.current_price !== editingProduct.current_price ||
        originalProduct.reorder_point !== editingProduct.reorder_point ||
        (originalProduct.discontinued || false) !== editingProduct.discontinued
      );
    });
  };

  const isUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const getChangedProducts = () => {
    return Object.values(editingProducts).filter(editingProduct => {
      const originalProduct = products.find(p => p.id === editingProduct.id);
      return originalProduct && (
        originalProduct.name !== editingProduct.name ||
        originalProduct.category !== editingProduct.category ||
        originalProduct.unit !== editingProduct.unit ||
        originalProduct.current_price !== editingProduct.current_price ||
        originalProduct.reorder_point !== editingProduct.reorder_point ||
        (originalProduct.discontinued || false) !== editingProduct.discontinued
      );
    });
  };

  const handleSaveChanges = async () => {
    // Check authentication first
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to edit products.",
        variant: "destructive",
      });
      return;
    }

    const changedProducts = getChangedProducts();
    
    if (changedProducts.length === 0) {
      toast({
        title: "No Changes",
        description: "No changes to save.",
      });
      return;
    }

    setUpdating(true);
    try {
      // Update products in database
      for (const product of changedProducts) {
        if (isUUID(product.id)) {
          // Product already exists in DB, update it
          const { error } = await supabase
            .from('products')
            .update({
              name: product.name,
              category: product.category,
              unit: product.unit,
              current_price: product.current_price,
              reorder_point: product.reorder_point,
              discontinued: product.discontinued,
            })
            .eq('id', product.id);

          if (error) {
            console.error('Database error:', error);
            throw new Error(`Failed to update ${product.name}: ${error.message}`);
          }
        } else {
          // Product has slug ID, need to find or create in DB
          const originalProduct = products.find(p => p.id === product.id);
          if (!originalProduct) continue;

          // Try to find existing product by supplier_id and name
          const { data: existingProducts, error: findError } = await supabase
            .from('products')
            .select('id')
            .eq('supplier_id', originalProduct.supplier_id)
            .eq('name', originalProduct.name)
            .limit(1);

          if (findError) {
            console.error('Error finding product:', findError);
            throw new Error(`Failed to find product ${product.name}: ${findError.message}`);
          }

          if (existingProducts && existingProducts.length > 0) {
            // Product exists, update it
            const { error } = await supabase
              .from('products')
              .update({
                name: product.name,
                category: product.category,
                unit: product.unit,
                current_price: product.current_price,
                reorder_point: product.reorder_point,
                discontinued: product.discontinued,
              })
              .eq('id', existingProducts[0].id);

            if (error) {
              console.error('Database error:', error);
              throw new Error(`Failed to update ${product.name}: ${error.message}`);
            }
          } else {
            // Product doesn't exist, create it first then update
            const { data: newProduct, error: insertError } = await supabase
              .from('products')
              .insert({
                name: originalProduct.name,
                category: originalProduct.category,
                unit: originalProduct.unit,
                current_price: originalProduct.current_price,
                reorder_point: originalProduct.reorder_point,
                supplier_id: originalProduct.supplier_id,
                discontinued: false,
              })
              .select('id')
              .single();

            if (insertError) {
              console.error('Error creating product:', insertError);
              throw new Error(`Failed to create product ${product.name}: ${insertError.message}`);
            }

            // Now update with the edited values
            const { error: updateError } = await supabase
              .from('products')
              .update({
                name: product.name,
                category: product.category,
                unit: product.unit,
                current_price: product.current_price,
                reorder_point: product.reorder_point,
                discontinued: product.discontinued,
              })
              .eq('id', newProduct.id);

            if (updateError) {
              console.error('Error updating new product:', updateError);
              throw new Error(`Failed to update new product ${product.name}: ${updateError.message}`);
            }
          }
        }
      }

      toast({
        title: "Products Updated",
        description: `Successfully updated ${changedProducts.length} product(s).`,
      });

      setIsOpen(false);
      onProductsUpdated();
    } catch (error) {
      console.error('Error updating products:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesDiscontinued = showDiscontinued || !product.discontinued;
    return matchesSearch && matchesCategory && matchesDiscontinued;
  });

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Settings className="h-4 w-4 mr-2" />
      Edit Products
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Products - {supplierName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search-filter">Search Products</Label>
              <Input
                id="search-filter"
                placeholder="Search by name or category..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
            <div className="min-w-[200px]">
              <Label htmlFor="category-filter">Filter by Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {existingCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-discontinued"
                checked={showDiscontinued}
                onCheckedChange={setShowDiscontinued}
              />
              <Label htmlFor="show-discontinued" className="flex items-center space-x-1">
                {showDiscontinued ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>Show Discontinued</span>
              </Label>
            </div>
          </div>

          {/* Products Grid */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {filteredProducts.map(product => {
              const editingProduct = editingProducts[product.id];
              if (!editingProduct) return null;

              const hasProductChanges = 
                product.name !== editingProduct.name ||
                product.category !== editingProduct.category ||
                product.unit !== editingProduct.unit ||
                product.current_price !== editingProduct.current_price ||
                product.reorder_point !== editingProduct.reorder_point ||
                (product.discontinued || false) !== editingProduct.discontinued;

              return (
                <div 
                  key={product.id} 
                  className={`grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg relative ${
                    hasProductChanges ? 'border-primary bg-primary/5' : 'border-border'
                  } ${editingProduct.discontinued ? 'opacity-75 bg-muted/30' : ''}`}
                >
                  <div className="absolute top-2 right-2 flex gap-2">
                    {!isUUID(product.id) && (
                      <Badge variant="outline" className="text-xs">
                        Not in DB yet
                      </Badge>
                    )}
                    {editingProduct.discontinued && (
                      <Badge variant="secondary" className="text-xs">
                        Discontinued
                      </Badge>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor={`name-${product.id}`}>Product Name</Label>
                    <Input
                      id={`name-${product.id}`}
                      value={editingProduct.name}
                      onChange={(e) => updateEditingProduct(product.id, 'name', e.target.value)}
                      className={`w-full ${editingProduct.discontinued ? 'line-through' : ''}`}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`category-${product.id}`}>Category</Label>
                    <EditableSelect
                      value={editingProduct.category}
                      onValueChange={(value) => updateEditingProduct(product.id, 'category', value)}
                      options={existingCategories}
                      placeholder="Select or add category..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`unit-${product.id}`}>Unit</Label>
                    <Input
                      id={`unit-${product.id}`}
                      value={editingProduct.unit}
                      onChange={(e) => updateEditingProduct(product.id, 'unit', e.target.value)}
                      className="w-full"
                      list={`units-${product.id}`}
                      disabled={editingProduct.discontinued}
                    />
                    <datalist id={`units-${product.id}`}>
                      {commonUnits.map(unit => (
                        <option key={unit} value={unit} />
                      ))}
                    </datalist>
                  </div>
                  
                  <div>
                    <Label htmlFor={`price-${product.id}`}>Price (£)</Label>
                    <Input
                      id={`price-${product.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingProduct.current_price}
                      onChange={(e) => updateEditingProduct(product.id, 'current_price', parseFloat(e.target.value) || 0)}
                      className="w-full"
                      disabled={editingProduct.discontinued}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`reorder-${product.id}`}>Reorder Point</Label>
                    <Input
                      id={`reorder-${product.id}`}
                      type="number"
                      min="0"
                      value={editingProduct.reorder_point}
                      onChange={(e) => updateEditingProduct(product.id, 'reorder_point', parseInt(e.target.value) || 0)}
                      className="w-full"
                      disabled={editingProduct.discontinued}
                    />
                  </div>
                  
                  <div className="flex flex-col justify-end">
                    <Label htmlFor={`discontinued-${product.id}`}>Status</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id={`discontinued-${product.id}`}
                        checked={editingProduct.discontinued}
                        onCheckedChange={(checked) => updateEditingProduct(product.id, 'discontinued', checked)}
                      />
                      <Label htmlFor={`discontinued-${product.id}`} className="text-sm">
                        {editingProduct.discontinued ? 'Discontinued' : 'Active'}
                      </Label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No products found matching your filters.
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {hasChanges() ? (
                `${getChangedProducts().length} product(s) with changes`
              ) : (
                "No changes made"
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={!hasChanges() || updating}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}