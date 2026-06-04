import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, PRIORITY_LABELS } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class TaskListComponent implements OnInit, OnChanges {
  @Input() refreshTrigger = 0;
  @Output() editTask = new EventEmitter<Task>();

  tasks: Task[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  search = '';
  statusFilter = '';
  sortBy = 'createdAt';
  sortDir = 'desc';

  priorityLabels = PRIORITY_LABELS;

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange) {
      this.loadTasks();
    }
  }

  loadTasks(): void {
    this.loading = true;
    this.errorMessage = '';
    this.taskService.getTasks(this.search, this.statusFilter, this.sortBy, this.sortDir).subscribe({
      next: tasks => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load tasks.';
        this.loading = false;
      }
    });
  }

  toggleComplete(task: Task): void {
    this.taskService.toggleComplete(task.id).subscribe({
      next: updated => {
        const idx = this.tasks.findIndex(t => t.id === updated.id);
        if (idx !== -1) this.tasks[idx] = updated;
        this.showSuccess(updated.isCompleted ? 'Task marked as completed.' : 'Task marked as pending.');
      },
      error: () => this.errorMessage = 'Failed to update task.'
    });
  }

  deleteTask(task: Task): void {
    if (!confirm(`Delete "${task.title}"?`)) return;
    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        this.showSuccess('Task deleted.');
      },
      error: () => this.errorMessage = 'Failed to delete task.'
    });
  }

  onEdit(task: Task): void {
    this.editTask.emit(task);
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  getPriorityClass(priority: number): string {
    return ['', 'low', 'medium', 'high'][priority] ?? 'low';
  }
}
