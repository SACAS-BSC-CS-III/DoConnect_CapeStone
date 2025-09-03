import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { QuestionListComponent } from './pages/questions/list/list.component';
import { QuestionDetailComponent } from './pages/questions/detail/detail.component';
import { AskQuestionComponent } from './pages/questions/ask/ask.component';
import { AnswerFormComponent } from './pages/answers/answer-form/answer-form.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: QuestionListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'questions/:id', component: QuestionDetailComponent },
  { path: 'ask', component: AskQuestionComponent, canActivate: [authGuard] },
  { path: 'questions/:id/answer', component: AnswerFormComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard] },
];

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule {}
