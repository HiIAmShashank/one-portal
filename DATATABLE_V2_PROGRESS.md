# DataTable V2 - Progress Tracker

**Branch:** `feature/datatable-v2-rewrite`
**Last Updated:** 2025-10-23

## Summary
- **Total Tasks:** 52
- **Completed:** 8 (15%)
- **In Progress:** 0
- **Pending:** 44

## Recent Changes

**Commit:** `fceb06e` - Upgraded Storybook from v8.6.14 to v9.1.13
- ✅ Ran 6 automigrations (eslintPlugin, addon-globals-api, etc.)
- ✅ Updated all Storybook packages to v9.1.13
- ✅ Migrated to framework-based configuration
- ✅ Updated globals API for backgrounds/viewport

**Commit:** `cd6369b` - Updated progress tracker with resolved issues

**Commit:** `75704bb` - Fixed loading state, dark mode, and UI issues
- ✅ Fixed loading spinner with proper SVG animation
- ✅ Fixed scrollwheel flicker by conditionally applying overflow-auto
- ✅ Added comprehensive dark mode support throughout table
- ✅ Rebuilt UI package to generate missing Tailwind classes (px-6, even:bg-muted/30)
- ✅ className prop already exists for custom styling
- ✅ Created progress tracking document (this file)

---

## Phase 1: Foundation ✅ (8/8 completed)

- [x] Create new git branch for DataTable V2 rewrite
- [x] Create data-table-v2 folder structure
- [x] Create types.ts with improved type system
- [x] Create useDataTable hook (core TanStack wrapper)
- [x] Create basic DataTable.tsx component
- [x] Create TableHead component (inline in DataTable)
- [x] Create TableBody component (inline in DataTable)
- [x] Create basic Storybook story - Default table

**Commit:** `cd2da90` - Foundation with 13 basic stories

---

## Phase 2: Core Features (0/4 completed)

### Sorting & Pagination
- [ ] Add sorting feature (enable column sorting)
- [ ] Create Storybook story - Sorting
- [ ] Add pagination feature (bottom controls)
- [ ] Create Storybook story - Pagination

---

## Phase 3: Filtering (0/6 completed)

### Faceted Filtering (Smart Auto-Detection)
- [ ] Implement useFaceting hook (auto-detect filter types)
- [ ] Create FacetedFilter component with shadcn
- [ ] Add column filtering with auto-detection
- [ ] Create Storybook story - Filtering
- [ ] Create GlobalSearch component
- [ ] Create Storybook story - Global search

---

## Phase 4: Selection & Actions (0/6 completed)

### Row Selection
- [ ] Create SelectColumn component (auto-pinned left)
- [ ] Add row selection with getCanSelect prop
- [ ] Create Storybook story - Row selection

### Actions
- [ ] Create ActionsColumn component (auto-pinned right)
- [ ] Add row actions and bulk actions
- [ ] Create Storybook story - Actions

---

## Phase 5: UI Controls (0/6 completed)

### Density & Variants
- [ ] Create DensityMenu component (dropdown with shadcn)
- [ ] Add density control (compact/default/relaxed)
- [ ] Create Storybook story - Density
- [ ] Add variant styles (default/bordered/striped)
- [ ] Test light and dark mode support
- [ ] Create Storybook story - Variants & themes

---

## Phase 6: Column Features (0/5 completed)

### Advanced Column Controls
- [ ] Add column visibility toggle
- [ ] Add column resizing
- [ ] Add column reordering with DndKit
- [ ] Add column pinning
- [ ] Create Storybook story - Column features

---

## Phase 7: Virtualization (0/3 completed)

### Large Dataset Support
- [ ] Implement useVirtualization hook
- [ ] Add virtualization support for large datasets
- [ ] Create Storybook story - Virtualization

---

## Phase 8: Grouping & Aggregation (0/4 completed)

### Advanced Features
- [ ] Add column grouping headers support
- [ ] Create TableFoot component with aggregations
- [ ] Add row grouping with aggregations
- [ ] Create Storybook story - Grouping & aggregations

---

## Phase 9: States & Loading (0/4 completed)

### Better UX
- [ ] Create EmptyState component with icon
- [ ] Create LoadingState component with skeleton
- [ ] Create ErrorState component
- [ ] Create Storybook story - States

---

## Phase 10: Persistence (0/3 completed)

### localStorage Integration
- [ ] Implement usePersistence hook (localStorage)
- [ ] Add persistence for column preferences
- [ ] Create Storybook story - Persistence

---

## Phase 11: Server-Side (0/2 completed)

### Server-Side Operations
- [ ] Add server-side mode support
- [ ] Create Storybook story - Server-side

---

## Phase 12: Documentation & Finalization (0/3 completed)

### Polish & Ship
- [ ] Update UI package exports for V2
- [ ] Write comprehensive API documentation
- [ ] Write migration guide from V1 to V2

---

## Current Issues (User Reported)

### ✅ Resolved (Commit 75704bb)
1. ✅ **Loading state flickering** - Fixed with proper SVG spinner and conditional overflow-auto
2. ✅ **Tailwind classes missing** - Fixed by rebuilding UI package (px-6, even:bg-muted/30 now available)
3. ✅ **Dark mode broken** - Fixed with dark: prefixes throughout component
4. ✅ **className prop** - Already exists, confirmed in DataTable.tsx props

### Optional
- [x] Upgrade Storybook to v9.1.13 (completed - commit fceb06e)

---

## Notes

### Tailwind Class Generation
The UI package needs to be rebuilt whenever new Tailwind classes are used. Run:
```bash
pnpm --filter @one-portal/ui build
```

### Dark Mode Support
Need to ensure dark: prefixes are applied to all table elements:
- Table background
- Border colors
- Text colors
- Row hover states
- Empty/loading/error states

### Storybook Upgrade
Current: v8.5.3
Available: v9.1.11
Command: `npx storybook@latest upgrade`
