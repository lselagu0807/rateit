import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() interactive: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() ratingChange = new EventEmitter<number>();

  hovered: number = 0;
  stars = [1, 2, 3, 4, 5];

  getColor(rating: number): string {
    if (rating >= 4) return 'green';
    if (rating >= 3) return 'yellow';
    return 'red';
  }

  isFilled(star: number): boolean {
    const ref = this.interactive && this.hovered ? this.hovered : this.rating;
    return star <= ref;
  }

  select(star: number) {
    if (!this.interactive) return;
    this.ratingChange.emit(star);
  }
}
