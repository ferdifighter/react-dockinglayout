import React, { useState, useMemo, Suspense } from 'react'
import { 
  DockingLayout, 
  DockingLayoutConfig, 
  DockingPanelConfig
} from '../src'
import { Tabs } from '../src'
import '../src/styles.css';
import '../src/themes/dark.theme.css';
import '../src/themes/light.theme.css';
import './App.css'

const PANEL_IDS = ['explorer', 'search', 'toolbox', 'editor', 'console', 'outline', 'problems']

const DemoApp: React.FC = () => {
  // State für geschlossene Panels
  const [closedPanels, setClosedPanels] = useState<string[]>([])
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto')
  const [enablePanelStyling, setEnablePanelStyling] = useState(true)

  // Panel-spezifische Styles für die Demo
  const panelStyles = useMemo(() => ({
    explorer: {
      panel: {
        backgroundColor: '#e3f2fd',
        borderColor: '#2196f3',
        borderRadius: '8px',
      },
      header: {
        backgroundColor: '#bbdefb',
        color: '#1565c0',
        fontWeight: '600',
      },
      content: {
        backgroundColor: '#f3e5f5',
        color: '#4a148c',
      }
    },
    terminal: {
      panel: {
        backgroundColor: '#263238',
        borderColor: '#455a64',
      },
      header: {
        backgroundColor: '#37474f',
        color: '#eceff1',
        fontWeight: '600',
      },
      content: {
        backgroundColor: '#263238',
        color: '#eceff1',
        fontFamily: 'monospace',
      }
    },
    problems: {
      panel: {
        backgroundColor: '#ffebee',
        borderColor: '#f44336',
      },
      header: {
        backgroundColor: '#ffcdd2',
        color: '#c62828',
        fontWeight: '600',
      },
      content: {
        backgroundColor: '#ffebee',
        color: '#c62828',
      }
    },
    output: {
      panel: {
        backgroundColor: '#e8f5e8',
        borderColor: '#4caf50',
      },
      header: {
        backgroundColor: '#c8e6c9',
        color: '#2e7d32',
        fontWeight: '600',
      },
      content: {
        backgroundColor: '#e8f5e8',
        color: '#2e7d32',
        fontFamily: 'monospace',
      }
    }
  }), [])

  // Global Styles für die Demo
  const globalStyles = useMemo(() => ({
    panel: {
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    header: {
      fontSize: '14px',
      fontWeight: '500',
    },
    tabs: {
      backgroundColor: '#f5f5f5',
      activeBackgroundColor: '#ffffff',
      color: '#333333',
      activeColor: '#000000',
    }
  }), [])

  // Panels aus der Konfiguration extrahieren (nur schließbare, keine Toolbox)
  const getClosablePanels = (config: DockingLayoutConfig): { id: string; title: string }[] => {
    const result: { id: string; title: string }[] = []
    config.columns.forEach(col => {
      col.panels.forEach(panel => {
        if (panel.id !== 'toolbox' && panel.closable !== false) {
          result.push({ id: panel.id, title: panel.title })
        }
      })
    })
    return result
  }

  // Panels filtern je nach Sichtbarkeit
  const filterPanels = (panels: DockingPanelConfig[]) => panels.filter(p => !closedPanels.includes(p.id))

  // Die Panel-Konfiguration
  const [layoutConfig, setLayoutConfig] = useState<DockingLayoutConfig>({
    columns: [
      {
        id: 'left',
        width: 220,
        panels: filterPanels([
          {
            id: 'explorer',
            title: 'Explorer',
            closable: false,
            pinned: true,
            content: (
              <div>
                <h3>Navigation</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li>🏠 Dashboard</li>
                  <li>📁 Projekte</li>
                  <li>👥 Benutzer</li>
                  <li>⚙️ Einstellungen</li>
                </ul>
              </div>
            ),
          },
          {
            id: 'search',
            title: 'Suche',
            closable: false,
            pinned: true,
            content: (
              <div>
                <h3>Suche</h3>
                <input type="text" placeholder="Suchen..." style={{ width: '100%' }} />
              </div>
            ),
          },
        ]),
      },
      {
        id: 'center',
        panels: filterPanels([
          {
            id: 'toolbox',
            title: 'Toolbox',
            closable: false,
            canPin: false,
            hideHeader: true,
            resizable: false,
            size: 150,
            content: null, // Wird unten gesetzt
          },
          {
            id: 'editor',
            title: 'Editor',
            closable: false,
            canPin: false,
            hideHeader: true,
            content: (
              <div>
                <h2>Willkommen zur React Docking Layout Demo</h2>
                <p>Dies ist der zentrale Editorbereich.</p>
                <p>Sie können Panels über die Toolbox ein- und ausblenden!</p>
              </div>
            ),
          },
          {
            id: 'output',
            title: 'Output',
            closable: true,
            position: 'bottom',
            size: 200,
            resizable: true,
            pinned: true,
            content: (
              <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                <div>✅ Anwendung gestartet</div>
                <div>📦 Dependencies geladen</div>
                <div>🚀 React Docking Layout bereit</div>
              </div>
            ),
          },
          {
            id: 'terminal',
            title: 'Terminal',
            closable: true,
            position: 'bottom',
            size: 200,
            resizable: true,
            pinned: false,
            contentPadding: 8, // Weniger Padding für Terminal
            content: (
              <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                <div>user@host:~$ echo Hallo Welt</div>
                <div>Hallo Welt</div>
              </div>
            ),
          },
        ]),
      },
      {
        id: 'right',
        width: 260,
        panels: filterPanels([
          {
            id: 'outline',
            title: 'Outline',
            closable: true,
            pinned: true,
            contentPadding: 16, // Mehr Padding für Outline
            content: (
              <div>
                <h3>Outline</h3>
                <ul>
                  <li>Section 1</li>
                  <li>Section 2</li>
                  <li>Section 3</li>
                </ul>
              </div>
            ),
          },
          {
            id: 'problems',
            title: 'Problems',
            closable: true,
            pinned: true,
            content: (
              <div>
                <h3>Problems</h3>
                <div style={{ color: '#ff6b6b' }}>❌ 2 Fehler gefunden</div>
                <div style={{ color: '#ff6b6b' }}>⚠️ 1 Warnung</div>
              </div>
            ),
          },
        ]),
      },
    ],
    closedPanels,
    theme,
  })

  // Toolbox-Content dynamisch setzen (nachdem layoutConfig initialisiert ist)
  const closablePanels = getClosablePanels(layoutConfig)
  layoutConfig.columns[1].panels[0].content = (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Toolbox</h2>
        <div style={{ marginLeft: 'auto' }}>
          <label style={{ fontSize: 13, fontWeight: 500 }}>
            Theme:
            <select
              value={theme}
              onChange={e => setTheme(e.target.value as any)}
              style={{ marginLeft: 8 }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </label>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>Styling-Optionen:</strong>
        <div style={{
          marginTop: 6,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: 13 }}>
            <input
              type="checkbox"
              checked={enablePanelStyling}
              onChange={e => setEnablePanelStyling(e.target.checked)}
              style={{ marginRight: 6 }}
            />
            Panel-spezifische Styles aktivieren
          </label>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>Panels ein-/ausblenden:</strong>
        <div style={{
          marginTop: 6,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px 16px',
          alignItems: 'center',
        }}>
          {closablePanels.map(panel => (
            <label key={panel.id} style={{ display: 'flex', alignItems: 'center', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={!closedPanels.includes(panel.id)}
                onChange={e => {
                  setClosedPanels(prev =>
                    e.target.checked
                      ? prev.filter(id => id !== panel.id)
                      : [...prev, panel.id]
                  )
                }}
                style={{ marginRight: 6 }}
              />
              {panel.title}
            </label>
          ))}
        </div>
      </div>
      <p style={{ marginTop: 16, color: '#888', fontSize: 12 }}>
        Die Toolbox kann nicht geschlossen werden.
      </p>
    </div>
  )

  const handleLayoutChange = (newConfig: DockingLayoutConfig) => {
    setLayoutConfig(newConfig)
  }

  const handlePanelClose = (panelId: string) => {
    setClosedPanels(prev => prev.includes(panelId) ? prev : [...prev, panelId])
  }

  // Theme-Klasse am Body setzen (für Demo, in HomeAssistant ggf. am Root-Element)
  React.useEffect(() => {
    const root = document.body
    root.classList.remove('theme-light', 'theme-dark')
    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      root.classList.add(mq.matches ? 'theme-dark' : 'theme-light')
    } else {
      root.classList.add(`theme-${theme}`)
    }
  }, [theme])

  return (
    <DockingLayout
      config={layoutConfig}
      onLayoutChange={handleLayoutChange}
      onPanelClose={handlePanelClose}
      closedPanels={closedPanels}
      panelStyles={enablePanelStyling ? panelStyles : undefined}
      globalStyles={enablePanelStyling ? globalStyles : undefined}
      theme={theme}
      enablePanelStyling={enablePanelStyling}
      style={{
        height: '100vh',
        width: '100vw',
      }}
    />
  )
}

export default DemoApp 