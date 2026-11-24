import type { FC, ReactNode } from 'react';

interface BottomNavigationItem {
  label: string;
  icon?: ReactNode;
  value: string;
}

interface BottomNavigationProps {
  items: BottomNavigationItem[];
  value: string;
  onChange: (value: string) => void;
  position?: 'static' | 'fixed';
  className?: string;
}

export const BottomNavigation: FC<BottomNavigationProps> = ({
  items,
  value,
  onChange,
  position = 'static',
  className = '',
}) => (
  <nav
    aria-label="Bottom navigation"
    className={`btm-nav ${position === 'fixed' ? 'fixed' : ''} ${className}`}>
    {items.map((item) => {
      const active = item.value === value;
      return (
        <button
          key={item.value}
          type="button"
          aria-label={item.label}
          aria-current={active ? 'page' : undefined}
          className={active ? 'active' : ''}
          onClick={() => onChange(item.value)}>
          {item.icon}
          <span className="btm-nav-label">{item.label}</span>
        </button>
      );
    })}
  </nav>
);
