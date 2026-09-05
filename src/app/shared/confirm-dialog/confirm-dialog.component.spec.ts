import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let closePayload: boolean | null = null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { title: 'Eliminar', message: '¿Confirmar?', confirmLabel: 'Eliminar' },
        },
        {
          provide: MatDialogRef,
          useValue: {
            close: (value: boolean) => {
              closePayload = value;
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
  });

  it('closes with true on confirm', () => {
    fixture.componentInstance.confirm();

    expect(closePayload).toBe(true);
  });
});
