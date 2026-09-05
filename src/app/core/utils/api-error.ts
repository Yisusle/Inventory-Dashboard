import { HttpErrorResponse } from '@angular/common/http';

import { ApiResponse } from '../models/api-response.model';

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const response = error.error as ApiResponse<unknown> | undefined;
    return response?.errors?.join(' ') || response?.message || fallback;
  }

  return fallback;
}
