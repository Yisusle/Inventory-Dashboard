import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { InventoryService } from '../../../core/services/inventory.service';
import { ProductDialogComponent } from './product-dialog.component';

describe('ProductDialogComponent', () => {
  let fixture: ComponentFixture<ProductDialogComponent>;
  let closed = false;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDialogComponent],
      providers: [
        provideHttpClient(),
        { provide: MAT_DIALOG_DATA, useValue: { categories: [] } },
        { provide: MatDialogRef, useValue: { close: () => { closed = true; } } },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
        {
          provide: InventoryService,
          useValue: {
            createProduct: () =>
              of({
                success: true,
                data: { id: '1', name: 'P', sku: null, categoryId: null, price: 1, stock: 1, minimumStock: 0, createdAt: '' },
                message: '',
                errors: [],
                timestamp: '',
              }),
            updateProduct: () =>
              of({
                success: true,
                data: { id: '1', name: 'P', sku: null, categoryId: null, price: 1, stock: 1, minimumStock: 0, createdAt: '' },
                message: '',
                errors: [],
                timestamp: '',
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDialogComponent);
  });

  it('creates a product when form is valid', () => {
    fixture.componentInstance.form.setValue({
      name: 'Producto',
      sku: '',
      categoryId: '',
      price: 10,
      stock: 4,
      minimumStock: 0,
    });
    fixture.componentInstance.save();

    expect(closed).toBe(true);
  });
});
