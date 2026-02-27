import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PlantService } from '../../core/services/plant.service';
import { NotificationService } from '../../core/services/notification.service';
import { Plant, PlantStatus } from '../../core/models/plant.model';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-plant-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSkeletonComponent],
  template: `
    <div class="detail-container">
      @if (isLoading()) {
        <app-loading-skeleton type="card"></app-loading-skeleton>
      } @else if (plant()) {
        <div class="detail-card">
          <!-- Hero Image -->
          <div class="hero-image" [style.backgroundImage]="heroImageUrl">
            <div class="hero-overlay">
              <button routerLink="/dashboard" class="back-button">
                ← Vissza
              </button>
              <div class="status-badge" [class]="statusClass">
                {{ status() }}
              </div>
            </div>
          </div>

          <!-- Header -->
          <div class="detail-header">
            <div class="header-content">
              <h1 class="plant-title">{{ plant()!.name }}</h1>
              @if (plant()!.variety) {
                <p class="plant-variety">{{ plant()!.variety }}</p>
              }
            </div>
            <div class="header-actions">
              <button
                [routerLink]="['/plants', plant()!.id, 'edit']"
                class="btn btn-secondary"
              >
                ✏️ Szerkesztés
              </button>
              <button
                (click)="onDelete()"
                class="btn btn-danger"
                [disabled]="isDeleting()"
              >
                🗑️ Törlés
              </button>
            </div>
          </div>

          <!-- Basic Info -->
          <div class="info-grid">
            <div class="info-card">
              <span class="info-icon">📅</span>
              <div class="info-content">
                <div class="info-label">Ültetés dátuma</div>
                <div class="info-value">{{ plant()!.plantedDate | date: 'yyyy. MM. dd.' }}</div>
              </div>
            </div>

            @if (plant()!.location) {
              <div class="info-card">
                <span class="info-icon">📍</span>
                <div class="info-content">
                  <div class="info-label">Helyszín</div>
                  <div class="info-value">{{ plant()!.location }}</div>
                </div>
              </div>
            }

            @if (daysUntilHarvest() !== null) {
              <div class="info-card harvest">
                <span class="info-icon">⏳</span>
                <div class="info-content">
                  <div class="info-label">Szedésig hátralévő idő</div>
                  <div class="info-value">
                    @if (daysUntilHarvest()! === 0) {
                      <strong>Szedésre kész! 🎉</strong>
                    } @else if (daysUntilHarvest()! > 0) {
                      {{ daysUntilHarvest() }} nap
                    } @else {
                      Szedési időszak lejárt
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Notes -->
          @if (plant()!.notes) {
            <div class="notes-section">
              <h3 class="section-title">📝 Megjegyzések</h3>
              <p class="notes-text">{{ plant()!.notes }}</p>
            </div>
          }
        </div>
      } @else {
        <div class="error-state">
          <h2>❌ Növény nem található</h2>
          <p>A keresett növény nem létezik vagy törölve lett.</p>
          <button routerLink="/dashboard" class="btn btn-primary">
            Vissza a kezdőlapra
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0;
      min-height: 100vh;
    }

    .detail-card {
      background: white;
      overflow: hidden;
    }

    .hero-image {
      width: 100%;
      height: 400px;
      background-size: cover;
      background-position: center;
      background-color: #f0f0f0;
      position: relative;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem;
    }

    .back-button {
      background: rgba(255, 255, 255, 0.9);
      border: none;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .back-button:hover {
      background: white;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.planted {
      background: rgba(232, 245, 233, 0.95);
      color: #2d6a4f;
    }

    .status-badge.maturing {
      background: rgba(255, 243, 224, 0.95);
      color: #e65100;
    }

    .status-badge.ready {
      background: rgba(243, 229, 245, 0.95);
      color: #6a1b9a;
    }

    .detail-header {
      padding: 2rem;
      border-bottom: 2px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .header-content {
      flex: 1;
      min-width: 250px;
    }

    .plant-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d6a4f;
      margin: 0 0 0.5rem 0;
    }

    .plant-variety {
      font-size: 1.25rem;
      color: #666;
      font-style: italic;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #2d6a4f;
      color: white;
    }

    .btn-primary:not(:disabled):hover {
      background: #1e4d36;
    }

    .btn-secondary {
      background: #f0f0f0;
      color: #333;
    }

    .btn-secondary:not(:disabled):hover {
      background: #e0e0e0;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:not(:disabled):hover {
      background: #c82333;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      padding: 2rem;
    }

    .info-card {
      background: #f8f9fa;
      padding: 1.25rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .info-card.harvest {
      background: #fff3e0;
    }

    .info-icon {
      font-size: 2rem;
    }

    .info-content {
      flex: 1;
    }

    .info-label {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.25rem;
    }

    .info-value {
      font-size: 1.125rem;
      font-weight: 600;
      color: #333;
    }

    .notes-section {
      padding: 2rem;
      border-top: 2px solid #f0f0f0;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d6a4f;
      margin: 0 0 1rem 0;
    }

    .notes-text {
      color: #555;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .ai-section {
      padding: 2rem;
      border-top: 2px solid #f0f0f0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .btn-refresh {
      background: #f0f0f0;
      border: none;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.25rem;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
    }

    .btn-refresh:not(:disabled):hover {
      background: #e0e0e0;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid #ddd;
      border-top-color: #2d6a4f;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .harvest-window {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 12px;
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2d6a4f;
      margin-bottom: 1rem;
    }

    .separator {
      color: #999;
    }

    .description {
      color: #555;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #74c69d, #2d6a4f);
      transition: width 0.3s;
    }

    .progress-label {
      font-size: 0.875rem;
      color: #666;
      text-align: center;
      margin: 0;
    }

    .needs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
      border-top: 2px solid #f0f0f0;
    }

    .need-card {
      padding: 1.5rem;
      border-radius: 12px;
    }

    .need-card.water {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
    }

    .need-card.sun {
      background: #fff8e1;
      border-left: 4px solid #ffc107;
    }

    .need-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.75rem 0;
      color: #333;
    }

    .need-frequency {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d6a4f;
      margin: 0 0 0.5rem 0;
    }

    .category {
      font-size: 0.875rem;
      font-weight: 400;
      color: #666;
    }

    .need-details {
      color: #555;
      line-height: 1.6;
      margin: 0;
      font-size: 0.875rem;
    }

    .care-plan {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .care-phase {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 12px;
      border-left: 4px solid #74c69d;
    }

    .phase-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .phase-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d6a4f;
      margin: 0;
    }

    .phase-weeks {
      background: #2d6a4f;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .phase-description {
      color: #555;
      line-height: 1.6;
      margin-bottom: 0.75rem;
    }

    .task-list {
      margin: 0;
      padding-left: 1.5rem;
    }

    .task-item {
      color: #444;
      line-height: 1.8;
    }

    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .recipe-card {
      background: white;
      border: 2px solid #f0f0f0;
      border-radius: 12px;
      padding: 1.25rem;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
    }

    .recipe-card:hover {
      border-color: #2d6a4f;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .recipe-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d6a4f;
      margin: 0 0 0.5rem 0;
    }

    .recipe-description {
      color: #666;
      font-size: 0.875rem;
      line-height: 1.5;
      margin: 0 0 1rem 0;
      flex: 1;
    }

    .recipe-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .recipe-difficulty {
      padding: 0.25rem 0.625rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .difficulty-egyszerű {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .difficulty-közepes {
      background: #fff3e0;
      color: #f57c00;
    }

    .difficulty-haladó {
      background: #fce4ec;
      color: #c2185b;
    }

    .recipe-link {
      font-size: 0.875rem;
      color: #2d6a4f;
      font-weight: 500;
    }

    .ai-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 2rem;
      background: #f8f9fa;
      font-size: 0.875rem;
      color: #666;
    }

    .ai-info-icon {
      font-size: 1.25rem;
    }

    .stale-warning {
      color: #f4a261;
      font-weight: 600;
    }

    .no-ai-data {
      padding: 3rem 2rem;
      text-align: center;
    }

    .no-ai-message {
      color: #666;
      margin-bottom: 1.5rem;
    }

    .error-state {
      padding: 4rem 2rem;
      text-align: center;
    }

    .error-state h2 {
      font-size: 2rem;
      color: #dc3545;
      margin-bottom: 1rem;
    }

    .error-state p {
      color: #666;
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .hero-image {
        height: 250px;
      }

      .detail-header {
        padding: 1.5rem;
        flex-direction: column;
        align-items: stretch;
      }

      .plant-title {
        font-size: 2rem;
      }

      .header-actions {
        width: 100%;
      }

      .header-actions .btn {
        flex: 1;
      }

      .info-grid,
      .needs-grid,
      .ai-section {
        padding: 1.5rem 1rem;
      }

      .recipes-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PlantDetailComponent implements OnInit {
  plant = signal<Plant | null>(null);
  isLoading = signal(true);
  isDeleting = signal(false);
  status = signal<PlantStatus>(PlantStatus.PLANTED);
  daysUntilHarvest = signal<number | null>(null);
  harvestProgress = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private plantService: PlantService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPlant(id);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  get heroImageUrl(): string {
    return this.plant()?.imageUrl 
      ? `url(${this.plant()!.imageUrl})` 
      : '';
  }

  get statusClass(): string {
    switch (this.status()) {
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

  private loadPlant(id: string): void {
    setTimeout(() => {
      const foundPlant = this.plantService.getPlantById(id);
      if (foundPlant) {
        this.plant.set(foundPlant);
        this.status.set(this.plantService.getPlantStatus(foundPlant));
        this.daysUntilHarvest.set(this.plantService.getDaysUntilHarvest(foundPlant));
        this.calculateHarvestProgress();
      }
      this.isLoading.set(false);
    }, 300);
  }

  private calculateHarvestProgress(): void {
    const p = this.plant();
    if (!p?.aiData?.harvestWindow) {
      this.harvestProgress = 0;
      return;
    }

    const plantedDate = new Date(p.plantedDate);
    const harvestStart = new Date(p.aiData.harvestWindow.start);
    const today = new Date();

    const totalDays = Math.max(1, (harvestStart.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = (today.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24);

    this.harvestProgress = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
  }

  async onDelete(): Promise<void> {
    if (!confirm('Biztosan törölni szeretnéd ezt a növényt?')) {
      return;
    }

    this.isDeleting.set(true);
    const p = this.plant();
    if (p) {
      const success = await this.plantService.deletePlant(p.id);
      if (success) {
        this.notificationService.success('Növény sikeresen törölve');
        this.router.navigate(['/dashboard']);
      } else {
        this.notificationService.error('Hiba történt a törlés során');
        this.isDeleting.set(false);
      }
    }
  }
}
