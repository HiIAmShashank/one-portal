import { X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

interface FilterWrapperProps {
  label: string;
  value: string | number | boolean | null | undefined | [number | null, number | null] | string[];
  onClear: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component for column filters.
 * Provides consistent layout with label, filter control, and clear button.
 */
export function FilterWrapper({
  label,
  value,
  onClear,
  children,
  className,
}: FilterWrapperProps) {
  const hasValue = () => {
    if (Array.isArray(value)) {
      if (value.length === 2) {
        // Number range: [min, max]
        return value[0] !== null || value[1] !== null;
      }
      // Multi-select: string[]
      return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
  };

  const isActive = hasValue();

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between gap-2 font-bold">
        <label className={cn(
          'text-sm font-medium',
          isActive && 'text-primary'
        )}>
          {label}
        </label>
        {isActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 px-2"
            aria-label={`Clear ${label} filter`}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
