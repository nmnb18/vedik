import { Component } from '@angular/core';
import { LayoutComponent } from './core/layout/layout.component';

@Component({
  selector: 'vhb-root',
  imports: [LayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'vedik-healthcare-business';
}
