export interface Product {
  id: string;
  name: string;
  sku: string | null;
  categoryId: string | null;
  price: number;
  stock: number;
  minimumStock: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface ProductPayload {
  name: string;
  sku: string | null;
  categoryId: string | null;
  price: number;
  stock: number;
  minimumStock: number;
}

export interface CategoryPayload {
  name: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  quantity: number;
  totalCost?: number;
  unitPrice?: number;
  total?: number;
  date: string;
}

export interface SaleLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  createdByUserId: string;
  lines: SaleLine[];
  totalItems: number;
  total: number;
  date: string;
}

export interface SaleLinePayload {
  productId: string;
  quantity: number;
}

export interface SalePayload {
  lines: SaleLinePayload[];
}

export interface PurchasePayload extends SaleLinePayload {
  totalCost: number;
}

export interface InventoryAdjustmentPayload {
  productId: string;
  quantityChange: number;
  reason: string;
}

export interface SaleReturnPayload {
  saleId: string;
  productId: string;
  quantity: number;
  reason: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'User';
  createdAt: string;
}

export interface ProductSalesSummary {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}
