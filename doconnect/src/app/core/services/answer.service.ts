import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AnswersService {
  // Use endpoint that matches your backend routes. If your backend uses nested route:
  // POST /api/questions/{questionId}/answers
  constructor(private http: HttpClient) {}

  addAnswer(questionId: number, formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/questions/${questionId}/answers`, formData);
  }
}
