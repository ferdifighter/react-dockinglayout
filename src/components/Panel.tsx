import React, { useState } from 'react'
import clsx from 'clsx'
import { DockingPanelConfig } from '../types'
import { Tabs, Tab } from './Tabs'

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
  const collapsed = !!config.collapsed;
  const hasTabs = Array.isArray((config as any).tabs) && (config as any).tabs.length > 0
  const [activeTab, setActiveTab] = useState(0)
  const tabs: Tab[] = hasTabs ? (config as any).tabs : []

  // Höhe der Tabs-Leiste (z. B. 36px)
  const TABBAR_HEIGHT = hasTabs ? 28 : 0;
  const HEADER_HEIGHT = 40;

  const handleToggle = () => {
    onToggle?.(config.id, !collapsed)
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
      // Im collapsed-Zustand nur Tabs-Leiste, keinen Platz im Flex-Flow reservieren
      return {
        ...baseStyles,
        flex: 'none',
        height: `${TABBAR_HEIGHT}px`,
        minHeight: `${TABBAR_HEIGHT}px`,
        maxHeight: `${TABBAR_HEIGHT}px`,
      }
    }

    // Nur im ausgeklappten Zustand size berücksichtigen
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

  // Panel-Titel: Wenn Tabs, dann Titel des aktiven Tabs, sonst config.title
  const panelTitle = hasTabs ? tabs[activeTab]?.label || config.title : config.title

  // Pin/Unpin-Logik für Center-Bereich
  const isCenter = config && (config as any).center === true;

  // Tab-Wechsel-Handler, der im collapsed-Zustand das Panel aufklappt
  const handleTabChange = (idx: number) => {
    if (collapsed && onToggle) {
      onToggle(config.id, false);
    }
    setActiveTab(idx);
  };

  return (
    <div
      className={clsx('docking-panel', className)}
      style={getPanelStyles()}
    >
      {/* Header: Im Center-Bereich Pin/Unpin-Button statt Collapse */}
      {config.hideHeader !== true && !collapsed && (
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
            height: HEADER_HEIGHT,
            minHeight: HEADER_HEIGHT,
            maxHeight: HEADER_HEIGHT,
          }}
          onClick={isCenter && onPinChange ? undefined : handleToggle}
        >
          <span style={{ flex: 1 }}>{panelTitle}</span>
          {/* Center-Bereich: Pin/Unpin-Button */}
          {isCenter && onPinChange && config.canPin !== false && (
            <button
              onClick={e => {
                e.stopPropagation();
                onPinChange(config.id, false);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '2px',
                marginLeft: '8px',
              }}
              title={'Unpin'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"/>
              </svg>
            </button>
          )}
          {/* Seitenbereiche: Collapse-Button */}
          {!isCenter && config.collapsible && (
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
          {typeof config.pinned !== 'undefined' && onPinChange && !isCenter && (
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
              {config.pinned ? (
              // Unpin: durchgestrichener Pin (Material Design Outlined)
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.71,19.29,17.41,16H16V14.41l-2-2V4h1V2H7V4H8V12.41l-6.29,6.3a1,1,0,0,0,1.42,1.42l6.3-6.29H14.41l2,2V16h-1.41l3.3,3.29a1,1,0,0,0,1.42-1.42Z"/>
              </svg>
            ) : (
              // Pin: Gerade
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"/>
              </svg>
            )}
            </button>
          )}
        </div>
      )}

      {/* Flex-Container für Inhalt und Tabs-Leiste */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        padding: 0,
        overflow: 'hidden',
      }}>
        {/* Panel Content */}
        {hasTabs ? (
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {tabs[activeTab]?.content}
          </div>
        ) : (
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {config.content}
          </div>
        )}
        {/* Tabs-Leiste immer am unteren Rand, wenn Tabs vorhanden */}
        {hasTabs && (
          <div style={{ borderTop: '1px solid #e0e0e0', height: TABBAR_HEIGHT, minHeight: TABBAR_HEIGHT, maxHeight: TABBAR_HEIGHT }}>
            <Tabs
              tabs={tabs}
              active={activeTab}
              onTabChange={handleTabChange}
              position="bottom"
            />
          </div>
        )}
      </div>
    </div>
  )
} 