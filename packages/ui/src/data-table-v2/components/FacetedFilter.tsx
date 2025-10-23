/**
 * FacetedFilter - Smart filter component that auto-adapts to data type
 *
 * Renders appropriate filter UI based on detected or configured filter variant
 */

import type { Column } from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { useFaceting } from "../hooks/useFaceting";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { Calendar } from "../../components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/ui/command";

interface FacetedFilterProps<TData> {
  column: Column<TData>;
  title?: string;
}

export function FacetedFilter<TData>({
  column,
  title,
}: FacetedFilterProps<TData>) {
  const metadata = useFaceting(column);
  const filterValue = column.getFilterValue();

  // Text filter
  if (metadata.variant === "text") {
    return (
      <Input
        type="text"
        value={(filterValue as string) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        placeholder={`Filter ${title || column.id}...`}
        className="h-8"
      />
    );
  }

  // Select filter (single)
  if (metadata.variant === "select" && metadata.options) {
    return (
      <Select
        value={(filterValue as string) ?? ""}
        onValueChange={(value) => column.setFilterValue(value || undefined)}
      >
        <SelectTrigger className="h-8 w-full">
          <SelectValue placeholder={`All ${title || column.id}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All {title || column.id}</SelectItem>
          {metadata.options.map((option) => (
            <SelectItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Multi-select filter with Command/Popover
  if (metadata.variant === "multi-select" && metadata.options) {
    const selected = (filterValue as string[]) || [];

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full justify-between"
          >
            <span className="truncate">
              {selected.length > 0
                ? `${selected.length} selected`
                : `All ${title || column.id}`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${title || column.id}...`} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {metadata.options.map((option) => {
                  const isSelected = selected.includes(String(option.value));
                  return (
                    <CommandItem
                      key={String(option.value)}
                      onSelect={() => {
                        if (isSelected) {
                          column.setFilterValue(
                            selected.filter((v) => v !== String(option.value)),
                          );
                        } else {
                          column.setFilterValue([
                            ...selected,
                            String(option.value),
                          ]);
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  // Number range filter
  if (metadata.variant === "number-range") {
    const [min, max] = (filterValue as [number, number]) || [
      metadata.min,
      metadata.max,
    ];

    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-foreground">
          {title || column.id}
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            value={min ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              column.setFilterValue((old: [number, number]) => [
                value,
                old?.[1],
              ]);
            }}
            placeholder="Min"
            className="h-8"
          />
          <Input
            type="number"
            value={max ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                value,
              ]);
            }}
            placeholder="Max"
            className="h-8"
          />
        </div>
      </div>
    );
  }

  // Boolean filter
  if (metadata.variant === "boolean") {
    return (
      <Select
        value={
          filterValue === true ? "true" : filterValue === false ? "false" : ""
        }
        onValueChange={(value) => {
          const newValue =
            value === "true" ? true : value === "false" ? false : undefined;
          column.setFilterValue(newValue);
        }}
      >
        <SelectTrigger className="h-8 w-full">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          <SelectItem value="true">Yes</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  // Date range filter
  if (metadata.variant === "date-range") {
    const [startDate, endDate] = (filterValue as [Date, Date]) || [
      undefined,
      undefined,
    ];

    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-foreground">
          {title || column.id}
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  column.setFilterValue((old: [Date, Date]) => [
                    date,
                    old?.[1],
                  ]);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  column.setFilterValue((old: [Date, Date]) => [
                    old?.[0],
                    date,
                  ]);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  }

  // Date filter (single date)
  if (metadata.variant === "date" && metadata.options) {
    return (
      <Select
        value={(filterValue as string) ?? ""}
        onValueChange={(value) => column.setFilterValue(value || undefined)}
      >
        <SelectTrigger className="h-8 w-full">
          <SelectValue placeholder={`All ${title || column.id}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All {title || column.id}</SelectItem>
          {metadata.options.map((option) => (
            <SelectItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Fallback to text
  return (
    <Input
      type="text"
      value={(filterValue as string) ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      placeholder={`Filter ${title || column.id}...`}
      className="h-8"
    />
  );
}
