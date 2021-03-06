import {NgModule} from '@angular/core';
import {
  MatButtonModule, MatCardModule, MatDatepickerModule, MatDividerModule, MatInputModule, MatNativeDateModule, MatPaginatorModule,
  MatSelectModule, MatSnackBarModule, MatSortModule, MatTableModule, MatTabsModule, MatTooltipModule
} from '@angular/material';
import {MatSidenavModule} from '@angular/material/sidenav';

@NgModule({
  exports: [
    MatButtonModule,
    MatInputModule,
    MatTooltipModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatDividerModule,
    MatTabsModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatSidenavModule
  ]
})
export class MatComponentsModule {
}
