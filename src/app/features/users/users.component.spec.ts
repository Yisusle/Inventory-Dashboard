import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { InventoryService } from '../../core/services/inventory.service';
import { UsersComponent } from './users.component';

describe('UsersComponent', () => {
  let fixture: ComponentFixture<UsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        provideHttpClient(),
        {
          provide: InventoryService,
          useValue: {
            getUsers: () =>
              of({
                success: true,
                data: {
                  items: [{ id: '1', username: 'admin', email: 'admin@example.com', role: 'Admin', createdAt: '2026-01-01' }],
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
          },
        },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
  });

  it('loads users list', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance.users().length).toBe(1);
  });
});
