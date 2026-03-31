import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nome = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  onSubmit(): void {
    if (!this.nome || !this.email || !this.password) {
      this.snackBar.open('Preencha todos os campos.', 'OK', { duration: 3000 });
      return;
    }

    if (this.password.length < 6) {
      this.snackBar.open('A senha deve ter pelo menos 6 caracteres.', 'OK', { duration: 3000 });
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.snackBar.open('As senhas não conferem.', 'OK', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.authService.register({ nome: this.nome, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.snackBar.open('Conta criada com sucesso!', 'OK', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao criar conta.';
        this.snackBar.open(msg, 'OK', { duration: 4000 });
      }
    });
  }
}
