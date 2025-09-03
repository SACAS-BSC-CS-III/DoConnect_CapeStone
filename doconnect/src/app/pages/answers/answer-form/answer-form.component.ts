import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-answer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './answer-form.component.html',
  styleUrls: ['./answer-form.component.scss']
})
export class AnswerFormComponent {
  form: FormGroup;
  error: string | null = null;
  questionId: string | null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      body: ['', Validators.required],
      images: [null]
    });

    this.questionId = this.route.snapshot.paramMap.get('id');
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.form.patchValue({ images: event.target.files });
    }
  }

  submit() {
    if (this.form.invalid || !this.questionId) return;

    const formData = new FormData();
    formData.append('body', this.form.value.body);

    if (this.form.value.images) {
      for (let file of this.form.value.images) {
        formData.append('images', file);
      }
    }

    this.http.post(`${environment.apiUrl}/questions/${this.questionId}/answers`, formData)
      .subscribe({
        next: () => {
          alert('Answer submitted (awaiting approval)');
          this.router.navigate(['/questions', this.questionId]);
        },
        error: (err) => {
          this.error = err.error || 'Failed to post answer';
        }
      });
  }
}
