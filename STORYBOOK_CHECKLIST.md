# Storybook Setup Progress Checklist

This file tracks progress for implementing Storybook for the DataTable component.
Update checkboxes as tasks are completed: `- [ ]` → `- [x]`

---

## Phase 0: Progress Tracking

- [x] Create STORYBOOK_CHECKLIST.md file

---

## Phase 1: Initial Setup

- [x] Create `apps/storybook/` directory structure
- [x] Initialize Storybook with `pnpm dlx storybook@latest init`
- [x] Install dependencies (@storybook/react-vite, addons, @faker-js/faker)
- [x] Create package.json with workspace dependencies
- [x] Create tsconfig.json extending base config
- [x] Create vite.config.ts with path aliases
- [x] Configure `.storybook/main.ts` (Vite builder, addons, stories location)
- [x] Configure `.storybook/preview.tsx` (global decorators, theme provider)
- [x] Import `@one-portal/ui/styles.css` in preview
- [x] Test that Storybook runs with `pnpm storybook`

**Status:** ✅ Completed

---

## Phase 2: Mock Data Infrastructure

- [x] Create `src/mocks/data-generators.ts`
- [x] Implement user data generator (name, email, role, status)
- [x] Implement order data generator (ID, customer, amount, status, date)
- [x] Implement product data generator (name, SKU, price, stock, category)
- [x] Implement financial data generator (transactions, balances)
- [x] Implement task data generator (title, assignee, priority, due date)
- [x] Create `src/mocks/column-definitions.tsx`
- [x] Define user columns with custom renderers
- [x] Define order columns with status badges
- [x] Define product columns with inline editing config
- [x] Define financial columns with number formatting
- [x] Define task columns with priority indicators

**Status:** ✅ Completed

---

## Phase 3: Story Files - Basic Features

**File:** `src/stories/DataTable/01-BasicFeatures.stories.tsx`

- [x] Create story file with default export (meta)
- [x] Story: Default - Simple table with data
- [x] Story: WithSorting - Sortable columns
- [x] Story: WithPagination - Pagination controls
- [x] Story: WithGlobalFilter - Search box
- [x] Story: WithColumnFilters - Per-column filters
- [x] Story: EmptyState - No data message
- [x] Story: LoadingState - Loading spinner
- [x] Story: ErrorState - Error display

**Status:** ✅ Completed

---

## Phase 4: Story Files - Advanced Features

**File:** `src/stories/DataTable/02-AdvancedFeatures.stories.tsx`

- [ ] Create story file structure
- [ ] Story: InlineEditing - Editable cells
- [ ] Story: RowGrouping - Grouped rows with aggregation
- [ ] Story: RowExpanding - Expandable rows
- [ ] Story: ServerSideMode - Server pagination/sorting
- [ ] Story: MultiSelectFilters - Various filter types
- [ ] Story: CustomAggregations - Sum, count, average

**Status:** Not started

---

## Phase 5: Story Files - Column Features

**File:** `src/stories/DataTable/03-ColumnFeatures.stories.tsx`

- [ ] Create story file structure
- [ ] Story: ColumnResizing - Draggable borders
- [ ] Story: ColumnReordering - Drag & drop columns
- [ ] Story: ColumnPinning - Pin left/right
- [ ] Story: ColumnVisibility - Show/hide toggle
- [ ] Story: StickyColumns - Fixed first/last columns
- [ ] Story: StickyHeader - Fixed header on scroll
- [ ] Story: CustomCellRenderers - Icons, badges

**Status:** Not started

---

## Phase 6: Story Files - Selection & Actions

**File:** `src/stories/DataTable/04-SelectionActions.stories.tsx`

- [ ] Create story file structure
- [ ] Story: SingleRowSelection - Radio buttons
- [ ] Story: MultipleRowSelection - Checkboxes
- [ ] Story: RowActions - Per-row action menu
- [ ] Story: BulkActions - Bulk operations
- [ ] Story: ConditionalActions - State-based actions
- [ ] Story: DisabledSelection - Non-selectable rows

**Status:** Not started

---

## Phase 7: Story Files - UI Variations

**File:** `src/stories/DataTable/05-UIVariations.stories.tsx`

- [ ] Create story file structure
- [ ] Story: CompactDensity - Tight spacing
- [ ] Story: DefaultDensity - Standard spacing
- [ ] Story: RelaxedDensity - Loose spacing
- [ ] Story: FilterModeToolbar - Toolbar filters
- [ ] Story: FilterModeInline - Inline filters
- [ ] Story: VariantDefault - Standard style
- [ ] Story: VariantBordered - Bordered cells
- [ ] Story: VariantStriped - Striped rows
- [ ] Story: DarkMode - Dark theme
- [ ] Story: LightMode - Light theme

**Status:** Not started

---

## Phase 8: Story Files - Real-World Examples

**File:** `src/stories/DataTable/06-RealWorldExamples.stories.tsx`

- [ ] Create story file structure
- [ ] Story: UserManagement - Full-featured user table
- [ ] Story: OrdersTable - E-commerce orders
- [ ] Story: ProductCatalog - Products with editing
- [ ] Story: FinancialData - Formatted numbers
- [ ] Story: AuditLog - Expandable details
- [ ] Story: TaskManager - Bulk actions

**Status:** Not started

---

## Phase 9: Story Files - Persistence & State

**File:** `src/stories/DataTable/07-PersistenceState.stories.tsx`

- [ ] Create story file structure
- [ ] Story: WithPersistence - localStorage state
- [ ] Story: ControlledMode - Parent-controlled state
- [ ] Story: UncontrolledMode - Internal state
- [ ] Story: InitialState - Pre-configured state
- [ ] Story: StateReset - Reset button

**Status:** Not started

---

## Phase 10: Documentation & Polish

- [ ] Add comprehensive JSDoc comments to all stories
- [ ] Configure Storybook docs page with usage examples
- [ ] Add accessibility tests to critical stories
- [ ] Test all interactive features work correctly
- [ ] Verify theme switching works properly
- [ ] Add README.md to storybook app explaining usage
- [ ] Take screenshots for documentation (optional)

**Status:** Not started

---

## Phase 11: Integration & Deployment Exclusion

- [ ] Verify `combine-builds.js` does NOT include storybook
- [ ] Update root `package.json` with storybook scripts
- [ ] Update `turbo.json` with storybook tasks
- [ ] Add storybook to `.gitignore` (storybook-static/)
- [ ] Test `pnpm storybook` from root works
- [ ] Test `pnpm build-storybook` creates static build
- [ ] Verify `pnpm build:deploy` excludes storybook
- [ ] Update project README with Storybook section
- [ ] Document how to run and use Storybook

**Status:** Not started

---

## Summary

**Total Tasks:** 90
**Completed:** 32 (36%)
**In Progress:** None
**Next Up:** Phase 4 - Advanced Features Stories

---

## Notes

- Update this file after completing each task or phase
- Commit this file regularly to preserve progress
- If context is lost, read this file to resume from last checkpoint
