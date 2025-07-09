import { StyleConfig } from '../Types'

/**
 * Erstellt benutzerdefinierte Styles
 */
export function createStyles(styles: StyleConfig): StyleConfig {
  return styles
}

/**
 * Kombiniert mehrere Style-Configs
 */
export function mergeStyles(...styleConfigs: StyleConfig[]): StyleConfig {
  return styleConfigs.reduce((merged, current) => {
    return {
      panel: { ...merged.panel, ...current.panel },
      header: { ...merged.header, ...current.header },
      tabs: { ...merged.tabs, ...current.tabs },
      resizeHandle: { ...merged.resizeHandle, ...current.resizeHandle },
      overlay: { ...merged.overlay, ...current.overlay },
    }
  }, {} as StyleConfig)
}

/**
 * Wendet Styles direkt auf das Dokument an
 */
export function applyStyles(styles: StyleConfig): void {
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
function generateCSSRules(styles: StyleConfig): string {
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
 * Entfernt alle benutzerdefinierten Styles
 */
export function clearStyles(): void {
  const styleElement = document.getElementById('docking-layout-custom-styles')
  if (styleElement) {
    styleElement.remove()
  }
}

/**
 * Prüft, ob benutzerdefinierte Styles angewendet sind
 */
export function hasCustomStyles(): boolean {
  return document.getElementById('docking-layout-custom-styles') !== null
} 