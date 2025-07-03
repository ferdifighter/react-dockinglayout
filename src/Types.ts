export type PanelPosition = 'left' | 'right' | 'top' | 'bottom' | 'center'

export interface DockingPanelConfig {
  id: string
  title: string
  size?: number | string
  minSize?: number
  maxSize?: number
  resizable?: boolean
  collapsible?: boolean
  collapsed?: boolean
  closable?: boolean
  pinned?: boolean
  content: React.ReactNode
  className?: string
  style?: React.CSSProperties
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
  onLayoutChange?: (layout: DockingLayoutConfig) => void
  className?: string
  style?: React.CSSProperties
} 