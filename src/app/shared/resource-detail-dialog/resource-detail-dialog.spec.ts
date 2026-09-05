import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ResourceDetailDialogComponent } from './resource-detail-dialog';

describe('ResourceDetailDialogComponent', () => {
  let component: ResourceDetailDialogComponent;
  let fixture: ComponentFixture<ResourceDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceDetailDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { title: 'Detalle', rows: [{ label: 'ID', value: '1' }] },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceDetailDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
