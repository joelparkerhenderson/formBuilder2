import React from 'react';

type FbcPanelProps = {
  header: React.ReactNode;
  properties: React.ReactNode;
  actions: React.ReactNode;
  footer: React.ReactNode;
  bodyRef?: React.Ref<HTMLDivElement>;
};

export const fbcPanel: React.FC<FbcPanelProps> = ({ header, properties, actions, footer, bodyRef }) => (
  <aside className="fb-designer-panel fbc-panel">
    <div className="fbc-panel-header">{header}</div>
    <div className="fbc-panel-body" ref={bodyRef}>
      <div className="fbc-panel-scroll fbc-panel-properties">{properties}</div>
      <div className="fbc-panel-scroll fbc-panel-actions">{actions}</div>
    </div>
    <div className="fbc-panel-footer">{footer}</div>
  </aside>
);

