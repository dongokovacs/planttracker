import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Plant, PlantStatus } from '../../../core/models/plant.model';

@Component({
  selector: 'app-plant-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article class="plant-card">
      <a 
        [routerLink]="['/plants', plant.id]" 
        class="plant-card-link"
        [attr.aria-label]="getCardAriaLabel()"
      >
        <div class="plant-image" [style.backgroundImage]="imageUrl">
          @if (!plant.imageUrl) {
            <div class="placeholder-icon" aria-hidden="true">🌱</div>
          }
        </div>
        
        <div class="plant-content">
          <div class="plant-header">
            <h3 class="plant-name">{{ plant.name }}</h3>
            @if (plant.variety) {
              <span class="plant-variety">{{ plant.variety }}</span>
            }
          </div>

          <div class="plant-meta">
            <div class="meta-item">
              <span class="meta-icon" aria-hidden="true">📅</span>
              <span class="meta-text">Ültetve: {{ plant.plantedDate | date: 'yyyy. MM. dd.' }}</span>
            </div>

            @if (daysUntilHarvest !== null) {
              <div class="meta-item harvest">
                <span class="meta-icon" aria-hidden="true">⏳</span>
                <span class="meta-text">
                  @if (daysUntilHarvest === 0) {
                    <strong>Szedésre kész!</strong>
                  } @else if (daysUntilHarvest > 0) {
                    {{ daysUntilHarvest }} nap a szedésig
                  } @else {
                    Szedési időszak lejárt
                  }
                </span>
              </div>
            }

            @if (plant.aiData) {
              <div class="meta-item">
                <span class="meta-icon" aria-hidden="true">💧</span>
                <span class="meta-text">{{ plant.aiData.waterNeeds.frequency }}</span>
              </div>

              <div class="meta-item">
                <span class="meta-icon" aria-hidden="true">☀️</span>
                <span class="meta-text">{{ plant.aiData.sunNeeds.category }}</span>
              </div>
            }

            @if (plant.location) {
              <div class="meta-item">
                <span class="meta-icon" aria-hidden="true">📍</span>
                <span class="meta-text">{{ plant.location }}</span>
              </div>
            }
          </div>

          @if (nextTask) {
            <div class="next-task">
              <span class="task-icon" aria-hidden="true">🔔</span>
              <span class="task-text">{{ nextTask }}</span>
            </div>
          }

          <div class="status-badge" [class]="statusClass">
            {{ status }}
          </div>
        </div>
      </a>
    </article>
  `,
  styles: [`
    .plant-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .plant-card-link {
      display: flex;
      flex-direction: column;
      height: 100%;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }

    .plant-card-link:hover {
      transform: translateY(-4px);
    }

    .plant-card:has(.plant-card-link:hover) {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .plant-card-link:focus {
      outline: none;
    }

    .plant-card-link:focus-visible {
      outline: 3px solid #2d6a4f;
      outline-offset: 3px;
      border-radius: 12px;
    }

    .plant-image {
      width: 100%;
      height: 200px;
      background-size: cover;
      background-position: center;
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .placeholder-icon {
      font-size: 4rem;
      opacity: 0.3;
    }

    .plant-content {
      padding: 1.25rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .plant-header {
      margin-bottom: 1rem;
    }

    .plant-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1b1b1b;
      margin: 0 0 0.25rem 0;
    }

    .plant-variety {
      font-size: 0.875rem;
      color: #666;
      font-style: italic;
    }

    .plant-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #444;
    }

    .meta-item.harvest {
      color: #f4a261;
      font-weight: 500;
    }

    .meta-icon {
      font-size: 1rem;
    }

    .meta-text {
      flex: 1;
    }

    .next-task {
      background: #fef3e4;
      border-left: 3px solid #f4a261;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .task-icon {
      font-size: 1rem;
    }

    .status-badge {
      align-self: flex-start;
      padding: 0.375rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: auto;
    }

    .status-badge.planted {
      background: #e8f5e9;
      color: #2d6a4f;
    }

    .status-badge.maturing {
      background: #fff3e0;
      color: #e65100;
    }

    .status-badge.ready {
      background: #f3e5f5;
      color: #6a1b9a;
    }

    @media (max-width: 640px) {
      .plant-image {
        height: 160px;
      }

      .plant-content {
        padding: 1rem;
      }
    }
  `]
})
export class PlantCardComponent {
  @Input({ required: true }) plant!: Plant;
  @Input() daysUntilHarvest: number | null = null;
  @Input() status: PlantStatus = PlantStatus.PLANTED;

  get imageUrl(): string {
    return this.plant.imageUrl 
      ? `url(${this.plant.imageUrl})` 
      : '';
  }

  get statusClass(): string {
    switch (this.status) {
      case PlantStatus.PLANTED:
        return 'planted';
      case PlantStatus.MATURING:
        return 'maturing';
      case PlantStatus.READY_TO_HARVEST:
        return 'ready';
      default:
        return 'planted';
    }
  }

  get nextTask(): string | null {
    if (!this.plant.aiData?.carePlan || this.plant.aiData.carePlan.length === 0) {
      return null;
    }

    // Find the next upcoming task
    const now = new Date();
    const plantedDate = new Date(this.plant.plantedDate);
    const weeksSincePlanting = Math.floor((now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

    for (const phase of this.plant.aiData.carePlan) {
      if (phase.weeksFromPlanting && phase.weeksFromPlanting >= weeksSincePlanting) {
        return phase.tasks[0] || phase.description;
      }
    }

    return null;
  }

  getCardAriaLabel(): string {
    let label = `${this.plant.name}`;
    
    if (this.plant.variety) {
      label += `, ${this.plant.variety}`;
    }
    
    label += `. Státusz: ${this.status}`;
    
    if (this.daysUntilHarvest !== null) {
      if (this.daysUntilHarvest === 0) {
        label += '. Szedésre kész!';
      } else if (this.daysUntilHarvest > 0) {
        label += `. ${this.daysUntilHarvest} nap a szedésig`;
      }
    }
    
    if (this.plant.location) {
      label += `. Helyszín: ${this.plant.location}`;
    }
    
    return label + '. Kattintson a részletekhez';
  }
}
