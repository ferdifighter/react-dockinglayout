# React Docking Layout

Eine flexible und wiederverwendbare React-Komponente für Docking-Layouts, ähnlich wie in VS Code. Diese Komponente ermöglicht es, Panels an verschiedenen Positionen (links, rechts, oben, unten, zentriert) zu platzieren und deren Größe anzupassen.

## Features

- 🎯 **Flexible Panel-Positionen**: left, right, top, bottom, center
- ⚙️ **JSON-Konfiguration**: Einfache Konfiguration über JSON
- 🎨 **Vollständig anpassbar**: Alle Styles können angepasst werden
- 📦 **Wiederverwendbar**: Als npm-Paket verwendbar
- 🔄 **Resizable Panels**: Größenänderung durch Drag & Drop
- 📱 **Responsive**: Funktioniert auf verschiedenen Bildschirmgrößen
- 🎭 **Collapsible Panels**: Panels können ein- und ausgeklappt werden
- 🎨 **Theme-Support**: Light, Dark und Auto-Themes

## Installation

```bash
npm install react-docking-layout
```

## Verwendung

### Grundlegende Verwendung

```tsx
import React, { useState } from 'react'
import { DockingLayout, DockingLayoutConfig } from 'react-docking-layout'

const App: React.FC = () => {
  const [layoutConfig, setLayoutConfig] = useState<DockingLayoutConfig>({
    panels: [
      {
        id: 'sidebar',
        title: 'Sidebar',
        position: 'left',
        size: 250,
        content: <div>Sidebar Inhalt</div>,
      },
      {
        id: 'main',
        title: 'Hauptbereich',
        position: 'center',
        content: <div>Hauptinhalt</div>,
      },
      {
        id: 'output',
        title: 'Output',
        position: 'bottom',
        size: 200,
        content: <div>Output Bereich</div>,
      },
    ],
  })

  return (
    <DockingLayout
      config={layoutConfig}
      onLayoutChange={setLayoutConfig}
    />
  )
}
```

### Erweiterte Konfiguration

```tsx
const advancedConfig: DockingLayoutConfig = {
  panels: [
    {
      id: 'explorer',
      title: 'Explorer',
      position: 'left',
      size: 250,
      minSize: 150,
      maxSize: 500,
      resizable: true,
      collapsible: true,
      collapsed: false,
      content: <FileExplorer />,
      className: 'custom-explorer',
      style: { backgroundColor: '#f5f5f5' },
    },
    {
      id: 'editor',
      title: 'Code Editor',
      position: 'center',
      content: <CodeEditor />,
    },
    {
      id: 'terminal',
      title: 'Terminal',
      position: 'bottom',
      size: 200,
      minSize: 100,
      maxSize: 400,
      resizable: true,
      collapsible: true,
      content: <Terminal />,
    },
  ],
  showResizeHandles: true,
  showPanelHeaders: true,
  defaultPanelSize: 250,
  minPanelSize: 100,
  maxPanelSize: 800,
  theme: 'dark',
  className: 'my-docking-layout',
  style: { height: '100vh' },
}
```

## API-Referenz

### DockingLayoutConfig

```typescript
interface DockingLayoutConfig {
  panels: PanelConfig[]
  className?: string
  style?: React.CSSProperties
  theme?: 'light' | 'dark' | 'auto'
  showResizeHandles?: boolean
  showPanelHeaders?: boolean
  defaultPanelSize?: number
  minPanelSize?: number
  maxPanelSize?: number
}
```

### PanelConfig

```typescript
interface PanelConfig {
  id: string
  title: string
  position: 'left' | 'right' | 'top' | 'bottom' | 'center'
  size?: number | string
  minSize?: number
  maxSize?: number
  resizable?: boolean
  collapsible?: boolean
  collapsed?: boolean
  content: React.ReactNode
  className?: string
  style?: React.CSSProperties
}
```

### DockingLayoutProps

```typescript
interface DockingLayoutProps {
  config: DockingLayoutConfig
  onLayoutChange?: (layout: DockingLayoutConfig) => void
  className?: string
  style?: React.CSSProperties
}
```

## Panel-Positionen

- **left**: Panel wird links angezeigt
- **right**: Panel wird rechts angezeigt
- **top**: Panel wird oben angezeigt
- **bottom**: Panel wird unten angezeigt
- **center**: Panel wird im zentralen Bereich angezeigt

## Styling

Die Komponente verwendet CSS-Klassen für einfache Anpassungen:

```css
/* Hauptcontainer */
.docking-layout {
  /* Deine Styles */
}

/* Panel-Container */
.docking-panel {
  /* Deine Styles */
}

/* Panel-Header */
.panel-header {
  /* Deine Styles */
}

/* Resize-Handle */
.resize-handle {
  /* Deine Styles */
}

/* Position-spezifische Klassen */
.docking-panel--left { }
.docking-panel--right { }
.docking-panel--top { }
.docking-panel--bottom { }
.docking-panel--center { }
```

## Events

### onLayoutChange

Wird aufgerufen, wenn sich das Layout ändert (Resize, Toggle, Close):

```tsx
const handleLayoutChange = (newConfig: DockingLayoutConfig) => {
  console.log('Layout geändert:', newConfig)
  // Speichere Layout in localStorage oder sende an Server
}
```

## Entwicklung

### Setup

```bash
git clone <repository>
cd react-docking-layout
npm install
```

### Entwicklungsserver starten

```bash
npm run dev
```

### Build erstellen

```bash
npm run build
```

### Tests ausführen

```bash
npm test
```

## Lizenz

MIT

## Beitragen

Beiträge sind willkommen! Bitte erstelle einen Pull Request oder öffne ein Issue. 