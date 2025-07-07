import React, { useState, useCallback, useRef, useEffect } from 'react'
import { DockingLayoutProps, DockingColumnConfig } from '../Types'
import { Panel } from './Panel'
import { ResizeHandle } from './ResizeHandle'
import clsx from 'clsx'

const COLLAPSED_WIDTH = 36

interface DockingLayoutWithClosedProps extends DockingLayoutProps {
  closedPanels: string[]
  onPanelClose: (panelId: string) => void
  contentRenderer?: (panel: any) => React.ReactNode
}

export const DockingLayout: React.FC<DockingLayoutWithClosedProps> = ({
  config,
  onLayoutChange,
  closedPanels,
  onPanelClose,
  className,
  style,
  contentRenderer,
}: DockingLayoutWithClosedProps) => {
  const [columns, setColumns] = useState<DockingColumnConfig[]>(config.columns)
  // Für Resizing: Referenz auf aktuelle Spalten
  const columnsRef = useRef(columns)
  columnsRef.current = columns

  // Drawer-Overlay-Logik für unpinned Panels (links)
  const [openLeftDrawer, setOpenLeftDrawer] = useState<string | null>(null)

  // GLOBALER STATE für aktives Bottom-Panel (Center-Bereich)
  const centerCol = config.columns.find(col => col.id === 'center');
  const bottomPanelsGlobal = centerCol ? centerCol.panels.filter(p => p.position === 'bottom') : [];
  const [activeBottomTabId, setActiveBottomTabId] = useState<string | null>(
    bottomPanelsGlobal.length > 0 ? bottomPanelsGlobal[0].id : null
  );
  // State für das ursprünglich aktive angepinnte Panel (für Click-Outside-Recovery)
  const [originalActiveTabId, setOriginalActiveTabId] = useState<string | null>(
    bottomPanelsGlobal.length > 0 ? bottomPanelsGlobal[0].id : null
  );

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

  useEffect(() => {
    if (!openRightDrawer) return
    const handleClick = (e: MouseEvent) => {
      const drawer = document.getElementById('right-drawer')
      if (drawer && !drawer.contains(e.target as Node)) {
        setOpenRightDrawer(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openRightDrawer])

  // Click-Outside-Logik für Center-Drawer (Bottom-Panel-Overlay)
  useEffect(() => {
    if (!activeBottomTabId) return
    const handleClick = (e: MouseEvent) => {
      const drawer = document.getElementById('center-drawer')
      if (drawer && !drawer.contains(e.target as Node)) {
        // Wenn wir ein ungepinntes Panel haben, gehe zurück zum ursprünglichen angepinnten Panel
        const currentActivePanel = bottomPanelsGlobal.find(p => p.id === activeBottomTabId);
        if (currentActivePanel && currentActivePanel.pinned === false) {
          setActiveBottomTabId(originalActiveTabId);
        } else {
          setActiveBottomTabId(null);
        }
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [activeBottomTabId, originalActiveTabId, bottomPanelsGlobal])

  // Pin/Unpin-Handler für Panels (Panel wird wirklich verschoben)
  const handlePinPanel = (colIdx: number, panelId: string, pinned: boolean) => {
    setColumns(prevCols => {
      const cols = [...prevCols];
      const col = { ...cols[colIdx] };
      let panels = col.panels.map(p =>
        p.id === panelId ? { ...p, pinned } : p
      );
      cols[colIdx] = { ...col, panels };
      onLayoutChange?.({ ...config, columns: cols })
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

  // Panel schließen: Callback an Demo-App
  const handlePanelClose = useCallback((panelId: string) => {
    onPanelClose(panelId)
    // Wenn das geschlossene Panel das aktive Bottom-Panel ist, Overlay schließen
    if (activeBottomTabId === panelId) {
      setActiveBottomTabId(null)
    }
  }, [onPanelClose, activeBottomTabId])

  // Panels nach closedPanels filtern
  const getVisibleColumns = useCallback(() => {
    return columns.map(col => ({
      ...col,
      panels: col.panels.filter(panel => !closedPanels.includes(panel.id))
    }))
  }, [columns, closedPanels])
  const visibleColumns = getVisibleColumns()

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
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        ...style,
      }}
    >
      {/* Overlay für geschlossene Panels wurde entfernt! */}
      {/* Sidebar für unpinned Panels und Collapse-Button: nur sichtbar, wenn unpinned Panels ODER collapsed (links) */}
      {visibleColumns[0] && (
        (visibleColumns[0].panels.some(panel => panel.pinned === false) || visibleColumns[0].collapsed) && (
          <div
            className="docking-sidebar docking-sidebar--left"
            style={{
              width: 36,
              background: 'var(--sidebar-bg)',
              color: 'var(--icon-color)',
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 3000,
              position: 'relative',
            }}
          >
            {visibleColumns[0].panels.filter(panel => panel.pinned === false).map(panel => (
              <button
                key={panel.id}
                style={{
                  width: 32,
                  height: 100,
                  margin: '6px 0',
                  border: 'none',
                  background: openLeftDrawer === panel.id ? 'var(--sidebar-tab-active-bg, var(--border))' : 'transparent',
                  color: 'var(--icon-color)',
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
      {openLeftDrawer && visibleColumns[0] && (
        <div
          id="left-drawer"
          style={{
            position: 'fixed',
            top: 0,
            left: 36,
            height: '100vh',
            width: 320,
            background: 'var(--panel-bg)',
            color: 'var(--icon-color)',
            borderRight: '1px solid var(--border)',
            boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
            zIndex: 4000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {visibleColumns[0].panels.filter(p => p.pinned === false && p.id === openLeftDrawer).map(panel => (
            <div key={panel.id} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <span style={{ flex: 1, fontWeight: 500 }}>{panel.title}</span>
                <button
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, marginRight: 8, color: 'var(--icon-color)' }}
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
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--icon-color)' }}
                  title="Schließen"
                  onClick={() => setOpenLeftDrawer(null)}
                >✕</button>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>{contentRenderer ? contentRenderer(panel) : panel.content}</div>
            </div>
          ))}
        </div>
      )}
      {visibleColumns[0] && visibleColumns[0].panels.filter(p => p.pinned !== false).length > 0 && (
        <div
          className={clsx('docking-column', visibleColumns[0].className, { 'docking-column--collapsed': visibleColumns[0].collapsed })}
          style={{
            width: visibleColumns[0].collapsed ? COLLAPSED_WIDTH : (visibleColumns[0].width ? (typeof visibleColumns[0].width === 'number' ? `${visibleColumns[0].width}px` : visibleColumns[0].width) : 220),
            minWidth: visibleColumns[0].collapsed ? COLLAPSED_WIDTH : visibleColumns[0].minWidth,
            maxWidth: visibleColumns[0].collapsed ? COLLAPSED_WIDTH : visibleColumns[0].maxWidth,
            flex: undefined,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Panels nur anzeigen, wenn nicht collapsed */}
          {!visibleColumns[0].collapsed && visibleColumns[0].panels.filter(p => p.pinned !== false).map((panel, idx, arr) => (
            <React.Fragment key={panel.id}>
              <Panel
                config={{ ...panel, center: true }}
                onToggle={(id: string, collapsed: boolean) => handlePanelToggle(visibleColumns[0].id, id, collapsed)}
                onClose={(id: string) => handlePanelClose(id)}
                onPinChange={(id: string, pinned: boolean) => handlePinPanel(0, id, pinned)}
                contentRenderer={contentRenderer}
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
      {visibleColumns.length > 1 && visibleColumns[0] && visibleColumns[0].panels.filter(p => p.pinned !== false).length > 0 && (
        <ResizeHandle
          position="horizontal"
          onResizeStart={e => handleColumnResizeStart(0, e)}
        />
      )}
      {visibleColumns.map((col, colIdx) => {
        if (colIdx === 0 || colIdx === visibleColumns.length - 1) return null; // Linke und rechte Spalte werden separat gerendert!
        // Neue Flex-Logik: Nur die mittlere Spalte (center) ist flexibel
        let style: React.CSSProperties = {
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...col.style,
        };
        if (colIdx === 0 || colIdx === visibleColumns.length - 1) {
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
          const centerPanels = col.panels.filter(p => p.position !== 'bottom');
          const bottomPanels = col.panels.filter(p => p.position === 'bottom');
          // Synchronisiere activeBottomTabId, wenn Panels sich ändern
          React.useEffect(() => {
            // Wenn das aktuell aktive Panel nicht mehr existiert, wähle das erste Panel oder null
            if (activeBottomTabId && !bottomPanels.find(p => p.id === activeBottomTabId)) {
              setActiveBottomTabId(bottomPanels.length > 0 ? bottomPanels[0].id : null);
            }
          }, [bottomPanels.map(p => p.id).join(',')]);
          const activeBottomPanel = bottomPanels.find(p => p.id === activeBottomTabId);
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
              {/* Center-Panels wie bisher normal anzeigen */}
              {!col.collapsed && centerPanels.map((panel, idx) => (
                <React.Fragment key={panel.id}>
                  <Panel
                    config={{ ...panel, center: true }}
                    onToggle={(id: string, collapsed: boolean) => handlePanelToggle(col.id, id, collapsed)}
                    onClose={(id: string) => handlePanelClose(id)}
                    onPinChange={(id: string, pinned: boolean) => {
                      handlePinPanel(colIdx, id, pinned);
                      // Wenn ein Bottom-Panel ungepinnt wird, Overlay schließen
                      if (panel.position === 'bottom' && pinned === false) {
                        setActiveBottomTabId(null);
                      }
                    }}
                    contentRenderer={contentRenderer}
                  />
                  {/* ResizeHandle nur zwischen centerPanels, wenn beide resizable sind */}
                  {idx < centerPanels.length - 1 &&
                    centerPanels[idx].resizable !== false &&
                    centerPanels[idx + 1].resizable !== false && (
                      <ResizeHandle
                        position="vertical"
                        onResizeStart={(e: React.MouseEvent<HTMLDivElement>) => handleSplitResizeStart(colIdx, idx, e)}
                      />
                    )}
                </React.Fragment>
              ))}
              {/* Tabbar unten für Bottom-Panels */}
              {bottomPanels.length > 0 && (
                <div className="panel-header">
                  <div style={{ display: 'flex', height: 28 }}>
                    {bottomPanels.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          // Wenn wir von einem angepinnten Panel zu einem ungepinnten wechseln, speichere das ursprüngliche
                          const currentActivePanel = bottomPanels.find(p => p.id === activeBottomTabId);
                          if (currentActivePanel && currentActivePanel.pinned !== false && tab.pinned === false) {
                            setOriginalActiveTabId(activeBottomTabId);
                          }
                          setActiveBottomTabId(tab.id);
                        }}
                        className={activeBottomTabId === tab.id ? 'tab active tab-bottom-active' : 'tab'}
                        style={{
                          padding: '4px 14px',
                          border: 'none',
                          borderBottom: activeBottomTabId === tab.id ? '2px solid var(--tab-active)' : 'none',
                          background: 'var(--tab-bg)',
                          cursor: 'pointer',
                          fontWeight: activeBottomTabId === tab.id ? 600 : 400,
                          color: activeBottomTabId === tab.id ? 'var(--tab-fg-active)' : 'var(--tab-fg)',
                          height: '100%',
                        }}
                      >
                        {tab.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Bottom-Panel anzeigen: als Overlay, wenn ungepinnt, sonst normal */}
              {activeBottomPanel && activeBottomPanel.pinned !== false && !col.collapsed && (
                <Panel
                  key={activeBottomPanel.id}
                  config={{ ...activeBottomPanel, center: true }}
                  onToggle={(id: string, collapsed: boolean) => handlePanelToggle(col.id, id, collapsed)}
                  onClose={(id: string) => handlePanelClose(id)}
                  onPinChange={(id: string, pinned: boolean) => handlePinPanel(colIdx, id, pinned)}
                  contentRenderer={contentRenderer}
                />
              )}
              {activeBottomPanel && activeBottomPanel.pinned === false && (
                <div
                  id="center-drawer"
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 28, // Höhe der Tabs-Leiste
                    height: '40vh',
                    background: 'var(--panel-bg)',
                    color: 'var(--foreground)',
                    borderTop: '1px solid var(--border)',
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
                    zIndex: 4000,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div className="panel-header">
                    <span style={{ flex: 1, fontWeight: 500 }}>{activeBottomPanel.title}</span>
                    <button
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, marginRight: 8, color: 'var(--icon-color)' }}
                      title={activeBottomPanel.pinned ? 'Unpin' : 'Pin'}
                      onClick={() => { 
                        handlePinPanel(colIdx, activeBottomPanel.id, !activeBottomPanel.pinned); 
                        // Wenn Panel angepinnt wird, setze es als aktives Panel
                        if (activeBottomPanel.pinned === false) {
                          setActiveBottomTabId(activeBottomPanel.id);
                        } else {
                          setActiveBottomTabId(null);
                        }
                      }}
                    >
                      {activeBottomPanel.pinned ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"/>
                          <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                    <button
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--icon-color)' }}
                      title="Schließen"
                      onClick={() => {
                        // Wenn wir ein ungepinntes Panel haben, gehe zurück zum ursprünglichen angepinnten Panel
                        const currentActivePanel = bottomPanelsGlobal.find(p => p.id === activeBottomTabId);
                        if (currentActivePanel && currentActivePanel.pinned === false) {
                          setActiveBottomTabId(originalActiveTabId);
                        } else {
                          setActiveBottomTabId(null);
                        }
                      }}
                    >✕</button>
                  </div>
                  <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>{activeBottomPanel.content}</div>
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
                    onClose={(id: string) => handlePanelClose(id)}
                    onPinChange={(id: string, pinned: boolean) => handlePinPanel(colIdx, id, pinned)}
                    contentRenderer={contentRenderer}
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
                    onClose={(id: string) => handlePanelClose(id)}
                    onPinChange={(id: string, pinned: boolean) => handlePinPanel(colIdx, id, pinned)}
                    contentRenderer={contentRenderer}
                  />
                </div>
              ))}
            </div>
            {/* Moderner Spalten-ResizeHandle (außer nach der letzten Spalte) */}
            {colIdx < visibleColumns.length - 1 && (
              <ResizeHandle
                position="horizontal"
                onResizeStart={(e: React.MouseEvent<HTMLDivElement>) => handleColumnResizeStart(colIdx, e)}
              />
            )}
          </React.Fragment>
        )
      })}
      {/* Sidebar für unpinned Panels und Collapse-Button: nur sichtbar, wenn unpinned Panels ODER collapsed (rechts) */}
      {visibleColumns[visibleColumns.length-1] && (
        (visibleColumns[visibleColumns.length-1].panels.some(panel => panel.pinned === false) || visibleColumns[visibleColumns.length-1].collapsed) && (
          <div
            className="docking-sidebar docking-sidebar--right"
            style={{
              width: 36,
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
            {visibleColumns[visibleColumns.length-1].panels.filter(panel => panel.pinned === false).map(panel => (
              <button
                key={panel.id}
                className={clsx('sidebar-tab-btn', { active: openRightDrawer === panel.id })}
                style={{
                  width: 32,
                  height: 100,
                  margin: '6px 0',
                  borderRadius: 4,
                  fontWeight: 500,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  position: 'relative',
                  color: 'var(--icon-color)'
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
      {openRightDrawer && visibleColumns[visibleColumns.length-1] && (
        <div
          id="right-drawer"
          className="drawer-overlay"
          style={{
            right: 36,
          }}
        >
          {visibleColumns[visibleColumns.length-1].panels.filter(p => p.pinned === false && p.id === openRightDrawer).map(panel => (
            <div key={panel.id} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="panel-header">
                <span style={{ flex: 1, fontWeight: 500 }}>{panel.title}</span>
                <button
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, marginRight: 8, color: 'var(--icon-color)' }}
                  title={panel.pinned ? 'Unpin' : 'Pin'}
                  onClick={() => handlePinPanel(visibleColumns.length-1, panel.id, !panel.pinned)}
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
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--icon-color)' }}
                  title="Schließen"
                  onClick={() => setOpenRightDrawer(null)}
                >✕</button>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>{contentRenderer ? contentRenderer(panel) : panel.content}</div>
            </div>
          ))}
        </div>
      )}
      {/* ResizeHandle zwischen Center und rechter Spalte */}
      {visibleColumns.length > 1 && visibleColumns[visibleColumns.length-1] && visibleColumns[visibleColumns.length-1].panels.filter(p => p.pinned !== false).length > 0 && (
        <ResizeHandle
          position="horizontal"
          onResizeStart={e => handleColumnResizeStart(visibleColumns.length - 2, e)}
        />
      )}
      {/* Rechte Spalte (Panels mit pinned: true) */}
      {visibleColumns[visibleColumns.length-1] && visibleColumns[visibleColumns.length-1].panels.filter(p => p.pinned !== false).length > 0 && (
        <div
          className={clsx('docking-column', visibleColumns[visibleColumns.length-1].className, { 'docking-column--collapsed': visibleColumns[visibleColumns.length-1].collapsed })}
          style={{
            width: visibleColumns[visibleColumns.length-1].collapsed ? COLLAPSED_WIDTH : (visibleColumns[visibleColumns.length-1].width ? (typeof visibleColumns[visibleColumns.length-1].width === 'number' ? `${visibleColumns[visibleColumns.length-1].width}px` : visibleColumns[visibleColumns.length-1].width) : 220),
            minWidth: visibleColumns[visibleColumns.length-1].collapsed ? COLLAPSED_WIDTH : visibleColumns[visibleColumns.length-1].minWidth,
            maxWidth: visibleColumns[visibleColumns.length-1].collapsed ? COLLAPSED_WIDTH : visibleColumns[visibleColumns.length-1].maxWidth,
            flex: undefined,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Panels nur anzeigen, wenn nicht collapsed */}
          {!visibleColumns[visibleColumns.length-1].collapsed && visibleColumns[visibleColumns.length-1].panels.filter(p => p.pinned !== false).map((panel, idx, arr) => (
            <React.Fragment key={panel.id}>
              <Panel
                config={{ ...panel, center: true }}
                onToggle={(id: string, collapsed: boolean) => handlePanelToggle(visibleColumns[visibleColumns.length-1].id, id, collapsed)}
                onClose={(id: string) => handlePanelClose(id)}
                onPinChange={(id: string, pinned: boolean) => handlePinPanel(visibleColumns.length-1, id, pinned)}
                contentRenderer={contentRenderer}
              />
              {idx < arr.length - 1 && 
               arr[idx].resizable !== false && 
               arr[idx + 1].resizable !== false && (
                <ResizeHandle
                  position="vertical"
                  onResizeStart={(e: React.MouseEvent<HTMLDivElement>) => handleSplitResizeStart(visibleColumns.length-1, idx, e)}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
} 