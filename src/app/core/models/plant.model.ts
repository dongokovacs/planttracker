export interface Plant {
  id: string;
  name: string;
  variety?: string;
  plantedDate: Date;
  location?: string;
  notes?: string;
  imageUrl?: string;
  aiData?: PlantAIData;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlantAIData {
  harvestWindow: HarvestWindow;
  waterNeeds: WaterNeeds;
  sunNeeds: SunNeeds;
  carePlan: CarePlanPhase[];
  recipes: Recipe[];
  fetchedAt: Date;
}

export interface HarvestWindow {
  start: string;
  end: string;
  description: string;
}

export interface WaterNeeds {
  frequency: string;
  details: string;
}

export interface SunNeeds {
  hours: number;
  category: 'teljes nap' | 'félárnyék' | 'árnyék';
  details: string;
}

export interface CarePlanPhase {
  phase: string;
  weeksFromPlanting?: number;
  description: string;
  tasks: string[];
}

export interface Recipe {
  name: string;
  url: string;
  description: string;
  difficulty: 'egyszerű' | 'közepes' | 'haladó';
}

// DTO for creating/updating plants
export interface PlantFormData {
  name: string;
  variety?: string;
  plantedDate: Date;
  location?: string;
  notes?: string;
}

// Enum for plant status
export enum PlantStatus {
  PLANTED = 'ültetett',
  MATURING = 'érlel',
  READY_TO_HARVEST = 'szedésre kész'
}
