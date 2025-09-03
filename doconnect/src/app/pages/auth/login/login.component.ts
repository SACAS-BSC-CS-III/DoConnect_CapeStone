import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,  // ✅ mark as standalone
  imports: [CommonModule, ReactiveFormsModule],  // ✅ import modules here
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        // ✅ check role from token
        const role = this.auth.getUserRole();

        if (role === 'Admin') {
          this.router.navigate(['/admin']);  // go to admin dashboard
        } else {
          this.router.navigate(['/questions']); // normal users
        }
      },
      error: (err) => {
        this.error = err.error || 'Login failed';
      }
    });
  }
}
