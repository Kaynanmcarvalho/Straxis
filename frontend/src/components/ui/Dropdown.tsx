import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check } from 'lucide-react';

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'end',
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger}
      </DropdownMenu.Trigger>
      
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          className="
            min-w-[200px] p-1
            bg-background-paper rounded-md shadow-lg
            border border-neutral-200 dark:border-neutral-700
            z-50
            animate-in fade-in-0 zoom-in-95
          "
          sideOffset={5}
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export const DropdownItem: React.FC<{
  children: React.ReactNode;
  onSelect?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}> = ({ children, onSelect, icon, disabled }) => {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      disabled={disabled}
      className="
        flex items-center gap-2 px-3 py-2
        text-sm text-text-primary
        rounded-md cursor-pointer
        hover:bg-neutral-100 dark:hover:bg-neutral-800
        focus:bg-neutral-100 dark:focus:bg-neutral-800
        focus:outline-none
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
      "
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </DropdownMenu.Item>
  );
};

export const DropdownCheckboxItem: React.FC<{
  children: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}> = ({ children, checked, onCheckedChange }) => {
  return (
    <DropdownMenu.CheckboxItem
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="
        flex items-center gap-2 px-3 py-2
        text-sm text-text-primary
        rounded-md cursor-pointer
        hover:bg-neutral-100 dark:hover:bg-neutral-800
        focus:bg-neutral-100 dark:focus:bg-neutral-800
        focus:outline-none
        transition-colors
      "
    >
      <DropdownMenu.ItemIndicator>
        <Check className="w-4 h-4" />
      </DropdownMenu.ItemIndicator>
      {children}
    </DropdownMenu.CheckboxItem>
  );
};

export const DropdownSeparator: React.FC = () => {
  return (
    <DropdownMenu.Separator className="h-px my-1 bg-neutral-200 dark:bg-neutral-700" />
  );
};

export const DropdownLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DropdownMenu.Label className="px-3 py-2 text-xs font-semibold text-text-secondary">
      {children}
    </DropdownMenu.Label>
  );
};
