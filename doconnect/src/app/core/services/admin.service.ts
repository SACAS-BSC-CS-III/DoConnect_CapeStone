import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getPending(): Observable<any> {
    return this.http.get(`${this.base}/pending`);
  }

  approveQuestion(id: number, approve = true): Observable<any> {
    // matches backend: POST /api/admin/questions/{id}/approve?approve=true
    return this.http.post(`${this.base}/questions/${id}/approve`, null, { params: { approve } as any });
  }

  approveAnswer(id: number, approve = true): Observable<any> {
    return this.http.post(`${this.base}/answers/${id}/approve`, null, { params: { approve } as any });
  }

  deleteQuestion(id: number): Observable<any> {
    return this.http.delete(`${this.base}/questions/${id}`);
  }

  deleteAnswer(id: number): Observable<any> {
    return this.http.delete(`${this.base}/answers/${id}`);
  }
}
