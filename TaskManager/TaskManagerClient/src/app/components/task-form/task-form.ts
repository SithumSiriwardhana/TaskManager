import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css'
})
export class TaskFormComponent implements OnChanges {
  @Input() taskToEdit: Task | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  title = '';
  description = '';
  dueDate = '';
  priority = 1;
  isCompleted = false;

  saving = false;
  successMessage = '';
  errorMessage = '';

  constructor(private taskService: TaskService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskToEdit']) {
      const task = this.taskToEdit;
      if (task) {
        this.title = task.title;
        this.description = task.description ?? '';
        this.dueDate = task.dueDate ? task.dueDate.substring(0, 10) : '';
        this.priority = task.priority;
        this.isCompleted = task.isCompleted;
      } else {
        this.resetForm();
      }
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  get isEditMode(): boolean {
    return !!this.taskToEdit;
  }

  submit(): void {
    if (!this.title.trim()) {
      this.errorMessage = 'Title is required.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const dueDateIso = this.dueDate ? new Date(this.dueDate).toISOString() : undefined;

    if (this.isEditMode) {
      this.taskService.updateTask(this.taskToEdit!.id, {
        title: this.title.trim(),
        description: this.description.trim() || undefined,
        isCompleted: this.isCompleted,
        dueDate: dueDateIso,
        priority: this.priority
      }).subscribe({
        next: () => {
          this.showSuccess('Task updated successfully!');
          this.saving = false;
          this.saved.emit();
        },
        error: () => {
          this.errorMessage = 'Failed to update task.';
          this.saving = false;
        }
      });
    } else {
      this.taskService.createTask({
        title: this.title.trim(),
        description: this.description.trim() || undefined,
        dueDate: dueDateIso,
        priority: this.priority
      }).subscribe({
        next: () => {
          this.showSuccess('Task created successfully!');
          this.resetForm();
          this.saving = false;
          this.saved.emit();
        },
        error: () => {
          this.errorMessage = 'Failed to create task.';
          this.saving = false;
        }
      });
    }
  }

  cancel(): void {
    this.resetForm();
    this.cancelled.emit();
  }

  private resetForm(): void {
    this.title = '';
    this.description = '';
    this.dueDate = '';
    this.priority = 1;
    this.isCompleted = false;
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
