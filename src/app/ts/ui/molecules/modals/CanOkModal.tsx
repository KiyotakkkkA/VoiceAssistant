import { R } from 'framer-motion/dist/types.d-DDSxwf0n';
import React, { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  children?: React.ReactNode;
}

const CanOkModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'ОК',
  cancelText = 'Отмена',
  type = 'info',
  children
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeStyles = {
    info: {
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/25',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      )
    },
    warning: {
      gradient: 'from-orange-500 to-orange-600',
      shadow: 'shadow-orange-500/25',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
      )
    },
    danger: {
      gradient: 'from-red-500 to-red-600',
      shadow: 'shadow-red-500/25',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"/>
        </svg>
      )
    },
    success: {
      gradient: 'from-green-500 to-green-600',
      shadow: 'shadow-green-500/25',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      )
    }
  };

  const currentStyle = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div className="relative bg-ui-bg-primary border border-ui-border-primary/20 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        <div className="flex items-center gap-3 p-6 pb-4">
          <div className={`w-12 h-12 bg-gradient-to-r ${currentStyle.gradient} ${currentStyle.shadow} rounded-xl flex items-center justify-center text-white shadow-lg`}>
            {currentStyle.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-ui-text-primary mb-1">{title}</h3>
            {description && (
              <p className="text-sm text-ui-text-secondary leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-ui-text-secondary hover:text-ui-text-primary hover:bg-ui-text-secondary/10 rounded-lg transition-colors duration-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        {children && (
          <div className="px-6 pb-4">
            {children}
          </div>
        )}
        
        <div className="flex gap-3 p-6 pt-4 border-t border-ui-border-primary/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-ui-text-secondary/10 hover:bg-ui-text-secondary/20 text-ui-text-primary font-medium rounded-xl transition-all duration-200"
          >
            {cancelText}
          </button>
          {onConfirm && (
            <button
              onClick={(e) => {
                onConfirm(e);
                onClose();
              }}
              className={`flex-1 px-4 py-2.5 bg-gradient-to-r ${currentStyle.gradient} hover:scale-105 ${currentStyle.shadow} text-white font-medium rounded-xl shadow-lg transition-all duration-200`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export { CanOkModal };
