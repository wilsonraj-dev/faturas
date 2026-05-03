import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest, UserProfile } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request).pipe(
      tap(response => this.storeSession(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request).pipe(
      tap(response => this.storeSession(response))
    );
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/profile`).pipe(
      tap(profile => this.storeUser(profile))
    );
  }

  updateProfile(request: UpdateProfileRequest): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.baseUrl}/profile`, request).pipe(
      tap(response => this.storeSession(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getUserName(): string {
    return this.getStoredUser().nome;
  }

  getUserEmail(): string {
    return this.getStoredUser().email;
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    this.storeUser({ nome: response.nome, email: response.email });
    this.loggedIn.next(true);
  }

  private storeUser(user: UserProfile): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredUser(): UserProfile {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user) {
      return { nome: '', email: '' };
    }

    try {
      return JSON.parse(user) as UserProfile;
    } catch {
      return { nome: '', email: '' };
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}
