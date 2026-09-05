import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { Category } from '../../../core/models/inventory.model';
import { InventoryService } from '../../../core/services/inventory.service';
import { apiErrorMessage } from '../../../core/utils/api-error';

@Component({
  selector: 'app-category-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ category ? 'Editar categoría' : 'Nueva categoría' }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content>
        <mat-form-field appearance="outline">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" />
          @if (form.controls.name.invalid) { <mat-error>Ingresa un nombre válido.</mat-error> }
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="isSaving()">
          {{ isSaving() ? 'Guardando...' : 'Guardar' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: ['mat-form-field { min-width: min(360px, 75vw); }'],
})
export class CategoryDialogComponent {
  readonly category = inject<Category | undefined>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CategoryDialogComponent>);
  private readonly formBuilder = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly snackBar = inject(MatSnackBar);

  readonly isSaving = signal(false);
  readonly form = this.formBuilder.nonNullable.group({
    name: [this.category?.name ?? '', [Validators.required, Validators.maxLength(80)]],
  });

  save(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const request = this.category
      ? this.inventoryService.updateCategory(this.category.id, this.form.getRawValue())
      : this.inventoryService.createCategory(this.form.getRawValue());

    request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => this.dialogRef.close(true),
      error: (error: unknown) =>
        this.snackBar.open(apiErrorMessage(error, 'No se pudo guardar la categoría.'), 'Cerrar', {
          duration: 5000,
        }),
    });
  }
}
