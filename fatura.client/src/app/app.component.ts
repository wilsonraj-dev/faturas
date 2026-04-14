import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  readonly isAuthenticated$: Observable<boolean>;

  constructor(
    private themeService: ThemeService,
    public authService: AuthService
  ) {
    this.isAuthenticated$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {
    this.themeService.initTheme();
  }
}
