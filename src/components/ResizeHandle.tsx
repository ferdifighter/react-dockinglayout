import React from 'react'
import clsx from 'clsx'

interface ResizeHandleProps {
  position: 'horizontal' | 'vertical'
  onResizeStart: (e: React.MouseEvent<HTMLDivElement>) => void
  className?: string
  style?: React.CSSProperties
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  position,
  onResizeStart,
  className,
  style,
}) => {
  return (
    <div
      className={clsx(
        'resize-handle',
        `resize-handle--${position}`,
        className
      )}
      style={{
        position: 'relative',
        backgroundColor: 'transparent',
        cursor: position === 'horizontal' ? 'col-resize' : 'row-resize',
        zIndex: 1000,
        width: position === 'horizontal' ? '4px' : '100%',
        minWidth: position === 'horizontal' ? '4px' : undefined,
        height: position === 'vertical' ? '4px' : '100%',
        minHeight: position === 'vertical' ? '4px' : undefined,
        userSelect: 'none',
        ...style,
      }}
      onPointerDown={onResizeStart}
      onMouseOver={e => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
      onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    />
  )
} 