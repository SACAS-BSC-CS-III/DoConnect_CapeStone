import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  pendingQuestions: any[] = [];
  pendingAnswers: any[] = [];
  approvedQuestions: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.http.get<any>(`${environment.apiUrl}/admin/pending`)
      .subscribe({
        next: (res) => {
          this.pendingQuestions = res.questions || [];
          this.pendingAnswers = res.answers || [];
          this.loadApproved();
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load pending items';
          this.loading = false;
        }
      });
  }
  
  loadApproved() {
    this.http.get<any[]>(`${environment.apiUrl}/admin/approved-questions`)
      .subscribe({
        next: (res) => {
          this.approvedQuestions = res || [];
        },
        error: () => {
          this.error = 'Failed to load approved questions';
        }
      });
  }

  deleteApprovedQuestion(id: number) {
    this.http.delete(`${environment.apiUrl}/admin/questions/${id}`)
      .subscribe(() => this.loadApproved());
  }

  approveQuestion(id: number, approve: boolean) {
    this.http.post(`${environment.apiUrl}/admin/questions/${id}/approve?approve=${approve}`, {})
      .subscribe(() => this.loadPending());
  }

  approveAnswer(id: number, approve: boolean) {
    this.http.post(`${environment.apiUrl}/admin/answers/${id}/approve?approve=${approve}`, {})
      .subscribe(() => this.loadPending());
  }

  deleteQuestion(id: number) {
    this.http.delete(`${environment.apiUrl}/admin/questions/${id}`)
      .subscribe(() => this.loadPending());
  }

  deleteAnswer(id: number) {
    this.http.delete(`${environment.apiUrl}/admin/answers/${id}`)
      .subscribe(() => this.loadPending());
  }
}
