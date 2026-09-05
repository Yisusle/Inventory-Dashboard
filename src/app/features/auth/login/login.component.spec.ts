import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response.model';
import { AuthSession } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: { login: (payload: unknown) => Observable<ApiResponse<AuthSession>> };
  let snackBarMock: { open: (message: string, action: string, config?: object) => void };
  let loginCalls = 0;
  let navigationCalls = 0;

  beforeEach(async () => {
    authServiceMock = {
      login: () => {
        loginCalls += 1;
        return of({
          success: true,
          data: { token: 't', username: 'admin', role: 'Admin' },
          message: '',
          errors: [],
          timestamp: '',
        });
      },
    };
    snackBarMock = { open: () => undefined };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    router.navigateByUrl = async () => {
      navigationCalls += 1;
      return true;
    };

    fixture = TestBed.createComponent(LoginComponent);
  });

  it('does not submit while form is invalid', () => {
    fixture.componentInstance.submit();

    expect(loginCalls).toBe(0);
  });

  it('submits credentials and navigates on success', () => {
    fixture.componentInstance.form.setValue({ username: 'admin', password: 'Admin123!@#' });
    fixture.componentInstance.submit();

    expect(loginCalls).toBe(1);
    expect(navigationCalls).toBe(1);
  });
});
