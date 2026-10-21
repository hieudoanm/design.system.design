import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Rich from '@/components/atoms/Rich';

describe('Rich', () => {
  it('renders plain text as a paragraph', () => {
    render(<Rich text='Just words.' />);
    expect(screen.getByText('Just words.')).toBeInTheDocument();
  });

  it('splits paragraphs on a blank line', () => {
    const { container } = render(<Rich text={'First paragraph.\n\nSecond paragraph.'} />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toHaveTextContent('First paragraph.');
    expect(paragraphs[1]).toHaveTextContent('Second paragraph.');
  });

  it('renders inline code', () => {
    const { container } = render(<Rich text='Use `tokens` first.' />);
    const code = container.querySelector('code');
    expect(code).toHaveTextContent('tokens');
    expect(code).not.toHaveTextContent('`');
  });

  it('renders bold text', () => {
    const { container } = render(<Rich text='This is **important**.' />);
    const strong = container.querySelector('strong');
    expect(strong).toHaveTextContent('important');
  });

  it('renders a link', () => {
    render(<Rich text='Read the [guide](/design-system) first.' />);
    const link = screen.getByRole('link', { name: 'guide' });
    expect(link).toHaveAttribute('href', '/design-system');
  });

  it('keeps the base path out of a link that is not root relative', () => {
    render(<Rich text='[external](https://example.com)' />);
    expect(screen.getByRole('link', { name: 'external' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
  });

  it('renders a block of "- " lines as a bullet list', () => {
    const { container } = render(<Rich text={'- One.\n- Two with `code`.'} />);
    const items = container.querySelectorAll('li');
    expect(container.querySelectorAll('p')).toHaveLength(0);
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('One.');
    expect(items[1]).toHaveTextContent('Two with code.');
    expect(items[1].querySelector('code')).toHaveTextContent('code');
  });

  it('keeps a list separate from the paragraph around it', () => {
    const { container } = render(<Rich text={'Before.\n\n- One.\n- Two.\n\nAfter.'} />);
    const blocks = container.children;
    expect(blocks).toHaveLength(3);
    expect(blocks[0].tagName).toBe('P');
    expect(blocks[1].tagName).toBe('UL');
    expect(blocks[2].tagName).toBe('P');
  });

  it('applies the class name to every paragraph', () => {
    const { container } = render(<Rich text={'One.\n\nTwo.'} className='inline' />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(2);
    paragraphs.forEach((paragraph) => expect(paragraph).toHaveClass('inline'));
  });

  it('leaves an empty string alone', () => {
    const { container } = render(<Rich text='' />);
    expect(container.querySelectorAll('p')).toHaveLength(1);
    expect(container.querySelector('p')).toBeEmptyDOMElement();
  });

  it('does not treat a lone backtick pair as code', () => {
    const { container } = render(<Rich text='a ` b' />);
    expect(container.querySelector('code')).toBeNull();
  });

  it('does not treat an empty bold pair as bold', () => {
    const { container } = render(<Rich text='a ** b' />);
    expect(container.querySelector('strong')).toBeNull();
  });
});
