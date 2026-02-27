import { Injectable, signal, computed } from '@angular/core';
import { Plant, PlantFormData, PlantStatus } from '../models/plant.model';
import { v4 as uuidv4 } from 'uuid';
import { db } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class PlantService {
  private readonly STORAGE_KEY = 'planttracker_plants';
  private migrationDone = false;
  
  // Signal-based state management
  private plantsSignal = signal<Plant[]>([]);
  
  // Computed signals for derived state
  plants = this.plantsSignal.asReadonly();
  
  plantsCount = computed(() => this.plantsSignal().length);
  
  constructor() {
    this.initializeDatabase();
  }

  /**
   * Initialize database and migrate from localStorage if needed
   */
  private async initializeDatabase(): Promise<void> {
    try {
      // Check if this is first run (no data in IndexedDB)
      const existingPlants = await db.getAllPlants();
      
      if (existingPlants.length === 0 && !this.migrationDone) {
        // Try to import from localStorage
        const imported = await db.importFromLocalStorage(this.STORAGE_KEY);
        if (imported > 0) {
          console.log(`✅ Migrated ${imported} plants from localStorage to IndexedDB`);
          // Remove from localStorage after successful migration
          localStorage.removeItem(this.STORAGE_KEY);
        }
        this.migrationDone = true;
      }
      
      // Load all plants into signal
      await this.refreshPlants();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  /**
   * Refresh plants from database to signal
   */
  private async refreshPlants(): Promise<void> {
    try {
      const plants = await db.getAllPlants();
      this.plantsSignal.set(plants);
    } catch (error) {
      console.error('Error refreshing plants:', error);
    }
  }

  /**
   * Get all plants
   */
  getAllPlants(): Plant[] {
    return this.plantsSignal();
  }

  /**
   * Get plant by ID
   */
  getPlantById(id: string): Plant | undefined {
    return this.plantsSignal().find(plant => plant.id === id);
  }

  /**
   * Add new plant
   */
  async addPlant(formData: PlantFormData): Promise<Plant> {
    const newPlant: Plant = {
      id: uuidv4(),
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    try {
      await db.addPlant(newPlant);
      await this.refreshPlants();
      console.log('✅ Plant added to IndexedDB:', newPlant.name);
      return newPlant;
    } catch (error) {
      console.error('Error adding plant:', error);
      throw error;
    }
  }

  /**
   * Update existing plant
   */
  async updatePlant(id: string, updates: Partial<PlantFormData>): Promise<Plant | null> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      const updated = await db.updatePlant(id, updateData);
      
      if (updated === 0) {
        return null;
      }
      
      await this.refreshPlants();
      const plant = this.getPlantById(id);
      console.log('✅ Plant updated in IndexedDB:', plant?.name);
      return plant || null;
    } catch (error) {
      console.error('Error updating plant:', error);
      throw error;
    }
  }

  /**
   * Update plant AI data
   */
  async updatePlantAIData(id: string, aiData: Plant['aiData']): Promise<Plant | null> {
    try {
      const updated = await db.updatePlant(id, {
        aiData,
        updatedAt: new Date()
      });
      
      if (updated === 0) {
        return null;
      }
      
      await this.refreshPlants();
      return this.getPlantById(id) || null;
    } catch (error) {
      console.error('Error updating plant AI data:', error);
      throw error;
    }
  }

  /**
   * Delete plant
   */
  async deletePlant(id: string): Promise<boolean> {
    try {
      await db.deletePlant(id);
      await this.refreshPlants();
      console.log('✅ Plant deleted from IndexedDB');
      return true;
    } catch (error) {
      console.error('Error deleting plant:', error);
      return false;
    }
  }

  /**
   * Search plants by name
   */
  searchPlants(query: string): Plant[] {
    const lowerQuery = query.toLowerCase();
    return this.plantsSignal().filter(plant =>
      plant.name.toLowerCase().includes(lowerQuery) ||
      plant.variety?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Filter plants by location
   */
  filterByLocation(location: string): Plant[] {
    return this.plantsSignal().filter(plant => plant.location === location);
  }

  /**
   * Get plant status based on harvest window
   */
  getPlantStatus(plant: Plant): PlantStatus {
    if (!plant.aiData?.harvestWindow) {
      return PlantStatus.PLANTED;
    }

    const today = new Date();
    const harvestStart = new Date(plant.aiData.harvestWindow.start);
    const harvestEnd = new Date(plant.aiData.harvestWindow.end);

    if (today >= harvestStart && today <= harvestEnd) {
      return PlantStatus.READY_TO_HARVEST;
    } else if (today < harvestStart) {
      return PlantStatus.MATURING;
    } else {
      return PlantStatus.PLANTED;
    }
  }

  /**
   * Get days until harvest
   */
  getDaysUntilHarvest(plant: Plant): number | null {
    if (!plant.aiData?.harvestWindow) {
      return null;
    }

    const today = new Date();
    const harvestStart = new Date(plant.aiData.harvestWindow.start);
    const diffTime = harvestStart.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  /**
   * Get unique locations
   */
  getLocations(): string[] {
    const locations = this.plantsSignal()
      .map(p => p.location)
      .filter((loc): loc is string => !!loc);
    return [...new Set(locations)];
  }

  /**
   * Sort plants by planting date
   */
  sortByPlantingDate(ascending: boolean = true): Plant[] {
    return [...this.plantsSignal()].sort((a, b) => {
      const dateA = new Date(a.plantedDate).getTime();
      const dateB = new Date(b.plantedDate).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }
}
