import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { filter, map, Observable } from 'rxjs';

@Component({
  selector: 'vhb-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  collapsed = false;
  isOpen = false;
  isMobile = false;

  selected: string = 'dashboard';

  isLoggedIn$: Observable<boolean>;

  constructor(private auth: Auth, private router: Router) {
    this.isLoggedIn$ = authState(this.auth).pipe(
      // Emits true if user is logged in, false if null
      map((user) => !!user)
    );
    this.checkScreenSize();
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.isOpen = !this.isOpen;
    } else {
      this.collapsed = !this.collapsed;
    }
  }

  closeSidebar() {
    this.isOpen = false;
  }

  navigate(route: string) {
    this.selected = route;
    const url = `/${route}`;
    this.closeSidebar();
    this.router.navigate([url]);
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile = window.innerWidth < 1024; // Tailwind `lg` breakpoint
    if (!this.isMobile) {
      this.isOpen = true; // keep sidebar always visible on desktop
    } else {
      this.closeSidebar();
    }
  }
}
