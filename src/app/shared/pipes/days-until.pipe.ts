import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'daysUntil',
  standalone: true
})
export class DaysUntilPipe implements PipeTransform {
  transform(targetDate: Date | string | null): string {
    if (!targetDate) {
      return 'Nincs megadva';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const absDays = Math.abs(diffDays);
      return `${absDays} napja lejárt`;
    } else if (diffDays === 0) {
      return 'Ma esedékes';
    } else if (diffDays === 1) {
      return 'Holnap';
    } else if (diffDays <= 7) {
      return `${diffDays} nap múlva`;
    } else if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} hét múlva`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} hónap múlva`;
    }
  }
}
