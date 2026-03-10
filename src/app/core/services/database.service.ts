import Dexie, { Table } from 'dexie';
import { Plant, Review } from '../models/plant.model';

/**
 * PlantTracker Database Service using Dexie.js (IndexedDB wrapper)
 * 
 * Benefits:
 * - Larger storage capacity (GBs instead of 5-10MB localStorage limit)
 * - Structured queries and indexing
 * - Async operations (non-blocking)
 * - Better performance for large datasets
 */
export class PlantDatabase extends Dexie {
  plants!: Table<Plant, string>; // string = id type
  reviews!: Table<Review, string>; // string = id type

  constructor() {
    super('PlantTrackerDB');
    
    // Define database schema
    this.version(1).stores({
      plants: 'id, name, location, status, plantedDate, createdAt' // indexed fields
    });

    // Version 2: add reviews table
    this.version(2).stores({
      plants: 'id, name, location, status, plantedDate, createdAt',
      reviews: 'id, plantId, rating, createdAt' // indexed fields
    });
  }

  /**
   * Get all plants
   */
  async getAllPlants(): Promise<Plant[]> {
    return await this.plants.toArray();
  }

  /**
   * Get plant by ID
   */
  async getPlantById(id: string): Promise<Plant | undefined> {
    return await this.plants.get(id);
  }

  /**
   * Add new plant
   */
  async addPlant(plant: Plant): Promise<string> {
    return await this.plants.add(plant);
  }

  /**
   * Update plant
   */
  async updatePlant(id: string, updates: Partial<Plant>): Promise<number> {
    return await this.plants.update(id, updates);
  }

  /**
   * Delete plant
   */
  async deletePlant(id: string): Promise<void> {
    await this.plants.delete(id);
  }

  /**
   * Search plants by name
   */
  async searchByName(query: string): Promise<Plant[]> {
    return await this.plants
      .filter(plant => plant.name.toLowerCase().includes(query.toLowerCase()))
      .toArray();
  }

  /**
   * Filter plants by location
   */
  async filterByLocation(location: string): Promise<Plant[]> {
    return await this.plants
      .where('location')
      .equals(location)
      .toArray();
  }

  /**
   * Filter plants by status
   */
  async filterByStatus(status: string): Promise<Plant[]> {
    return await this.plants
      .where('status')
      .equals(status)
      .toArray();
  }

  /**
   * Get all unique locations
   */
  async getUniqueLocations(): Promise<string[]> {
    const plants = await this.plants.toArray();
    const locations = plants
      .map(p => p.location)
      .filter((loc): loc is string => !!loc);
    return [...new Set(locations)];
  }

  /**
   * Clear all plants (for testing/reset)
   */
  async clearAllPlants(): Promise<void> {
    await this.plants.clear();
  }

  /**
   * Import plants from localStorage (migration helper)
   */
  async importFromLocalStorage(storageKey: string): Promise<number> {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        return 0;
      }

      const plants = JSON.parse(stored) as Plant[];
      
      // Convert date strings to Date objects
      plants.forEach(plant => {
        plant.plantedDate = new Date(plant.plantedDate);
        plant.createdAt = new Date(plant.createdAt);
        plant.updatedAt = new Date(plant.updatedAt);
        if (plant.aiData?.fetchedAt) {
          plant.aiData.fetchedAt = new Date(plant.aiData.fetchedAt);
        }
      });

      // Bulk insert
      await this.plants.bulkAdd(plants);
      
      console.log(`✅ Imported ${plants.length} plants from localStorage to IndexedDB`);
      return plants.length;
    } catch (error) {
      console.error('Error importing from localStorage:', error);
      return 0;
    }
  }

  // ─── Review Methods ───────────────────────────────────────────────────────

  /**
   * Get all reviews for a plant
   */
  async getReviewsByPlantId(plantId: string): Promise<Review[]> {
    return await this.reviews
      .where('plantId')
      .equals(plantId)
      .sortBy('createdAt');
  }

  /**
   * Get review by ID
   */
  async getReviewById(id: string): Promise<Review | undefined> {
    return await this.reviews.get(id);
  }

  /**
   * Add a new review
   */
  async addReview(review: Review): Promise<string> {
    return await this.reviews.add(review);
  }

  /**
   * Update a review
   */
  async updateReview(id: string, updates: Partial<Review>): Promise<number> {
    return await this.reviews.update(id, updates);
  }

  /**
   * Delete a review
   */
  async deleteReview(id: string): Promise<void> {
    await this.reviews.delete(id);
  }

  /**
   * Delete all reviews for a plant
   */
  async deleteReviewsByPlantId(plantId: string): Promise<void> {
    await this.reviews.where('plantId').equals(plantId).delete();
  }
}

// Singleton instance
export const db = new PlantDatabase();
