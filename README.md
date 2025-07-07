# React Docking Layout

**Flexible, moderne Docking-Layout-Komponente für React – inspiriert von VS Code.**

Ideal für komplexe Web-UIs, Admin-Tools, Editoren, IDEs und überall, wo du Panels flexibel anordnen, ein-/ausblenden und verschieben möchtest.

---

## 🚀 Schnellstart

```bash
npm install react-docking-layout
```

> **Wichtig:** Importiere die CSS- und Theme-Dateien in deinem Projekt:
> ```js
> import "@ferdifighter/react-docking-layout/dist/styles.css";
> import "@ferdifighter/react-docking-layout/dist/themes/dark.theme.css";
> import "@ferdifighter/react-docking-layout/dist/themes/light.theme.css";
> ```

```tsx
import React, { useState } from 'react';
import { DockingLayout, DockingLayoutConfig } from 'react-docking-layout';

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

## ✨ Features
- **Panels überall:** links, rechts, oben, unten, zentriert
- **Resizable & Collapsible:** Panels per Drag & Drop verschieben, ein-/ausklappen
- **Flexible Content-API:** Beliebige React-Komponenten, Factories, Lazy-Loading (über `contentRenderer`)
- **Themes:** Light, Dark, Auto (systemabhängig)
- **Responsiv:** Funktioniert auf allen Bildschirmgrößen
- **Events:** Layout-Änderungen abfangen (`onLayoutChange`)
- **Custom Styling:** Eigene CSS-Klassen, Themes, Inline-Styles

---

## 🧩 Flexible Content-API

Du kannst Panels mit statischem JSX, eigenen Komponenten, dynamischen Factories oder sogar Lazy-Loading befüllen:

```tsx
const panelConfig = {
  id: 'editor',
  title: 'Editor',
  content: <MeinEditor file="readme.md" />,
};

// Oder dynamisch:
const panelConfig = {
  id: 'editor',
  title: 'Editor',
  content: (panel) => <MeinEditor file={panel.file} />,
};

// Oder via contentRenderer für maximale Flexibilität:
<DockingLayout
  config={config}
  contentRenderer={panel => {
    if (typeof panel.content === 'function') return panel.content(panel);
    return panel.content;
  }}
/>
```

---

## 🎨 Themes & Styling

- **Dark/Light/Auto:**
  ```tsx
  <DockingLayout config={config} theme="dark" />
  <DockingLayout config={config} theme="light" />
  <DockingLayout config={config} theme="auto" />
  ```
- **Eigene Styles:**
  - Passe CSS-Variablen oder Klassen an (`.docking-layout`, `.docking-panel`, `.panel-header` ...)
  - Eigene Theme-Dateien möglich

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
}
```

---

## ⚡️ Events & Callbacks

- **onLayoutChange:**
  Wird bei jeder Änderung (Resize, Panel schließen, etc.) aufgerufen.
  ```tsx
  <DockingLayout onLayoutChange={newConfig => console.log(newConfig)} ... />
  ```

---

## 🛠️ Eigene Komponenten & Tipps
- Du kannst beliebige React-Komponenten als Panel-Content verwenden
- Auch dynamische Factories oder Lazy-Loading sind möglich
- Nutze `contentRenderer` für maximale Flexibilität
- Panels können beliebige Props erhalten (z.B. file, user, etc.)

---

## 🎨 Styling & Anpassung
- Passe die mitgelieferten CSS-Variablen/Themes an
- Überschreibe Klassen wie `.docking-layout`, `.docking-panel`, `.panel-header` usw.
- Eigene Themes: Kopiere und passe die Theme-Dateien in `src/themes/` an

---

## 🧑‍💻 Entwicklung & Beitrag

```bash
git clone <repo-url>
cd react-docking-layout
npm install
npm run dev
```

Pull Requests & Issues sind willkommen!

---

## 📄 Lizenz
MIT

---

**Hinweis:** Dieses Projekt wurde mit Vibe Coding erstellt.

---

## 🟢 Panels per State/Checkbox steuern (controlled usage)

Du kannst die Sichtbarkeit der Panels komplett von außen steuern – z. B. mit Checkboxen in deiner App (wie in der Demo):

```tsx
const [closedPanels, setClosedPanels] = useState<string[]>([]);

// In deiner Toolbox:
{allPanels.map(panel => (
  <label key={panel.id}>
    <input
      type="checkbox"
      checked={!closedPanels.includes(panel.id)}
      onChange={e => {
        setClosedPanels(prev =>
          e.target.checked
            ? prev.filter(id => id !== panel.id)
            : [...prev, panel.id]
        );
      }}
    />
    {panel.title}
  </label>
))}

// Beim Rendern:
<DockingLayout
  config={config}
  closedPanels={closedPanels}
  onPanelClose={panelId => setClosedPanels(prev => [...prev, panelId])}
/>
```

So hast du die volle Kontrolle, welche Panels angezeigt werden – ideal für Toolbars, User-Settings oder dynamische Layouts!

--- 