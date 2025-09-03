import { Routes } from '@angular/router';

import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { QuestionListComponent } from './pages/questions/list/list.component';
import { QuestionDetailComponent } from './pages/questions/detail/detail.component';
import { AskQuestionComponent } from './pages/questions/ask/ask.component';
import { AnswerFormComponent } from './pages/answers/answer-form/answer-form.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { UserManagementComponent } from './pages/admin/user-management/user-management.component';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'questions', component: QuestionListComponent },
  { path: 'questions/:id', component: QuestionDetailComponent },
  { path: 'ask', component: AskQuestionComponent, canActivate: [authGuard] },
  { path: 'questions/:id/answer', component: AnswerFormComponent, canActivate: [authGuard] },

  // ✅ Protect admin with role-based restriction
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard],  data: { admin: true } },
  { path: 'admin/users', component: UserManagementComponent, canActivate: [authGuard], data: { admin: true } },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
