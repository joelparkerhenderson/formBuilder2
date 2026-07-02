import React from 'react';

interface fbAnimatedSubquestionProps {
  open: boolean;
  children: React.ReactNode;
}

interface fbAnimatedCollapsibleProps {
  open: boolean;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  durationMs?: number;
  onCollapsed?: () => void;
}

export const fbAnimatedCollapsible: React.FC<fbAnimatedCollapsibleProps> = ({
  open,
  children,
  className,
  contentClassName,
  durationMs = 500,
  onCollapsed,
}) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(0);
  const [collapsed, setCollapsed] = React.useState(!open);

  const measureHeight = React.useCallback(() => {
    const content = contentRef.current;
    if (!content) return;
    setHeight(content.scrollHeight);
  }, []);

  React.useLayoutEffect(() => {
    measureHeight();
  }, [children, measureHeight]);

  React.useLayoutEffect(() => {
    if (open) {
      setCollapsed(false);
      measureHeight();
    }
  }, [open, measureHeight]);

  React.useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measureHeight);
    observer.observe(content);
    return () => observer.disconnect();
  }, [measureHeight]);

  return (
    <div
      className={className}
      aria-hidden={!open}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === 'height' && !open) {
          setCollapsed(true);
          onCollapsed?.();
        }
      }}
      style={{
        height: open ? `${height}px` : 0,
        overflow: 'hidden',
        transition: `height ${durationMs}ms ease`,
        visibility: collapsed ? 'hidden' : 'visible',
      }}
    >
      <div ref={contentRef} className={contentClassName}>
        {children}
      </div>
    </div>
  );
};

export const fbAnimatedSubquestion: React.FC<fbAnimatedSubquestionProps> = ({ open, children }) => {
  const FbAnimatedCollapsible = fbAnimatedCollapsible;
  return (
    <FbAnimatedCollapsible
      open={open}
      className="fb-subquestion-collapsible"
      contentClassName="pl-6 pb-1"
    >
      {children}
    </FbAnimatedCollapsible>
  );
};
