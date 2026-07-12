import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-chip',
  templateUrl: './status-chip.component.html',
  styleUrls: ['./status-chip.component.css']
})
export class StatusChipComponent {
  @Input() tone: 'success' | 'danger' | 'warning' | 'info' | 'neutral' = 'neutral';
}
