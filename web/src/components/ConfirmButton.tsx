import { useState, useEffect } from 'react';

interface ConfirmButtonProps {
  label: string;
  confirmLabel?: string;
  className?: string;
  onConfirm: () => void;
  danger?: boolean;
}

export function ConfirmButton({ 
  label, 
  confirmLabel = 'Confirm?', 
  className = '', 
  onConfirm,
  danger = false
}: ConfirmButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isConfirming) {
      const timer = setTimeout(() => setIsConfirming(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirming]);

  if (isConfirming) {
    return (
      <button 
        className={`${className} ${danger ? 'btn-danger' : 'btn-primary'} pulse`}
        onClick={(e) => {
          e.stopPropagation();
          setIsConfirming(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </button>
    );
  }

  return (
    <button 
      className={className} 
      onClick={(e) => {
        e.stopPropagation();
        setIsConfirming(true);
      }}
    >
      {label}
    </button>
  );
}
