import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { InventoryService } from '../../core/services/inventory.service';
import { CatalogComponent } from './catalog.component';

describe('CatalogComponent', () => {
  let fixture: ComponentFixture<CatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogComponent],
      providers: [
        provideHttpClient(),
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
            getCategories: () =>
              of({
                success: true,
                data: { items: [], page: 1, pageSize: 10, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
                message: '',
                errors: [],
                timestamp: '',
              }),
            deleteProduct: () => of({ success: true, data: null, message: '', errors: [], timestamp: '' }),
            deleteCategory: () => of({ success: true, data: null, message: '', errors: [], timestamp: '' }),
            getProduct: () => of({ success: true, data: { id: '1', name: 'P', sku: null, categoryId: null, price: 1, stock: 1, minimumStock: 0, createdAt: '' }, message: '', errors: [], timestamp: '' }),
            getCategory: () => of({ success: true, data: { id: '1', name: 'C' }, message: '', errors: [], timestamp: '' }),
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => ({ afterClosed: () => of(false) }),
          },
        },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogComponent);
  });

  it('loads catalog lists', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance.products().length).toBe(0);
    expect(fixture.componentInstance.categories().length).toBe(0);
  });
});
