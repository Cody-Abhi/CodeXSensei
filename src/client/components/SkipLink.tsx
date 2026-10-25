export interface SkipLinkProps {
  /** Target element id to jump to (default `main`). */
  targetId?: string;
  children?: React.ReactNode;
}

/**
 * Skip-to-content link: visually hidden until focused, then revealed as the
 * first focusable element on the page (PRD §11). Styled via `.skip-link` in
 * base.css.
 *
 * @param props - Skip link props.
 * @returns An anchor element.
 */
export function SkipLink({
  targetId = 'main',
  children = 'Skip to content',
}: SkipLinkProps): React.JSX.Element {
  return (
    <a className="skip-link" href={`#${targetId}`}>
      {children}
    </a>
  );
}
