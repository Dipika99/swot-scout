'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

type FilterDropdownWithDialogProps = {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  dialogTitle: string;
  dialogPlaceholder: string;
};

export function FilterDropdownWithDialog({
  label,
  options,
  selected,
  onSelect,
  dialogTitle,
  dialogPlaceholder,
}: FilterDropdownWithDialogProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (!trimmed) {
      return;
    }

    onSelect(trimmed);
    setCustomInput('');
    setShowDialog(false);
  };

  return (
    <div className="space-y-1">
      <label className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-sm font-bold text-transparent">{label}</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            {/* ✅ Show placeholder if no selection */}
            {selected || `Select ${label}`}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* ✅ Add a placeholder menu item at the top */}
          <DropdownMenuItem onClick={() => onSelect('')}>
            Select
            {' '}
            {label}
          </DropdownMenuItem>

          {options.map(opt => (
            <DropdownMenuItem key={opt} onClick={() => onSelect(opt)}>
              {opt}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="link" className="px-0 text-xs text-blue-500 hover:underline">
            + Add custom
            {' '}
            {label.toLowerCase()}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-transparent">{dialogTitle}</DialogTitle>
          </DialogHeader>
          <Input
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder={dialogPlaceholder}
          />
          <DialogFooter>
            <Button onClick={handleAddCustom}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
