import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-record-card',
  templateUrl: './record-card.component.html',
  styleUrls: ['./record-card.component.css']
})
export class RecordCardComponent {
  @Input() title = '';
  @Input() eyebrow = '';
  @Input() value = '';
  @Input() icon = 'description';
  @Input() tone: 'primary' | 'success' | 'danger' | 'warning' | 'neutral' = 'primary';
}
