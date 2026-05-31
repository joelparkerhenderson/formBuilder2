import * as React from 'react';
import { fbToolTip as FbToolTip } from '../components/fbToolTip';

interface FbTooltipState {
  text: string;
  x: number;
  y: number;
  targetElement: HTMLElement;
  offsetRight: boolean;
  showClose: boolean;
  placeBelowLabel: boolean;
  horizontalAnchorElement?: HTMLElement;
  horizontalOffsetPx?: number;
}

interface FbTooltipRequest {
  text: string;
  element: HTMLElement;
  offsetRight?: boolean;
}

export const useFbTooltips = () => {
  const [activeTooltips, setActiveTooltips] = React.useState<FbTooltipState[]>([]);
  const tooltipTimeoutRef = React.useRef<number | null>(null);
  const tooltipRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  const showTooltip = (
    text: string,
    element: HTMLElement,
    offsetRight: boolean = false,
    showClose: boolean = true
  ) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setActiveTooltips([{ text, x: 0, y: 0, targetElement: element, offsetRight, showClose, placeBelowLabel: false }]);
  };

  const showMultipleTooltips = (tooltips: FbTooltipRequest[]) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setActiveTooltips(tooltips.map(({ text, element, offsetRight = false }) => ({
      text,
      x: 0,
      y: 0,
      targetElement: element,
      offsetRight,
      showClose: true,
      placeBelowLabel: false,
    })));
  };

  const isVisibleElement = (element: Element | null) => {
    if (!(element instanceof HTMLElement)) return false;
    const rect = element.getBoundingClientRect();
    return rect.height > 0 && rect.width > 0;
  };

  const getQuestionLabelAnchor = (element: HTMLElement) => {
    const radioCheckboxLabel = element.closest('.fb-radio-checkbox-item');
    if (radioCheckboxLabel instanceof HTMLElement) return radioCheckboxLabel;

    const questionContainer = element.closest('.fb-question-container');
    if (questionContainer) {
      const directLabel = Array.from(questionContainer.children).find(
        (child) => child instanceof HTMLLabelElement
      );
      if (directLabel instanceof HTMLElement) return directLabel;
    }

    return element;
  };

  const hasOpenSubquestion = (radioCheckboxLabel: Element | null) => {
    if (!(radioCheckboxLabel instanceof HTMLElement)) return false;

    const wrapper = radioCheckboxLabel.closest('.fb-subquestion-wrapper');
    if (wrapper instanceof HTMLElement) {
      const wrapperHasOpenChild = Array.from(wrapper.children).some((child) => {
        if (!(child instanceof HTMLElement) || child === radioCheckboxLabel) return false;
        return isVisibleElement(child);
      });
      if (wrapperHasOpenChild) return true;
    }

    const nextSibling = radioCheckboxLabel.nextElementSibling;
    if (isVisibleElement(nextSibling)) return true;

    const parent = radioCheckboxLabel.parentElement;
    if (!parent) return false;

    const siblings = Array.from(parent.children);
    const ownIndex = siblings.indexOf(radioCheckboxLabel);
    return siblings.slice(ownIndex + 1).some((sibling) => {
      if (!(sibling instanceof HTMLElement)) return false;
      if (sibling.matches('.fb-radio-checkbox-item')) return false;
      return isVisibleElement(sibling);
    });
  };

  const showTooltipForControl = (
    text: string,
    element: HTMLElement,
    belowLabel: boolean = false
  ) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    const anchor = getQuestionLabelAnchor(element);
    const inputAnchor = anchor.querySelector('input[type="radio"], input[type="checkbox"]');
    const placeBelowLabel = belowLabel && !hasOpenSubquestion(anchor);
    const horizontalAnchorElement = placeBelowLabel && inputAnchor instanceof HTMLElement
      ? inputAnchor
      : undefined;

    setActiveTooltips([{
      text,
      x: 0,
      y: 0,
      targetElement: anchor,
      offsetRight: false,
      showClose: !belowLabel,
      placeBelowLabel,
      horizontalAnchorElement,
      horizontalOffsetPx: horizontalAnchorElement ? 32 : 0,
    }]);
  };

  React.useLayoutEffect(() => {
    if (activeTooltips.length === 0 || activeTooltips.every((tooltip) => tooltip.x !== 0 || tooltip.y !== 0)) {
      return;
    }

    setActiveTooltips(activeTooltips.map((tooltip, index) => {
      const tooltipElement = tooltipRefs.current[index];
      if (!tooltipElement) return tooltip;

      const rect = tooltip.targetElement.getBoundingClientRect();
      const tooltipHeight = tooltipElement.offsetHeight;
      let x = rect.left;
      let y = rect.top - tooltipHeight - 5;

      if (tooltip.offsetRight) {
        x = rect.right + 10;
        y = rect.bottom + 5;
      }

      if (tooltip.placeBelowLabel) {
        const horizontalRect = tooltip.horizontalAnchorElement?.getBoundingClientRect();
        x = horizontalRect ? horizontalRect.left + (tooltip.horizontalOffsetPx || 0) : rect.left;
        y = rect.bottom + 5;
      }

      const maxLeft = window.innerWidth - tooltipElement.offsetWidth - 10;
      x = Math.max(10, Math.min(x, maxLeft));

      return { ...tooltip, x, y };
    }));
  });

  const hideTooltip = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    tooltipTimeoutRef.current = window.setTimeout(() => {
      setActiveTooltips([]);
      tooltipRefs.current = [];
    }, 100);
  };

  const closeTooltip = () => {
    setActiveTooltips([]);
    tooltipRefs.current = [];
  };

  const keepTooltipOpen = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
  };

  const renderTooltips = (persistOnHover: boolean = false) => activeTooltips.map((tooltip, index) => (
    <FbToolTip
      key={index}
      innerRef={(el) => { tooltipRefs.current[index] = el; }}
      x={tooltip.x}
      y={tooltip.y}
      text={tooltip.text}
      showClose={tooltip.showClose}
      onClose={closeTooltip}
      onMouseEnter={persistOnHover ? keepTooltipOpen : undefined}
      onMouseLeave={persistOnHover ? hideTooltip : undefined}
    />
  ));

  return {
    showTooltip,
    showMultipleTooltips,
    showTooltipForControl,
    hideTooltip,
    closeTooltip,
    renderTooltips,
  };
};
