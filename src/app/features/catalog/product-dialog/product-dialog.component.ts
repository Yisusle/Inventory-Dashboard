import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { Category, Product } from '../../../core/models/inventory.model';
import { InventoryService } from '../../../core/services/inventory.service';
import { apiErrorMessage } from '../../../core/utils/api-error';

export interface ProductDialogData {
  categories: Category[];
  product?: Product;
}

@Component({
  selector: 'app-product-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  templateUrl: './product-dialog.component.html',
})
export class ProductDialogComponent {
  readonly data = inject<ProductDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ProductDialogComponent>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly snackBar = inject(MatSnackBar);

  readonly isSaving = signal(false);
  readonly form = this.formBuilder.nonNullable.group({
    name: [this.data.product?.name ?? '', [Validators.required, Validators.maxLength(120)]],
    sku: [this.data.product?.sku ?? '', [Validators.maxLength(64)]],
    categoryId: [this.data.product?.categoryId ?? ''],
    price: [this.data.product?.price ?? 0, [Validators.required, Validators.min(0.01)]],
    stock: [this.data.product?.stock ?? 0, [Validators.required, Validators.min(0)]],
    minimumStock: [this.data.product?.minimumStock ?? 0, [Validators.required, Validators.min(0)]],
  });

  save(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const commonPayload = {
      name: value.name,
      sku: value.sku || null,
      categoryId: value.categoryId || null,
      price: value.price,
      minimumStock: value.minimumStock,
    };

    this.isSaving.set(true);
    const request = this.data.product
      ? this.inventoryService.updateProduct(this.data.product.id, commonPayload)
      : this.inventoryService.createProduct({ ...commonPayload, stock: value.stock });

    request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => this.dialogRef.close(true),
      error: (error: unknown) =>
        this.snackBar.open(apiErrorMessage(error, 'No se pudo guardar el producto.'), 'Cerrar', {
          duration: 5000,
        }),
    });
  }
}
