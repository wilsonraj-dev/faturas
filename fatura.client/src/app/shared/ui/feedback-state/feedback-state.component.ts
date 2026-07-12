import { Component, Input } from '@angular/core';

export type FeedbackStateKind = 'loading' | 'empty' | 'error';

@Component({
  selector: 'app-feedback-state',
  templateUrl: './feedback-state.component.html',
  styleUrls: ['./feedback-state.component.css']
})
export class FeedbackStateComponent {
  @Input() kind: FeedbackStateKind = 'empty';
  @Input() title = '';
  @Input() message = '';
  @Input() icon = '';

  get resolvedIcon(): string {
    if (this.icon) return this.icon;
    return this.kind === 'error' ? 'error_outline' : 'inbox';
  }
}
