import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="empty-state">
      <div class="empty-state-icon">
        <span class="icon">{{ icon }}</span>
      </div>
      <h2 class="empty-state-title">{{ title }}</h2>
      <p class="empty-state-message">{{ message }}</p>
      @if (actionLabel && actionRoute) {
        <a [routerLink]="actionRoute" class="empty-state-action">
          {{ actionLabel }}
        </a>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
      min-height: 400px;
    }

    .empty-state-icon {
      margin-bottom: 1.5rem;
    }

    .icon {
      font-size: 4rem;
      opacity: 0.3;
    }

    .empty-state-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1b1b1b;
      margin-bottom: 0.5rem;
    }

    .empty-state-message {
      font-size: 1rem;
      color: #666;
      max-width: 400px;
      margin-bottom: 2rem;
    }

    .empty-state-action {
      display: inline-block;
      background-color: #2d6a4f;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .empty-state-action:hover {
      background-color: #1e4d36;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = '🌱';
  @Input() title: string = 'Nincs még növény';
  @Input() message: string = 'Kezdj el növényeket követni az első hozzáadásával!';
  @Input() actionLabel?: string = 'Növény hozzáadása';
  @Input() actionRoute?: string = '/plants/add';
}
