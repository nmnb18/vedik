import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'vhb-layout',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    NavbarComponent,
    FooterComponent,
    RouterOutlet,
    ConfirmDialogModule,
    ToastModule,
  ],

  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  deferredPrompt: any;
  showInstallButton = false;

  constructor() {}

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(event: Event) {
    event.preventDefault(); // Prevent default mini-infobar
    this.deferredPrompt = event;
    this.showInstallButton = true;
  }

  installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt(); // Show the native install prompt
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        this.deferredPrompt = null;
        this.showInstallButton = false;
      });
    }
  }
}
