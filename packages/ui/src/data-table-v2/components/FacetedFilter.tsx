/**
 * FacetedFilter - Smart filter component that auto-adapts to data type
 *
 * Renders appropriate filter UI based on detected or configured filter variant
 */

import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { cn } from "../../lib/utils";
import { useFaceting } from "../hooks/useFaceting";

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
      <input
        type="text"
        value={(filterValue as string) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        placeholder={`Filter ${title || column.id}...`}
        className={cn(
          "h-8 w-full rounded-md border border-border dark:border-border",
          "bg-background dark:bg-background",
          "px-3 py-2 text-sm",
          "placeholder:text-muted-foreground dark:placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring",
        )}
      />
    );
  }

  // Select filter (single)
  if (metadata.variant === "select" && metadata.options) {
    return (
      <select
        value={(filterValue as string) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        className={cn(
          "h-8 w-full rounded-md border border-border dark:border-border",
          "bg-background dark:bg-background",
          "px-3 py-2 text-sm",
          "text-foreground dark:text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring",
        )}
      >
        <option value="">All {title || column.id}</option>
        {metadata.options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  // Multi-select filter
  if (metadata.variant === "multi-select" && metadata.options) {
    const selected = (filterValue as string[]) || [];

    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-foreground dark:text-foreground">
          {title || column.id}
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {metadata.options.map((option) => {
            const isSelected = selected.includes(String(option.value));
            return (
              <label
                key={String(option.value)}
                className="flex items-center gap-2 cursor-pointer hover:bg-muted dark:hover:bg-muted rounded px-2 py-1"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      column.setFilterValue([
                        ...selected,
                        String(option.value),
                      ]);
                    } else {
                      column.setFilterValue(
                        selected.filter((v) => v !== String(option.value)),
                      );
                    }
                  }}
                  className="h-4 w-4 rounded border-border dark:border-border"
                />
                <span className="text-sm text-foreground dark:text-foreground">
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
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
        <div className="text-sm font-medium text-foreground dark:text-foreground">
          {title || column.id}
        </div>
        <div className="flex gap-2">
          <input
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
            className={cn(
              "h-8 w-full rounded-md border border-border dark:border-border",
              "bg-background dark:bg-background",
              "px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring",
            )}
          />
          <input
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
            className={cn(
              "h-8 w-full rounded-md border border-border dark:border-border",
              "bg-background dark:bg-background",
              "px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring",
            )}
          />
        </div>
      </div>
    );
  }

  // Boolean filter
  if (metadata.variant === "boolean") {
    return (
      <select
        value={
          filterValue === true ? "true" : filterValue === false ? "false" : ""
        }
        onChange={(e) => {
          const value =
            e.target.value === "true"
              ? true
              : e.target.value === "false"
                ? false
                : undefined;
          column.setFilterValue(value);
        }}
        className={cn(
          "h-8 w-full rounded-md border border-border dark:border-border",
          "bg-background dark:bg-background",
          "px-3 py-2 text-sm",
          "text-foreground dark:text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring",
        )}
      >
        <option value="">All</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }

  // Date range filter
  if (metadata.variant === "date-range") {
    const [startDate, endDate] = (filterValue as [string, string]) || ["", ""];

    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-foreground dark:text-foreground">
          {title || column.id}
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              column.setFilterValue((old: [string, string]) => [
                e.target.value,
                old?.[1] || "",
              ]);
            }}
            className={cn(
              "h-8 w-full rounded-md border border-border dark:border-border",
              "bg-background dark:bg-background",
              "px-3 py-2 text-sm",
              "text-foreground dark:text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring",
            )}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              column.setFilterValue((old: [string, string]) => [
                old?.[0] || "",
                e.target.value,
              ]);
            }}
            className={cn(
              "h-8 w-full rounded-md border border-border dark:border-border",
              "bg-background dark:bg-background",
              "px-3 py-2 text-sm",
              "text-foreground dark:text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring",
            )}
          />
        </div>
      </div>
    );
  }

  // Date filter (single date)
  if (metadata.variant === "date" && metadata.options) {
    return (
      <select
        value={(filterValue as string) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        className={cn(
          "h-8 w-full rounded-md border border-border dark:border-border",
          "bg-background dark:bg-background",
          "px-3 py-2 text-sm",
          "text-foreground dark:text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring",
        )}
      >
        <option value="">All {title || column.id}</option>
        {metadata.options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  // Fallback to text
  return (
    <input
      type="text"
      value={(filterValue as string) ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      placeholder={`Filter ${title || column.id}...`}
      className={cn(
        "h-8 w-full rounded-md border border-border dark:border-border",
        "bg-background dark:bg-background",
        "px-3 py-2 text-sm",
        "placeholder:text-muted-foreground dark:placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring",
      )}
    />
  );
}
