import type { FC } from 'react';

interface Swatch {
  name: string;
  value: string;
}

interface ColorSwatchProps {
  colors: Swatch[];
  selected?: string;
  onSelect?: (name: string) => void;
}

export const ColorSwatch: FC<ColorSwatchProps> = ({
  colors,
  selected,
  onSelect,
}) => (
  <div
    className="flex flex-wrap gap-2"
    role="group"
    aria-label="Colors"
    data-testid="color-swatch">
    {colors.map((color) => (
      <button
        key={color.name}
        type="button"
        className={`h-8 w-8 rounded-full border-2 ${
          selected === color.name ? 'border-primary' : 'border-base-300'
        }`}
        style={{ backgroundColor: color.value }}
        aria-label={color.name}
        aria-pressed={selected === color.name}
        onClick={() => onSelect?.(color.name)}
      />
    ))}
  </div>
);
