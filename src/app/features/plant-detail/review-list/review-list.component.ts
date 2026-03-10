import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review } from '../../../core/models/plant.model';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="review-list" role="list" aria-label="Értékelések listája">

      @if (reviews.length === 0) {
        <div class="no-reviews">
          <span class="no-reviews-icon" aria-hidden="true">💬</span>
          <p class="no-reviews-text">Még nincs értékelés ehhez a növényhez.</p>
        </div>
      }

      @for (review of reviews; track review.id) {
        <article class="review-item" role="listitem">
          <div class="review-header">
            <div class="review-meta">
              <div class="review-stars" [attr.aria-label]="review.rating + ' csillag az 5-ből'">
                @for (star of starsArray; track star) {
                  <span class="star" [class.filled]="star <= review.rating" aria-hidden="true">★</span>
                }
              </div>
              <h5 class="review-title">{{ review.title }}</h5>
            </div>
            <div class="review-actions" *ngIf="showActions">
              <button
                class="action-btn edit-btn"
                (click)="onEdit(review)"
                [attr.aria-label]="'Értékelés szerkesztése: ' + review.title"
                title="Szerkesztés"
              >✏️</button>
              <button
                class="action-btn delete-btn"
                (click)="onDelete(review)"
                [attr.aria-label]="'Értékelés törlése: ' + review.title"
                title="Törlés"
              >🗑️</button>
            </div>
          </div>

          <p class="review-content">{{ review.content }}</p>

          <footer class="review-footer">
            <span class="review-author">— {{ review.authorName }}</span>
            <time class="review-date" [dateTime]="review.createdAt | date:'yyyy-MM-dd'">
              {{ review.createdAt | date:'yyyy. MM. dd.' }}
            </time>
          </footer>
        </article>
      }
    </div>
  `,
  styles: [`
    .review-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .no-reviews {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
      color: #999;
      gap: 0.5rem;
    }

    .no-reviews-icon {
      font-size: 2.5rem;
      opacity: 0.5;
    }

    .no-reviews-text {
      margin: 0;
      font-size: 0.9375rem;
    }

    .review-item {
      background: white;
      border: 1px solid #e8e8e8;
      border-radius: 10px;
      padding: 1.25rem;
      transition: box-shadow 0.2s;
    }

    .review-item:hover {
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .review-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .review-stars {
      display: flex;
      gap: 2px;
    }

    .star {
      font-size: 1.125rem;
      color: #ddd;
      line-height: 1;
    }

    .star.filled {
      color: #f4a261;
    }

    .review-title {
      font-size: 1rem;
      font-weight: 600;
      color: #222;
      margin: 0;
    }

    .review-actions {
      display: flex;
      gap: 0.375rem;
      flex-shrink: 0;
    }

    .action-btn {
      background: none;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 0.3rem 0.5rem;
      cursor: pointer;
      font-size: 0.875rem;
      line-height: 1;
      transition: background 0.15s, border-color 0.15s;
    }

    .action-btn:hover {
      background: #f5f5f5;
    }

    .edit-btn:hover {
      border-color: #2d6a4f;
    }

    .delete-btn:hover {
      border-color: #dc3545;
      background: #fff5f5;
    }

    .action-btn:focus-visible {
      outline: 2px solid #2d6a4f;
      outline-offset: 2px;
    }

    .review-content {
      color: #555;
      font-size: 0.9375rem;
      line-height: 1.65;
      margin: 0 0 1rem 0;
      white-space: pre-wrap;
    }

    .review-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid #f0f0f0;
    }

    .review-author {
      font-size: 0.875rem;
      font-weight: 600;
      color: #2d6a4f;
    }

    .review-date {
      font-size: 0.8125rem;
      color: #999;
    }
  `]
})
export class ReviewListComponent {
  @Input() reviews: Review[] = [];
  @Input() showActions = true;

  @Output() editClicked = new EventEmitter<Review>();
  @Output() deleteClicked = new EventEmitter<Review>();

  readonly starsArray = [1, 2, 3, 4, 5];

  onEdit(review: Review): void {
    this.editClicked.emit(review);
  }

  onDelete(review: Review): void {
    this.deleteClicked.emit(review);
  }
}
