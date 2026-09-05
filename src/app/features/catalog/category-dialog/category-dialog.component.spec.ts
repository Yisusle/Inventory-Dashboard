import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { InventoryService } from '../../../core/services/inventory.service';
import { CategoryDialogComponent } from './category-dialog.component';

describe('CategoryDialogComponent', () => {
  let fixture: ComponentFixture<CategoryDialogComponent>;
  let closed = false;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryDialogComponent],
      providers: [
        provideHttpClient(),
        { provide: MAT_DIALOG_DATA, useValue: undefined },
        { provide: MatDialogRef, useValue: { close: () => { closed = true; } } },
        { provide: MatSnackBar, useValue: { open: () => undefined } },
        {
          provide: InventoryService,
          useValue: {
            createCategory: () => of({ success: true, data: { id: '1', name: 'New' }, message: '', errors: [], timestamp: '' }),
            updateCategory: () => of({ success: true, data: { id: '1', name: 'Updated' }, message: '', errors: [], timestamp: '' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryDialogComponent);
  });

  it('creates a category when form is valid', () => {
    fixture.componentInstance.form.setValue({ name: 'New' });
    fixture.componentInstance.save();

    expect(closed).toBe(true);
  });
});
