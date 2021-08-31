export function belongs<T>(item: T, array: unknown[], key: keyof T): boolean {
  return !!array.find((i) => i[key] === item[key]);
}
export function difference<T>(arrayOne: T[], arrayTwo: unknown[], key: keyof T): T[] {
  return arrayOne.filter((i) => !belongs(i, arrayTwo, key));
}

export interface ListSelection<T> {
  selectedItems: T[];

  totalItems: T[];

  mouseDown(item: T, event?: MouseEvent): void;

  mouseUp(item: T, event?: MouseEvent): void;

  selectAll(): void;

  unselect(item: T): void;

  isSelected(item: T): boolean;
}

export class ListSelectionImpl<T> implements ListSelection<T> {
  private _selectedItems: T[] = [];

  constructor(readonly totalItems: T[]) {}

  mouseDown(item: T, event?: MouseEvent): void {
    if (!event.ctrlKey) {
      if (!this.isSelected(item)) {
        this._selectedItems.length = 0;
        this._selectedItems.push(item);
      }
    } else if (!this.isSelected(item)) {
      this._selectedItems.push(item);
    } else {
      this.unselect(item);
    }
  }

  mouseUp(item: T, event?: MouseEvent): void {
    if (!event.ctrlKey) {
      if (this._selectedItems.length > 1 && this.isSelected(item)) {
        this._selectedItems.length = 0;
        this._selectedItems.push(item);
      }
    }
  }

  selectAll(): void {
    this._selectedItems = this.totalItems;
  }

  unselect(item: T): void {
    if (!this.isSelected(item)) {
      throw new Error('Cannot unselect an item that is not selected');
    }

    this._selectedItems = this._selectedItems.filter((e) => e !== item);
  }

  isSelected(item: T): boolean {
    return !!this._selectedItems.find((e) => e === item);
  }

  get selectedItems(): T[] {
    return this._selectedItems;
  }
}
