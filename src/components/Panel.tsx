import React, { useState } from 'react'
import clsx from 'clsx'
import { DockingPanelConfig } from '../types'

interface PanelProps {
  config: DockingPanelConfig
  onToggle?: (id: string, collapsed: boolean) => void
  onClose?: (id: string) => void
  onPinChange?: (id: string, pinned: boolean) => void
  className?: string
  style?: React.CSSProperties
}

export const Panel: React.FC<PanelProps> = ({
  config,
  onToggle,
  onClose,
  onPinChange,
  className,
  style,
}: PanelProps) => {
  const [collapsed, setCollapsed] = useState(config.collapsed || false)

  const handleToggle = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    onToggle?.(config.id, newCollapsed)
  }

  const getPanelStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      ...style,
    }

    if (collapsed) {
      return {
        ...baseStyles,
        height: '40px',
        flex: '0 0 40px',
      }
    }

    if (config.size) {
      return {
        ...baseStyles,
        height: typeof config.size === 'number' ? `${config.size}px` : config.size,
        flex: '0 0 auto',
      }
    } else {
      return {
        ...baseStyles,
        flex: '1 1 0%',
        minHeight: 0,
      }
    }
  }

  return (
    <div
      className={clsx('docking-panel', className)}
      style={getPanelStyles()}
    >
      {/* Panel Header */}
      <div
        className={clsx('panel-header', {
          'panel-header--collapsed': collapsed,
        })}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={handleToggle}
      >
        <span style={{ flex: 1 }}>{config.title}</span>
        {config.collapsible && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggle()
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '2px',
            }}
          >
            {collapsed ? '▶' : '▼'}
          </button>
        )}
        {onClose && config.closable !== false && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose(config.id)
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '2px',
              marginLeft: '8px',
            }}
          >
            ✕
          </button>
        )}
        {typeof config.pinned !== 'undefined' && onPinChange && (
          <button
            onClick={e => {
              e.stopPropagation()
              onPinChange(config.id, !config.pinned)
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '2px',
              marginLeft: '8px',
            }}
            title={config.pinned ? 'Unpin' : 'Pin'}
          >
            {config.pinned ? '📌' : '📍'}
          </button>
        )}
      </div>

      {/* Panel Content */}
      {!collapsed && (
        <div
          className="panel-content"
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '12px',
          }}
        >
          {config.content}
        </div>
      )}
    </div>
  )
} 