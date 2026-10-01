import { TestBed } from '@angular/core/testing';

import { App } from './app';
import { REVIEWERS } from './data/engagement-fixtures';

/** Smoke test for the supplied workbench shell. */
describe('App', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => document.documentElement.removeAttribute('data-theme'));

  it('renders the workbench', async () => {
    TestBed.configureTestingModule({ imports: [App] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('h1')?.textContent).toContain('Engagement UI kit');
  });

  it('adapts reviewer options, shows form state, and demonstrates reset and disabled state', async () => {
    TestBed.configureTestingModule({ imports: [App] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector<HTMLButtonElement>('[role="combobox"]')!;
    const state = () =>
      Array.from(host.querySelectorAll('.wb-state dd'), (node) => node.textContent?.trim());
    const action = (text: string) =>
      Array.from(host.querySelectorAll<HTMLButtonElement>('.wb-actions button')).find(
        (button) => button.textContent?.trim() === text,
      )!;
    expect(trigger.textContent).toContain('Select a reviewer');
    expect(state()).toEqual(['—', 'false', 'false']);
    trigger.click();
    await fixture.whenStable();
    const options = host.querySelectorAll<HTMLElement>('[role="option"]');
    expect(options.length).toBe(REVIEWERS.length);
    REVIEWERS.forEach((reviewer, index) => {
      expect(options[index].textContent).toContain(reviewer.name);
      expect(options[index].getAttribute('aria-disabled')).toBe(
        String(reviewer.unavailable ?? false),
      );
    });
    const availableIndex = REVIEWERS.findIndex((reviewer) => !reviewer.unavailable);
    expect(availableIndex).toBeGreaterThanOrEqual(0);
    options[availableIndex].click();
    await fixture.whenStable();
    expect(trigger.textContent).toContain(REVIEWERS[availableIndex].name);
    expect(state()).toEqual([REVIEWERS[availableIndex].id, 'false', 'true']);
    trigger.blur();
    await fixture.whenStable();
    expect(state()).toEqual([REVIEWERS[availableIndex].id, 'true', 'true']);
    action('Reset reviewer').click();
    await fixture.whenStable();
    expect(state()).toEqual(['—', 'false', 'false']);
    expect(trigger.textContent).toContain('Select a reviewer');
    action('Disable reviewer picker').click();
    await fixture.whenStable();
    expect(trigger.disabled).toBe(true);
    trigger.click();
    await fixture.whenStable();
    expect(host.querySelector('[role="listbox"]')).toBeNull();
    expect(state()).toEqual(['—', 'false', 'false']);
    action('Enable reviewer picker').click();
    await fixture.whenStable();
    expect(trigger.disabled).toBe(false);
  });

  it('switches themes both ways without resetting the reviewer form', async () => {
    TestBed.configureTestingModule({ imports: [App] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const toggle = host.querySelector<HTMLButtonElement>('.wb-theme-toggle')!;
    const trigger = host.querySelector<HTMLButtonElement>('[role="combobox"]')!;
    const state = () =>
      Array.from(host.querySelectorAll('.wb-state dd'), (node) => node.textContent?.trim());

    expect(toggle.textContent).toContain('Switch to dark theme');
    expect(document.documentElement.dataset['theme']).toBeUndefined();
    trigger.click();
    await fixture.whenStable();
    host.querySelector<HTMLElement>('[role="option"][aria-disabled="false"]')!.click();
    trigger.blur();
    await fixture.whenStable();
    const selectedState = state();
    expect(selectedState.slice(1)).toEqual(['true', 'true']);

    toggle.click();
    await fixture.whenStable();
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(toggle.textContent).toContain('Switch to light theme');
    expect(state()).toEqual(selectedState);

    toggle.click();
    await fixture.whenStable();
    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(toggle.textContent).toContain('Switch to dark theme');
    expect(state()).toEqual(selectedState);
  });
});
