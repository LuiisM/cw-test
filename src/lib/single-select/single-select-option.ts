/** A domain-independent option. Values must be unique within a non-empty array. */
export interface SingleSelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled: boolean;
}
