import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class QuestionListComponent implements OnInit {
  questions: any[] = [];
  filtered: any[] = [];
  loading = true;

  // search
  query = '';
  private search$ = new Subject<string>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // subscribe to debounced search
    this.search$.pipe(debounceTime(300)).subscribe(q => {
      this.loadQuestions(q);
    });

    // initial load
    this.loadQuestions();
  }

  onSearchInput() {
    // local filtering fallback (immediate) + server call (debounced)
    const q = (this.query || '').trim();
    if (!q) {
      // show full list immediately if cleared
      this.filtered = [...this.questions];
    } else {
      const low = q.toLowerCase();
      this.filtered = this.questions.filter(item =>
        (item.title || '').toLowerCase().includes(low) ||
        (item.body || '').toLowerCase().includes(low)
      );
    }

    // trigger server query (debounced) so results can be refreshed from server if you prefer server-side search
    this.search$.next(q);
  }

  loadQuestions(q?: string) {
    this.loading = true;

    let params = new HttpParams();
    if (q && q.length) params = params.set('q', q);

    this.http.get<any[]>(`${environment.apiUrl}/questions`, { params })
      .subscribe({
        next: (res) => {
          this.questions = res || [];
          // if there is an active query, apply client-side filter else show all
          if (this.query && this.query.trim()) {
            const low = this.query.toLowerCase();
            this.filtered = this.questions.filter(item =>
              (item.title || '').toLowerCase().includes(low) ||
              (item.body || '').toLowerCase().includes(low)
            );
          } else {
            this.filtered = [...this.questions];
          }
          this.loading = false;
        },
        error: () => {
          // on error, keep whatever client-side results we had
          this.loading = false;
        }
      });
  }
}