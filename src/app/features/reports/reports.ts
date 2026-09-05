import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProductSalesSummary } from '../../core/models/inventory.model';
import { InventoryService } from '../../core/services/inventory.service';
import { apiErrorMessage } from '../../core/utils/api-error';

@Component({
  selector: 'app-reports',
  imports: [
    CurrencyPipe,
    DecimalPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class ReportsComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly formBuilder = inject(FormBuilder);

  readonly products = signal<ProductSalesSummary[]>([]);
  readonly isLoading = signal(true);
  readonly topControl = this.formBuilder.nonNullable.control(10);
  readonly totalRevenue = computed(() =>
    this.products().reduce((total, product) => total + product.totalRevenue, 0),
  );
  readonly totalUnits = computed(() =>
    this.products().reduce((total, product) => total + product.totalQuantitySold, 0),
  );
  readonly highestRevenue = computed(() => Math.max(...this.products().map((product) => product.totalRevenue), 0));

  constructor() {
    this.load();
  }

  load(): void {
    const requestedTop = Number(this.topControl.value || 10);
    const top = Number.isNaN(requestedTop) ? 10 : Math.max(1, Math.min(100, requestedTop));
    this.isLoading.set(true);
    this.inventoryService.getTopSellingProducts(top).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.snackBar.open(apiErrorMessage(error, 'No se pudo cargar el reporte de ventas.'), 'Cerrar', {
          duration: 5000,
        });
      },
    });
  }

  revenuePercent(revenue: number): number {
    const highestRevenue = this.highestRevenue();
    return highestRevenue ? (revenue / highestRevenue) * 100 : 0;
  }
}
