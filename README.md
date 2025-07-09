# @ferdifighter/react-docking-layout

**Flexible, moderne Docking-Layout-Komponente für React – inspiriert von VS Code.**

Ideal für komplexe Web-UIs, Admin-Tools, Editoren, IDEs und überall, wo du Panels flexibel anordnen, ein-/ausblenden und verschieben möchtest.

---

## 🚀 Schnellstart

```bash
npm install @ferdifighter/react-docking-layout
```

**Wichtig:** Importiere die CSS- und Theme-Dateien in deinem Projekt:
```js
import "@ferdifighter/react-docking-layout/dist/styles.css";
import "@ferdifighter/react-docking-layout/dist/themes/dark.theme.css";
import "@ferdifighter/react-docking-layout/dist/themes/light.theme.css";
```

**Minimalbeispiel:**
```tsx
import React, { useState } from 'react';
import { DockingLayout, DockingLayoutConfig } from '@ferdifighter/react-docking-layout';

const initialConfig: DockingLayoutConfig = {
  columns: [
    {
      id: 'left',
      width: 220,
      panels: [
        { id: 'explorer', title: 'Explorer', content: <div>Explorer-Inhalt</div> },
      ],
    },
    {
      id: 'center',
      panels: [
        { id: 'editor', title: 'Editor', content: <div>Editor-Inhalt</div> },
      ],
    },
    {
      id: 'right',
      width: 260,
      panels: [
        { id: 'outline', title: 'Outline', content: <div>Outline-Inhalt</div> },
      ],
    },
  ],
};

export default function App() {
  const [config, setConfig] = useState(initialConfig);
  return <DockingLayout config={config} onLayoutChange={setConfig} />;
}
```

---

## ✨ Features & Beispiele

### 1. **Panel-Content: Beliebige Komponenten, Factories, Lazy-Loading**
```tsx
// Statischer JSX-Content
{ id: 'editor', title: 'Editor', content: <MeinEditor file="readme.md" /> }

// Dynamisch per Factory
{ id: 'editor', title: 'Editor', content: (panel) => <MeinEditor file={panel.file} /> }

// Mit contentRenderer für maximale Flexibilität
<DockingLayout
  config={config}
  contentRenderer={panel => typeof panel.content === 'function' ? panel.content(panel) : panel.content}
/>
```

### 2. **Panel schließen, ein-/ausblenden, Events**
```tsx
const [closedPanels, setClosedPanels] = useState<string[]>([]);

<DockingLayout
  config={config}
  closedPanels={closedPanels}
  onPanelClose={id => setClosedPanels(panels => [...panels, id])}
/>
```

### 3. **Theme wechseln (Light, Dark, Auto)**
```tsx
<DockingLayout config={config} theme="dark" />
<DockingLayout config={config} theme="light" />
<DockingLayout config={config} theme="auto" />
```

### 4. **Panel-spezifisches Styling per API**
```tsx
<DockingLayout
  config={config}
  panelStyles={{
    explorer: { panel: { backgroundColor: '#e3f2fd', borderColor: '#2196f3' } },
    terminal: { panel: { backgroundColor: '#222', color: '#fff' } },
  }}
/>
```

### 5. **Dynamische Styles (z.B. Zustand, User-Settings)**
```tsx
const [activePanel, setActivePanel] = useState('editor');

<DockingLayout
  config={config}
  panelStyles={{
    [activePanel]: { panel: { borderColor: 'red', boxShadow: '0 0 0 2px red' } }
  }}
/>
```

### 6. **Panel gezielt per CSS oder data-Attribut stylen**
```css
/* Per CSS-Klasse */
.docking-panel--id-explorer {
  background: #e0f7fa;
  border-color: #00bcd4;
}
/* Per data-Attribut */
.docking-panel[data-panel-id="terminal"] {
  background: #222;
  color: #fff;
}
```

### 7. **Globale Styles für alle Panels**
```tsx
<DockingLayout
  config={config}
  globalStyles={{
    panel: { borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    header: { fontSize: '15px', fontWeight: 'bold' },
  }}
/>
```

### 8. **Events & Callbacks**
```tsx
<DockingLayout
  config={config}
  onLayoutChange={newConfig => console.log('Layout geändert:', newConfig)}
  onPanelClose={panelId => alert('Panel geschlossen: ' + panelId)}
/>
```

### 9. **Responsives Verhalten & Custom CSS**
```css
@media (max-width: 800px) {
  .docking-layout {
    flex-direction: column;
  }
}
```

---

## 📚 API-Referenz (Auszug)

### DockingLayoutConfig
```ts
interface DockingLayoutConfig {
  columns: DockingColumnConfig[];
  className?: string;
  style?: React.CSSProperties;
  theme?: 'light' | 'dark' | 'auto';
}

interface DockingColumnConfig {
  id: string;
  width?: number | string;
  panels: DockingPanelConfig[];
}

interface DockingPanelConfig {
  id: string;
  title: string;
  position?: 'left' | 'right' | 'top' | 'bottom' | 'center';
  size?: number | string;
  minSize?: number;
  maxSize?: number;
  resizable?: boolean;
  collapsible?: boolean;
  collapsed?: boolean;
  closable?: boolean;
  pinned?: boolean;
  content?: React.ReactNode | ((panel: DockingPanelConfig) => React.ReactNode);
  className?: string;
  style?: React.CSSProperties;
}
```

### DockingLayout Props
```ts
interface DockingLayoutProps {
  config: DockingLayoutConfig;
  onLayoutChange?: (layout: DockingLayoutConfig) => void;
  className?: string;
  style?: React.CSSProperties;
  theme?: 'light' | 'dark' | 'auto';
  contentRenderer?: (panel: DockingPanelConfig) => React.ReactNode;
  panelStyles?: Record<string, PanelStyleConfig>;
  globalStyles?: StyleConfig;
  enablePanelStyling?: boolean;
}
```

### PanelStyleConfig (API für dynamische Styles)
```ts
interface PanelStyleConfig {
  panel?: React.CSSProperties;
  header?: React.CSSProperties;
  content?: React.CSSProperties;
  // ...weitere Bereiche (Tabs, ResizeHandle, Overlay, etc.)
  className?: { panel?: string; header?: string; ... };
  cssVariables?: Record<string, string>;
}
```

---

## 🛠️ Entwicklung & Beitrag

```bash
git clone <repo-url>
cd react-docking-layout
npm install
npm run dev
```

Pull Requests & Issues sind willkommen!

---

**Fragen, Wünsche, Feedback?**
Erstelle ein Issue oder schreib mir direkt! 