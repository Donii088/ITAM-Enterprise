import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './Input';
import { debounce } from '@/lib/utils';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className, debounceMs = 350 }: SearchInputProps) {
  const [localValue, setLocalValue] = React.useState(value);
  const debouncedOnChange = React.useMemo(() => debounce(onChange, debounceMs), [onChange, debounceMs]);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <Input
      type="search"
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value);
        debouncedOnChange(e.target.value);
      }}
      placeholder={placeholder}
      leftIcon={<Search className="h-4 w-4" />}
      rightElement={
        localValue ? (
          <button
            type="button"
            onClick={() => {
              setLocalValue('');
              onChange('');
            }}
            className="focus-ring rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : undefined
      }
      className={className}
      aria-label="Search"
    />
  );
}
