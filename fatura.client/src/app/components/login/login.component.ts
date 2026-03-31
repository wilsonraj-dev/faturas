import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.snackBar.open('Preencha todos os campos.', 'OK', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const msg = typeof err.error === 'string' ? err.error : 'E-mail ou senha inválidos.';
        this.snackBar.open(msg, 'OK', { duration: 4000 });
      }
    });
  }
}
