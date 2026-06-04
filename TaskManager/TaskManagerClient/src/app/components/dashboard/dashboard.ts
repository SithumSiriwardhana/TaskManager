import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TaskListComponent } from '../task-list/task-list';
import { TaskFormComponent } from '../task-form/task-form';
import { Task } from '../../models/task.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, TaskListComponent, TaskFormComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  selectedTask: Task | null = null;
  refreshTrigger = 0;

  constructor(public auth: AuthService) { }

  onEditTask(task: Task): void {
    this.selectedTask = task;
  }

  onFormSaved(): void {
    this.selectedTask = null;
    this.refreshTrigger++;
  }

  onFormCancelled(): void {
    this.selectedTask = null;
  }

  logout(): void {
    this.auth.logout();
  }
}
