import { Component, OnInit } from '@angular/core';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(
    private themeService: ThemeService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.themeService.initTheme();
  }
}
