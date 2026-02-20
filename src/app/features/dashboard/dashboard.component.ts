import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlantService } from '../../core/services/plant.service';
import { Plant, PlantStatus } from '../../core/models/plant.model';
import { PlantCardComponent } from './plant-card/plant-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    PlantCardComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <div class="header-content">
          <h1 class="title">🌱 PlantTracker</h1>
          <p class="subtitle">Kövesse nyomon növényeit egyszerűen</p>
        </div>
        <a routerLink="/plants/add" class="add-button">
          <span class="add-icon">+</span>
          Új növény
        </a>
      </header>

      <div class="dashboard-controls">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Keresés növény neve szerint..."
            class="search-input"
          />
        </div>

        <div class="filters">
          <select
            [(ngModel)]="selectedLocation"
            (ngModelChange)="onFilterChange()"
            class="filter-select"
          >
            <option value="">Minden helyszín</option>
            @for (location of locations(); track location) {
              <option [value]="location">{{ location }}</option>
            }
          </select>

          <select
            [(ngModel)]="selectedStatus"
            (ngModelChange)="onFilterChange()"
            class="filter-select"
          >
            <option value="">Minden státusz</option>
            <option value="planted">Ültetett</option>
            <option value="maturing">Érlelődik</option>
            <option value="ready">Szedésre kész</option>
          </select>

          <select
            [(ngModel)]="sortOrder"
            (ngModelChange)="onSortChange()"
            class="filter-select"
          >
            <option value="desc">Legújabb elöl</option>
            <option value="asc">Legrégebbi elöl</option>
          </select>
        </div>
      </div>

      @if (isLoading()) {
        <div class="plants-grid">
          @for (item of [1,2,3]; track item) {
            <app-loading-skeleton type="card"></app-loading-skeleton>
          }
        </div>
      } @else if (filteredPlants().length === 0) {
        @if (plants().length === 0) {
          <app-empty-state
            icon="🌱"
            title="Nincs még növény"
            message="Kezdje el növényei nyomon követését az első hozzáadásával!"
            actionLabel="Első növény hozzáadása"
            actionRoute="/plants/add"
          ></app-empty-state>
        } @else {
          <app-empty-state
            icon="🔍"
            title="Nincs találat"
            message="Próbáljon más keresési kifejezést vagy szűrőt használni."
            [actionLabel]="undefined"
            [actionRoute]="undefined"
          ></app-empty-state>
        }
      } @else {
        <div class="plants-grid">
          @for (plant of filteredPlants(); track plant.id) {
            <app-plant-card
              [plant]="plant"
              [daysUntilHarvest]="getDaysUntilHarvest(plant)"
              [status]="getPlantStatus(plant)"
            ></app-plant-card>
          }
        </div>
      }

      @if (filteredPlants().length > 0) {
        <div class="dashboard-stats">
          <div class="stat-card">
            <div class="stat-value">{{ plants().length }}</div>
            <div class="stat-label">Összes növény</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ readyToHarvestCount() }}</div>
            <div class="stat-label">Szedésre kész</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ maturingCount() }}</div>
            <div class="stat-label">Érlelődik</div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .header-content {
      flex: 1;
      min-width: 250px;
    }

    .title {
      font-size: 2rem;
      font-weight: 700;
      color: #2d6a4f;
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      font-size: 1rem;
      color: #666;
      margin: 0;
    }

    .add-button {
      background: #2d6a4f;
      color: white;
      padding: 0.875rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s, transform 0.2s;
    }

    .add-button:hover {
      background: #1e4d36;
      transform: translateY(-2px);
    }

    .add-icon {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .dashboard-controls {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      background: #f8f9fa;
      padding: 0.75rem 1rem;
      border-radius: 8px;
    }

    .search-icon {
      font-size: 1.25rem;
      opacity: 0.6;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 1rem;
      outline: none;
    }

    .filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-select {
      flex: 1;
      min-width: 150px;
      padding: 0.625rem 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.875rem;
      background: white;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .filter-select:hover,
    .filter-select:focus {
      border-color: #2d6a4f;
      outline: none;
    }

    .plants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d6a4f;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media (max-width: 640px) {
      .dashboard {
        padding: 1rem;
      }

      .title {
        font-size: 1.5rem;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: stretch;
      }

      .add-button {
        width: 100%;
        justify-content: center;
      }

      .plants-grid {
        grid-template-columns: 1fr;
      }

      .filters {
        flex-direction: column;
      }

      .filter-select {
        width: 100%;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private plantService: PlantService;

  // Signals for reactive state
  plants = signal<Plant[]>([]);
  isLoading = signal(true);
  searchQuery = '';
  selectedLocation = '';
  selectedStatus = '';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Computed signals
  locations = computed(() => {
    return this.plantService.getLocations();
  });

  filteredPlants = computed(() => {
    let result = [...this.plants()];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(plant =>
        plant.name.toLowerCase().includes(query) ||
        plant.variety?.toLowerCase().includes(query)
      );
    }

    // Location filter
    if (this.selectedLocation) {
      result = result.filter(plant => plant.location === this.selectedLocation);
    }

    // Status filter
    if (this.selectedStatus) {
      result = result.filter(plant => {
        const status = this.getPlantStatus(plant);
        return status.toLowerCase() === this.selectedStatus;
      });
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.plantedDate).getTime();
      const dateB = new Date(b.plantedDate).getTime();
      return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  });

  readyToHarvestCount = computed(() => {
    return this.plants().filter(plant =>
      this.getPlantStatus(plant) === PlantStatus.READY_TO_HARVEST
    ).length;
  });

  maturingCount = computed(() => {
    return this.plants().filter(plant =>
      this.getPlantStatus(plant) === PlantStatus.MATURING
    ).length;
  });

  constructor(plantService: PlantService) {
    this.plantService = plantService;
  }

  ngOnInit(): void {
    this.loadPlants();
  }

  private loadPlants(): void {
    // Simulate loading delay
    setTimeout(() => {
      this.plants.set(this.plantService.getAllPlants());
      this.isLoading.set(false);
    }, 500);
  }

  onSearchChange(): void {
    // Trigger change detection via computed signals
    this.filteredPlants();
  }

  onFilterChange(): void {
    // Trigger change detection via computed signals
    this.filteredPlants();
  }

  onSortChange(): void {
    // Trigger change detection via computed signals
    this.filteredPlants();
  }

  getDaysUntilHarvest(plant: Plant): number | null {
    return this.plantService.getDaysUntilHarvest(plant);
  }

  getPlantStatus(plant: Plant): PlantStatus {
    return this.plantService.getPlantStatus(plant);
  }
}
