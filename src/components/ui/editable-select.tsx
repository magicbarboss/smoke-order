import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface EditableSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export function EditableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select option...",
  className,
}: EditableSelectProps) {
  const [open, setOpen] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newValue, setNewValue] = useState("");

  const handleAddNew = () => {
    if (newValue.trim()) {
      onValueChange(newValue.trim());
      setNewValue("");
      setShowAddNew(false);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandList>
            <CommandEmpty>
              {showAddNew ? (
                <div className="p-2 space-y-2">
                  <Input
                    placeholder="Enter new option..."
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddNew();
                      }
                      if (e.key === "Escape") {
                        setShowAddNew(false);
                        setNewValue("");
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddNew}>
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddNew(false);
                        setNewValue("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setShowAddNew(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add new option
                </Button>
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onValueChange(option === value ? "" : option);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
              {!showAddNew && (
                <CommandItem
                  onSelect={() => setShowAddNew(true)}
                  className="text-muted-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add new option
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}