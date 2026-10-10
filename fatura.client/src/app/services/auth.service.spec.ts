import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  const makeToken = (expiration: number): string =>
    `header.${btoa(JSON.stringify({ exp: expiration }))}.signature`;

  beforeEach(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: router },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  });

  it('descarta um token expirado ao restaurar a sessão', () => {
    localStorage.setItem('auth_token', makeToken(Math.floor(Date.now() / 1000) - 60));
    localStorage.setItem('auth_user', JSON.stringify({ nome: 'Usuário antigo', email: 'antigo@example.com' }));

    const auth = TestBed.inject(AuthService);
    let loggedIn: boolean | undefined;
    auth.isLoggedIn$.subscribe(value => loggedIn = value);

    expect(loggedIn).toBeFalse();
    expect(auth.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('não encerra uma sessão nova por causa de um 401 da sessão antiga', () => {
    const oldToken = makeToken(Math.floor(Date.now() / 1000) + 3600);
    const newToken = makeToken(Math.floor(Date.now() / 1000) + 7200);
    localStorage.setItem('auth_token', oldToken);
    const auth = TestBed.inject(AuthService);

    http.get('/api/protegida').subscribe({ error: () => {} });
    const oldRequest = httpMock.expectOne('/api/protegida');
    expect(oldRequest.request.headers.get('Authorization')).toBe(`Bearer ${oldToken}`);

    auth.login({ email: 'novo@example.com', password: 'senha' }).subscribe();
    const loginRequest = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(loginRequest.request.headers.has('Authorization')).toBeFalse();
    loginRequest.flush({ token: newToken, nome: 'Novo usuário', email: 'novo@example.com' });

    oldRequest.flush('Não autorizado', { status: 401, statusText: 'Unauthorized' });

    expect(auth.getToken()).toBe(newToken);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('encerra a sessão atual quando uma chamada protegida recebe 401', () => {
    const token = makeToken(Math.floor(Date.now() / 1000) + 3600);
    localStorage.setItem('auth_token', token);
    TestBed.inject(AuthService);

    http.get('/api/protegida').subscribe({ error: () => {} });
    httpMock.expectOne('/api/protegida').flush('Não autorizado', { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
