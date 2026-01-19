import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterState } from '@/types/dashboard';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  states: string[];
  districts: string[];
}

// Special value for "All" since Radix UI doesn't allow empty string values
const ALL_VALUE = '__all__';

export function FilterBar({ filters, onFilterChange, states, districts }: FilterBarProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    // Convert special ALL_VALUE back to empty string
    const actualValue = value === ALL_VALUE ? '' : value;
    const newFilters = { ...filters, [key]: actualValue };
    // Reset district when state changes
    if (key === 'state') {
      newFilters.district = '';
    }
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({
      state: '',
      district: '',
      priority: '',
      search: '',
    });
  };

  const hasActiveFilters = filters.state || filters.district || filters.priority || filters.search;

  // Convert empty string to ALL_VALUE for Select value prop
  const getSelectValue = (value: string) => value || ALL_VALUE;

  return (
    <div className="bg-card rounded-lg border p-4 mb-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by pincode, district, or task..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* State Filter */}
        <Select value={getSelectValue(filters.state)} onValueChange={(value) => updateFilter('state', value)}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All States</SelectItem>
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* District Filter */}
        <Select
          value={getSelectValue(filters.district)}
          onValueChange={(value) => updateFilter('district', value)}
          disabled={!filters.state}
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All Districts</SelectItem>
            {districts.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select value={getSelectValue(filters.priority)} onValueChange={(value) => updateFilter('priority', value)}>
          <SelectTrigger className="w-full lg:w-[150px]">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All Priorities</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="flex-shrink-0">
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
