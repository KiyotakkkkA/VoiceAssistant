import React, { useEffect } from "react";

interface Props {
  id: string;
  title?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  className?: string;
  onClose: (id: string) => void;
}

const selectLineColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-500';
    case 'warning':
      return 'bg-orange-500';
    case 'error':
      return 'bg-red-500';
    case "info":
      return 'bg-blue-500';
  }
};

const Toast: React.FC<Props> = ({ id, title, type = 'info', duration = 3500, className, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={`pointer-events-auto select-none group relative px-4 py-3 rounded-md border shadow-lg overflow-hidden animate-slide-in border-ui-border-primary bg-ui-bg-secondary-light ${className || ''}`}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{
          background:
            "radial-gradient(circle at 85% 15%, rgba(0,122,204,0.18), transparent 60%)",
        }}
      />
      <div className="flex items-start gap-3 relative z-10">
        <div className={`mt-0.5 h-2 w-2 rounded-full ${selectLineColor(type)} shadow-inner animate-pulse`} />
        <div className="text-sm leading-snug text-ui-text-primary">{title}</div>
      </div>
      <div className={`absolute left-0 bottom-0 h-0.5 ${selectLineColor(type)} animate-toast-bar`} />
    </div>
  );
};

export { Toast };
