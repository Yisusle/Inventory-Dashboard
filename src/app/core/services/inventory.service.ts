import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedData } from '../models/api-response.model';
import {
  Category,
  CategoryPayload,
  InventoryTransaction,
  InventoryAdjustmentPayload,
  Product,
  ProductPayload,
  ProductSalesSummary,
  PurchasePayload,
  Sale,
  SaleReturnPayload,
  SalePayload,
  User,
} from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);

  getProducts(page = 1, pageSize = 10): Observable<ApiResponse<PaginatedData<Product>>> {
    return this.http.get<ApiResponse<PaginatedData<Product>>>(`${environment.apiBaseUrl}/products`, {
      params: this.paginationParams(page, pageSize),
    });
  }

  getProduct(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${environment.apiBaseUrl}/products/${id}`);
  }

  getProductBySku(sku: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${environment.apiBaseUrl}/products/by-sku/${encodeURIComponent(sku)}`);
  }

  createProduct(payload: ProductPayload): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${environment.apiBaseUrl}/products`, payload);
  }

  updateProduct(id: string, payload: Partial<ProductPayload>): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${environment.apiBaseUrl}/products/${id}`, payload);
  }

  deleteProduct(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${environment.apiBaseUrl}/products/${id}`);
  }

  getCategories(page = 1, pageSize = 100): Observable<ApiResponse<PaginatedData<Category>>> {
    return this.http.get<ApiResponse<PaginatedData<Category>>>(`${environment.apiBaseUrl}/categories`, {
      params: this.paginationParams(page, pageSize),
    });
  }

  getCategory(id: string): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${environment.apiBaseUrl}/categories/${id}`);
  }

  createCategory(payload: CategoryPayload): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${environment.apiBaseUrl}/categories`, payload);
  }

  updateCategory(id: string, payload: CategoryPayload): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${environment.apiBaseUrl}/categories/${id}`, payload);
  }

  deleteCategory(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${environment.apiBaseUrl}/categories/${id}`);
  }

  getPurchases(page = 1, pageSize = 10): Observable<ApiResponse<PaginatedData<InventoryTransaction>>> {
    return this.http.get<ApiResponse<PaginatedData<InventoryTransaction>>>(
      `${environment.apiBaseUrl}/purchases`,
      { params: this.paginationParams(page, pageSize) },
    );
  }

  getPurchase(id: string): Observable<ApiResponse<InventoryTransaction>> {
    return this.http.get<ApiResponse<InventoryTransaction>>(`${environment.apiBaseUrl}/purchases/${id}`);
  }

  createPurchase(payload: PurchasePayload): Observable<ApiResponse<InventoryTransaction>> {
    return this.http.post<ApiResponse<InventoryTransaction>>(`${environment.apiBaseUrl}/purchases`, {
      productId: payload.productId,
      quantity: payload.quantity,
      totalCost: payload.totalCost,
    });
  }

  getSales(page = 1, pageSize = 10): Observable<ApiResponse<PaginatedData<Sale>>> {
    return this.http.get<ApiResponse<PaginatedData<Sale>>>(`${environment.apiBaseUrl}/sales`, {
      params: this.paginationParams(page, pageSize),
    });
  }

  getSale(id: string): Observable<ApiResponse<Sale>> {
    return this.http.get<ApiResponse<Sale>>(`${environment.apiBaseUrl}/sales/${id}`);
  }

  createSale(payload: SalePayload): Observable<ApiResponse<Sale>> {
    return this.http.post<ApiResponse<Sale>>(`${environment.apiBaseUrl}/sales`, payload);
  }

  getUsers(page = 1, pageSize = 10): Observable<ApiResponse<PaginatedData<User>>> {
    return this.http.get<ApiResponse<PaginatedData<User>>>(`${environment.apiBaseUrl}/users`, {
      params: this.paginationParams(page, pageSize),
    });
  }

  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${environment.apiBaseUrl}/users/me`);
  }

  getTopSellingProducts(top = 10): Observable<ApiResponse<ProductSalesSummary[]>> {
    return this.http.get<ApiResponse<ProductSalesSummary[]>>(
      `${environment.apiBaseUrl}/sales/reports/top-products`,
      { params: new HttpParams().set('top', top) },
    );
  }

  adjustInventory(payload: InventoryAdjustmentPayload): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${environment.apiBaseUrl}/inventory-operations/adjustments`, payload);
  }

  returnSaleItem(payload: SaleReturnPayload): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${environment.apiBaseUrl}/inventory-operations/returns`, payload);
  }

  private paginationParams(page: number, pageSize: number): HttpParams {
    return new HttpParams().set('page', page).set('pageSize', pageSize);
  }
}
