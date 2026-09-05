import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { ProfileComponent } from './profile';

describe('ProfileComponent', () => {
  let fixture: ComponentFixture<ProfileComponent>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProfileComponent);
  });

  it('loads the authenticated user profile', () => {
    fixture.detectChanges();
    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/users/me`);
    request.flush({
      success: true,
      data: { id: '1', username: 'admin', email: 'admin@example.com', role: 'Admin', createdAt: '2026-01-01' },
    });

    expect(fixture.componentInstance.user()?.username).toBe('admin');
    httpTesting.verify();
  });
});
