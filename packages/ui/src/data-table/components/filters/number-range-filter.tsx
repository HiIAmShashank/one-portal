/**
 * NumberRangeFilter - Filter component for numeric ranges
 * @module data-table/components/filters/number-range-filter
 */

import { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface NumberRangeValue {
  min?: number;
  max?: number;
}

export interface NumberRangeFilterProps {
  value?: NumberRangeValue;
  onChange: (value: NumberRangeValue | undefined) => void;
  onClear?: () => void;
  min?: number;
  max?: number;
  inline?: boolean;
  className?: string;
}

/**
 * NumberRangeFilter - Dual input for min/max numeric filtering
 */
export function NumberRangeFilter({
  value,
  onChange,
  onClear,
  inline = false,
  className,
}: NumberRangeFilterProps) {
  const [minValue, setMinValue] = useState<string>(value?.min?.toString() || '');
  const [maxValue, setMaxValue] = useState<string>(value?.max?.toString() || '');

  // Sync with external value changes
  useEffect(() => {
    setMinValue(value?.min?.toString() || '');
    setMaxValue(value?.max?.toString() || '');
  }, [value]);

  const handleMinChange = (newMin: string) => {
    setMinValue(newMin);

    const minNum = newMin === '' ? undefined : parseFloat(newMin);
    const maxNum = maxValue === '' ? undefined : parseFloat(maxValue);

    // Only update if valid number or empty
    if (newMin === '' || !isNaN(minNum!)) {
      onChange(
        minNum === undefined && maxNum === undefined
          ? undefined
          : { min: minNum, max: maxNum }
      );
    }
  };

  const handleMaxChange = (newMax: string) => {
    setMaxValue(newMax);

    const minNum = minValue === '' ? undefined : parseFloat(minValue);
    const maxNum = newMax === '' ? undefined : parseFloat(newMax);

    // Only update if valid number or empty
    if (newMax === '' || !isNaN(maxNum!)) {
      onChange(
        minNum === undefined && maxNum === undefined
          ? undefined
          : { min: minNum, max: maxNum }
      );
    }
  };

  const handleClear = () => {
    setMinValue('');
    setMaxValue('');
    onChange(undefined);
    onClear?.();
  };

  const hasValue = minValue !== '' || maxValue !== '';
  const inputHeight = inline ? '' : 'h-9';
  const inputSize = inline ? 'text-xs' : 'text-sm';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-1 flex-1">
        <Input
          type="text"
          inputMode="decimal"
          value={minValue}
          onChange={(e) => handleMinChange(e.target.value)}
          placeholder="Min"
          className={cn(inputHeight, inputSize, inline && 'border-input/50 placeholder:text-muted-foreground placeholder:font-light')}
        />
        <span className="text-muted-foreground text-xs">-</span>
        <Input
          type="text"
          inputMode="decimal"
          value={maxValue}
          onChange={(e) => handleMaxChange(e.target.value)}
          placeholder="Max"
          className={cn(inputHeight, inputSize, inline && 'border-input/50 placeholder:text-muted-foreground placeholder:font-light')}
        />
      </div>
      {hasValue && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(inputHeight, 'w-7 p-0')}
          onClick={handleClear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

NumberRangeFilter.displayName = 'NumberRangeFilter';

/**
 * Custom filter function for TanStack Table number range filtering
 */
export function numberRangeFilterFn(
  row: any,
  columnId: string,
  filterValue: NumberRangeValue
): boolean {
  const value = row.getValue(columnId);

  if (typeof value !== 'number') {
    return false;
  }

  const { min, max } = filterValue;

  if (min !== undefined && value < min) {
    return false;
  }

  if (max !== undefined && value > max) {
    return false;
  }

  return true;
}
