import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { FilterWrapper } from './filter-wrapper';

interface BooleanFilterProps {
  label: string;
  value: boolean | undefined;
  onChange: (value: boolean | undefined) => void;
  trueLabel?: string;
  falseLabel?: string;
  allLabel?: string;
}

/**
 * Boolean filter component with Yes/No/All toggle.
 * Used for filtering boolean columns.
 */
export function BooleanFilter({
  label,
  value,
  onChange,
  trueLabel = 'Yes',
  falseLabel = 'No',
  allLabel = 'All',
}: BooleanFilterProps) {
  const handleClear = () => {
    onChange(undefined);
  };

  const stringValue = value === undefined ? 'all' : value ? 'true' : 'false';

  const handleValueChange = (newValue: string) => {
    if (newValue === 'all') {
      onChange(undefined);
    } else if (newValue === 'true') {
      onChange(true);
    } else {
      onChange(false);
    }
  };

  return (
    <FilterWrapper
      label={label}
      value={value}
      onClear={handleClear}
    >
      <Select value={stringValue} onValueChange={handleValueChange}>
        <SelectTrigger className="h-9 shadow-sm">
          <SelectValue placeholder={allLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allLabel}</SelectItem>
          <SelectItem value="true">{trueLabel}</SelectItem>
          <SelectItem value="false">{falseLabel}</SelectItem>
        </SelectContent>
      </Select>
    </FilterWrapper>
  );
}
