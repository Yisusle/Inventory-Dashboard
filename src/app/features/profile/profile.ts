import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { User } from '../../core/models/inventory.model';
import { InventoryService } from '../../core/services/inventory.service';
import { apiErrorMessage } from '../../core/utils/api-error';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly snackBar = inject(MatSnackBar);

  readonly user = signal<User | null>(null);
  readonly isLoading = signal(true);

  constructor() {
    this.inventoryService.getCurrentUser().subscribe({
      next: (response) => {
        this.user.set(response.data);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.snackBar.open(apiErrorMessage(error, 'No se pudo cargar el perfil.'), 'Cerrar', {
          duration: 5000,
        });
      },
    });
  }
}
