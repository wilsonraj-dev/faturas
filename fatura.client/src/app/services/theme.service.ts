import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'app_theme';
  private themeSubject = new BehaviorSubject<AppTheme>(this.getStoredTheme());

  theme$ = this.themeSubject.asObservable();

  get currentTheme(): AppTheme {
    return this.themeSubject.value;
  }

  get isDark(): boolean {
    return this.currentTheme === 'dark';
  }

  toggleTheme(): void {
    const newTheme: AppTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: AppTheme): void {
    this.themeSubject.next(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  initTheme(): void {
    this.applyTheme(this.currentTheme);
  }

  private getStoredTheme(): AppTheme {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return (stored === 'dark') ? 'dark' : 'light';
  }

  private applyTheme(theme: AppTheme): void {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  }
}
