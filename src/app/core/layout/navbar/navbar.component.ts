import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { map, Observable } from 'rxjs';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'vhb-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  isLoggedIn$: Observable<boolean>;
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private auth: Auth, private authService: AuthService) {
    this.isLoggedIn$ = authState(this.auth).pipe(
      // Emits true if user is logged in, false if null
      map((user) => !!user)
    );
  }

  logout() {
    this.authService.logout();
  }
}
