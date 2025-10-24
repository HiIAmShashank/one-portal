/**
 * FacetedFilter - Smart filter component that auto-adapts to data type
 *
 * Renders appropriate filter UI based on detected or configured filter variant
 */

import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { useFaceting } from "../hooks/useFaceting";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
  const placeholder =
    (column.columnDef.meta as any)?.filterPlaceholder ||
    `Filter ${title || column.id}...`;

  // Text filter
  if (metadata.variant === "text") {
    return (
      <div className="space-y-2">
        <Label htmlFor={`filter-${column.id}`} className="text-sm font-medium">
          {title || column.id}
        </Label>
        <Input
          id={`filter-${column.id}`}
          type="text"
          value={(filterValue as string) ?? ""}
          onChange={(e) => column.setFilterValue(e.target.value || undefined)}
          placeholder={placeholder}
          className="h-8"
        />
      </div>
    );
  }

  // Select filter (single)
  if (metadata.variant === "select" && metadata.options) {
    return (
      <div className="space-y-2">
        <Label htmlFor={`filter-${column.id}`} className="text-sm font-medium">
          {title || column.id}
        </Label>
        <Select
          value={(filterValue as string) ?? "__all__"}
          onValueChange={(value) =>
            column.setFilterValue(value === "__all__" ? undefined : value)
          }
        >
          <SelectTrigger id={`filter-${column.id}`} className="h-8 w-full">
            <SelectValue placeholder={`All ${title || column.id}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All {title || column.id}</SelectItem>
            {metadata.options.map((option) => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Multi-select filter with Command/Popover
  if (metadata.variant === "multi-select" && metadata.options) {
    const selected = (filterValue as string[]) || [];

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{title || column.id}</Label>
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
                              selected.filter(
                                (v) => v !== String(option.value),
                              ),
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
      </div>
    );
  }

  // Number range filter
  if (metadata.variant === "number-range") {
    const [min, max] = (filterValue as [
      number | undefined,
      number | undefined,
    ]) || [undefined, undefined];

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{title || column.id}</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={min ?? ""}
            onChange={(e) => {
              const newMin = e.target.value
                ? Number(e.target.value)
                : undefined;
              const currentMax = (
                column.getFilterValue() as [
                  number | undefined,
                  number | undefined,
                ]
              )?.[1];

              // Clear filter if both values are undefined
              if (newMin === undefined && currentMax === undefined) {
                column.setFilterValue(undefined);
              } else {
                column.setFilterValue([newMin, currentMax]);
              }
            }}
            placeholder="Min"
            className="h-8"
          />
          <Input
            type="number"
            value={max ?? ""}
            onChange={(e) => {
              const newMax = e.target.value
                ? Number(e.target.value)
                : undefined;
              const currentMin = (
                column.getFilterValue() as [
                  number | undefined,
                  number | undefined,
                ]
              )?.[0];

              // Clear filter if both values are undefined
              if (currentMin === undefined && newMax === undefined) {
                column.setFilterValue(undefined);
              } else {
                column.setFilterValue([currentMin, newMax]);
              }
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
      <div className="space-y-2">
        <Label htmlFor={`filter-${column.id}`} className="text-sm font-medium">
          {title || column.id}
        </Label>
        <Select
          value={
            filterValue === true
              ? "true"
              : filterValue === false
                ? "false"
                : "__all__"
          }
          onValueChange={(value) => {
            const newValue =
              value === "true" ? true : value === "false" ? false : undefined;
            column.setFilterValue(newValue);
          }}
        >
          <SelectTrigger id={`filter-${column.id}`} className="h-8 w-full">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Date range filter
  if (metadata.variant === "date-range") {
    const [startDate, endDate] = (filterValue as [Date, Date]) || [
      undefined,
      undefined,
    ];
    const [startOpen, setStartOpen] = React.useState(false);
    const [endOpen, setEndOpen] = React.useState(false);
    const [startValue, setStartValue] = React.useState(
      startDate ? format(startDate, "PPP") : "",
    );
    const [endValue, setEndValue] = React.useState(
      endDate ? format(endDate, "PPP") : "",
    );

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{title || column.id}</Label>
        <div className="flex gap-2">
          {/* Start Date */}
          <div className="relative flex-1">
            <Input
              value={startValue}
              placeholder="Start date"
              className="h-8 pr-8"
              onChange={(e) => {
                const val = e.target.value;
                setStartValue(val);
                const date = new Date(val);
                if (!isNaN(date.getTime())) {
                  column.setFilterValue((old: [Date, Date]) => [
                    date,
                    old?.[1],
                  ]);
                }
              }}
            />
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-8 w-8 p-0"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    if (date) {
                      setStartValue(format(date, "PPP"));
                      column.setFilterValue((old: [Date, Date]) => [
                        date,
                        old?.[1],
                      ]);
                      setStartOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="relative flex-1">
            <Input
              value={endValue}
              placeholder="End date"
              className="h-8 pr-8"
              onChange={(e) => {
                const val = e.target.value;
                setEndValue(val);
                const date = new Date(val);
                if (!isNaN(date.getTime())) {
                  column.setFilterValue((old: [Date, Date]) => [
                    old?.[0],
                    date,
                  ]);
                }
              }}
            />
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-8 w-8 p-0"
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    if (date) {
                      setEndValue(format(date, "PPP"));
                      column.setFilterValue((old: [Date, Date]) => [
                        old?.[0],
                        date,
                      ]);
                      setEndOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    );
  }

  // Date filter (single date)
  if (metadata.variant === "date" && metadata.options) {
    return (
      <div className="space-y-2">
        <Label htmlFor={`filter-${column.id}`} className="text-sm font-medium">
          {title || column.id}
        </Label>
        <Select
          value={(filterValue as string) ?? "__all__"}
          onValueChange={(value) =>
            column.setFilterValue(value === "__all__" ? undefined : value)
          }
        >
          <SelectTrigger id={`filter-${column.id}`} className="h-8 w-full">
            <SelectValue placeholder={`All ${title || column.id}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All {title || column.id}</SelectItem>
            {metadata.options.map((option) => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Fallback to text
  return (
    <div className="space-y-2">
      <Label htmlFor={`filter-${column.id}`} className="text-sm font-medium">
        {title || column.id}
      </Label>
      <Input
        id={`filter-${column.id}`}
        type="text"
        value={(filterValue as string) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        placeholder={placeholder}
        className="h-8"
      />
    </div>
  );
}
