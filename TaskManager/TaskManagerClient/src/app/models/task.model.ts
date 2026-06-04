export interface Task {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: string;
  dueDate?: string;
  priority: number; // 1=Low, 2=Medium, 3=High
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  priority: number;
}

export interface UpdateTaskDto {
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
  priority: number;
}

export const PRIORITY_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High'
};
