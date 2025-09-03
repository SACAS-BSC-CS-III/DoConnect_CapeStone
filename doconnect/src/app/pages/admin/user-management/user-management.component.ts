import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  newUser = { username: '', password: '', email: '', isAdmin: false };
  editingUser: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/users`)
      .subscribe(data => this.users = data);
  }

  addUser() {
    this.http.post(`${environment.apiUrl}/admin/users`, this.newUser, { params: this.newUser as any })
      .subscribe(() => {
        this.newUser = { username: '', password: '', email: '', isAdmin: false };
        this.loadUsers();
      });
  }

  edit(user: any) {
    this.editingUser = { ...user }; // clone user to edit safely
  }

  save() {
    const params: any = {
      email: this.editingUser.email,
      isAdmin: this.editingUser.role === 'Admin',
      newPassword: this.editingUser.newPassword || null
    };

    this.http.put(`${environment.apiUrl}/admin/users/${this.editingUser.id}`, null, { params })
      .subscribe(() => {
        this.editingUser = null;
        this.loadUsers();
      });
  }

  delete(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`${environment.apiUrl}/admin/users/${id}`)
        .subscribe(() => this.loadUsers());
    }
  }
}
