import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-table-shell',
  templateUrl: './table-shell.component.html',
  styleUrls: ['./table-shell.component.css']
})
export class TableShellComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() count: number | null = null;
}
