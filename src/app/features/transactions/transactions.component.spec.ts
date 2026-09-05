import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { InventoryService } from '../../core/services/inventory.service';
import { SalePayload } from '../../core/models/inventory.model';
import { TransactionsComponent } from './transactions.component';

describe('TransactionsComponent', () => {
  let fixture: ComponentFixture<TransactionsComponent>;
  let submittedSale: SalePayload | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsComponent],
      providers: [
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: {
            session: signal({ token: 't', username: 'user', role: 'User' as const }).asReadonly(),
          },
        },
        {
          provide: InventoryService,
          useValue: {
            getProducts: () =>
              of({
                success: true,
                data: { items: [], page: 1, pageSize: 10, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
                message: '',
                errors: [],
                timestamp: '',
              }),
            createSale: (payload: SalePayload) => {
              submittedSale = payload;
              return of({ success: true, data: { id: '1', createdByUserId: 'user-1', lines: [], totalItems: 1, total: 10, date: '' }, message: '', errors: [], timestamp: '' });
            },
            createPurchase: () => of({ success: true, data: { id: '1', productId: '1', quantity: 1, totalCost: 10, date: '' }, message: '', errors: [], timestamp: '' }),
            getSales: () =>
              of({
                success: true,
                data: { items: [], page: 1, pageSize: 10, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
                message: '',
                errors: [],
                timestamp: '',
              }),
            getPurchases: () =>
              of({
                success: true,
                data: { items: [], page: 1, pageSize: 10, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
                message: '',
                errors: [],
                timestamp: '',
              }),
            getSale: () => of({ success: true, data: { id: '1', createdByUserId: 'user-1', lines: [], totalItems: 1, total: 10, date: '' }, message: '', errors: [], timestamp: '' }),
            getPurchase: () => of({ success: true, data: { id: '1', productId: '1', quantity: 1, totalCost: 10, date: '' }, message: '', errors: [], timestamp: '' }),
          },
        },
        { provide: MatDialog, useValue: { open: () => ({}) } },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsComponent);
  });

  it('loads products for user role', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance.products().length).toBe(0);
  });

  it('sends sale lines without client-side prices when registering a sale', () => {
    fixture.detectChanges();
    fixture.componentInstance.products.set([
      {
        id: 'product-1',
        name: 'Producto de prueba',
        sku: null,
        categoryId: null,
        price: 10,
        stock: 2,
        minimumStock: 0,
        createdAt: '',
      },
    ]);
    fixture.componentInstance.form.setValue({ productId: 'product-1', quantity: 2, totalCost: 0, quantityChange: 0, reason: '', skuLookup: '', saleId: '' });
    fixture.componentInstance.addSaleLine();
    fixture.componentInstance.submit();

    expect(submittedSale).toEqual({ lines: [{ productId: 'product-1', quantity: 2 }] });
  });
});
