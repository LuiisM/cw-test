import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { vi } from 'vitest';

import { SingleSelect, type SingleSelectOption } from '../public-api';

const OPTIONS: readonly SingleSelectOption[] = [
  { value: 'apple', label: 'Apple', disabled: false },
  { value: 'apricot', label: 'Apricot', disabled: true },
  { value: 'banana', label: 'Banana', disabled: false },
];

@Component({
  imports: [ReactiveFormsModule, SingleSelect],
  template: `
    <cw-single-select label="Fruit" [options]="options" [formControl]="control" />
    <button type="button">Next control</button>
  `,
})
class FormHost {
  options = OPTIONS;
  control = new FormControl<string | null>(null);
}

describe('SingleSelect: user-facing risks', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [FormHost] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function create(updateOn: 'change' | 'blur' = 'change') {
    const fixture = TestBed.createComponent(FormHost);
    const control = new FormControl<string | null>(null, { updateOn });
    fixture.componentInstance.control = control;
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector<HTMLButtonElement>('[role="combobox"]')!;
    const next = host.querySelector<HTMLButtonElement>('button:not([role])')!;
    const key = (key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      trigger.dispatchEvent(event);
      fixture.detectChanges();
      return event;
    };
    const replaceOptions = (options: readonly SingleSelectOption[]) => {
      fixture.componentInstance.options = options;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
    };
    return { fixture, host, trigger, next, control, key, replaceOptions };
  }

  it('labels the control, keeps navigation provisional, cancels with Escape and confirms with Enter', () => {
    const { fixture, host, trigger, control, key } = create();
    control.setValue('apple');
    fixture.detectChanges();
    const label = host.querySelector('label')!;
    expect(label.textContent).toBe('Fruit');
    expect(trigger.getAttribute('aria-labelledby')).toBe(label.id);
    trigger.focus();
    key('ArrowDown');
    key('ArrowDown');
    const list = host.querySelector('[role="listbox"]')!;
    expect(trigger.getAttribute('aria-controls')).toBe(list.id);
    // Chromium can otherwise include scroll containers in sequential Tab navigation.
    expect(list.getAttribute('tabindex')).toBe('-1');
    expect(host.querySelector('.is-active')?.textContent).toContain('Apricot');
    expect(trigger.getAttribute('aria-activedescendant')).toBe(
      host.querySelector('.is-active')!.id,
    );
    expect(host.querySelector('[aria-selected="true"]')?.textContent).toContain('Apple');
    expect(control.value).toBe('apple');
    expect(control.pristine && control.untouched).toBe(true);
    key('Escape');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false);
    expect(control.value).toBe('apple');
    expect(document.activeElement).toBe(trigger);
    key(' ');
    key('End');
    key('Enter');
    expect(control.value).toBe('banana');
    expect(control.dirty && control.untouched).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('makes disabled options discoverable but blocks every confirmation path, including Tab', () => {
    const { host, trigger, next, control, key } = create();
    trigger.focus();
    key('Enter');
    key('ArrowDown');
    const option = host.querySelector<HTMLElement>('.is-active')!;
    expect(option.getAttribute('aria-disabled')).toBe('true');
    expect(option.textContent).toContain('Unavailable');
    for (const confirmation of ['Enter', ' ']) {
      key(confirmation);
      expect(control.value).toBeNull();
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    }
    const press = new Event('pointerdown', { bubbles: true, cancelable: true });
    option.dispatchEvent(press);
    expect(press.defaultPrevented).toBe(true);
    option.click();
    expect(control.value).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(key('Tab').defaultPrevented).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(control.pristine).toBe(true);
    next.focus();
    expect(control.touched).toBe(true);
    expect(document.activeElement).toBe(next);
  });

  it.each(['change', 'blur'] as const)(
    'preserves the forms contract with updateOn: %s',
    (updateOn) => {
      const { fixture, host, trigger, next, control, key } = create(updateOn);
      control.setValue('apple');
      fixture.detectChanges();
      expect(trigger.textContent).toContain('Apple');
      expect(control.pristine && control.untouched).toBe(true);
      trigger.click();
      key('End');
      const option = host.querySelector<HTMLElement>('.is-active')!;
      const press = new Event('pointerdown', { bubbles: true, cancelable: true });
      option.dispatchEvent(press);
      expect(press.defaultPrevented).toBe(true);
      option.click();
      fixture.detectChanges();
      expect(control.value).toBe(updateOn === 'blur' ? 'apple' : 'banana');
      expect(trigger.textContent).toContain('Banana');
      expect(control.untouched).toBe(true);
      expect(document.activeElement).toBe(trigger);
      next.focus();
      expect(control.value).toBe('banana');
      expect(control.dirty && control.touched).toBe(true);
      control.reset();
      fixture.detectChanges();
      expect(control.value).toBeNull();
      expect(control.pristine && control.untouched).toBe(true);
      expect(trigger.textContent).toContain('Select an option');
      trigger.click();
      fixture.detectChanges();
      control.disable();
      fixture.detectChanges();
      trigger.click();
      key('Enter');
      expect(trigger.disabled).toBe(true);
      expect(trigger.getAttribute('aria-disabled')).toBe('true');
      expect(host.querySelector('[role="listbox"]')).toBeNull();
      expect(trigger.hasAttribute('aria-activedescendant')).toBe(false);
      expect(control.value).toBeNull();
    },
  );

  it('commits before Tab blur without preventing normal focus traversal', () => {
    const { trigger, next, control, key } = create('blur');
    trigger.focus();
    key('Enter');
    key('End');
    expect(key('Tab').defaultPrevented).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(control.value).toBeNull();
    next.focus();
    expect(control.value).toBe('banana');
    expect(control.dirty && control.touched).toBe(true);
    expect(document.activeElement).toBe(next);
  });

  it('reconciles options by value and closes safely when the active option disappears', () => {
    const { fixture, host, trigger, control, key, replaceOptions } = create();
    control.setValue('apple');
    fixture.detectChanges();
    trigger.focus();
    key('Enter');
    key('End');
    const activeId = trigger.getAttribute('aria-activedescendant');
    replaceOptions(
      [...OPTIONS].reverse().map((option) => ({ ...option, label: `${option.label} updated` })),
    );
    expect(trigger.getAttribute('aria-activedescendant')).toBe(activeId);
    expect(trigger.textContent).toContain('Apple updated');
    replaceOptions(OPTIONS.filter((option) => option.value !== 'banana'));
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.hasAttribute('aria-activedescendant')).toBe(false);
    expect(host.querySelector('[role="listbox"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    replaceOptions(OPTIONS.filter((option) => option.value !== 'apple'));
    expect(control.value).toBe('apple');
    expect(control.errors).toEqual({ optionNotFound: true });
    expect(trigger.textContent).toContain('Selection unavailable');
    replaceOptions(OPTIONS);
    expect(control.value).toBe('apple');
    expect(control.errors).toBeNull();
    expect(control.pristine && control.untouched).toBe(true);
  });

  it('retains unknown values until confirmation and composes membership with required validation', () => {
    const { fixture, host, trigger, control, key } = create();
    control.addValidators(Validators.required);
    control.setValue('unknown');
    fixture.detectChanges();
    expect(control.value).toBe('unknown');
    expect(control.errors).toEqual({ optionNotFound: true });
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
    expect(trigger.getAttribute('aria-describedby')).toBe(host.querySelector('p')!.id);
    expect(control.pristine && control.untouched).toBe(true);
    trigger.focus();
    key('Enter');
    key('End');
    key('Enter');
    expect(control.value).toBe('banana');
    expect(control.errors).toBeNull();
    control.setValue('apricot');
    fixture.detectChanges();
    expect(control.errors).toBeNull();
    expect(trigger.textContent).toContain('Unavailable');
    control.reset();
    expect(control.errors).toEqual({ required: true });
  });

  it('cycles initials, extends prefixes and starts fresh after timeout or cancellation', () => {
    const { fixture, host, trigger, control, key } = create();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    trigger.focus();
    key('a');
    expect(host.querySelector('.is-active')?.textContent).toContain('Apricot');
    key('A');
    expect(host.querySelector('.is-active')?.textContent).toContain('Apple');
    key('a');
    expect(host.querySelector('.is-active')?.textContent).toContain('Apricot');
    vi.advanceTimersByTime(600);
    key('p');
    vi.advanceTimersByTime(699);
    key('p');
    expect(host.querySelector('.is-active')?.textContent).toContain('Apple');
    vi.advanceTimersByTime(700);
    expect(control.value).toBeNull();
    key('B');
    key('a');
    expect(host.querySelector('.is-active')?.textContent).toContain('Banana');
    key('Escape');
    key('a');
    expect(host.querySelector('.is-active')?.textContent).toContain('Apricot');
    expect(host.querySelectorAll('[role="option"]')).toHaveLength(OPTIONS.length);
    expect(control.pristine && control.untouched).toBe(true);
    expect(document.activeElement).toBe(trigger);
    fixture.destroy();
  });

  it('reveals an active descendant after rendering a several-hundred-option list', () => {
    const { fixture, host, trigger, control, key, replaceOptions } = create();
    replaceOptions(
      Array.from({ length: 400 }, (_, index) => ({
        value: `item-${index}`,
        label: index === 350 ? 'Zebra destination' : `Item ${index}`,
        disabled: index === 350,
      })),
    );
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');
    const scroll = vi.fn(function (this: HTMLElement) {
      expect(this.isConnected).toBe(true);
      expect(this.id).toBe(trigger.getAttribute('aria-activedescendant'));
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scroll,
    });
    try {
      trigger.focus();
      key('Enter');
      const firstNode = host.querySelector('[role="option"]');
      key('End');
      expect(host.querySelector('.is-active')?.textContent).toContain('Item 399');
      key('z');
      expect(host.querySelector('.is-active')?.textContent).toContain('Zebra destination');
      expect(scroll).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
      expect(scroll.mock.contexts.at(-1)).toBe(host.querySelector('.is-active'));
      expect(host.querySelector('[role="option"]')).toBe(firstNode);
      expect(host.querySelectorAll('[role="option"]')).toHaveLength(400);
      expect(control.value).toBeNull();
      expect(document.activeElement).toBe(trigger);
    } finally {
      if (original) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', original);
      else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
      fixture.destroy();
    }
  });

  it('keeps label, popup and option IDs distinct between instances', () => {
    const ids: string[] = [];
    for (const { fixture, host, trigger } of [create(), create()]) {
      trigger.click();
      fixture.detectChanges();
      ids.push(...Array.from(host.querySelectorAll('[id]'), (node) => node.id));
    }
    expect(new Set(ids).size).toBe(ids.length);
  });
});
