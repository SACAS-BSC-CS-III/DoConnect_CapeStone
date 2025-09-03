import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = 'http://localhost:5000/api/questions'; // 🔹 adjust API URL

  constructor(private http: HttpClient) {}

  
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  search(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?query=${query}`);
  }
  
  getQuestions(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  searchQuestions(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?search=${query}`);
  }

  // 🔹 Add this for your AskQuestionComponent
  askQuestion(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }
}
