import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { User } from '../../core/models/inventory.model';
import { InventoryService } from '../../core/services/inventory.service';
import { apiErrorMessage } from '../../core/utils/api-error';

@Component({
  selector: 'app-users',
  imports: [DatePipe, MatCardModule, MatPaginatorModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly snackBar = inject(MatSnackBar);

  readonly users = signal<User[]>([]);
  readonly total = signal(0);
  readonly page = signal(0);
  readonly pageSize = signal(10);
  readonly isLoading = signal(true);

  constructor() {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.inventoryService.getUsers(this.page() + 1, this.pageSize()).subscribe({
      next: (response) => {
        this.users.set(response.data.items);
        this.total.set(response.data.total);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.isLoading.set(false);
        this.snackBar.open(apiErrorMessage(error, 'No se pudieron cargar los usuarios.'), 'Cerrar', {
          duration: 5000,
        });
      },
    });
  }

  changePage(event: PageEvent): void {
    this.page.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }
}
