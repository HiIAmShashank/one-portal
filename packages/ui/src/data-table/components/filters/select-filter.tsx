import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Search } from 'lucide-react';
import { FilterWrapper } from './filter-wrapper';

export interface FilterOption {
  label: string;
  value: string | number | boolean | null;
  disabled?: boolean;
}

interface SelectFilterProps {
  label: string;
  value: string | number | boolean | null | undefined;
  onChange: (value: string | number | boolean | null | undefined) => void;
  options: FilterOption[];
  placeholder?: string;
  enableSearch?: boolean; // New prop for search functionality
}

/**
 * Select filter component with dropdown.
 * Used for filtering columns with known value sets.
 * Supports null/blank values and optional search functionality.
 */
export function SelectFilter({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  enableSearch = false,
}: SelectFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleClear = () => {
    onChange(undefined);
  };

  // Filter options based on search query
  const filteredOptions = enableSearch
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Convert value to string for Select component
  // When undefined, we show placeholder (no value selected)
  // We can't use empty string with Radix UI, so we use 'all' as a sentinel
  // But we need to add 'all' as a SelectItem option
  const stringValue = value === null ? 'null' : value === undefined ? 'all' : String(value);

  const handleValueChange = (newValue: string) => {
    if (newValue === 'all') {
      onChange(undefined);
      return;
    }
    
    // Find the original option to get the correct type
    const option = options.find(opt => {
      const optValue = opt.value === null ? 'null' : String(opt.value);
      return optValue === newValue;
    });
    
    if (option) {
      onChange(option.value);
    }
  };

  return (
    <FilterWrapper
      label={label}
      value={value}
      onClear={handleClear}
    >
      <Select value={stringValue} onValueChange={handleValueChange}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {enableSearch && (
            <div className="flex items-center px-2 pb-2 border-b">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-7 text-xs border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          )}
          {/* Add "All" option to handle undefined value (Radix UI requirement) */}
          <SelectItem value="all">All</SelectItem>
          {filteredOptions.length > 0 ? (
            filteredOptions
              .filter((option) => {
                // Filter out empty strings (Radix UI requirement)
                const optValue = option.value === null ? 'null' : String(option.value);
                return optValue !== '';
              })
              .map((option, index) => {
                const optValue = option.value === null ? 'null' : String(option.value);
                return (
                  <SelectItem
                    key={`${optValue}-${index}`}
                    value={optValue}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                );
              })
          ) : (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              No options found
            </div>
          )}
        </SelectContent>
      </Select>
    </FilterWrapper>
  );
}
