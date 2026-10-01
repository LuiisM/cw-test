import { Component, Input } from '@angular/core';

export type StatusBadgeStatus = 'neutral' | 'ready' | 'processing' | 'error';
export type StatusBadgeSize = 'sm' | 'md' | 'lg';

/**
 * Shows the processing state of an engagement.
 *
 * Usage:
 * ```html
 * <cw-status-badge label="Ready" status="ready" size="sm"></cw-status-badge>
 * ```
 */
@Component({
  selector: 'cw-status-badge',
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  @Input() label = '';
  @Input() status: StatusBadgeStatus = 'neutral';
  @Input() size: StatusBadgeSize = 'md';
  @Input() tooltip = '';

  get cssClass(): string {
    return `badge badge-${this.status} badge-${this.size}`;
  }
}
