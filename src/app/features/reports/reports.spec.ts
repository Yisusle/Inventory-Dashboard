import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { ReportsComponent } from './reports';

describe('ReportsComponent', () => {
  let fixture: ComponentFixture<ReportsComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ReportsComponent);
  });

  it('loads the top selling products', () => {
    fixture.detectChanges();
    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/sales/reports/top-products?top=10`);
    request.flush({
      success: true,
      data: [{ productId: '1', productName: 'Keyboard', totalQuantitySold: 4, totalRevenue: 120 }],
    });

    expect(fixture.componentInstance.totalRevenue()).toBe(120);
    httpTesting.verify();
  });
});
