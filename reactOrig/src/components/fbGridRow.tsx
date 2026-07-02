import React from 'react';

interface fbGridRowProps {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const fbGridRow: React.FC<fbGridRowProps> = ({
  cols = 3,
  children,
  style,
  className = '',
}) => {
  const rowRef = React.useRef<HTMLDivElement>(null);

  const getGridColsClass = () => {
    switch (cols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-4';
      case 5: return 'grid-cols-1 md:grid-cols-5';
      case 6: return 'grid-cols-1 md:grid-cols-6';
      case 7: return 'grid-cols-1 md:grid-cols-7';
      case 8: return 'grid-cols-1 md:grid-cols-8';
      case 9: return 'grid-cols-1 md:grid-cols-9';
      case 10: return 'grid-cols-1 md:grid-cols-10';
      case 11: return 'grid-cols-1 md:grid-cols-11';
      case 12: return 'grid-cols-1 md:grid-cols-12';
      default: return 'grid-cols-1 md:grid-cols-3';
    }
  };

  React.useLayoutEffect(() => {
    const adjustLabelHeights = () => {
      const container = rowRef.current;
      if (!container) return;

      const isMobile = window.innerWidth < 768;

      // Select top-level question labels inside this row only
      const labels = Array.from(
        container.querySelectorAll('.fb-question-container > label:not(.fb-radio-checkbox-item)')
      ) as HTMLElement[];

      // Isolate labels that are descendants of nested subquestions to avoid double-equalizing.
      const filteredLabels = labels.filter((lbl) => {
        let parent = lbl.parentElement;
        while (parent && parent !== container) {
          if (
            parent.classList.contains('fb-subquestion') ||
            parent.classList.contains('fb-subquestion-wrapper')
          ) {
            return false;
          }
          parent = parent.parentElement;
        }
        return true;
      });

      if (filteredLabels.length <= 1) return;

      if (isMobile) {
        // Mobile view: clear modifications
        filteredLabels.forEach((lbl) => {
          lbl.style.height = 'auto';
          lbl.style.paddingTop = '0px';
          lbl.style.display = 'block';
        });
      } else {
        // Desktop view: reset and calculate heights
        filteredLabels.forEach((lbl) => {
          lbl.style.height = 'auto';
          lbl.style.paddingTop = '0px';
          lbl.style.display = 'block';
        });

        const heights = filteredLabels.map((lbl) => lbl.getBoundingClientRect().height);
        const maxHeight = Math.max(...heights);

        if (maxHeight > 0) {
          filteredLabels.forEach((lbl, idx) => {
            const naturalHeight = heights[idx];
            const diff = maxHeight - naturalHeight;
            lbl.style.boxSizing = 'border-box';
            lbl.style.height = `${maxHeight}px`;
            lbl.style.paddingTop = `${diff}px`;
            lbl.style.display = 'block';
          });
        }
      }
    };

    // Equalize heights after browser renders child components and on resize
    const timer = setTimeout(adjustLabelHeights, 50);
    window.addEventListener('resize', adjustLabelHeights);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', adjustLabelHeights);
    };
  }, [children]);

  return (
    <div
      ref={rowRef}
      className={`fb-grid-row grid ${getGridColsClass()} ${className}`}
      style={{
        columnGap: '1.0rem',
        rowGap: '0.4rem',
        marginBottom: '0.4rem',
        marginTop: 0,
        ...style
      }}
    >
      {children}
    </div>
  );
};
