import { forwardRef, ReactNode } from "react";

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  children: ReactNode;
}

const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ visible, x, y, children }, ref) => {
    if (!visible) return null;

    return (
      <div
        ref={ref}
        className="fixed bg-ui-bg-secondary border border-ui-border-primary rounded-md shadow-lg py-1 z-50"
        style={{ left: x, top: y }}
      >
        {children}
      </div>
    );
  }
);

export { ContextMenu };