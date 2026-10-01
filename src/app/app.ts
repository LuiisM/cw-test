import { Component, DOCUMENT, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import {
  SingleSelect,
  type SingleSelectOption,
  StatusBadge,
  type StatusBadgeStatus,
} from '../lib/public-api';
import {
  CHANGE_GROUPS,
  ENGAGEMENTS,
  REVIEWERS,
  type EngagementStatus,
} from './data/engagement-fixtures';

/**
 * The workbench: a consumer of the kit in `src/lib`.
 *
 * It exists so components can be built, demonstrated and reviewed in a running
 * application. Change it freely — it is a consumer, not part of the kit.
 */
@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, SingleSelect, StatusBadge],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly document = inject(DOCUMENT);
  protected readonly darkTheme = signal(this.document.documentElement.dataset['theme'] === 'dark');
  protected readonly engagements = ENGAGEMENTS;
  protected readonly reviewers = REVIEWERS;
  protected readonly changeGroups = CHANGE_GROUPS;
  protected readonly badgeStatus: Record<EngagementStatus, StatusBadgeStatus> = {
    READY: 'ready',
    PROCESSING: 'processing',
    ERROR: 'error',
  };
  protected readonly reviewerOptions: readonly SingleSelectOption[] = REVIEWERS.map((reviewer) => ({
    value: reviewer.id,
    label: reviewer.name,
    disabled: reviewer.unavailable ?? false,
  }));

  /** The form owns the selected reviewer and its interaction state. */
  protected readonly reviewerId = new FormControl<string | null>(null);

  protected toggleReviewerDisabled(): void {
    if (this.reviewerId.disabled) this.reviewerId.enable();
    else this.reviewerId.disable();
  }

  protected toggleTheme(): void {
    this.darkTheme.update((dark) => !dark);
    this.document.documentElement.dataset['theme'] = this.darkTheme() ? 'dark' : 'light';
  }
}
