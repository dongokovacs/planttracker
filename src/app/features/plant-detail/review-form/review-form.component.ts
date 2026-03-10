import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Review, ReviewFormData } from '../../../core/models/plant.model';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="review-form-wrapper" role="region" [attr.aria-label]="editReview ? 'Értékelés szerkesztése' : 'Új értékelés írása'">
      <h4 class="form-heading">{{ editReview ? '✏️ Értékelés szerkesztése' : '✍️ Értékelés írása' }}</h4>

      <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()" novalidate class="review-form" aria-labelledby="review-form-heading">

        <!-- Star Rating -->
        <div class="form-group">
          <label class="form-label">
            Értékelés <span class="required" aria-hidden="true">*</span>
          </label>
          <div class="star-selector" role="radiogroup" aria-label="Csillag értékelés">
            @for (star of stars; track star) {
              <button
                type="button"
                class="star-btn"
                [class.active]="(hoverRating() || reviewForm.get('rating')?.value) >= star"
                (mouseenter)="hoverRating.set(star)"
                (mouseleave)="hoverRating.set(0)"
                (click)="setRating(star)"
                [attr.aria-label]="star + ' csillag'"
                [attr.aria-pressed]="reviewForm.get('rating')?.value === star"
              >★</button>
            }
          </div>
          @if (reviewForm.get('rating')?.invalid && reviewForm.get('rating')?.touched) {
            <span class="error-message" role="alert">Kérjük, adjon értékelést</span>
          }
        </div>

        <!-- Title -->
        <div class="form-group">
          <label for="review-title" class="form-label">
            Cím <span class="required" aria-hidden="true">*</span>
          </label>
          <input
            id="review-title"
            type="text"
            formControlName="title"
            class="form-input"
            placeholder="pl. Remek termés"
            autocomplete="off"
            aria-required="true"
            [attr.aria-invalid]="reviewForm.get('title')?.invalid && reviewForm.get('title')?.touched"
            [class.error]="reviewForm.get('title')?.invalid && reviewForm.get('title')?.touched"
          />
          @if (reviewForm.get('title')?.invalid && reviewForm.get('title')?.touched) {
            <span class="error-message" role="alert">A cím kötelező (min. 3 karakter)</span>
          }
        </div>

        <!-- Content -->
        <div class="form-group">
          <label for="review-content" class="form-label">
            Vélemény <span class="required" aria-hidden="true">*</span>
          </label>
          <textarea
            id="review-content"
            formControlName="content"
            class="form-input"
            placeholder="Írja le tapasztalatait a növényről..."
            rows="4"
            aria-required="true"
            [attr.aria-invalid]="reviewForm.get('content')?.invalid && reviewForm.get('content')?.touched"
            [class.error]="reviewForm.get('content')?.invalid && reviewForm.get('content')?.touched"
          ></textarea>
          @if (reviewForm.get('content')?.invalid && reviewForm.get('content')?.touched) {
            <span class="error-message" role="alert">A vélemény kötelező (min. 10 karakter)</span>
          }
        </div>

        <!-- Author Name -->
        <div class="form-group">
          <label for="review-author" class="form-label">
            Név <span class="required" aria-hidden="true">*</span>
          </label>
          <input
            id="review-author"
            type="text"
            formControlName="authorName"
            class="form-input"
            placeholder="pl. Kovács János"
            autocomplete="name"
            aria-required="true"
            [attr.aria-invalid]="reviewForm.get('authorName')?.invalid && reviewForm.get('authorName')?.touched"
            [class.error]="reviewForm.get('authorName')?.invalid && reviewForm.get('authorName')?.touched"
          />
          @if (reviewForm.get('authorName')?.invalid && reviewForm.get('authorName')?.touched) {
            <span class="error-message" role="alert">A név kötelező</span>
          }
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            (click)="onCancel()"
            [disabled]="isSubmitting()"
          >Mégse</button>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="reviewForm.invalid || isSubmitting()"
          >
            @if (isSubmitting()) {
              <span class="btn-spinner" aria-hidden="true"></span>
            }
            {{ editReview ? 'Mentés' : 'Értékelés küldése' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .review-form-wrapper {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1.5rem;
      border: 2px solid #e0e0e0;
    }

    .form-heading {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d6a4f;
      margin: 0 0 1.25rem 0;
    }

    .review-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .required {
      color: #dc3545;
    }

    .form-input {
      padding: 0.75rem 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: white;
    }

    .form-input:focus {
      outline: none;
      border-color: #2d6a4f;
      box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.1);
    }

    .form-input.error {
      border-color: #dc3545;
    }

    textarea.form-input {
      resize: vertical;
      min-height: 100px;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.8125rem;
      margin-top: 0.375rem;
    }

    /* Star Selector */
    .star-selector {
      display: flex;
      gap: 0.25rem;
    }

    .star-btn {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #ddd;
      padding: 0;
      line-height: 1;
      transition: color 0.15s, transform 0.1s;
    }

    .star-btn.active {
      color: #f4a261;
    }

    .star-btn:hover,
    .star-btn:focus-visible {
      transform: scale(1.2);
      outline: none;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn:not(:disabled):hover {
      transform: translateY(-2px);
    }

    .btn:focus-visible {
      outline: 3px solid #2d6a4f;
      outline-offset: 3px;
    }

    .btn-primary {
      background: #2d6a4f;
      color: white;
    }

    .btn-primary:not(:disabled):hover {
      background: #1e4d36;
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn-secondary:not(:disabled):hover {
      background: #cfcfcf;
    }

    .btn-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 480px) {
      .form-actions {
        flex-direction: column;
      }
      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ReviewFormComponent implements OnInit {
  @Input() plantId!: string;
  @Input() editReview: Review | null = null;

  @Output() submitted = new EventEmitter<ReviewFormData>();
  @Output() cancelled = new EventEmitter<void>();

  reviewForm!: FormGroup;
  isSubmitting = signal(false);
  hoverRating = signal(0);
  readonly stars = [1, 2, 3, 4, 5];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      rating: [this.editReview?.rating ?? 0, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: [this.editReview?.title ?? '', [Validators.required, Validators.minLength(3)]],
      content: [this.editReview?.content ?? '', [Validators.required, Validators.minLength(10)]],
      authorName: [this.editReview?.authorName ?? '', [Validators.required, Validators.minLength(2)]]
    });
  }

  setRating(value: number): void {
    this.reviewForm.get('rating')?.setValue(value);
    this.reviewForm.get('rating')?.markAsTouched();
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      Object.keys(this.reviewForm.controls).forEach(key => {
        this.reviewForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);
    const formData: ReviewFormData = {
      rating: this.reviewForm.value.rating,
      title: this.reviewForm.value.title.trim(),
      content: this.reviewForm.value.content.trim(),
      authorName: this.reviewForm.value.authorName.trim()
    };
    this.submitted.emit(formData);
    this.isSubmitting.set(false);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
