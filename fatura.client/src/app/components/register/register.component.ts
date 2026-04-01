import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  readonly registerForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.formBuilder.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{6,}$/)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: [this.passwordsMatchValidator]
    });
  }

  get nome(): AbstractControl | null {
    return this.registerForm.get('nome');
  }

  get email(): AbstractControl | null {
    return this.registerForm.get('email');
  }

  get password(): AbstractControl | null {
    return this.registerForm.get('password');
  }

  get confirmPassword(): AbstractControl | null {
    return this.registerForm.get('confirmPassword');
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.snackBar.open('Corrija os campos inválidos.', 'OK', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.authService.register({
      nome: this.nome?.value,
      email: this.email?.value,
      password: this.password?.value
    }).subscribe({
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

  hasError(control: AbstractControl | null, errorCode: string): boolean {
    return !!control && control.hasError(errorCode) && (control.touched || control.dirty);
  }

  private passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordsMismatch: true };
  }
}
