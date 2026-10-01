import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  type ElementRef,
  forwardRef,
  input,
  signal,
  viewChildren,
  type OnChanges,
  type OnDestroy,
  type SimpleChanges,
} from '@angular/core';
import {
  type AbstractControl,
  type ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  type ValidationErrors,
  type Validator,
} from '@angular/forms';

import type { SingleSelectOption } from './single-select-option';

const TYPEAHEAD_TIMEOUT_MS = 700;

function checkOptions(options: readonly SingleSelectOption[]): readonly SingleSelectOption[] {
  if (options.length === 0) {
    throw new Error('cw-single-select: at least one option is required.');
  }
  const values = new Set<string>();
  for (const option of options) {
    if (values.has(option.value)) {
      throw new Error(`cw-single-select: duplicate option value "${option.value}".`);
    }
    values.add(option.value);
  }
  return options;
}

@Component({
  selector: 'cw-single-select',
  imports: [],
  templateUrl: './single-select.html',
  styleUrl: './single-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SingleSelect), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => SingleSelect), multi: true },
  ],
})
export class SingleSelect implements ControlValueAccessor, Validator, OnChanges, OnDestroy {
  private static nextId = 0;
  readonly options = input.required<readonly SingleSelectOption[], readonly SingleSelectOption[]>({
    transform: checkOptions,
  });
  readonly label = input.required<string>();
  readonly placeholder = input('Select an option');
  readonly unavailableText = input('Unavailable');
  readonly unmatchedValueText = input('Selection unavailable');

  protected readonly id = `cw-single-select-${SingleSelect.nextId++}`;
  protected readonly value = signal<string | null>(null);
  protected readonly expanded = signal(false);
  protected readonly activeValue = signal<string | null>(null);
  protected readonly disabled = signal(false);
  protected readonly selection = computed(() =>
    this.options().find((option) => option.value === this.value()),
  );
  protected readonly unmatched = computed(() => this.value() !== null && !this.selection());
  protected readonly displayText = computed(() =>
    this.value() === null
      ? this.placeholder()
      : (this.selection()?.label ?? this.unmatchedValueText()),
  );
  protected readonly activeId = computed(() => {
    const active = this.activeValue();
    return this.expanded() &&
      active !== null &&
      this.options().some((option) => option.value === active)
      ? this.optionId(active)
      : null;
  });
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};
  private prefix = '';
  private prefixTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly optionElements = viewChildren<ElementRef<HTMLElement>>('optionElement');

  constructor() {
    afterRenderEffect({
      mixedReadWrite: () => {
        const id = this.activeId();
        const option = this.optionElements().find((element) => element.nativeElement.id === id);
        option?.nativeElement.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
      },
    });
  }

  ngOnDestroy(): void {
    this.clearPrefix();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      const active = this.activeValue();
      if (active !== null && !this.options().some((option) => option.value === active)) {
        this.close();
      }
      this.onValidatorChange();
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return !control.disabled &&
      control.value !== null &&
      !this.options().some((option) => option.value === control.value)
      ? { optionNotFound: true }
      : null;
  }

  registerOnValidatorChange(callback: () => void): void {
    this.onValidatorChange = callback;
  }

  writeValue(value: string | null): void {
    this.value.set(value);
    this.close();
  }

  registerOnChange(callback: (value: string | null) => void): void {
    this.onChange = callback;
  }

  registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
    if (disabled) this.close();
  }

  protected onBlur(): void {
    this.close();
    this.onTouched();
  }

  protected confirm(option: SingleSelectOption): void {
    if (this.disabled() || option.disabled) return;
    if (this.value() !== option.value) {
      this.value.set(option.value);
      this.onChange(option.value);
    }
    this.close();
  }

  protected retainFocus(event: PointerEvent): void {
    // A pointer press must not blur the combobox before its click confirms.
    event.preventDefault();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || event.ctrlKey || event.metaKey || event.altKey || event.isComposing)
      return;
     console.log(event)
    switch (event.key) {
     
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        if (!this.expanded()) {
          this.open(direction);
        } else {
          const index = this.options().findIndex((option) => option.value === this.activeValue());
          this.activate(Math.max(0, Math.min(this.options().length - 1, index + direction)));
        }
        break;
      }
      case 'Home':
      case 'End':
        event.preventDefault();
        if (!this.expanded()) this.open();
        this.activate(event.key === 'Home' ? 0 : this.options().length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.expanded()) this.confirmActive();
        else this.open();
        break;
      case 'Escape':
        if (this.expanded()) {
          event.preventDefault();
          this.close();
        }
        break;
      case 'Tab':
        if (this.expanded()) {
          this.confirmActive();
          this.close();
        }
        // Allow the browser to traverse, then blur reports touched.
        break;
      default:
        if (event.key.length === 1) {
          event.preventDefault();
          if (!this.expanded()) this.open();
          this.typeahead(event.key);
        }
    }
  }

  private typeahead(character: string): void {
    const letter = character.toLowerCase();
    const cycling = this.prefix === letter;
    this.prefix = cycling ? letter : this.prefix + letter;
    if (this.prefixTimer !== undefined) clearTimeout(this.prefixTimer);
    this.prefixTimer = setTimeout(() => {
      this.prefix = '';
      this.prefixTimer = undefined;
    }, TYPEAHEAD_TIMEOUT_MS);

    const options = this.options();
    const current = options.findIndex((option) => option.value === this.activeValue());
    const start = current + (cycling || this.prefix.length === 1 ? 1 : 0);
    for (let offset = 0; offset < options.length; offset++) {
      const index = (start + offset + options.length) % options.length;
      if (options[index].label.toLowerCase().startsWith(this.prefix)) {
        this.activate(index);
        return;
      }
    }
  }

  private clearPrefix(): void {
    this.prefix = '';
    if (this.prefixTimer !== undefined) clearTimeout(this.prefixTimer);
    this.prefixTimer = undefined;
  }

  protected selectOption(option: SingleSelectOption): void {
    if (this.disabled()) return;
    this.activeValue.set(option.value);
    this.confirm(option);
  }

  private confirmActive(): void {
    const option = this.options().find((option) => option.value === this.activeValue());
    if (option) this.confirm(option);
  }

  private activate(index: number): void {
    this.activeValue.set(this.options()[index].value);
  }

  private open(direction = 1): void {
    this.activeValue.set(
      this.selection()?.value ??
        this.options()[direction === -1 ? this.options().length - 1 : 0].value,
    );
    this.expanded.set(true);
  }

  protected optionId(value: string): string {
    return `${this.id}-option-${encodeURIComponent(value)}`;
  }

  protected toggle(event: MouseEvent): void {
    if (this.disabled()) return;
    (event.currentTarget as HTMLElement).focus();
    if (this.expanded()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected close(): void {
    this.activeValue.set(null);
    this.expanded.set(false);
    this.clearPrefix();
  }
}
