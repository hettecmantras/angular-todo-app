import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Priority = 'High' | 'Medium' | 'Low';
type Filter = 'all' | 'active' | 'completed';

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
}

interface Draft {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private nextId = 4;

  protected readonly priorityOptions: Priority[] = ['High', 'Medium', 'Low'];

  protected readonly filters: { label: string; value: Filter }[] = [
    { label: 'All tasks', value: 'all' },
    { label: 'Next up', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  protected readonly todos = signal<Todo[]>([
    {
      id: 1,
      title: 'Create the quarterly product update slide deck',
      description: 'Gather feedback, update status counters, and add projected next steps.',
      completed: false,
      priority: 'High',
      dueDate: '2026-07-04',
      createdAt: '2026-06-28T14:00:00Z',
    },
    {
      id: 2,
      title: 'Pair-review Raman’s API isolation branch',
      description: 'Validate error handling paths, confirm contract duplication, and annotate the changelog.',
      completed: true,
      priority: 'Medium',
      dueDate: '2026-07-01',
      createdAt: '2026-06-29T09:45:00Z',
    },
    {
      id: 3,
      title: 'Refine onboarding tasks toward a single-playbook experience',
      description: 'Mapping the new welcome checklist into Trello and linking recorded walkthroughs.',
      completed: false,
      priority: 'Low',
      dueDate: '2026-07-10',
      createdAt: '2026-06-30T07:30:00Z',
    },
  ]);

  protected readonly viewFilter = signal<Filter>('all');

  protected readonly stats = computed(() => {
    const list = this.todos();
    const completed = list.filter((todo) => todo.completed).length;
    return {
      total: list.length,
      completed,
      active: list.length - completed,
    };
  });

  protected readonly filteredTodos = computed(() => {
    const list = this.todos();
    const filter = this.viewFilter();
    if (filter === 'active') {
      return list.filter((todo) => !todo.completed);
    }
    if (filter === 'completed') {
      return list.filter((todo) => todo.completed);
    }
    return list;
  });

  protected readonly progress = computed(() => {
    const list = this.todos();
    if (!list.length) {
      return 0;
    }
    const completed = list.filter((todo) => todo.completed).length;
    return Math.round((completed / list.length) * 100);
  });

  protected draft: Draft = {
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
  };

  protected addTodo(): void {
    const trimmed = this.draft.title.trim();
    if (!trimmed) {
      return;
    }

    const newEntry: Todo = {
      id: this.nextId++,
      title: trimmed,
      description: this.draft.description.trim(),
      completed: false,
      priority: this.draft.priority,
      dueDate: this.draft.dueDate || undefined,
      createdAt: new Date().toISOString(),
    };

    this.todos.update((entries) => [...entries, newEntry]);
    this.draft = {
      title: '',
      description: '',
      priority: 'Medium',
      dueDate: '',
    };
  }

  protected setFilter(filter: Filter): void {
    this.viewFilter.set(filter);
  }

  protected toggleCompletion(id: number): void {
    this.todos.update((entries) =>
      entries.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
            }
          : todo
      )
    );
  }

  protected removeTodo(id: number): void {
    this.todos.update((entries) => entries.filter((todo) => todo.id !== id));
  }

  protected clearCompleted(): void {
    this.todos.update((entries) => entries.filter((todo) => !todo.completed));
  }

  protected priorityClass(priority: Priority): string {
    return `priority-${priority.toLowerCase()}`;
  }

  protected formatDueDate(value?: string): string {
    if (!value) {
      return 'Flexible';
    }
    try {
      const parsed = new Date(value);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(parsed);
    } catch {
      return 'Custom date';
    }
  }

  protected formatCreatedAt(value: string): string {
    const parsed = new Date(value);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(parsed);
  }
}
