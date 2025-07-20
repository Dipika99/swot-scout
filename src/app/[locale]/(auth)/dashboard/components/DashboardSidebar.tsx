'use client';

import { Button } from '@/components/ui/button';

import { FilterDropdownWithDialog } from './FilterDropdownWithDialog';

type DashboardSidebarProps = {
  products: string[];
  objectives: string[];
  segments: string[];

  product: string;
  objective: string;
  segment: string;

  setProduct: (value: string) => void;
  setObjective: (value: string) => void;
  setSegment: (value: string) => void;

  onSubmit: () => void;
  loading: boolean;
};

export function DashboardSidebar({
  products,
  objectives,
  segments,
  product,
  objective,
  segment,
  setProduct,
  setObjective,
  setSegment,
  onSubmit,
  loading,
}: DashboardSidebarProps) {
  return (
    <aside className="flex w-64 flex-col space-y-6 bg-white p-6 shadow-md">
      <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">Filters</h2>

      <FilterDropdownWithDialog
        label="Product"
        options={products}
        selected={product}
        onSelect={setProduct}
        dialogTitle="Add Custom Product"
        dialogPlaceholder="e.g. Smartwatches"
      />

      <FilterDropdownWithDialog
        label="Objective"
        options={objectives}
        selected={objective}
        onSelect={setObjective}
        dialogTitle="Add Custom Objective"
        dialogPlaceholder="e.g. Improve Retention"
      />

      <FilterDropdownWithDialog
        label="Segment"
        options={segments}
        selected={segment}
        onSelect={setSegment}
        dialogTitle="Add Custom Market Segment"
        dialogPlaceholder="e.g. Health-conscious Millennials"
      />

      <Button
        className="mt-4"
        onClick={onSubmit}
        disabled={loading || !segment}
      >
        {loading ? 'Generating...' : 'Generate Insights'}
      </Button>
    </aside>
  );
}
