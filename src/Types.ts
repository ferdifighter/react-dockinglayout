export type PanelPosition = 'left' | 'right' | 'top' | 'bottom' | 'center'

export interface DockingPanelConfig {
  id: string
  title: string
  position?: PanelPosition
  size?: number | string
  minSize?: number
  maxSize?: number
  resizable?: boolean
  collapsible?: boolean
  collapsed?: boolean
  closable?: boolean
  pinned?: boolean
  canPin?: boolean
  hideHeader?: boolean
  content?: React.ReactNode
  tabs?: { label: string; content: React.ReactNode }[]
  className?: string
  style?: React.CSSProperties
  center?: boolean
  contentPadding?: number | string // Padding für den Panel-Content (z.B. 12, '16px', '1rem')
}

export interface DockingColumnConfig {
  id: string
  width?: number | string // z.B. 250, '20%', 'auto'
  minWidth?: number
  maxWidth?: number
  resizable?: boolean
  collapsed?: boolean
  panels: DockingPanelConfig[]
  className?: string
  style?: React.CSSProperties
}

export interface DockingLayoutConfig {
  columns: DockingColumnConfig[]
  closedPanels?: string[] // IDs der geschlossenen Panels
  className?: string
  style?: React.CSSProperties
  theme?: 'light' | 'dark' | 'auto'
}

export interface DockingPanelProps {
  config: DockingPanelConfig
  onResize?: (id: string, size: number) => void
  onToggle?: (id: string, collapsed: boolean) => void
  onClose?: (id: string) => void
  className?: string
  style?: React.CSSProperties
}

export interface ResizeHandleProps {
  position: 'horizontal' | 'vertical'
  onResize: (delta: number) => void
  className?: string
  style?: React.CSSProperties
}

export interface DockingLayoutProps {
  config: DockingLayoutConfig
  onLayoutChange?: (config: DockingLayoutConfig) => void
  className?: string
  style?: React.CSSProperties
  contentRenderer?: (panel: DockingPanelConfig) => React.ReactNode
  // Neue Styling-Optionen
  panelStyles?: Record<string, PanelStyleConfig>
  globalStyles?: StyleConfig
  theme?: string | ThemeConfig
  enablePanelStyling?: boolean
}

export interface PanelStyleConfig {
  // Panel-spezifische Styles
  panel?: {
    backgroundColor?: string
    borderColor?: string
    borderRadius?: string
    boxShadow?: string
    borderWidth?: string
    borderStyle?: string
  }
  // Header-spezifische Styles
  header?: {
    backgroundColor?: string
    color?: string
    fontSize?: string
    fontWeight?: string
    padding?: string
    borderBottomColor?: string
    borderBottomWidth?: string
    borderBottomStyle?: string
  }
  // Content-spezifische Styles
  content?: {
    backgroundColor?: string
    color?: string
    padding?: string
    fontSize?: string
    lineHeight?: string
  }
  // Tab-spezifische Styles
  tabs?: {
    backgroundColor?: string
    activeBackgroundColor?: string
    color?: string
    activeColor?: string
    borderColor?: string
    fontSize?: string
    fontWeight?: string
  }
  // Resize-Handle-spezifische Styles
  resizeHandle?: {
    backgroundColor?: string
    hoverBackgroundColor?: string
    width?: string
    height?: string
  }
  // Overlay-spezifische Styles
  overlay?: {
    backgroundColor?: string
    backdropColor?: string
  }
  // Custom CSS-Klassen
  className?: {
    panel?: string
    header?: string
    content?: string
    tabs?: string
    resizeHandle?: string
  }
  // Custom CSS-Variablen für das Panel
  cssVariables?: Record<string, string>
}

export interface StyleConfig {
  // Panel-spezifische Styles
  panel?: {
    backgroundColor?: string
    borderColor?: string
    borderRadius?: string
    boxShadow?: string
  }
  // Header-spezifische Styles
  header?: {
    backgroundColor?: string
    color?: string
    fontSize?: string
    fontWeight?: string
    padding?: string
  }
  // Tab-spezifische Styles
  tabs?: {
    backgroundColor?: string
    activeBackgroundColor?: string
    color?: string
    activeColor?: string
    borderColor?: string
  }
  // Resize-Handle-spezifische Styles
  resizeHandle?: {
    backgroundColor?: string
    hoverBackgroundColor?: string
    width?: string
  }
  // Overlay-spezifische Styles
  overlay?: {
    backgroundColor?: string
    backdropColor?: string
  }
}

export interface ThemeConfig {
  name: string
  variables: Record<string, string>
  styles?: StyleConfig
} 