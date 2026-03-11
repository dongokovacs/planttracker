import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Plant, PlantFormData, PlantStatus } from '../models/plant.model';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlantService {
  private readonly apiUrl = `${environment.apiBaseUrl}/plants`;
  
  // Signal-based state management
  private plantsSignal = signal<Plant[]>([]);
  
  // Computed signals for derived state
  plants = this.plantsSignal.asReadonly();
  
  plantsCount = computed(() => this.plantsSignal().length);
  
  constructor(private http: HttpClient) {
    void this.refreshPlants();
  }

  /**
   * Refresh plants from database to signal
   */
  private async refreshPlants(): Promise<void> {
    try {
      const plants = await firstValueFrom(this.http.get<Plant[]>(this.apiUrl));
      this.plantsSignal.set(plants.map(this.hydratePlant));
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
      const created = await firstValueFrom(this.http.post<Plant>(this.apiUrl, this.dehydratePlant(newPlant)));
      await this.refreshPlants();
      return this.hydratePlant(created);
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
      const updated = await firstValueFrom(
        this.http.put<Plant>(`${this.apiUrl}/${encodeURIComponent(id)}`, {
          ...updates
        })
      );
      await this.refreshPlants();
      return this.hydratePlant(updated);
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
      const updated = await firstValueFrom(
        this.http.put<Plant>(`${this.apiUrl}/${encodeURIComponent(id)}`, {
          aiData
        })
      );
      await this.refreshPlants();
      return this.hydratePlant(updated);
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
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${encodeURIComponent(id)}`, { responseType: 'text' }));
      await this.refreshPlants();
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

  private hydratePlant = (p: Plant): Plant => ({
    ...p,
    plantedDate: new Date(p.plantedDate),
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
    aiData: p.aiData
      ? {
          ...p.aiData,
          fetchedAt: new Date((p.aiData as any).fetchedAt),
        }
      : undefined,
  });

  private dehydratePlant(p: Plant): any {
    return {
      ...p,
      plantedDate: p.plantedDate instanceof Date ? p.plantedDate.toISOString() : p.plantedDate,
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
      updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
      aiData: p.aiData
        ? {
            ...p.aiData,
            fetchedAt:
              (p.aiData as any).fetchedAt instanceof Date
                ? (p.aiData as any).fetchedAt.toISOString()
                : (p.aiData as any).fetchedAt,
          }
        : undefined,
    };
  }
}
