import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isLoggedIn = false;
  role: string | null = null;

  constructor(private auth: AuthService, private router: Router) {
    this.auth.authState$.subscribe(state => {
      this.isLoggedIn = state;
      this.role = this.auth.getUserRole();
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
