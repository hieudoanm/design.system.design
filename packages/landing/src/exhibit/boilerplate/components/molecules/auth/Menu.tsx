import type { FC, ReactNode } from 'react';

interface MenuItem {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

interface MenuProps {
  items: MenuItem[];
  title?: string;
}

export const Menu: FC<MenuProps> = ({ items, title }) => (
  <ul className="menu menu-vertical bg-base-200 w-full rounded-xl p-2">
    {title && <li className="menu-title">{title}</li>}
    {items.map((item) => (
      <li key={item.label}>
        <button
          type="button"
          aria-current={item.active ? 'page' : undefined}
          className={`${item.active ? 'menu-active' : ''} ${
            item.danger ? 'text-error' : ''
          }`}
          onClick={item.onClick}>
          {item.icon}
          {item.label}
        </button>
      </li>
    ))}
  </ul>
);
