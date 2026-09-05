import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import { Category, Product } from '../../core/models/inventory.model';
import { InventoryService } from '../../core/services/inventory.service';

interface DashboardData {
  products: Product[];
  categories: Category[];
  totalProducts: number;
  lowStockProducts: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly inventoryService = inject(InventoryService);

  readonly data = signal<DashboardData | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      products: this.inventoryService.getProducts(1, 100),
      categories: this.inventoryService.getCategories(),
    }).subscribe({
      next: ({ products, categories }) => {
        this.data.set({
          products: products.data.items,
          categories: categories.data.items,
          totalProducts: products.data.total,
          lowStockProducts: products.data.items.filter((product) => product.stock <= product.minimumStock).length,
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No fue posible cargar los datos del inventario.');
        this.isLoading.set(false);
      },
    });
  }
}
