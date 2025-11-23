import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authSvc: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: [''],
      password: [''],
    });
  }

  login() {
    const { email, password } = this.loginForm.value;
    this.authSvc
      .login(email, password)
      .then(() => this.router.navigate(['/dashboard']))
      .catch((err) => (this.errorMessage = err.message));
  }
}
