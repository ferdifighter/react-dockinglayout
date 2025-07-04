import React, { useState, useCallback, useRef, useEffect } from 'react'
import { DockingLayoutProps, DockingColumnConfig } from '../types'
import { Panel } from './Panel'
import { ResizeHandle } from './ResizeHandle'
import clsx from 'clsx'

const COLLAPSED_WIDTH = 36

export const DockingLayout: React.FC<DockingLayoutProps> = ({
  config,
  onLayoutChange,
  className,
  style,
}: DockingLayoutProps) => {
  const [columns, setColumns] = useState<DockingColumnConfig[]>(config.columns)
  // Für Resizing: Referenz auf aktuelle Spalten
  const columnsRef = useRef(columns)
  columnsRef.current = columns

  // Drawer-Overlay-Logik für unpinned Panels (links)
  const [openLeftDrawer, setOpenLeftDrawer] = useState<string | null>(null)

  // Drawer-Overlay-Logik für unpinned Panels (rechts)
  const [openRightDrawer, setOpenRightDrawer] = useState<string | null>(null)

  // Klick außerhalb des Drawers schließt ihn
  useEffect(() => {
    if (!openLeftDrawer) return
    const handleClick = (e: MouseEvent) => {
      const drawer = document.getElementById('left-drawer')
      if (drawer && !drawer.contains(e.target as Node)) {
        setOpenLeftDrawer(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openLeftDrawer])

  // Pin/Unpin-Handler für Panels (Panel wird wirklich verschoben)
  const handlePinPanel = (colIdx: number, panelId: string, pinned: boolean) => {
    setColumns(prevCols => {
      const cols = [...prevCols];
      const col = { ...cols[colIdx] };
      let panels = col.panels.map(p =>
        p.id === panelId ? { ...p, pinned } : p
      );
      cols[colIdx] = { ...col, panels };
      onLayoutChange?.({ ...config, columns: cols });
      return cols;
    });
    if (colIdx === 0 && pinned) setOpenLeftDrawer(null);
    if (colIdx === columns.length - 1 && pinned) setOpenRightDrawer(null);
  }

  // Panel-Events (Toggle, Close)
  const handlePanelToggle = useCallback((colId: string, panelId: string, collapsed: boolean) => {
    const updated = columns.map(col =>
      col.id === colId
        ? { ...col, panels: col.panels.map(p => p.id === panelId ? { ...p, collapsed } : p) }
        : col
    )
    setColumns(updated)
    onLayoutChange?.({ ...config, columns: updated })
  }, [columns, config, onLayoutChange])

  const handlePanelClose = useCallback((colId: string, panelId: string) => {
    const updated = columns.map(col =>
      col.id === colId
        ? { ...col, panels: col.panels.filter(p => p.id !== panelId) }
        : col
    )
    setColumns(updated)
    onLayoutChange?.({ ...config, columns: updated })
  }, [columns, config, onLayoutChange])

  // Modernes Split-Resizing zwischen zwei Panels (vertikal, pixelgenau)
  const handleSplitResizeStart = (colIdx: number, upperIdx: number, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const startY = e.clientY
    const colDiv = (e.target as HTMLDivElement).parentElement as HTMLDivElement
    const panelDivs = Array.from(colDiv.children).filter(child => child.classList.contains('docking-panel')) as HTMLDivElement[]
    const upperPanelDiv = panelDivs[upperIdx]
    const lowerPanelDiv = panelDivs[upperIdx + 1]
    const startUpperHeight = upperPanelDiv.getBoundingClientRect().height
    const startLowerHeight = lowerPanelDiv.getBoundingClientRect().height
    // Mousemove-Handler
    const onPointerMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY
      let newUpper = Math.max(50, startUpperHeight + delta)
      let newLower = Math.max(50, startLowerHeight - delta)
      // Panels im State aktualisieren
      setColumns(prevCols => {
        const cols = [...prevCols]
        const col = { ...cols[colIdx] }
        const panels = [...col.panels]
        panels[upperIdx] = { ...panels[upperIdx], size: newUpper }
        panels[upperIdx + 1] = { ...panels[upperIdx + 1], size: newLower }
        cols[colIdx] = { ...col, panels }
        onLayoutChange?.({ ...config, columns: cols })
        return cols
      })
    }
    // Mouseup-Handler
    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
    }
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
  }

  // Horizontales Split-Resizing zwischen zwei Spalten
  const handleColumnResizeStart = (leftIdx: number, e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const startX = e.clientX
    // Spalten-Elemente im DOM suchen
    const layoutDiv = (e.target as HTMLDivElement).parentElement as HTMLDivElement
    const colDivs = Array.from(layoutDiv.children).filter(child => child.classList.contains('docking-column')) as HTMLDivElement[]
    const leftColDiv = colDivs[leftIdx]
    const rightColDiv = colDivs[leftIdx + 1]
    const startLeftWidth = leftColDiv.getBoundingClientRect().width
    const startRightWidth = rightColDiv.getBoundingClientRect().width
    const onPointerMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX
      let newLeft = Math.max(80, startLeftWidth + delta)
      let newRight = Math.max(80, startRightWidth - delta)
      setColumns(prevCols => {
        const cols = [...prevCols]
        const left = { ...cols[leftIdx] }
        const right = { ...cols[leftIdx + 1] }
        cols[leftIdx] = { ...left, width: newLeft }
        cols[leftIdx + 1] = { ...right, width: newRight }
        onLayoutChange?.({ ...config, columns: cols })
        return cols
      })
    }
    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
    }
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
  }

  return (
    <div
      className={clsx('docking-layout', className)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        ...style,
      }}
    >
      {/* Sidebar für unpinned Panels und Collapse-Button: nur sichtbar, wenn unpinned Panels ODER collapsed (links) */}
      {columns[0] && (
        (columns[0].panels.some(panel => panel.pinned === false) || columns[0].collapsed) && (
          <div
            className="docking-sidebar docking-sidebar--left"
            style={{
              width: 36,
              background: '#f5f5f5',
              borderRight: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 3000,
              position: 'relative',
            }}
          >
            {columns[0].panels.filter(panel => panel.pinned === false).map(panel => (
              <button
                key={panel.id}
                style={{
                  width: 32,
                  height: 100,
                  margin: '6px 0',
                  border: 'none',
                  background: openLeftDrawer === panel.id ? '#e0e0e0' : 'transparent',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  position: 'relative',
                }}
                title={panel.title}
                onClick={() => setOpenLeftDrawer(panel.id)}
              >
                <span
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    width: '100%',
                    userSelect: 'none',
                  }}
                >
                  {panel.title}
                </span>
              </button>
            ))}
          </div>
        )
      )}
      {/* Drawer-Overlay für unpinned Panel (links) */}
      {openLeftDrawer && columns[0] && (
        <div
          id="left-drawer"
          style={{
            position: 'fixed',
            top: 0,
            left: 36,
            height: '100vh',
            width: 320,
            background: '#fff',
            borderRight: '1px solid #e0e0e0',
            boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
            zIndex: 4000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {columns[0].panels.filter(p => p.pinned === false && p.id === openLeftDrawer).map(panel => (
            <div key={panel.id} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e0e0e0', padding: '8px 12px', background: '#f5f5f5' }}>
                <span style={{ flex: 1, fontWeight: 500 }}>{panel.title}</span>
                <button
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, marginRight: 8 }}
                  title={panel.pinned ? 'Unpin' : 'Pin'}
                  onClick={() => handlePinPanel(0, panel.id, !panel.pinned)}
                >
                  {panel.pinned ? (
                    // Pin: Gerade
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"/>
                    </svg>
                  ) : (
                    // Unpin: Pin mit diagonaler Linie
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"/>
                      <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </button>
                <button
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}
                  title="Schließen"
                  onClick={() => setOpenLeftDrawer(null)}
                >✕</button>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>{panel.content}</div>
            </div>
          ))}
        </div>
      )}
      {columns[0] && columns[0].panels.filter(p => p.pinned !== false).length > 0 && (
        <div
          className={clsx('docking-column', columns[0].className, { 'docking-column--collapsed': columns[0].collapsed })}
          style={{
            width: columns[0].collapsed ? COLLAPSED_WIDTH : (columns[0].width ? (typeof columns[0].width === 'number' ? `${columns[0].width}px` : columns[0].width) : 220),
            minWidth: columns[0].collapsed ? COLLAPSED_WIDTH : columns[0].minWidth,
            maxWidth: columns[0].collapsed ? COLLAPSED_WIDTH : columns[0].maxWidth,
            flex: undefined,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Panels nur anzeigen, wenn nicht collapsed */}
          {!columns[0].collapsed && columns[0].panels.filter(p => p.pinned !== false).map((panel, idx, arr) => (
            <React.Fragment key={panel.id}>
              <Panel
                config={{ ...panel, center: true }}
                onToggle={(id: string, collapsed: boolean) => handlePanelToggle(columns[0].id, id, collapsed)}
                onClose={(id: string) => handlePanelClose(columns[0].id, id)}
                onPinChange={(id: string, pinned: boolean) => handlePinPanel(0, id, pinned)}
              />
              {/* Moderner Split-ResizeHandle zwischen Panels (außer nach dem letzten) */}
              {idx < arr.length - 1 &&
                !panel.collapsed &&
                !arr[idx + 1].collapsed && (
                  <ResizeHandle
                    position="vertical"
                    onResizeStart={(e: React.MouseEvent<HTMLDivElement>) => handleSplitResizeStart(0, idx, e)}
                  />
                )}
            </React.Fragment>
          ))}
        </div>
      )}
      {columns.length > 1 && columns[0] && columns[0].panels.filter(p => p.pinned !== false).length > 0 && (
        <ResizeHandle
          position="horizontal"
          onResizeStart={e => handleColumnResizeStart(0, e)}
        />
      )}
      {columns.map((col, colIdx) => {
        if (colIdx === 0 || colIdx === columns.length - 1) return null; // Linke und rechte Spalte werden separat gerendert!
        // Neue Flex-Logik: Nur die mittlere Spalte (center) ist flexibel
        let style: React.CSSProperties = {
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...col.style,
        };
        if (colIdx === 0 || colIdx === columns.length - 1) {
          // Linke und rechte Spalte: immer feste Breite
          style.width = col.collapsed ? COLLAPSED_WIDTH : (col.width ? (typeof col.width === 'number' ? `${col.width}px` : col.width) : 220);
          style.minWidth = col.collapsed ? COLLAPSED_WIDTH : col.minWidth;
          style.maxWidth = col.collapsed ? COLLAPSED_WIDTH : col.maxWidth;
          style.flex = undefined;
        } else {
          // Mittlere Spalte: immer flexibel
          style.flex = 1;
          style.width = undefined;
          style.minWidth = undefined;
          style.maxWidth = undefined;
        }
        // Center-Bereich: Overlay-Logik für unpinned Panels
        if (col.id === 'center') {
          const pinnedPanels = col.panels.filter(p => p.pinned !== false);
          const unpinnedPanels = col.panels.filter(p => p.pinned === false);
          const [openCenterDrawer, setOpenCenterDrawer] = useState<string | null>(null);
          // Tabs für unpinned Panels unten
          const centerTabs = unpinnedPanels.map(p => ({ label: p.title, id: p.id }));
          return (
            <div
              className={clsx('docking-column', col.className, { 'docking-column--collapsed': col.collapsed })}
              style={{
                ...style,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              {/* Gerenderte Panels (pinned) */}
              {!col.collapsed && pinnedPanels.map((panel, idx) => (
                <React.Fragment key={panel.id}>
                  <Panel
                    config={{ ...panel, center: true }}
                    onToggle={(id: string, collapsed: boolean) => handlePanelToggle(col.id, id, collapsed)}
                    onClose={(id: string) => handlePanelClose(col.id, id)}
                    onPinChange={(id: string, pinned: boolean) => handlePinPanel(colIdx, id, pinned)}
                  />
                  {/* ResizeHandle nur zwischen pinnedPanels, wenn beide resizable sind */}
                  {idx < pinnedPanels.length - 1 && 
                   pinnedPanels[idx].resizable !== false && 
                   pinnedPanels[idx + 1].resizable !== false && (
                    <ResizeHandle
                      position="vertical"
                      onResizeStart={(e: React.MouseEvent<HTMLDivElement>) => handleSplitResizeStart(colIdx, idx, e)}
                    />
                  )}
                </React.Fragment>
              ))}
              {/* Tabs-Leiste unten für unpinned Panels (ohne Header) */}
              {unpinnedPanels.length > 0 && (
                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', zIndex: 2, background: '#fafafa', borderTop: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'flex', height: 28 }}>
                    {centerTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setOpenCenterDrawer(tab.id)}
                        style={{
                          padding: '4px 14px',
                          border: 'none',
                          borderBottom: openCenterDrawer === tab.id ? '2px solid #1976d2' : 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontWeight: openCenterDrawer === tab.id ? 600 : 400,
                          color: openCenterDrawer === tab.id ? '#1976d2' : '#333',
                          height: '100%',
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Overlay/Drawer für unpinned Panel (center) */}
              {openCenterDrawer && unpinnedPanels.find(p => p.id === openCenterDrawer) && (
                <div
                  id="center-drawer"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 28, // Höhe der Tabs-Leiste
                    height: '40vh',
                    background: '#fff',
                    borderTop: '1px solid #e0e0e0',
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
                    zIndex: 4000,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {unpinnedPanels.filter(p => p.id === openCenterDrawer).map(panel => (
                    <div key={panel.id} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e0e0e0', padding: '8px 12px', background: '#f5f5f5' }}>
                        <span style={{ flex: 1, fontWeight: 500 }}>{panel.title}</span>
                        <button
                          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, marginRight: 8 }}
                          title={panel.pinned ? 'Unpin' : 'Pin'}
                          onClick={() => { handlePinPanel(colIdx, panel.id, !panel.pinned); setOpenCenterDrawer(null); }}
                        >
                          {panel.pinned ? (
                            // Pin: Gerade
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"/>
                            </svg>
                          ) : (
                            // Unpin: Pin mit diagonaler Linie
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"/>
                              <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          )}
                        </button>
                        <button
                          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}
                          title="Schließen"
                          onClick={() => setOpenCenterDrawer(null)}
                        >✕</button>
                      </div>
                      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>{panel.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }
        // Panels: erst alle nicht-collapsed, dann alle collapsed Panels
        const pinnedPanels = col.panels.filter(p => p.pinned !== false);
        const expandedPanels = pinnedPanels.filter(p => !p.collapsed);
        const collapsedPanels = pinnedPanels.filter(p => p.collapsed);
        return (
          <React.Fragment key={col.id}>
            <div
              className={clsx('docking-column', col.className, { 'docking-column--collapsed': col.collapsed })}
              style={{
                ...style,
                position: 'relative',
              }}
            >
              {/* Expanded Panels als Flex-Children */}
              {!col.collapsed && expandedPanels.map((panel, idx) => (
                <React.Fragment key={panel.id}>
                  <Panel
                    config={{ ...panel, center: true }}
                    onToggle={(id: string, collapsed: boolean) => handlePanelToggle(col.id, id, collapsed)}
                    onClose={(id: string) => handlePanelClose(col.id, id)}
                    onPinChange={(id: string, pinned: boolean) => handlePinPanel(colIdx, id, pinned)}
                  />
                  {/* ResizeHandle nur zwischen expandedPanels, wenn beide resizable sind */}
                  {idx < expandedPanels.length - 1 && 
                   expandedPanels[idx].resizable !== false && 
                   expandedPanels[idx + 1].resizable !== false && (
                    <ResizeHandle
                      position="vertical"
                      onResizeStart={(e: React.MouseEvent<HTMLDivElement>) => handleSplitResizeStart(colIdx, idx, e)}
                    />
                  )}
                </React.Fragment>
              ))}
              {/* Collapsed Panels als Overlay am unteren Rand */}
              {!col.collapsed && collapsedPanels.map(panel => (
                <div key={panel.id} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', zIndex: 2 }}>
                  <Panel
                    config={{ ...panel, size: undefined }}
                    onToggle={(id: string, collapsed: boolean) => handlePanelToggle(col.id, id, collapsed)}
                    onClose={(id: string) => handlePanelClose(col.id, id)}
                    onPinChange={(id: string, pinned: boolean) => handlePinPanel(colIdx, id, pinned)}
                  />
                </div>
              ))}
            </div>
            {/* Moderner Spalten-ResizeHandle (außer nach der letzten Spalte) */}
            {colIdx < columns.length - 1 && (
              <ResizeHandle
                position="horizontal"
                onResizeStart={(e: React.MouseEvent<HTMLDivElement>) => handleColumnResizeStart(colIdx, e)}
              />
            )}
          </React.Fragment>
        )
      })}
      {/* Sidebar für unpinned Panels und Collapse-Button: nur sichtbar, wenn unpinned Panels ODER collapsed (rechts) */}
      {columns[columns.length-1] && (
        (columns[columns.length-1].panels.some(panel => panel.pinned === false) || columns[columns.length-1].collapsed) && (
          <div
            className="docking-sidebar docking-sidebar--right"
            style={{
              width: 36,
              background: '#f5f5f5',
              borderLeft: '1px solid #e0e0e0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 3000,
              position: 'relative',
              right: 0,
              left: 'auto',
              order: 9999,
            }}
          >
            {columns[columns.length-1].panels.filter(panel => panel.pinned === false).map(panel => (
              <button
                key={panel.id}
                style={{
                  width: 32,
                  height: 100,
                  margin: '6px 0',
                  border: 'none',
                  background: openRightDrawer === panel.id ? '#e0e0e0' : 'transparent',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  position: 'relative',
                }}
                title={panel.title}
                onClick={() => setOpenRightDrawer(panel.id)}
              >
                <span
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    width: '100%',
                    userSelect: 'none',
                  }}
                >
                  {panel.title}
                </span>
              </button>
            ))}
          </div>
        )
      )}
      {/* Drawer-Overlay für unpinned Panel (rechts) */}
      {openRightDrawer && columns[columns.length-1] && (
        <div
          id="right-drawer"
          style={{
            position: 'fixed',
            top: 0,
            right: 36,
            height: '100vh',
            width: 320,
            background: '#fff',
            borderLeft: '1px solid #e0e0e0',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.08)',
            zIndex: 4000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {columns[columns.length-1].panels.filter(p => p.pinned === false && p.id === openRightDrawer).map(panel => (
            <div key={panel.id} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #e0e0e0', padding: '8px 12px', background: '#f5f5f5' }}>
                <span style={{ flex: 1, fontWeight: 500 }}>{panel.title}</span>
                <button
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, marginRight: 8 }}
                  title={panel.pinned ? 'Unpin' : 'Pin'}
                  onClick={() => handlePinPanel(columns.length-1, panel.id, !panel.pinned)}
                >
                  {panel.pinned ? (
                    // Pin: Gerade
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"/>
                    </svg>
                  ) : (
                    // Unpin: Pin mit diagonaler Linie
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"/>
                      <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </button>
                <button
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}
                  title="Schließen"
                  onClick={() => setOpenRightDrawer(null)}
                >✕</button>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>{panel.content}</div>
            </div>
          ))}
        </div>
      )}
      {/* ResizeHandle zwischen Center und rechter Spalte */}
      {columns.length > 1 && columns[columns.length-1] && columns[columns.length-1].panels.filter(p => p.pinned !== false).length > 0 && (
        <ResizeHandle
          position="horizontal"
          onResizeStart={e => handleColumnResizeStart(columns.length - 2, e)}
        />
      )}
      {/* Rechte Spalte (Panels mit pinned: true) */}
      {columns[columns.length-1] && columns[columns.length-1].panels.filter(p => p.pinned !== false).length > 0 && (
        <div
          className={clsx('docking-column', columns[columns.length-1].className, { 'docking-column--collapsed': columns[columns.length-1].collapsed })}
          style={{
            width: columns[columns.length-1].collapsed ? COLLAPSED_WIDTH : (columns[columns.length-1].width ? (typeof columns[columns.length-1].width === 'number' ? `${columns[columns.length-1].width}px` : columns[columns.length-1].width) : 220),
            minWidth: columns[columns.length-1].collapsed ? COLLAPSED_WIDTH : columns[columns.length-1].minWidth,
            maxWidth: columns[columns.length-1].collapsed ? COLLAPSED_WIDTH : columns[columns.length-1].maxWidth,
            flex: undefined,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Panels nur anzeigen, wenn nicht collapsed */}
          {!columns[columns.length-1].collapsed && columns[columns.length-1].panels.filter(p => p.pinned !== false).map((panel, idx, arr) => (
            <React.Fragment key={panel.id}>
              <Panel
                config={{ ...panel, center: true }}
                onToggle={(id: string, collapsed: boolean) => handlePanelToggle(columns[columns.length-1].id, id, collapsed)}
                onClose={(id: string) => handlePanelClose(columns[columns.length-1].id, id)}
                onPinChange={(id: string, pinned: boolean) => handlePinPanel(columns.length-1, id, pinned)}
              />
              {idx < arr.length - 1 && 
               arr[idx].resizable !== false && 
               arr[idx + 1].resizable !== false && (
                <ResizeHandle
                  position="vertical"
                  onResizeStart={(e: React.MouseEvent<HTMLDivElement>) => handleSplitResizeStart(columns.length-1, idx, e)}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
} 