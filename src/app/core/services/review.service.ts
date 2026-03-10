import { Injectable, signal } from '@angular/core';
import { Review, ReviewFormData } from '../models/plant.model';
import { v4 as uuidv4 } from 'uuid';
import { db } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  // Cache reviews per plant in a signal map
  private reviewsMap = signal<Record<string, Review[]>>({});

  /**
   * Get reviews for a specific plant (from signal cache)
   */
  getReviewsForPlant(plantId: string): Review[] {
    return this.reviewsMap()[plantId] ?? [];
  }

  /**
   * Load reviews for a plant from the database into the signal cache
   */
  async loadReviewsForPlant(plantId: string): Promise<Review[]> {
    try {
      const reviews = await db.getReviewsByPlantId(plantId);
      // Sort descending (newest first)
      reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.reviewsMap.update(map => ({ ...map, [plantId]: reviews }));
      return reviews;
    } catch (error) {
      console.error('Error loading reviews:', error);
      return [];
    }
  }

  /**
   * Add a new review for a plant
   */
  async addReview(plantId: string, formData: ReviewFormData): Promise<Review> {
    const newReview: Review = {
      id: uuidv4(),
      plantId,
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await db.addReview(newReview);
      await this.loadReviewsForPlant(plantId);
      console.log('✅ Review added:', newReview.id);
      return newReview;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  /**
   * Update an existing review
   */
  async updateReview(reviewId: string, plantId: string, formData: ReviewFormData): Promise<Review | null> {
    try {
      const updates: Partial<Review> = {
        ...formData,
        updatedAt: new Date()
      };

      const updated = await db.updateReview(reviewId, updates);
      if (updated === 0) {
        return null;
      }

      await this.loadReviewsForPlant(plantId);
      const review = this.getReviewsForPlant(plantId).find(r => r.id === reviewId);
      console.log('✅ Review updated:', reviewId);
      return review || null;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string, plantId: string): Promise<boolean> {
    try {
      await db.deleteReview(reviewId);
      await this.loadReviewsForPlant(plantId);
      console.log('✅ Review deleted:', reviewId);
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  }

  /**
   * Get average rating for a plant
   */
  getAverageRating(plantId: string): number | null {
    const reviews = this.getReviewsForPlant(plantId);
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  /**
   * Get review count for a plant
   */
  getReviewCount(plantId: string): number {
    return this.getReviewsForPlant(plantId).length;
  }
}
