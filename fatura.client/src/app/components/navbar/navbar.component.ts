import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(
    public themeService: ThemeService,
    public authService: AuthService
  ) { }

  get userName(): string {
    return this.authService.getUserName();
  }

  logout(): void {
    this.authService.logout();
  }
}
