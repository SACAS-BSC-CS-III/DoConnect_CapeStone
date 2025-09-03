import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map, BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiUrl}/auth`;
  private authState = new BehaviorSubject<boolean>(this.isLoggedIn());

  authState$ = this.authState.asObservable();

  constructor(private http: HttpClient) {
    if (this.isLoggedIn()) {
      this.setAutoLogout();
    }
  }

  login(data: { username: string; password: string }) {
    return this.http.post<any>(`${this.base}/login`, data).pipe(
      map(res => {
        if (res?.token) {
          localStorage.setItem('token', res.token);
          this.authState.next(true);

          this.setAutoLogout();
        }
        return res;
      })
    );
  }

  register(data: { username: string; password: string; email?: string; isAdmin?: boolean }) {
    return this.http.post<any>(`${this.base}/register`, data);
  }

  logout() {
    localStorage.removeItem('token');
    this.authState.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (
        payload.role ||
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        null
      );
    } catch {
      return null;
    }
  }


  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch {
      return true;
    }
  }
  private logoutTimer: any;

  setAutoLogout() {
    const token = this.getToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const timeout = expiry - Date.now();

      if (this.logoutTimer) clearTimeout(this.logoutTimer);
      if (timeout > 0) {
        this.logoutTimer = setTimeout(() => this.logout(), timeout);
      } else {
        this.logout();
      }
    } catch {
      this.logout();
    }
  }
}
