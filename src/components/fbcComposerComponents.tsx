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

export const fbcHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const fbcBreadcrumbs: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="fbc-breadcrumbs">{children}</div>;
export const fbcOptions: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="fbc-options">{children}</div>;
export const fbcProperties: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="fbc-properties">{children}</div>;
export const fbcpName: React.FC<{ children: React.ReactNode }> = ({ children }) => <td className="fbcp-name">{children}</td>;
export const fbcpVal: React.FC<{ children: React.ReactNode }> = ({ children }) => <td className="fbcp-val">{children}</td>;

export const fbcpTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => (
  <textarea ref={ref} className="fbcp-textarea" rows={1} {...props} />
));

export const fbcpTextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input ref={ref} className="fbcp-text-input" {...props} />
));

export const fbcpDropdown = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>((props, ref) => (
  <select ref={ref} className="fbcp-dropdown" {...props} />
));

export const fbcpCheck: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input className="fbcp-check" type="checkbox" {...props} />;
export const fbcActions: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="fbc-actions">{children}</div>;

export const fbcAction: React.FC<React.LiHTMLAttributes<HTMLLIElement> & { danger?: boolean }> = ({ danger, className = '', ...props }) => (
  <li className={`fb-designer-action-item ${danger ? 'fb-designer-action-danger' : ''} ${className}`} {...props} />
);

export const fbcFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
