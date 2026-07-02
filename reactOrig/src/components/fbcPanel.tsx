import React from 'react';

type FbcPanelProps = {
  header: React.ReactNode;
  properties: React.ReactNode;
  actions: React.ReactNode;
  footer: React.ReactNode;
  bodyRef?: React.Ref<HTMLDivElement>;
};

export const fbcPanel: React.FC<FbcPanelProps> = ({ header, properties, actions, footer, bodyRef }) => (
  <FbcPanelLayout header={header} properties={properties} actions={actions} footer={footer} bodyRef={bodyRef} />
);

const FbcPanelLayout: React.FC<FbcPanelProps> = ({ header, properties, actions, footer, bodyRef }) => {
  const bodyElementRef = React.useRef<HTMLDivElement | null>(null);
  const propertiesElementRef = React.useRef<HTMLDivElement | null>(null);
  const actionsElementRef = React.useRef<HTMLDivElement | null>(null);
  const [constrained, setConstrained] = React.useState(false);

  const setBodyElement = React.useCallback((element: HTMLDivElement | null) => {
    bodyElementRef.current = element;
    if (typeof bodyRef === 'function') {
      bodyRef(element);
    } else if (bodyRef && 'current' in bodyRef) {
      (bodyRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
    }
  }, [bodyRef]);

  const updateLayoutMode = React.useCallback(() => {
    const bodyElement = bodyElementRef.current;
    const propertiesElement = propertiesElementRef.current;
    const actionsElement = actionsElementRef.current;
    if (!bodyElement || !propertiesElement || !actionsElement) return;
    const bodyStyle = window.getComputedStyle(bodyElement);
    const rowGap = Number.parseFloat(bodyStyle.rowGap || bodyStyle.gap || '0') || 0;
    const needsConstrainedLayout = propertiesElement.scrollHeight + actionsElement.scrollHeight + rowGap > bodyElement.clientHeight + 1;
    setConstrained((current) => (current === needsConstrainedLayout ? current : needsConstrainedLayout));
  }, []);

  React.useLayoutEffect(() => {
    updateLayoutMode();
  });

  React.useEffect(() => {
    const observedElements = [bodyElementRef.current, propertiesElementRef.current, actionsElementRef.current].filter(Boolean) as HTMLElement[];
    if (!observedElements.length) return undefined;
    const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(updateLayoutMode);
    const mutationObserver = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(updateLayoutMode);
    observedElements.forEach((element) => resizeObserver?.observe(element));
    [propertiesElementRef.current, actionsElementRef.current].forEach((element) => {
      if (element) mutationObserver?.observe(element, { attributes: true, childList: true, characterData: true, subtree: true });
    });
    window.addEventListener('resize', updateLayoutMode);
    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('resize', updateLayoutMode);
    };
  }, [updateLayoutMode]);

  return (
    <aside className="fb-designer-panel fbc-panel">
      <div className="fbc-panel-header">{header}</div>
      <div className={`fbc-panel-body${constrained ? ' fbc-panel-body-constrained' : ''}`} ref={setBodyElement}>
        <div className="fbc-panel-scroll fbc-panel-properties" ref={propertiesElementRef}>{properties}</div>
        <div className="fbc-panel-scroll fbc-panel-actions" ref={actionsElementRef}>{actions}</div>
      </div>
      <div className="fbc-panel-footer">{footer}</div>
    </aside>
  );
};
