import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';       // ✅ Import CommonModule
import { RouterModule } from '@angular/router';       // ✅ Needed for routerLink
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './pages/navbar/navbar.component';
import { FooterComponent } from './pages/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,                                   // ✅ Standalone
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],              // ✅ Add imports here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private auth: AuthService) {}

  isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  isAdmin() {
    return this.auth.getUserRole() === 'Admin';
  }

  logout() {
    this.auth.logout();
    window.location.href = '/login';
  }
}
