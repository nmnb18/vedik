import { Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'vhb-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  isMobile = false;

  constructor() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile = window.innerWidth < 1024; // Tailwind `lg` breakpoint
  }
}
