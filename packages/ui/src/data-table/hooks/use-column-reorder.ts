/**
 * useColumnReorder hook - Integrates @dnd-kit for drag-and-drop column reordering
 * @module data-table/hooks/use-column-reorder
 */

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

interface UseColumnReorderProps {
  initialOrder: string[];
  onOrderChange?: (order: string[]) => void;
}

interface UseColumnReorderReturn {
  columnOrder: string[];
  setColumnOrder: (order: string[] | ((prev: string[]) => string[])) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  sensors: ReturnType<typeof useSensors>;
  DndContext: typeof DndContext;
  SortableContext: typeof SortableContext;
  horizontalListSortingStrategy: typeof horizontalListSortingStrategy;
}

/**
 * Hook for managing column drag-and-drop reordering
 */
export function useColumnReorder({
  initialOrder,
  onOrderChange,
}: UseColumnReorderProps): UseColumnReorderReturn {
  const [columnOrder, setColumnOrderInternal] = useState<string[]>(initialOrder);

  // Configure dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const setColumnOrder = useCallback(
    (value: string[] | ((prev: string[]) => string[])) => {
      const newOrder = value instanceof Function ? value(columnOrder) : value;
      setColumnOrderInternal(newOrder);
      onOrderChange?.(newOrder);
    },
    [columnOrder, onOrderChange]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = columnOrder.indexOf(String(active.id));
        const newIndex = columnOrder.indexOf(String(over.id));
        const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
        setColumnOrder(newOrder);
      }
    },
    [columnOrder, setColumnOrder]
  );

  return {
    columnOrder,
    setColumnOrder,
    handleDragEnd,
    sensors,
    DndContext,
    SortableContext,
    horizontalListSortingStrategy,
  };
}
