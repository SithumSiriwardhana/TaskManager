import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly url = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(search?: string, status?: string, sortBy?: string, sortDir?: string): Observable<Task[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (sortDir) params = params.set('sortDir', sortDir);
    return this.http.get<Task[]>(this.url, { params });
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.url}/${id}`);
  }

  createTask(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.url, dto);
  }

  updateTask(id: number, dto: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.url}/${id}`, dto);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  toggleComplete(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.url}/${id}/toggle`, {});
  }
}
