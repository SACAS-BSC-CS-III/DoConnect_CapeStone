import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ask-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ask.component.html',
  styleUrls: ['./ask.component.scss']
})
export class AskQuestionComponent {
  form: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      body: ['', Validators.required],
      images: [null]
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.form.patchValue({ images: event.target.files });
    }
  }

  submit() {
    if (this.form.invalid) return;

    const formData = new FormData();
    formData.append('title', this.form.value.title);
    formData.append('body', this.form.value.body);

    if (this.form.value.images) {
      for (let file of this.form.value.images) {
        formData.append('images', file);
      }
    }

    this.http.post(`${environment.apiUrl}/questions`, formData)
      .subscribe({
        next: () => {
          alert('Question submitted (awaiting approval)');
          this.router.navigate(['/questions']);
        },
        error: (err) => {
          this.error = err.error || 'Failed to post question';
        }
      });
  }
}
