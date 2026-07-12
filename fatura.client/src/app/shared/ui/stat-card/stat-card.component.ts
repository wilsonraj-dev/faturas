import { Component, Input } from '@angular/core';

export type StatCardTone = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.css']
})
export class StatCardComponent {
  @Input() label = '';
  @Input() icon = '';
  @Input() helper = '';
  @Input() tone: StatCardTone = 'primary';
}
