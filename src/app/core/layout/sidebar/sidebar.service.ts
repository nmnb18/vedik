import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  // Signal to track mobile sidebar open state
  mobileSidebarOpen = signal(false);

  // Signal to track desktop collapse
  collapsed = signal(false);

  toggleMobileSidebar() {
    this.mobileSidebarOpen.set(!this.mobileSidebarOpen());
  }

  toggleCollapse() {
    this.collapsed.set(!this.collapsed());
  }
}
