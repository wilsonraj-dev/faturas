import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent implements OnInit {
  readonly profileForm: FormGroup;
  loading = false;
  saving = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.formBuilder.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: ['', Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{6,}$/)],
      confirmNewPassword: ['']
    }, {
      validators: [this.profilePasswordValidator]
    });
  }

  get nome(): AbstractControl | null {
    return this.profileForm.get('nome');
  }

  get email(): AbstractControl | null {
    return this.profileForm.get('email');
  }

  get currentPassword(): AbstractControl | null {
    return this.profileForm.get('currentPassword');
  }

  get newPassword(): AbstractControl | null {
    return this.profileForm.get('newPassword');
  }

  get confirmNewPassword(): AbstractControl | null {
    return this.profileForm.get('confirmNewPassword');
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          nome: profile.nome,
          email: profile.email
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao carregar suas configurações.';
        this.snackBar.open(msg, 'OK', { duration: 4000 });
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.snackBar.open('Corrija os campos inválidos.', 'OK', { duration: 3000 });
      return;
    }

    this.saving = true;
    this.authService.updateProfile({
      nome: this.nome?.value,
      email: this.email?.value,
      currentPassword: this.currentPassword?.value,
      newPassword: this.newPassword?.value
    }).subscribe({
      next: () => {
        this.saving = false;
        this.profileForm.patchValue({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        this.profileForm.markAsPristine();
        this.profileForm.markAsUntouched();
        this.snackBar.open('Configurações atualizadas com sucesso!', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.saving = false;
        const msg = typeof err.error === 'string' ? err.error : 'Erro ao atualizar suas configurações.';
        this.snackBar.open(msg, 'OK', { duration: 4000 });
      }
    });
  }

  hasError(control: AbstractControl | null, errorCode: string): boolean {
    return !!control && control.hasError(errorCode) && (control.touched || control.dirty);
  }

  private profilePasswordValidator(group: AbstractControl): ValidationErrors | null {
    const currentPassword = group.get('currentPassword')?.value;
    const newPassword = group.get('newPassword')?.value;
    const confirmNewPassword = group.get('confirmNewPassword')?.value;

    if (!newPassword && !currentPassword && !confirmNewPassword) {
      return null;
    }

    if (newPassword && !currentPassword) {
      return { currentPasswordRequired: true };
    }

    if (newPassword && newPassword !== confirmNewPassword) {
      return { passwordsMismatch: true };
    }

    return null;
  }
}
