import React, { useState } from 'react'
import { DockingLayout, DockingLayoutConfig } from '../src'

const DemoApp: React.FC = () => {
  const [layoutConfig, setLayoutConfig] = useState<DockingLayoutConfig>({
    columns: [
      {
        id: 'left',
        width: 220,
        panels: [
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
        ],
      },
      {
        id: 'center',
        panels: [
          {
            id: 'editor',
            title: 'Editor',
            closable: false,
            content: (
              <div>
                <h2>Willkommen zur React Docking Layout Demo</h2>
                <p>Dies ist der zentrale Editorbereich.</p>
              </div>
            ),
          },
          {
            id: 'output',
            title: 'Output',
            content: (
              <div>
                <h3>System Output</h3>
                <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                  <div>✅ Anwendung gestartet</div>
                  <div>📦 Dependencies geladen</div>
                  <div>🚀 React Docking Layout bereit</div>
                </div>
              </div>
            ),
            size: 120,
            resizable: true,
          },
        ],
      },
      {
        id: 'right',
        width: 260,
        panels: [
          {
            id: 'outline',
            title: 'Outline',
            pinned: true,
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
            pinned: true,
            content: (
              <div>
                <h3>Problems</h3>
                <div style={{ color: '#ff6b6b' }}>❌ 2 Fehler gefunden</div>
                <div style={{ color: '#ff6b6b' }}>⚠️ 1 Warnung</div>
              </div>
            ),
          },
        ],
      },
    ],
  })

  const handleLayoutChange = (newConfig: DockingLayoutConfig) => {
    setLayoutConfig(newConfig)
    console.log('Layout geändert:', newConfig)
  }

  return (
    <DockingLayout
      config={layoutConfig}
      onLayoutChange={handleLayoutChange}
      style={{
        height: '100vh',
        width: '100vw',
      }}
    />
  )
}

export default DemoApp 