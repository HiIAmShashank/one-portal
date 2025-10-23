import * as React from 'react';
import { Input } from '../../../components/ui/input';
import { FilterWrapper } from './filter-wrapper';

interface TextFilterProps {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  debounce?: number;
}

/**
 * Text filter component with debounced input.
 * Used for filtering string columns.
 */
export function TextFilter({
  label,
  value,
  onChange,
  placeholder = 'Filter...',
  debounce = 0,
}: TextFilterProps) {
  const [localValue, setLocalValue] = React.useState(value ?? '');

  // Debounce the onChange callback
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue || undefined);
    }, debounce);

    return () => clearTimeout(timer);
  }, [localValue, debounce, onChange]);

  // Update local value when external value changes
  React.useEffect(() => {
    setLocalValue(value ?? '');
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChange(undefined);
  };

  return (
    <FilterWrapper
      label={label}
      value={value}
      onClear={handleClear}
    >
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="h-9"
      />
    </FilterWrapper>
  );
}
