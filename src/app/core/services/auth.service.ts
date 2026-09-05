import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AuthSession, LoginRequest, RegisterRequest } from '../models/auth.model';

const sessionStorageKey = 'inventory-dashboard.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionState = signal<AuthSession | null>(this.readStoredSession());

  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionState() !== null);

  login(credentials: LoginRequest): Observable<ApiResponse<AuthSession>> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${environment.apiBaseUrl}/auth/login`, credentials)
      .pipe(tap((response) => this.saveSession(response.data)));
  }

  register(account: RegisterRequest): Observable<ApiResponse<AuthSession>> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${environment.apiBaseUrl}/auth/register`, account)
      .pipe(tap((response) => this.saveSession(response.data)));
  }

  logout(): void {
    localStorage.removeItem(sessionStorageKey);
    this.sessionState.set(null);
  }

  private saveSession(session: AuthSession): void {
    localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    this.sessionState.set(session);
  }

  private readStoredSession(): AuthSession | null {
    const storedSession = localStorage.getItem(sessionStorageKey);
    if (!storedSession) {
      return null;
    }

    try {
      return JSON.parse(storedSession) as AuthSession;
    } catch {
      localStorage.removeItem(sessionStorageKey);
      return null;
    }
  }
}
