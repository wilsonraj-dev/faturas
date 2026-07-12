import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
export class SideMenuComponent implements OnDestroy {
  isCollapsed = false;
  isHandset = false;
  isTablet = false;
  isMenuOpen = true;
  readonly navigationItems: SideMenuItem[];

  private readonly destroy$ = new Subject<void>();
  private readonly handsetQuery = '(max-width: 599.98px)';
  private readonly tabletQuery = '(min-width: 600px) and (max-width: 959.98px)';

  constructor(
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    public themeService: ThemeService,
    public authService: AuthService
  ) {
    this.navigationItems = this.buildNavigationItems();
    this.observeLayout();
  }

  get userName(): string {
    return this.authService.getUserName();
  }

  toggleMenu(): void {
    if (this.isHandset) {
      this.isMenuOpen = !this.isMenuOpen;
      return;
    }

    this.isCollapsed = !this.isCollapsed;
  }

  onNavigation(): void {
    if (this.isHandset) {
      this.isMenuOpen = false;
    }
  }

  onMenuOpenedChange(opened: boolean): void {
    this.isMenuOpen = opened;
  }

  get menuButtonLabel(): string {
    if (this.isHandset) {
      return this.isMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação';
    }

    return this.isCollapsed ? 'Expandir menu lateral' : 'Contrair menu lateral';
  }

  get menuButtonIcon(): string {
    if (this.isHandset) {
      return this.isMenuOpen ? 'close' : 'menu';
    }

    return this.isCollapsed ? 'menu' : 'menu_open';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
  }

  trackByRoute(_: number, item: SideMenuItem): string {
    return item.route;
  }

  private observeLayout(): void {
    this.breakpointObserver
      .observe([this.handsetQuery, this.tabletQuery])
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        const wasHandset = this.isHandset;
        this.isHandset = state.breakpoints[this.handsetQuery];
        this.isTablet = state.breakpoints[this.tabletQuery];

        if (this.isHandset) {
          this.isCollapsed = false;
          this.isMenuOpen = wasHandset ? this.isMenuOpen : false;
          return;
        }

        this.isMenuOpen = true;
        this.isCollapsed = this.isTablet;
      });
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
