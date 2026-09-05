import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { InventoryService } from '../../core/services/inventory.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        {
          provide: InventoryService,
          useValue: {
            getProducts: () =>
              of({
                success: true,
                data: {
                  items: [
                    {
                      id: '1',
                      name: 'Laptop',
                      sku: 'LP-01',
                      categoryId: null,
                      price: 100,
                      stock: 5,
                      minimumStock: 5,
                      createdAt: '2026-01-01',
                    },
                  ],
                  page: 1,
                  pageSize: 10,
                  total: 1,
                  totalPages: 1,
                  hasNextPage: false,
                  hasPreviousPage: false,
                },
                message: '',
                errors: [],
                timestamp: '',
              }),
            getCategories: () =>
              of({
                success: true,
                data: { items: [{ id: 'c1', name: 'Tech' }], page: 1, pageSize: 10, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
                message: '',
                errors: [],
                timestamp: '',
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
  });

  it('loads dashboard data', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance.data()?.totalProducts).toBe(1);
  });
});
