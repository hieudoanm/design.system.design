import type { FC, ReactNode } from 'react';

interface MenuGroupItem {
  id: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

interface MenuGroupSection {
  id: string;
  title: string;
  items: MenuGroupItem[];
}

interface MenuGroupProps {
  sections: MenuGroupSection[];
}

export const MenuGroup: FC<MenuGroupProps> = ({ sections }) => (
  <ul className="menu bg-base-200 w-full rounded-xl p-2">
    {sections.map((section) => (
      <li key={section.id}>
        <span className="menu-title">{section.title}</span>
        <ul>
          {section.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-current={item.active ? 'page' : undefined}
                onClick={item.onClick}
                className={item.active ? 'menu-active' : ''}>
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </li>
    ))}
  </ul>
);
