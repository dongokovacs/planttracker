import { Injectable, signal, computed } from '@angular/core';
import { Plant, PlantFormData, PlantStatus } from '../models/plant.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class PlantService {
  private readonly STORAGE_KEY = 'planttracker_plants';
  
  // Signal-based state management
  private plantsSignal = signal<Plant[]>([]);
  
  // Computed signals for derived state
  plants = this.plantsSignal.asReadonly();
  
  plantsCount = computed(() => this.plantsSignal().length);
  
  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load plants from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const plants = JSON.parse(stored) as Plant[];
        // Convert date strings back to Date objects
        plants.forEach(plant => {
          plant.plantedDate = new Date(plant.plantedDate);
          plant.createdAt = new Date(plant.createdAt);
          plant.updatedAt = new Date(plant.updatedAt);
          if (plant.aiData?.fetchedAt) {
            plant.aiData.fetchedAt = new Date(plant.aiData.fetchedAt);
          }
        });
        this.plantsSignal.set(plants);
      }
    } catch (error) {
      console.error('Error loading plants from storage:', error);
    }
  }

  /**
   * Save plants to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.plantsSignal()));
    } catch (error) {
      console.error('Error saving plants to storage:', error);
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
  addPlant(formData: PlantFormData): Plant {
    const newPlant: Plant = {
      id: uuidv4(),
      ...formData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.plantsSignal.update(plants => [...plants, newPlant]);
    this.saveToStorage();
    
    return newPlant;
  }

  /**
   * Update existing plant
   */
  updatePlant(id: string, updates: Partial<PlantFormData>): Plant | null {
    const plantIndex = this.plantsSignal().findIndex(p => p.id === id);
    
    if (plantIndex === -1) {
      return null;
    }
    
    this.plantsSignal.update(plants => {
      const updatedPlants = [...plants];
      updatedPlants[plantIndex] = {
        ...updatedPlants[plantIndex],
        ...updates,
        updatedAt: new Date()
      };
      return updatedPlants;
    });
    
    this.saveToStorage();
    return this.plantsSignal()[plantIndex];
  }

  /**
   * Update plant AI data
   */
  updatePlantAIData(id: string, aiData: Plant['aiData']): Plant | null {
    const plantIndex = this.plantsSignal().findIndex(p => p.id === id);
    
    if (plantIndex === -1) {
      return null;
    }
    
    this.plantsSignal.update(plants => {
      const updatedPlants = [...plants];
      updatedPlants[plantIndex] = {
        ...updatedPlants[plantIndex],
        aiData,
        updatedAt: new Date()
      };
      return updatedPlants;
    });
    
    this.saveToStorage();
    return this.plantsSignal()[plantIndex];
  }

  /**
   * Delete plant
   */
  deletePlant(id: string): boolean {
    const initialLength = this.plantsSignal().length;
    this.plantsSignal.update(plants => plants.filter(p => p.id !== id));
    
    if (this.plantsSignal().length < initialLength) {
      this.saveToStorage();
      return true;
    }
    
    return false;
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
