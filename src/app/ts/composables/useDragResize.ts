import { useRef, useCallback } from 'react';

interface DragState {
  x: number;
  y: number;
  value: number;
}

export const useDragResize = (
  initialValue: number,
  minValue: number = 400,
  maxValueFactor: number = 0.9,
  direction: 'horizontal' | 'vertical' = 'horizontal'
) => {
  const startRef = useRef<DragState>();
  const didDragRef = useRef(false);

  const onDragStart = useCallback((
    e: React.MouseEvent, 
    onUpdate: (newValue: number) => void,
    onDragStateChange?: (isDragging: boolean) => void
  ) => {
    didDragRef.current = false;
    startRef.current = { 
      x: e.clientX, 
      y: e.clientY, 
      value: initialValue 
    };
    
    if (onDragStateChange) onDragStateChange(true);
    
    const onDragMove = (e: MouseEvent) => {
      if (!startRef.current) return;
      
      let delta: number;
      let maxConstraint: number;
      
      if (direction === 'vertical') {
        delta = startRef.current.y - e.clientY;
        maxConstraint = window.innerHeight * maxValueFactor;
      } else {
        delta = startRef.current.x - e.clientX;
        maxConstraint = window.innerWidth * maxValueFactor;
      }
      
      if (Math.abs(delta) > 2) didDragRef.current = true;
      
      let newValue = startRef.current.value + delta;
      newValue = Math.max(minValue, Math.min(maxConstraint, newValue));
      
      onUpdate(newValue);
    };

    const onDragEnd = () => {
      if (onDragStateChange) onDragStateChange(false);
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
    };

    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
    e.preventDefault();
  }, [initialValue, minValue, maxValueFactor, direction]);

  return {
    onDragStart,
    didDragRef
  };
};
