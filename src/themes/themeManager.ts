import { ThemeConfig } from '../Types'

// Standard-Themes
const defaultThemes: Record<string, ThemeConfig> = {
  light: {
    name: 'light',
    variables: {
      '--docking-bg': '#ffffff',
      '--docking-panel-bg': '#f8f9fa',
      '--docking-header-bg': '#e9ecef',
      '--docking-header-color': '#495057',
      '--docking-border': '#dee2e6',
      '--docking-tab-bg': '#f1f3f4',
      '--docking-tab-active-bg': '#ffffff',
      '--docking-tab-color': '#495057',
      '--docking-tab-active-color': '#000000',
      '--docking-resize-handle-bg': '#dee2e6',
      '--docking-resize-handle-hover-bg': '#adb5bd',
      '--docking-overlay-bg': '#ffffff',
      '--docking-overlay-backdrop': 'rgba(0, 0, 0, 0.1)',
    }
  },
  dark: {
    name: 'dark',
    variables: {
      '--docking-bg': '#1e1e1e',
      '--docking-panel-bg': '#252526',
      '--docking-header-bg': '#3c3c3c',
      '--docking-header-color': '#cccccc',
      '--docking-border': '#3c3c3c',
      '--docking-tab-bg': '#2d2d30',
      '--docking-tab-active-bg': '#1e1e1e',
      '--docking-tab-color': '#cccccc',
      '--docking-tab-active-color': '#ffffff',
      '--docking-resize-handle-bg': '#3c3c3c',
      '--docking-resize-handle-hover-bg': '#5c5c5c',
      '--docking-overlay-bg': '#252526',
      '--docking-overlay-backdrop': 'rgba(0, 0, 0, 0.3)',
    }
  }
}

/**
 * Erstellt ein neues Theme
 */
export function createTheme(name: string, variables: Record<string, string>, styles?: any): ThemeConfig {
  return {
    name,
    variables,
    styles
  }
}

/**
 * Wendet ein Theme auf das Dokument an
 */
export function applyTheme(theme: ThemeConfig | string): void {
  const themeConfig = typeof theme === 'string' ? defaultThemes[theme] : theme
  
  if (!themeConfig) {
    console.warn(`Theme "${theme}" nicht gefunden`)
    return
  }

  const root = document.documentElement
  
  // CSS-Variablen anwenden
  Object.entries(themeConfig.variables).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })

  // Zusätzliche Styles anwenden, falls vorhanden
  if (themeConfig.styles) {
    applyStyles(themeConfig.styles)
  }
}

/**
 * Wendet zusätzliche Styles an
 */
function applyStyles(styles: any): void {
  const styleId = 'docking-layout-custom-styles'
  let styleElement = document.getElementById(styleId) as HTMLStyleElement
  
  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = styleId
    document.head.appendChild(styleElement)
  }

  const cssRules = generateCSSRules(styles)
  styleElement.textContent = cssRules
}

/**
 * Generiert CSS-Regeln aus Style-Config
 */
function generateCSSRules(styles: any): string {
  let css = ''
  
  if (styles.panel) {
    css += `
      .docking-panel {
        ${styles.panel.backgroundColor ? `background-color: ${styles.panel.backgroundColor};` : ''}
        ${styles.panel.borderColor ? `border-color: ${styles.panel.borderColor};` : ''}
        ${styles.panel.borderRadius ? `border-radius: ${styles.panel.borderRadius};` : ''}
        ${styles.panel.boxShadow ? `box-shadow: ${styles.panel.boxShadow};` : ''}
      }
    `
  }
  
  if (styles.header) {
    css += `
      .docking-panel-header {
        ${styles.header.backgroundColor ? `background-color: ${styles.header.backgroundColor};` : ''}
        ${styles.header.color ? `color: ${styles.header.color};` : ''}
        ${styles.header.fontSize ? `font-size: ${styles.header.fontSize};` : ''}
        ${styles.header.fontWeight ? `font-weight: ${styles.header.fontWeight};` : ''}
        ${styles.header.padding ? `padding: ${styles.header.padding};` : ''}
      }
    `
  }
  
  if (styles.tabs) {
    css += `
      .docking-tabs {
        ${styles.tabs.backgroundColor ? `background-color: ${styles.tabs.backgroundColor};` : ''}
        ${styles.tabs.borderColor ? `border-color: ${styles.tabs.borderColor};` : ''}
      }
      .docking-tab {
        ${styles.tabs.color ? `color: ${styles.tabs.color};` : ''}
      }
      .docking-tab.active {
        ${styles.tabs.activeBackgroundColor ? `background-color: ${styles.tabs.activeBackgroundColor};` : ''}
        ${styles.tabs.activeColor ? `color: ${styles.tabs.activeColor};` : ''}
      }
    `
  }
  
  if (styles.resizeHandle) {
    css += `
      .docking-resize-handle {
        ${styles.resizeHandle.backgroundColor ? `background-color: ${styles.resizeHandle.backgroundColor};` : ''}
        ${styles.resizeHandle.width ? `width: ${styles.resizeHandle.width};` : ''}
      }
      .docking-resize-handle:hover {
        ${styles.resizeHandle.hoverBackgroundColor ? `background-color: ${styles.resizeHandle.hoverBackgroundColor};` : ''}
      }
    `
  }
  
  if (styles.overlay) {
    css += `
      .docking-overlay {
        ${styles.overlay.backgroundColor ? `background-color: ${styles.overlay.backgroundColor};` : ''}
      }
      .docking-overlay::before {
        ${styles.overlay.backdropColor ? `background-color: ${styles.overlay.backdropColor};` : ''}
      }
    `
  }
  
  return css
}

/**
 * Gibt alle verfügbaren Standard-Themes zurück
 */
export function getAvailableThemes(): string[] {
  return Object.keys(defaultThemes)
}

/**
 * Entfernt alle benutzerdefinierten Styles
 */
export function clearCustomStyles(): void {
  const styleElement = document.getElementById('docking-layout-custom-styles')
  if (styleElement) {
    styleElement.remove()
  }
} 