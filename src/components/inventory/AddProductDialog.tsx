import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  currentPrice: z.string().min(1, "Price is required"),
  reorderPoint: z.string().optional(),
  customCategory: z.string().optional(),
  barStock: z.string().optional(),
  cellarStock: z.string().optional(),
  holdingStock: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddProductDialogProps {
  supplierId: string;
  supplierName: string;
  existingCategories: string[];
  onProductAdded: () => void;
}

const UNIT_OPTIONS = [
  "bottle",
  "case", 
  "keg",
  "litre",
  "pint",
  "shot",
  "each"
];

export function AddProductDialog({ 
  supplierId, 
  supplierName, 
  existingCategories, 
  onProductAdded 
}: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      unit: "",
      currentPrice: "",
      reorderPoint: "0",
      customCategory: "",
      barStock: "0",
      cellarStock: "0", 
      holdingStock: "0",
    },
  });

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const category = useCustomCategory ? data.customCategory : data.category;
      const price = parseFloat(data.currentPrice);
      const reorderPoint = parseInt(data.reorderPoint || "0");

      // Insert product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: data.name,
          category: category?.toUpperCase() || "",
          unit: data.unit,
          current_price: price,
          reorder_point: reorderPoint,
          supplier_id: supplierId,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Insert stock levels for each location
      const stockLevels = [
        { location: 'bar', quantity: parseFloat(data.barStock || "0") },
        { location: 'cellar', quantity: parseFloat(data.cellarStock || "0") },
        { location: 'holding', quantity: parseFloat(data.holdingStock || "0") },
      ];

      const { error: stockError } = await supabase
        .from('stock_levels')
        .insert(
          stockLevels.map(stock => ({
            product_id: product.id,
            location: stock.location,
            quantity: stock.quantity,
          }))
        );

      if (stockError) throw stockError;

      toast({
        title: "Success",
        description: `Product "${data.name}" added successfully`,
      });

      form.reset();
      setUseCustomCategory(false);
      setOpen(false);
      onProductAdded();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryValue = form.watch("category");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product - {supplierName}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={!useCustomCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseCustomCategory(false)}
                >
                  Existing
                </Button>
                <Button
                  type="button"
                  variant={useCustomCategory ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseCustomCategory(true)}
                >
                  Custom
                </Button>
              </div>
            </div>

            {!useCustomCategory ? (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {existingCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="customCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter new category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIT_OPTIONS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Price (£)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reorderPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Point</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Initial Stock Levels</label>
              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="barStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Bar</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0" 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cellarStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Cellar</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0" 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="holdingStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Holding</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0" 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Adding..." : "Add Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}