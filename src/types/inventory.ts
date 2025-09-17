export interface StockLocation {
  bar: number;
  cellar: number;
  holding?: number;
  comingMon?: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  costPerUnit: number;
  stock: StockLocation;
  reorderPoint: number;
  supplierId: string;
  discontinued?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  account: string;
  deadline: string;
  deliveryWindow: string;
  hasVAT?: boolean;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  cost: number;
}

export interface Order {
  id: string;
  supplierId: string;
  items: OrderItem[];
  totalCost: number;
  status: 'draft' | 'submitted' | 'delivered';
  createdAt: Date;
  deadline: Date;
}