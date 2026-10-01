import { TestBed } from '@angular/core/testing';

import { StatusBadge, type StatusBadgeSize, type StatusBadgeStatus } from '../public-api';

describe('StatusBadge', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [StatusBadge] });
  });

  it('renders only the current status and size when inputs change', () => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.badge') as HTMLElement;
    expect(new Set(badge.classList)).toEqual(new Set(['badge', 'badge-neutral', 'badge-md']));

    const changes: [StatusBadgeStatus, StatusBadgeSize][] = [
      ['ready', 'sm'],
      ['error', 'lg'],
      ['processing', 'md'],
      ['neutral', 'md'],
    ];
    for (const [status, size] of changes) {
      fixture.componentRef.setInput('status', status);
      fixture.componentRef.setInput('size', size);
      fixture.detectChanges();
      expect(new Set(badge.classList)).toEqual(
        new Set(['badge', `badge-${status}`, `badge-${size}`]),
      );
    }
  });

  it('exposes its status label and hides only the decorative dot', () => {
    const fixture = TestBed.createComponent(StatusBadge);
    fixture.componentRef.setInput('label', 'Processing');
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const label = host.querySelector('.text')!;
    expect(label.textContent).toBe('Processing');
    expect(label.closest('[aria-hidden="true"]')).toBeNull();
    expect(host.querySelector('.dot')?.getAttribute('aria-hidden')).toBe('true');
  });
});
