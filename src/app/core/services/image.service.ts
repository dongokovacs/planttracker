import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '@environments/environment';

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
  private readonly PLACEHOLDER_IMAGES = [
    '/images/plant-placeholder-1.jpg',
    '/images/plant-placeholder-2.jpg',
    '/images/plant-placeholder-3.jpg'
  ];

  // Local images mapping (Hungarian plant names to image files)
  private readonly LOCAL_IMAGES: Record<string, string> = {
    'paradicsom': '/images/paradicsom.jpg',
    'paprika': '/images/paprika.jpg',
    'oregánó': '/images/oregano.jpg',
    'oregano': '/images/oregano.jpg',
    'uborka': '/images/uborka.jpg',
    'saláta': '/images/salata.jpg',
    'salata': '/images/salata.jpg',
    'retek': '/images/retek.jpg',
    'bazsalikom': '/images/bazsalikom.jpg',
    'cukkini': '/images/cukkini.jpg',
    'cukini': '/images/cukkini.jpg',
    'burgonya': '/images/burgonya.jpg',
    'krumpli': '/images/burgonya.jpg',
    'sárgarépa': '/images/sárgarépa.jpg',
    'sargarépa': '/images/sargarépa.jpg',
    'répa': '/images/sargarépa.jpg',
    'repa': '/images/sargarépa.jpg',
    'hagyma': '/images/hagyma.jpg',
    'petrezselyem': '/images/petrezselyem.jpg',
    'zeller': '/images/petrezselyem.jpg',
    'spenót': '/images/spenót.jpg',
    'spenot': '/images/spenot.jpg',
    'brokkoli': '/images/brokkoli.jpg',
    'karfiol': '/images/karfiol.jpg',
    'kelbimbó': '/images/kelbimbó.jpg',
    'kelbimbo': '/images/kelbimbo.jpg'
  };

  constructor(private http: HttpClient) {}

  /**
   * Search for plant images (local first, then Unsplash)
   */
  searchPlantImage(plantName: string, variety?: string): Observable<string> {
    // First, check if we have a local image
    const localImage = this.getLocalImage(plantName);
    if (localImage) {
      console.log(`Using local image for ${plantName}`);
      return of(localImage);
    }

    // Check if API key is configured
    if (!environment.unsplashApiKey) {
      console.warn('Unsplash API key not configured, using placeholder');
      return of(this.getRandomPlaceholder());
    }

    // Search on Unsplash
    const headers = new HttpHeaders({
      'Authorization': `Client-ID ${environment.unsplashApiKey}`
    });

    const searchQuery = variety ? `${plantName} ${variety} plant` : `${plantName} plant`;
    const params = new HttpParams()
      .set('query', searchQuery)
      .set('per_page', '1')
      .set('orientation', 'landscape');

    return this.http.get<UnsplashSearchResponse>(this.UNSPLASH_API_URL, { headers, params }).pipe(
      map(response => {
        if (response.results.length > 0) {
          // Return regular size image URL
          return response.results[0].urls.regular;
        }
        // Fallback to placeholder if no results
        return this.getRandomPlaceholder();
      }),
      catchError(error => {
        console.error('Error fetching image from Unsplash:', error);
        return of(this.getRandomPlaceholder());
      })
    );
  }

  /**
   * Get local image for a plant if available
   */
  private getLocalImage(plantName: string): string | null {
    const normalizedName = plantName.toLowerCase().trim();
    return this.LOCAL_IMAGES[normalizedName] || null;
  }

  /**
   * Get a random placeholder image
   */
  private getRandomPlaceholder(): string {
    const index = Math.floor(Math.random() * this.PLACEHOLDER_IMAGES.length);
    return this.PLACEHOLDER_IMAGES[index];
  }

  /**
   * Download and cache image (for offline use)
   */
  cacheImage(imageUrl: string): Observable<Blob> {
    return this.http.get(imageUrl, { responseType: 'blob' });
  }

  /**
   * Generate a gradient placeholder based on plant name
   */
  generateGradientPlaceholder(plantName: string): string {
    // Simple hash function to generate consistent colors
    const hash = plantName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 60) % 360;

    return `linear-gradient(135deg, hsl(${hue1}, 60%, 50%), hsl(${hue2}, 60%, 70%))`;
  }

  /**
   * Validate image URL
   */
  isValidImageUrl(url: string): boolean {
    try {
      new URL(url);
      return url.match(/\.(jpg|jpeg|png|webp|gif)$/i) !== null;
    } catch {
      return false;
    }
  }
}
