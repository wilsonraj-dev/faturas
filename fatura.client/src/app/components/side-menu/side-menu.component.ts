import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

interface SideMenuItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly exact: boolean;
}

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent {
  isCollapsed = false;
  readonly navigationItems: SideMenuItem[];

  constructor(
    private router: Router,
    public themeService: ThemeService,
    public authService: AuthService
  ) {
    this.navigationItems = this.buildNavigationItems();
  }

  get userName(): string {
    return this.authService.getUserName();
  }

  toggleMenu(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
  }

  trackByRoute(_: number, item: SideMenuItem): string {
    return item.route;
  }

  private buildNavigationItems(): SideMenuItem[] {
    return this.router.config
      .filter(route => route.path && route.data?.['showInMenu'])
      .map(route => this.mapRouteToNavigationItem(route));
  }

  private mapRouteToNavigationItem(route: Route): SideMenuItem {
    return {
      label: String(route.data?.['label'] ?? ''),
      icon: String(route.data?.['icon'] ?? 'chevron_right'),
      route: `/${route.path ?? ''}`,
      exact: route.data?.['exact'] !== false
    };
  }
}
