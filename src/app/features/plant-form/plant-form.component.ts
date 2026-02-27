import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PlantService } from '../../core/services/plant.service';
import { ImageService } from '../../core/services/image.service';
import { NotificationService } from '../../core/services/notification.service';
import { Plant, PlantFormData } from '../../core/models/plant.model';

@Component({
  selector: 'app-plant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <main class="form-container">
      <div class="form-card">
        <header class="form-header">
          <h1 id="form-title" class="form-title">
            <span aria-hidden="true">{{ isEditMode() ? '✏️' : '🌱' }}</span>
            {{ isEditMode() ? 'Növény szerkesztése' : 'Új növény hozzáadása' }}
          </h1>
          <p class="form-subtitle">
            {{ isEditMode() 
              ? 'Módosítsa a növény adatait' 
              : 'Adja meg a növény alapvető információit, az AI automatikusan kiegészíti a részleteket' 
            }}
          </p>
        </header>

        <form 
          [formGroup]="plantForm" 
          (ngSubmit)="onSubmit()" 
          class="plant-form"
          aria-labelledby="form-title"
          novalidate
        >
          <div class="form-group">
            <label for="name" class="form-label">
              Növény neve <span class="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              formControlName="name"
              placeholder="pl. Paradicsom"
              class="form-input"
              autocomplete="off"
              aria-required="true"
              [attr.aria-invalid]="plantForm.get('name')?.invalid && plantForm.get('name')?.touched"
              [attr.aria-describedby]="plantForm.get('name')?.invalid && plantForm.get('name')?.touched ? 'name-error' : null"
              [class.error]="plantForm.get('name')?.invalid && plantForm.get('name')?.touched"
            />
            @if (plantForm.get('name')?.invalid && plantForm.get('name')?.touched) {
              <span id="name-error" class="error-message" role="alert">A növény neve kötelező</span>
            }
          </div>

          <div class="form-group">
            <label for="variety" class="form-label">
              Fajta (opcionális)
            </label>
            <input
              id="variety"
              type="text"
              formControlName="variety"
              placeholder="pl. Cherry, Genovese"
              class="form-input"
              autocomplete="off"
            />
          </div>

          <div class="form-group">
            <label for="plantedDate" class="form-label">
              Ültetés dátuma <span class="required">*</span>
            </label>
            <input
              id="plantedDate"
              type="date"
              formControlName="plantedDate"
              class="form-input"
              [max]="today"
              aria-required="true"
              [attr.aria-invalid]="plantForm.get('plantedDate')?.invalid && plantForm.get('plantedDate')?.touched"
              [attr.aria-describedby]="plantForm.get('plantedDate')?.invalid && plantForm.get('plantedDate')?.touched ? 'plantedDate-error' : null"
              [class.error]="plantForm.get('plantedDate')?.invalid && plantForm.get('plantedDate')?.touched"
            />
            @if (plantForm.get('plantedDate')?.invalid && plantForm.get('plantedDate')?.touched) {
              <span id="plantedDate-error" class="error-message" role="alert">
                Az ültetés dátuma kötelező és nem lehet jövőbeli
              </span>
            }
          </div>

          <div class="form-group">
            <label for="location" class="form-label">
              Helyszín (opcionális)
            </label>
            <input
              id="location"
              type="text"
              formControlName="location"
              placeholder="pl. Erkély, Kert, Ablakpárkány"
              class="form-input"
              list="location-suggestions"
              autocomplete="off"
              role="combobox"
              aria-autocomplete="list"
              [attr.aria-expanded]="existingLocations.length > 0"
              aria-controls="location-suggestions"
            />
            <datalist id="location-suggestions">
              @for (location of existingLocations; track location) {
                <option [value]="location">{{ location }}</option>
              }
            </datalist>
          </div>

          <div class="form-group">
            <label for="notes" class="form-label">
              Megjegyzések (opcionális)
            </label>
            <textarea
              id="notes"
              formControlName="notes"
              placeholder="Egyéni feljegyzések..."
              rows="4"
              class="form-input"
            ></textarea>
          </div>

          @if (isLoading()) {
            <div class="loading-indicator" role="status" aria-live="polite">
              <div class="spinner" aria-hidden="true"></div>
              <p class="loading-text">
                {{ loadingMessage() }}
              </p>
            </div>
          }

          @if (errorMessage()) {
            <div class="error-alert" role="alert" aria-live="assertive">
              <span class="error-icon" aria-hidden="true">⚠️</span>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <div class="form-actions">
            <button
              type="button"
              (click)="onCancel()"
              class="btn btn-secondary"
              [disabled]="isLoading()"
              aria-label="Adatok módosításának elvetése"
            >
              Mégse
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="plantForm.invalid || isLoading()"
              [attr.aria-label]="isEditMode() ? 'Növény adatainak mentése' : 'Új növény hozzáadása'"
            >
              @if (isLoading()) {
                <span class="btn-spinner" role="status" aria-label="Betöltés folyamatban"></span>
              }
              {{ isEditMode() ? 'Mentés' : 'Hozzáadás' }}
            </button>
          </div>
        </form>


      </div>
    </main>
  `,
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .form-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
      padding: 2rem;
    }

    .form-header {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #f0f0f0;
    }

    .form-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #2d6a4f;
      margin: 0 0 0.5rem 0;
    }

    .form-subtitle {
      font-size: 1rem;
      color: #666;
      margin: 0;
    }

    .plant-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
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
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: inherit;
    }

    .form-input:focus {
      outline: none;
      border-color: #2d6a4f;
      box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.1);
    }

    .form-input:focus-visible {
      outline: 3px solid #2d6a4f;
      outline-offset: 2px;
      border-color: #2d6a4f;
    }

    .form-input.error {
      border-color: #dc3545;
    }

    .form-input.error:focus {
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }

    .form-input.error:focus-visible {
      outline-color: #dc3545;
    }

    textarea.form-input {
      resize: vertical;
      min-height: 100px;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.375rem;
    }

    .loading-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e0e0e0;
      border-top-color: #2d6a4f;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      margin-top: 1rem;
      color: #666;
      font-size: 0.875rem;
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      color: #c33;
    }

    .error-icon {
      font-size: 1.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn {
      flex: 1;
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
      display: flex;
      align-items: center;
      justify-content: center;
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
      background: #f0f0f0;
      color: #333;
    }

    .btn-secondary:not(:disabled):hover {
      background: #e0e0e0;
    }

    .btn-secondary:focus-visible {
      outline-color: #333;
    }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    .info-box {
      margin-top: 2rem;
      padding: 1.25rem;
      background: #e8f5e9;
      border-left: 4px solid #2d6a4f;
      border-radius: 8px;
      display: flex;
      gap: 1rem;
    }

    .info-icon {
      font-size: 1.5rem;
    }

    .info-content {
      flex: 1;
    }

    .info-content strong {
      display: block;
      color: #2d6a4f;
      margin-bottom: 0.5rem;
    }

    .info-content p {
      margin: 0;
      color: #555;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    @media (max-width: 640px) {
      .form-container {
        padding: 1rem;
      }

      .form-card {
        padding: 1.5rem;
      }

      .form-title {
        font-size: 1.5rem;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class PlantFormComponent implements OnInit {
  plantForm!: FormGroup;
  isEditMode = signal(false);
  isLoading = signal(false);
  loadingMessage = signal('');
  errorMessage = signal('');
  existingLocations: string[] = [];
  plantId: string | null = null;
  today: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private plantService: PlantService,
    private imageService: ImageService,
    private notificationService: NotificationService
  ) {
    // Set max date to today
    this.today = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initForm();
    this.loadExistingLocations();
    this.checkEditMode();
  }

  private initForm(): void {
    this.plantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      variety: [''],
      plantedDate: ['', [Validators.required, this.dateNotInFutureValidator]],
      location: [''],
      notes: ['']
    });
  }

  private dateNotInFutureValidator(control: any) {
    if (!control.value) {
      return null;
    }
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate <= today ? null : { futureDate: true };
  }

  private loadExistingLocations(): void {
    this.existingLocations = this.plantService.getLocations();
  }

  private checkEditMode(): void {
    this.plantId = this.route.snapshot.paramMap.get('id');
    if (this.plantId) {
      this.isEditMode.set(true);
      this.loadPlantData(this.plantId);
    }
  }

  private loadPlantData(id: string): void {
    const plant = this.plantService.getPlantById(id);
    if (plant) {
      this.plantForm.patchValue({
        name: plant.name,
        variety: plant.variety || '',
        plantedDate: new Date(plant.plantedDate).toISOString().split('T')[0],
        location: plant.location || '',
        notes: plant.notes || ''
      });
    } else {
      this.notificationService.error('Növény nem található');
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.plantForm.invalid) {
      Object.keys(this.plantForm.controls).forEach(key => {
        this.plantForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const formData: PlantFormData = {
      name: this.plantForm.value.name,
      variety: this.plantForm.value.variety || undefined,
      plantedDate: new Date(this.plantForm.value.plantedDate),
      location: this.plantForm.value.location || undefined,
      notes: this.plantForm.value.notes || undefined
    };

    try {
      if (this.isEditMode() && this.plantId) {
        // Update existing plant
        this.loadingMessage.set('Növény frissítése...');
        const updatedPlant = await this.plantService.updatePlant(this.plantId, formData);
        
        if (updatedPlant) {
          this.notificationService.success('Növény sikeresen frissítve!');
          this.router.navigate(['/plants', this.plantId]);
        } else {
          throw new Error('Nem sikerült frissíteni a növényt');
        }
      } else {
        // Add new plant
        this.loadingMessage.set('Növény hozzáadása...');
        const newPlant = await this.plantService.addPlant(formData);

        // Fetch image
        this.loadingMessage.set('Növény kép keresése...');
        try {
          const imageUrl = await this.imageService.searchPlantImage(
            formData.name,
            formData.variety
          ).toPromise();
          
          if (imageUrl) {
            await this.plantService.updatePlant(newPlant.id, { ...formData } as any);
            const plant = this.plantService.getPlantById(newPlant.id);
            if (plant) {
              plant.imageUrl = imageUrl;
              await this.plantService.updatePlantAIData(newPlant.id, plant.aiData);
            }
          }
        } catch (imageError) {
          console.warn('Image fetch failed, continuing without image:', imageError);
        }

        this.notificationService.success('Növény sikeresen hozzáadva!');
        this.router.navigate(['/plants', newPlant.id]);
      }
    } catch (error) {
      console.error('Error saving plant:', error);
      this.errorMessage.set('Hiba történt a mentés során. Kérjük, próbálja újra!');
      this.notificationService.error('Hiba történt a mentés során');
    } finally {
      this.isLoading.set(false);
    }
  }

  onCancel(): void {
    if (this.isEditMode() && this.plantId) {
      this.router.navigate(['/plants', this.plantId]);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
