import type { Topic } from '../../index';

const compoundComponentsMd: string = `Compound components pattern

Instead of a single component with 20 props, split into a parent + children that share implicit state via React Context.

\`\`\`tsx
// Props explosion
<Select
  options={options}
  value={value}
  onChange={setValue}
  placeholder="Choose..."
  disabled={false}
  error={error}
  required={true}
  size="md"
  variant="outlined"
/>
\`\`\`

\`\`\`tsx
// Compound components
<Select.Root value={value} onChange={setValue}>
  <Select.Label>Choose...</Select.Label>
  <Select.Trigger>
    <Select.Value />
    <Select.Icon />
  </Select.Trigger>
  <Select.Portal>
    <Select.Content>
      <Select.Group>
        {options.map(opt => (
          <Select.Item key={opt.value} value={opt.value}>
            {opt.label}
          </Select.Item>
        ))}
      </Select.Group>
    </Select.Content>
  </Select.Portal>
  <Select.Error>{error}</Select.Error>
</Select.Root>
\`\`\``;

const controlledUncontrolledMd: string = `Controlled vs uncontrolled

**Controlled**: parent owns state, passes \`value\` + \`onChange\`. Source of truth is external.
**Uncontrolled**: component owns state internally, uses \`defaultValue\`. Source of truth is internal.

**Rule**: support both. Use a single \`value\` prop — if \`undefined\`, behave uncontrolled; if defined, behave controlled.

\`\`\`tsx
function TextField({
  value,
  defaultValue,
  onChange,
}: TextFieldProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;
  const handleChange = (next: string) => {
    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next);
  };
  return <input value={currentValue} onChange={e => handleChange(e.target.value)} />;
}
\`\`\`
`;

const variantPropsMd = `Variant props: discriminated unions over string enums

Don't use \`variant: "primary" | "secondary" | "ghost"\` — it forces the consumer to remember magic strings and breaks autocomplete when you add a variant.

Instead, use a discriminated union with a \`variant\` object:

\`\`\`tsx
type ButtonProps =
  | { variant: 'primary'; href?: never; onClick: () => void }
  | { variant: 'link'; href: string; onClick?: never };

function Button({ variant, ...props }: ButtonProps) {
  if (variant === 'primary') return <button {...props} />;
  return <a {...props} />;
}
\`\`\`
`;

const slotsCompositionMd = `Slots over configuration

Instead of \`renderItem\`, \`renderLabel\`, \`renderIcon\` props, accept children with typed slots:

\`\`\`tsx
<Select>
  <Select.Trigger>
    <Select.Value />
    <Select.Icon />
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      <Select.Item>Option 1</Select.Item>
    </Select.Group>
  </Select.Content>
</Select>
\`\`\`
`;

const forwardRefMd = `Forwarding refs & polymorphic \`asChild\`

Every interactive component must forward its ref. Use \`forwardRef\` and the \`asChild\` / \`as\` pattern for polymorphism:

\`\`\`tsx
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp ref={ref} {...props}>{children}</Comp>;
  }
);
Button.displayName = 'Button';
\`\`\`
`;

const apiChecklistMd = `Component API checklist

Before publishing a component to the system:
- [ ] Supports both controlled and uncontrolled modes
- [ ] Uses compound components for complex state (not 20 props)
- [ ] Variants are discriminated unions (not string enums)
- [ ] Accepts \`className\`, \`style\`, \`testId\`, and all native props via \`ComponentPropsWithoutRef\`
- [ ] Forwards ref with \`forwardRef\`
- [ ] Supports \`asChild\` / \`as\` for polymorphism
- [ ] Has a clear \`displayName\` for debugging
- [ ] Documents every prop with JSDoc + example
- [ ] Has a migration codemod for breaking changes
`;

export const componentApi: Topic = {
  slug: 'component-api',
  title: 'Component API design',
  tagline: 'Props, variants, slots, and polymorphism — the interface between system and consumer.',
  summary:
    "A component's API is the contract between the design system and every product team that uses it. Bad APIs cause workarounds, forks, and technical debt. This chapter covers the patterns that scale: compound components over props explosion, discriminated unions for variants, slots over render props, controlled/uncontrolled duality, and ref forwarding with polymorphic `asChild`.",
  group: 'specialized',
  sections: [
    {
      id: 'compound',
      title: 'Compound components',
      intro: 'Split complex components into a parent + typed children.',
      body: 'A component with 20 props is a configuration nightmare. The compound components pattern moves configuration into the component tree: the parent manages state and renders nothing; children are presentational and receive implicit state via Context. This makes every piece independently styleable, replaceable, and type-safe.',
      rules: [
        'Parent owns state; children are presentational.',
        'Share implicit state via React Context (not props).',
        'Type each child with its own props interface.',
        'Export children as static properties on the parent (`Select.Item`).',
      ],
      code: {
        label: 'patterns/compound-components.tsx',
        source: compoundComponentsMd,
      },
    },
    {
      id: 'controlled-uncontrolled',
      title: 'Controlled & uncontrolled duality',
      intro: 'One component, two modes — the consumer decides.',
      body: 'A well-designed component supports both controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) patterns. The implementation uses a single `value` prop: when `undefined`, the component manages its own state; when defined, the parent owns it. This matches native HTML elements like `<input>` and `<select>`.',
      rules: [
        'Single `value` prop — `undefined` = uncontrolled.',
        'Call `onChange` in both modes for consistency.',
        'Support `defaultValue` for uncontrolled initial state.',
        'Never require `onChange` for controlled components.',
      ],
      code: {
        label: 'patterns/controlled-uncontrolled.tsx',
        source: controlledUncontrolledMd,
      },
    },
    {
      id: 'variants',
      title: 'Variants as discriminated unions',
      intro: 'Type-safe variants that enforce required props per variant.',
      body: 'String enum variants (`"primary" | "secondary" | "ghost"`) are not type-safe — they allow invalid combinations and provide no autocomplete for variant-specific props. Discriminated unions solve this: each variant is a distinct type with its own required/optional props.',
      rules: [
        'Use a discriminated union with a `variant` discriminant.',
        'Each variant defines its own required props.',
        'Exhaustiveness check with `never` in the default case.',
        'Avoid optional props that are only valid for some variants.',
      ],
      code: {
        label: 'patterns/discriminated-variants.tsx',
        source: variantPropsMd,
      },
    },
    {
      id: 'slots',
      title: 'Slots over render props',
      intro: 'Explicit composition beats implicit configuration.',
      body: "Render props (`renderItem`, `renderLabel`, `renderIcon`) couple the consumer to the component's internal structure and make styling harder. Slots — typed children with known roles — are explicit, composable, and naturally styleable via CSS. The component defines the slot types; the consumer fills them.",
      rules: [
        'Define slots as static sub-components (`Select.Trigger`, `Select.Value`).',
        'Use `ReactElement` or a slot type for type safety.',
        'Allow multiple instances of the same slot type where valid.',
        'Document the slot contract (required/optional children).',
      ],
      code: {
        label: 'patterns/slots.tsx',
        source: slotsCompositionMd,
      },
    },
    {
      id: 'refs-polymorphism',
      title: 'Ref forwarding & polymorphic `asChild`',
      intro: 'Every interactive component forwards its ref.',
      body: "A component that does not forward its ref breaks composition — consumers cannot focus it, measure it, or compose it with libraries like Framer Motion. Use `forwardRef` and the `asChild` pattern (popularised by Radix UI) to allow polymorphic rendering: the component's styles and behaviour apply to whatever element the consumer provides.",
      rules: [
        'Always `forwardRef` for interactive components.',
        'Support `asChild` prop for polymorphic rendering.',
        'Accept `as` prop for explicit element type override.',
        'Merge props correctly: consumer props override component defaults.',
      ],
      code: {
        label: 'patterns/polymorphic.tsx',
        source: forwardRefMd,
      },
    },
    {
      id: 'checklist',
      title: 'Component API checklist',
      intro: 'Before publishing to the system.',
      code: {
        label: 'CHECKLIST.md',
        source: apiChecklistMd,
      },
      items: [
        {
          title: 'Duality',
          body: 'Supports both controlled and uncontrolled modes with a single value prop.',
        },
        {
          title: 'Compound',
          body: 'Complex state uses compound components, not 20+ props.',
        },
        {
          title: 'Variants',
          body: 'Discriminated unions enforce valid prop combinations per variant.',
        },
        {
          title: 'Slots',
          body: 'Configuration is slots (typed children), not render props.',
        },
        {
          title: 'Refs',
          body: 'Forwards ref; supports asChild/as for polymorphism.',
        },
        {
          title: 'Native props',
          body: 'Spreads ComponentPropsWithoutRef for all native attributes.',
        },
        {
          title: 'Documentation',
          body: 'Every prop has JSDoc + example. Migration codemod for breaking changes.',
        },
      ],
    },
  ],
};
