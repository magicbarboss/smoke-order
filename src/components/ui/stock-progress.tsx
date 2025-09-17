import * as React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface StockProgressProps {
  current: number;
  reorderPoint: number;
  maximum: number;
  className?: string;
}

export function StockProgress({ current, reorderPoint, maximum, className }: StockProgressProps) {
  const percentage = (current / maximum) * 100;
  const reorderPercentage = (reorderPoint / maximum) * 100;
  
  const getStockLevel = () => {
    if (current <= reorderPoint) return "low";
    if (current <= reorderPoint * 1.5) return "medium";
    return "high";
  };

  const getProgressColor = () => {
    const level = getStockLevel();
    switch (level) {
      case "low": return "bg-stock-low";
      case "medium": return "bg-stock-medium"; 
      default: return "bg-stock-high";
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{current}</span>
        <span>Max: {maximum}</span>
      </div>
      <div className="relative">
        <Progress value={percentage} className="h-2" />
        {/* Reorder point indicator */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-border"
          style={{ left: `${Math.min(reorderPercentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Reorder: {reorderPoint}</span>
        <span className={cn("font-medium capitalize", 
          getStockLevel() === "low" && "text-stock-low",
          getStockLevel() === "medium" && "text-stock-medium",
          getStockLevel() === "high" && "text-stock-high"
        )}>
          {getStockLevel()}
        </span>
      </div>
    </div>
  );
}