---
title: Forms
description: Accessible, usable forms that guide users to success.
---

# Forms

Accessible, usable forms that guide users to success.

Forms are critical interaction points where users provide information.
Well-designed forms are clear, accessible, forgiving of errors, and guide users
efficiently to completion with proper validation and feedback.

## Form design philosophy

Forms should be helpful, not hostile.

The best forms feel effortless. They guide users step by step, prevent errors
when possible, clearly explain mistakes when they happen, and make success
obvious. Every form field should have a purpose, and unnecessary fields should
be removed. Accessibility is paramount — forms must be usable by everyone,
including keyboard users and screen reader users. Proper labeling, error
handling, and logical tab order are non-negotiable.

**Rules**

- Only ask for information you absolutely need.
- Make the happy path as simple as possible.
- Prevent errors with smart defaults and constraints.
- Provide clear, helpful error messages.
- Make forms accessible by default.

## Field anatomy

Building blocks of a form field.

Every form field should have a clear structure. The label identifies what
information is needed, the input is where users enter data, hints provide
additional context, and error messages guide users when something goes wrong.
All parts should be properly associated for accessibility using labels, ARIA
attributes, and semantic HTML.

**Examples**

- Label: Clear, descriptive text associated with the input
- Input: The form control for data entry
- Hint text: Optional guidance shown before user interacts
- Required indicator: Clear marking for required fields (* or text)
- Error message: Specific, actionable feedback on validation failure
- Help text: Additional context or formatting instructions

**Rules**

- Every input needs a visible label (not just placeholder).
- Associate labels with inputs using `htmlFor`/`id`.
- Show required fields clearly and consistently.
- Place error messages near the field they relate to.
- Use `aria-describedby` to link hints and errors.

## Input states

Visual feedback for every interaction.

Form controls need distinct visual states to communicate their status. Users
should always know if a field is enabled, focused, filled, in error, or
disabled. These states must be accessible and meet contrast requirements. Use
consistent styling across all inputs in the system.

**Examples**

- Default: Ready for input with normal styling
- Focus: Clear focus indicator (keyboard navigation)
- Filled: Has user-entered value
- Success: Validation passed (use sparingly)
- Error: Validation failed with error border/message
- Disabled: Not interactive, reduced opacity
- Readonly: Display value, not editable

**Rules**

- Always show a visible focus indicator.
- Error states must use color plus other indicators.
- Disabled fields should still be perceivable but not interactive.
- Maintain sufficient contrast in all states.
- Use `:focus-visible` for keyboard focus only.

## Form controls

Choosing the right input type.

Select the appropriate form control based on the type of input needed. Use
native HTML inputs when possible for better accessibility and mobile keyboard
support. Each control has its own patterns and considerations.

**Examples**

- Text input: Single-line text, email, password, number, tel, url
- Textarea: Multi-line text like comments or descriptions
- Select: Choose from a predefined list of options
- Checkbox: Multiple selections from a list
- Radio: Single selection from mutually exclusive options
- Toggle/Switch: On/off binary states
- Button: Form submission and actions

**Rules**

- Use semantic input types (`email`, `tel`, `number`) for better mobile keyboards.
- Use native controls when they meet your needs.
- Group related options with fieldsets and legends.
- Make click targets large enough (minimum 44x44px).
- Provide clear labels for all controls.

**Code:** FormField.tsx

```ts
export function FormField({
  label,
  hint,
  error,
  required,
  children
}: FormFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ');

  return (
    <div className="form-field">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {cloneElement(children, {
        id,
        "aria-invalid": !!error,
        "aria-describedby": describedBy || undefined,
        required
      })}
      {hint && <p id={hintId} className="field-hint">{hint}</p>}
      {error && <p id={errorId} className="field-error" role="alert">{error}</p>}
    </div>
  );
}
```

## Form layout

Organizing fields for clarity.

Form layout affects usability significantly. Vertical layouts are easiest to
scan and work well on all screen sizes. Horizontal layouts can work for simple
forms with few fields but are harder on mobile. Grid layouts help group related
fields together. Keep forms short and logical. Group related fields into
sections with clear headings. Use progressive disclosure for complex forms.

**Examples**

- Vertical: Most common, works on all devices, easy to scan
- Horizontal: Labels beside inputs, good for short forms on desktop
- Grid: Group related fields (first/last name) on same row
- Multi-column: Use sparingly and ensure mobile stacking

**Rules**

- Default to vertical layout for maximum compatibility.
- Stack fields vertically on mobile, even if horizontal on desktop.
- Group related fields logically.
- Use consistent spacing between fields (space-4 to space-6).
- Align actions (Submit/Cancel) clearly.

## Validation & error handling

Helping users fix mistakes.

Good validation prevents errors when possible and clearly explains them when
they occur. Validate on submit for most cases, or use real-time validation for
complex rules like passwords. Always provide specific, actionable error
messages. Never blame the user — say "Please enter a valid email" not "Invalid
email". Show errors near the field and in an error summary for longer forms.

**Examples**

- On submit: Validate all fields, show errors and focus first error
- On blur: Validate when user leaves field (good for format checks)
- On input: Real-time for password strength, character counts
- Error summary: List all errors at top of form with links to fields

**Rules**

- Validate on submit as the baseline.
- Show specific, actionable error messages.
- Place errors near the relevant field.
- Use `role="alert"` for error messages.
- Focus the first error on submit.
- Don't clear valid fields when showing errors.
- Provide success feedback when appropriate.

**Code:** validation.ts

```ts
function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address (e.g., name@example.com)';
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter';
  }
  return null;
}
```

## Accessibility

Forms for everyone.

Accessible forms work with keyboards, screen readers, and assistive
technologies. Proper HTML semantics and ARIA attributes are essential. Ensure
logical tab order, clear labels, and proper error announcements. Test with
keyboard navigation and a screen reader to catch issues that automated tools
might miss.

**Rules**

- Use semantic HTML (`<form>`, `<fieldset>`, `<legend>`, `<label>`).
- All inputs must have associated labels.
- Use `required` attribute and mark visually.
- Announce errors with `role="alert"` or `aria-live`.
- Ensure keyboard navigation works (Tab, Enter, Space, Arrow keys).
- Group related radios/checkboxes with `<fieldset>` and `<legend>`.
- Provide clear instructions before complex forms.
- Don't use placeholder as a label replacement.

**Code:** accessible-form.html

```ts
<form novalidate>
  <fieldset>
    <legend>Contact Information</legend>

    <div class="form-field">
      <label for="email">Email Address <span aria-label="required">*</span></label>
      <input
        id="email"
        type="email"
        required
        aria-required="true"
        aria-describedby="email-hint email-error"
      />
      <p id="email-hint" class="hint">We'll never share your email</p>
      <p id="email-error" class="error" role="alert" aria-live="polite"></p>
    </div>
  </fieldset>

  <button type="submit">Submit</button>
</form>
```

## Best practices

Practical tips for better forms.

Follow these guidelines to create forms users actually want to fill out.
Remember that every field has a cost — only ask for what you need.

**Rules**

- Keep forms short — remove unnecessary fields.
- Use smart defaults where possible.
- Break long forms into steps with progress indicators.
- Save progress for long forms.
- Use autocomplete attributes for common fields.
- Match input types to expected data.
- Provide clear calls-to-action (specific button text).
- Show confirmation after successful submission.
- Handle empty states and loading states.
- Consider mobile-first design.

**Code:** autocomplete-example.tsx

```ts
<input
  type="email"
  name="email"
  autoComplete="email"
  placeholder="you@example.com"
/>
<input
  type="tel"
  name="phone"
  autoComplete="tel"
  placeholder="+1 (555) 000-0000"
/>
<input
  type="text"
  name="name"
  autoComplete="name"
  placeholder="Full name"
/>
```

## Checklist

Before shipping your form.
