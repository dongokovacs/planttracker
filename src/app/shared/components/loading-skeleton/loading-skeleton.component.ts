import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container" [class.card]="type === 'card'">
      @if (type === 'card') {
        <div class="skeleton-card">
          <div class="skeleton skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text short"></div>
          </div>
        </div>
      } @else if (type === 'list') {
        <div class="skeleton-list">
          @for (item of items; track $index) {
            <div class="skeleton skeleton-list-item"></div>
          }
        </div>
      } @else {
        <div class="skeleton skeleton-text"></div>
      }
    </div>
  `,
  styles: [`
    .skeleton-container {
      width: 100%;
    }

    .skeleton {
      background: linear-gradient(
        90deg,
        #f0f0f0 25%,
        #e0e0e0 50%,
        #f0f0f0 75%
      );
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 8px;
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    .skeleton-card {
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      overflow: hidden;
      background: white;
    }

    .skeleton-image {
      width: 100%;
      height: 200px;
    }

    .skeleton-content {
      padding: 1rem;
    }

    .skeleton-title {
      height: 24px;
      margin-bottom: 1rem;
      width: 70%;
    }

    .skeleton-text {
      height: 16px;
      margin-bottom: 0.5rem;
      width: 100%;
    }

    .skeleton-text.short {
      width: 60%;
    }

    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .skeleton-list-item {
      height: 60px;
      width: 100%;
    }
  `]
})
export class LoadingSkeletonComponent {
  @Input() type: 'card' | 'list' | 'text' = 'text';
  @Input() count: number = 3;

  get items(): number[] {
    return Array(this.count).fill(0);
  }
}
