import React, { useState } from 'react'
import { DockingPanelConfig, PanelStyleConfig } from '../Types'
import { Tabs } from './Tabs'
import clsx from 'clsx'

interface Tab {
  label: string
  content: React.ReactNode
}

interface PanelProps {
  config: DockingPanelConfig
  onToggle?: (id: string, collapsed: boolean) => void
  onClose?: (id: string) => void
  onPinChange?: (id: string, pinned: boolean) => void
  className?: string
  style?: React.CSSProperties
  contentRenderer?: (panel: DockingPanelConfig) => React.ReactNode
  // Neue Styling-Optionen
  panelStyle?: PanelStyleConfig
  enablePanelStyling?: boolean
}

export const Panel: React.FC<PanelProps> = ({
  config,
  onToggle,
  onClose,
  onPinChange,
  className,
  style,
  contentRenderer,
  panelStyle,
  enablePanelStyling = true,
}: PanelProps) => {
  const collapsed = !!config.collapsed;
  const hasTabs = Array.isArray((config as any).tabs) && (config as any).tabs.length > 0
  const [activeTab, setActiveTab] = useState(0)
  const tabs: Tab[] = hasTabs ? (config as any).tabs : []

  // Höhe der Tabs-Leiste (z. B. 36px)
  const TABBAR_HEIGHT = hasTabs ? 28 : 0;

  const handleToggle = () => {
    onToggle?.(config.id, !collapsed)
  }

  // Panel-spezifische Styles generieren
  const getPanelStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }

    // Panel-spezifische Styles anwenden
    if (enablePanelStyling && panelStyle?.panel) {
      Object.assign(baseStyles, panelStyle.panel)
    }

    // CSS-Variablen für das Panel setzen
    if (enablePanelStyling && panelStyle?.cssVariables) {
      Object.entries(panelStyle.cssVariables).forEach(([key, value]) => {
        (baseStyles as any)[`--${key}`] = value
      })
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

  // Header-spezifische Styles generieren
  const getHeaderStyles = (): React.CSSProperties => {
    const headerStyles: React.CSSProperties = {}
    
    if (enablePanelStyling && panelStyle?.header) {
      Object.assign(headerStyles, panelStyle.header)
    }
    
    return headerStyles
  }

  // Content-spezifische Styles generieren
  const getContentStyles = (): React.CSSProperties => {
    const contentStyles: React.CSSProperties = { 
      flex: 1,
      ...(config.contentPadding !== undefined && config.contentPadding !== null ? { 
        padding: typeof config.contentPadding === 'number' 
          ? `${config.contentPadding}px` 
          : config.contentPadding 
      } : {})
    }
    
    if (enablePanelStyling && panelStyle?.content) {
      Object.assign(contentStyles, panelStyle.content)
    }
    
    return contentStyles
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

  // CSS-Klassen für Panel
  const panelClasses = clsx(
    'docking-panel', 
    `docking-panel--id-${config.id}`,
    enablePanelStyling && panelStyle?.className?.panel,
    className
  )

  // CSS-Klassen für Header
  const headerClasses = clsx(
    'panel-header',
    {
      'panel-header--collapsed': collapsed,
    },
    enablePanelStyling && panelStyle?.className?.header
  )

  // CSS-Klassen für Content
  const contentClasses = clsx(
    'panel-content',
    enablePanelStyling && panelStyle?.className?.content
  )

  return (
    <div
      className={panelClasses}
      style={getPanelStyles()}
      data-panel-id={config.id}
    >
      {/* Header: Im Center-Bereich Pin/Unpin-Button statt Collapse */}
      {config.hideHeader !== true && !collapsed && (
        <div
          className={headerClasses}
          style={getHeaderStyles()}
          onClick={isCenter && onPinChange ? undefined : handleToggle}
        >
          <span className="panel-title" style={{ flex: 1 }}>{panelTitle}</span>
          {/* Center-Bereich: Pin/Unpin-Button */}
          {isCenter && onPinChange && config.canPin !== false && (
            <button
              onClick={e => {
                e.stopPropagation();
                onPinChange(config.id, false);
              }}
              className="panel-header-btn"
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
              className="panel-header-btn"
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
              className="panel-header-btn"
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
              className="panel-header-btn"
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
          <div 
            className={contentClasses}
            style={getContentStyles()}
          >
            {tabs[activeTab]?.content}
          </div>
        ) : (
          <div 
            className={contentClasses}
            style={getContentStyles()}
          >
            {contentRenderer ? contentRenderer(config) : config.content}
          </div>
        )}
        {/* Tabs-Leiste immer am unteren Rand, wenn Tabs vorhanden */}
        {hasTabs && (
          <div className="panel-tabs-bar" style={{ height: TABBAR_HEIGHT, minHeight: TABBAR_HEIGHT, maxHeight: TABBAR_HEIGHT }}>
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