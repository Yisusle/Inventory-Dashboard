import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ApplicationShellComponent } from './application-shell.component';

describe('ApplicationShellComponent', () => {
  let fixture: ComponentFixture<ApplicationShellComponent>;
  let logoutCalls = 0;
  let navigationCalls = 0;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationShellComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            session: signal({ token: 't', username: 'admin', role: 'Admin' as const }).asReadonly(),
            logout: () => {
              logoutCalls += 1;
            },
          },
        },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    router.navigateByUrl = async () => {
      navigationCalls += 1;
      return true;
    };

    fixture = TestBed.createComponent(ApplicationShellComponent);
  });

  it('logs out and redirects to login', () => {
    fixture.componentInstance.logout();

    expect(logoutCalls).toBe(1);
    expect(navigationCalls).toBe(1);
  });
});
