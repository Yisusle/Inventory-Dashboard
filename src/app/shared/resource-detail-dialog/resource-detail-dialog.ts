import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface DetailRow {
  label: string;
  value: string;
}

export interface ResourceDetailDialogData {
  title: string;
  subtitle?: string;
  rows: DetailRow[];
}

@Component({
  selector: 'app-resource-detail-dialog',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './resource-detail-dialog.html',
  styleUrl: './resource-detail-dialog.scss',
})
export class ResourceDetailDialogComponent {
  readonly data = inject<ResourceDetailDialogData>(MAT_DIALOG_DATA);
}
