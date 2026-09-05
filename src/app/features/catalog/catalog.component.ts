import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Category, Product } from '../../core/models/inventory.model';
import { InventoryService } from '../../core/services/inventory.service';
import { apiErrorMessage } from '../../core/utils/api-error';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import {
  DetailRow,
  ResourceDetailDialogComponent,
} from '../../shared/resource-detail-dialog/resource-detail-dialog';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';

@Component({
  selector: 'app-catalog',
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly totalProducts = signal(0);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  readonly isLoading = signal(true);

  constructor() {
    this.loadCategories();
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.inventoryService.getProducts(this.page() + 1, this.pageSize()).subscribe({
      next: (response) => {
        this.products.set(response.data.items);
        this.totalProducts.set(response.data.total);
        this.isLoading.set(false);
      },
      error: (error: unknown) => this.showError(error, 'No se pudieron cargar los productos.'),
    });
  }

  loadCategories(): void {
    this.inventoryService.getCategories().subscribe({
      next: (response) => this.categories.set(response.data.items),
      error: (error: unknown) => this.showError(error, 'No se pudieron cargar las categorías.'),
    });
  }

  changePage(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadProducts();
  }

  openProductDialog(product?: Product): void {
    this.dialog
      .open(ProductDialogComponent, { data: { product, categories: this.categories() }, width: '680px' })
      .afterClosed()
      .subscribe((changed) => {
        if (changed) {
          this.loadProducts();
          this.showSuccess(product ? 'Producto actualizado.' : 'Producto creado.');
        }
      });
  }

  openCategoryDialog(category?: Category): void {
    this.dialog
      .open(CategoryDialogComponent, { data: category })
      .afterClosed()
      .subscribe((changed) => {
        if (changed) {
          this.loadCategories();
          this.showSuccess(category ? 'Categoría actualizada.' : 'Categoría creada.');
        }
      });
  }

  deleteProduct(product: Product): void {
    this.confirm(`¿Eliminar "${product.name}"?`).subscribe((confirmed) => {
      if (confirmed) {
        this.inventoryService.deleteProduct(product.id).subscribe({
          next: () => {
            this.loadProducts();
            this.showSuccess('Producto eliminado.');
          },
          error: (error: unknown) => this.showError(error, 'No se pudo eliminar el producto.'),
        });
      }
    });
  }

  deleteCategory(category: Category): void {
    this.confirm(`¿Eliminar la categoría "${category.name}"?`).subscribe((confirmed) => {
      if (confirmed) {
        this.inventoryService.deleteCategory(category.id).subscribe({
          next: () => {
            this.loadCategories();
            this.showSuccess('Categoría eliminada.');
          },
          error: (error: unknown) => this.showError(error, 'No se pudo eliminar la categoría.'),
        });
      }
    });
  }

  viewProductDetails(productId: string): void {
    this.inventoryService.getProduct(productId).subscribe({
      next: (response) => {
        const product = response.data;
        this.dialog.open(ResourceDetailDialogComponent, {
          width: '620px',
          data: {
            title: 'Detalle de producto',
            subtitle: product.name,
            rows: this.productDetailRows(product),
          },
        });
      },
      error: (error: unknown) => this.showError(error, 'No se pudo cargar el detalle del producto.'),
    });
  }

  viewCategoryDetails(categoryId: string): void {
    this.inventoryService.getCategory(categoryId).subscribe({
      next: (response) => {
        const category = response.data;
        this.dialog.open(ResourceDetailDialogComponent, {
          width: '560px',
          data: {
            title: 'Detalle de categoría',
            subtitle: category.name,
            rows: [
              { label: 'ID', value: category.id },
              { label: 'Nombre', value: category.name },
            ],
          },
        });
      },
      error: (error: unknown) => this.showError(error, 'No se pudo cargar el detalle de la categoría.'),
    });
  }

  categoryName(categoryId: string | null): string {
    return this.categories().find((category) => category.id === categoryId)?.name || 'Sin categoría';
  }

  private productDetailRows(product: Product): DetailRow[] {
    const createdAt = new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(product.createdAt));

    return [
      { label: 'ID', value: product.id },
      { label: 'Nombre', value: product.name },
      { label: 'SKU', value: product.sku || 'Sin SKU' },
      { label: 'Categoría', value: this.categoryName(product.categoryId) },
      { label: 'Precio', value: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(product.price) },
      { label: 'Stock', value: `${product.stock}` },
      { label: 'Creado', value: createdAt },
    ];
  }

  private confirm(message: string) {
    return this.dialog
      .open(ConfirmDialogComponent, { data: { title: 'Confirmar acción', message, confirmLabel: 'Eliminar' } })
      .afterClosed();
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }

  private showError(error: unknown, fallback: string): void {
    this.isLoading.set(false);
    this.snackBar.open(apiErrorMessage(error, fallback), 'Cerrar', { duration: 5000 });
  }
}
