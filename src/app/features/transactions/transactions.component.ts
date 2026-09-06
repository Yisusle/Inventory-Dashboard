import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, forkJoin, map, startWith } from 'rxjs';

import { InventoryAdjustmentPayload, InventoryTransaction, Product, Sale, SaleLinePayload, SaleReturnPayload } from '../../core/models/inventory.model';
import { AuthService } from '../../core/services/auth.service';
import { InventoryService } from '../../core/services/inventory.service';
import { apiErrorMessage } from '../../core/utils/api-error';
import {
  DetailRow,
  ResourceDetailDialogComponent,
} from '../../shared/resource-detail-dialog/resource-detail-dialog';

type TransactionType = 'sale' | 'purchase' | 'adjustment' | 'return';

@Component({
  selector: 'app-transactions',
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
})
export class TransactionsComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly isAdmin = computed(() => this.authService.session()?.role === 'Admin');
  readonly type = signal<TransactionType>('sale');
  readonly products = signal<Product[]>([]);
  readonly sales = signal<Sale[]>([]);
  readonly saleLines = signal<SaleLinePayload[]>([]);
  readonly purchases = signal<InventoryTransaction[]>([]);
  readonly salesPage = signal(0);
  readonly purchasesPage = signal(0);
  readonly salesPageSize = signal(10);
  readonly purchasesPageSize = signal(10);
  readonly salesTotal = signal(0);
  readonly purchasesTotal = signal(0);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly form = this.formBuilder.nonNullable.group({
    productId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    totalCost: [0],
    quantityChange: [0],
    reason: [''],
    skuLookup: [''],
    saleId: [''],
  });
  private readonly selectedProductId = toSignal(
    this.form.controls.productId.valueChanges.pipe(startWith(this.form.controls.productId.value)),
    { initialValue: this.form.controls.productId.value },
  );
  private readonly selectedQuantity = toSignal(
    this.form.controls.quantity.valueChanges.pipe(startWith(this.form.controls.quantity.value)),
    { initialValue: this.form.controls.quantity.value },
  );
  readonly selectedProduct = computed(() =>
    this.products().find((product) => product.id === this.selectedProductId()),
  );
  readonly saleTotal = computed(() =>
    this.saleLines().reduce((total, line) => total + this.productPrice(line.productId) * line.quantity, 0),
  );
  readonly saleItems = computed(() => this.saleLines().reduce((total, line) => total + line.quantity, 0));

  constructor() {
    this.configureTotalCostValidation();
    this.load();
  }

  selectType(type: TransactionType): void {
    this.type.set(type);
    this.form.reset({ productId: '', quantity: 1, totalCost: 0, quantityChange: 0, reason: '', skuLookup: '', saleId: '' });
    this.saleLines.set([]);
    this.configureTotalCostValidation();
  }

  load(): void {
    this.isLoading.set(true);
    const products = this.inventoryService.getProducts(1, 100);
    if (!this.isAdmin()) {
      products.subscribe({
        next: (response) => {
          this.products.set(response.data.items);
          this.isLoading.set(false);
        },
        error: (error: unknown) => this.showError(error, 'No se pudieron cargar los productos.'),
      });
      return;
    }

    forkJoin({
      products,
      purchases: this.inventoryService.getPurchases(this.purchasesPage() + 1, this.purchasesPageSize()),
      sales: this.inventoryService.getSales(this.salesPage() + 1, this.salesPageSize()),
    }).subscribe({
      next: (response) => {
        this.products.set(response.products.data.items);
        this.purchases.set(response.purchases.data.items);
        this.sales.set(response.sales.data.items);
        this.purchasesTotal.set(response.purchases.data.total);
        this.salesTotal.set(response.sales.data.total);
        this.isLoading.set(false);
      },
      error: (error: unknown) => this.showError(error, 'No se pudo cargar el historial de movimientos.'),
    });
  }

  changeSalesPage(event: PageEvent): void {
    this.salesPage.set(event.pageIndex);
    this.salesPageSize.set(event.pageSize);
    this.load();
  }

  changePurchasesPage(event: PageEvent): void {
    this.purchasesPage.set(event.pageIndex);
    this.purchasesPageSize.set(event.pageSize);
    this.load();
  }

  submit(): void {
    if (this.isSaving() || (this.type() !== 'sale' && this.form.invalid)) {
      this.form.markAllAsTouched();
      return;
    }

    const { productId, quantity, totalCost, quantityChange, reason, saleId } = this.form.getRawValue();
    if (this.type() === 'sale') {
      if (!this.saleLines().length) {
        this.snackBar.open('Agrega al menos un producto a la venta.', 'Cerrar', { duration: 5000 });
        return;
      }
      if (!this.hasSufficientStock()) {
        this.snackBar.open('La cantidad solicitada supera las existencias disponibles.', 'Cerrar', { duration: 5000 });
        return;
      }
    }

    const request = this.type() === 'return'
      ? this.inventoryService.returnSaleItem({ saleId, productId, quantity, reason } satisfies SaleReturnPayload).pipe(map(() => undefined))
      : this.type() === 'adjustment'
      ? this.inventoryService.adjustInventory({ productId, quantityChange, reason } satisfies InventoryAdjustmentPayload).pipe(map(() => undefined))
      : this.type() === 'purchase'
        ? this.inventoryService.createPurchase({ productId, quantity, totalCost }).pipe(map(() => undefined))
        : this.inventoryService.createSale({ lines: this.saleLines() }).pipe(map(() => undefined));

    this.isSaving.set(true);
    request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        const successMessage = {
          sale: 'Venta registrada.',
          purchase: 'Compra registrada.',
          adjustment: 'Ajuste de inventario registrado.',
          return: 'Devolución registrada.',
        }[this.type()];
        this.snackBar.open(successMessage, 'Cerrar', {
          duration: 3000,
        });
        this.form.reset({ productId: '', quantity: 1, totalCost: 0, quantityChange: 0, reason: '', skuLookup: '', saleId: '' });
        this.saleLines.set([]);
        this.load();
      },
      error: (error: unknown) => this.showError(error, 'No se pudo registrar el movimiento.'),
    });
  }

  addSaleLine(): void {
    const { productId, quantity } = this.form.getRawValue();
    const product = this.selectedProduct();
    if (!productId || !product || quantity < 1) {
      this.form.controls.productId.markAsTouched();
      this.form.controls.quantity.markAsTouched();
      return;
    }

    const currentQuantity = this.saleLines()
      .filter(line => line.productId === productId)
      .reduce((total, line) => total + line.quantity, 0);
    if (currentQuantity + quantity > product.stock) {
      this.snackBar.open('La cantidad acumulada supera las existencias disponibles.', 'Cerrar', { duration: 5000 });
      return;
    }

    this.saleLines.update(lines => [...lines, { productId, quantity }]);
    this.form.reset({ productId: '', quantity: 1, totalCost: 0, quantityChange: 0, reason: '', skuLookup: '', saleId: '' });
  }

  removeSaleLine(index: number): void {
    this.saleLines.update(lines => lines.filter((_, lineIndex) => lineIndex !== index));
  }

  exportSales(): void {
    const rows = [
      ['Venta', 'Fecha', 'Articulos', 'Productos', 'Total'],
      ...this.sales().map(sale => [
        sale.id,
        sale.date,
        sale.totalItems.toString(),
        sale.lines.map(line => `${line.productName} x ${line.quantity}`).join(' | '),
        sale.total.toFixed(2),
      ]),
    ];
    const csv = rows.map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ventas.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  findProductBySku(): void {
    const sku = this.form.controls.skuLookup.value.trim();
    if (!sku) return;

    this.inventoryService.getProductBySku(sku).subscribe({
      next: response => {
        const product = response.data;
        if (!this.products().some(item => item.id === product.id))
          this.products.update(products => [...products, product]);
        this.form.controls.productId.setValue(product.id);
      },
      error: (error: unknown) => this.showError(error, 'No se encontró un producto con ese SKU.'),
    });
  }

  productName(id: string): string {
    return this.products().find((product) => product.id === id)?.name || 'Producto no disponible';
  }

  viewSaleDetails(saleId: string): void {
    this.inventoryService.getSale(saleId).subscribe({
      next: (response) => {
        this.dialog.open(ResourceDetailDialogComponent, {
          width: '620px',
          data: {
            title: 'Detalle de venta',
            subtitle: `${response.data.totalItems} artículos`,
            rows: this.saleRows(response.data),
          },
        });
      },
      error: (error: unknown) => this.showError(error, 'No se pudo cargar el detalle de la venta.'),
    });
  }

  viewPurchaseDetails(purchaseId: string): void {
    this.inventoryService.getPurchase(purchaseId).subscribe({
      next: (response) => {
        this.dialog.open(ResourceDetailDialogComponent, {
          width: '620px',
          data: {
            title: 'Detalle de compra',
            subtitle: this.productName(response.data.productId),
            rows: this.transactionRows(response.data, 'purchase'),
          },
        });
      },
      error: (error: unknown) => this.showError(error, 'No se pudo cargar el detalle de la compra.'),
    });
  }

  private transactionRows(transaction: InventoryTransaction, type: TransactionType): DetailRow[] {
    const amount = transaction.totalCost;
    const formattedAmount =
      amount === undefined
        ? 'No disponible'
        : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);

    return [
      { label: 'ID', value: transaction.id },
      { label: 'Producto', value: this.productName(transaction.productId) },
      { label: 'Cantidad', value: `${transaction.quantity}` },
      { label: 'Total de compra', value: formattedAmount },
      {
        label: 'Fecha',
        value: new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(
          new Date(transaction.date),
        ),
      },
    ];
  }

  private configureTotalCostValidation(): void {
    const totalCost = this.form.controls.totalCost;
    totalCost.setValidators(
      this.type() === 'purchase' ? [Validators.required, Validators.min(0.01)] : [],
    );
    totalCost.updateValueAndValidity();
    const quantityChange = this.form.controls.quantityChange;
    const reason = this.form.controls.reason;
    quantityChange.setValidators(this.type() === 'adjustment' ? [Validators.required, Validators.min(-1000000), Validators.max(1000000)] : []);
    reason.setValidators(this.type() === 'adjustment' || this.type() === 'return' ? [Validators.required, Validators.minLength(3), Validators.maxLength(500)] : []);
    this.form.controls.saleId.setValidators(this.type() === 'return' ? [Validators.required] : []);
    quantityChange.updateValueAndValidity();
    reason.updateValueAndValidity();
    this.form.controls.saleId.updateValueAndValidity();
  }

  private formatCurrency(amount: number | undefined): string {
    return amount === undefined
      ? 'No disponible'
      : new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  }

  private saleRows(sale: Sale): DetailRow[] {
    return [
      { label: 'ID', value: sale.id },
      ...sale.lines.map(line => ({
        label: `${line.productName} × ${line.quantity}`,
        value: `${this.formatCurrency(line.unitPrice)} · ${this.formatCurrency(line.total)}`,
      })),
      { label: 'Total', value: this.formatCurrency(sale.total) },
      {
        label: 'Fecha',
        value: new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(sale.date)),
      },
    ];
  }

  productPrice(productId: string): number {
    return this.products().find(product => product.id === productId)?.price ?? 0;
  }

  private hasSufficientStock(): boolean {
    return this.saleLines().every(line =>
      line.quantity <= (this.products().find(product => product.id === line.productId)?.stock ?? 0),
    );
  }

  private showError(error: unknown, fallback: string): void {
    this.isLoading.set(false);
    this.snackBar.open(apiErrorMessage(error, fallback), 'Cerrar', { duration: 5000 });
  }
}
