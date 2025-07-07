import React from 'react';

export interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  active?: number;
  onTabChange?: (idx: number) => void;
  position?: 'top' | 'bottom';
}

export const Tabs: React.FC<TabsProps> = ({ tabs, active = 0, onTabChange, position = 'top' }) => {
  // Wenn onTabChange übergeben, ist Tabs "controlled", sonst eigener State
  const [internalActive, setInternalActive] = React.useState(0);
  const isControlled = typeof onTabChange === 'function';
  const currentActive = isControlled ? active : internalActive;
  const handleTabClick = (idx: number) => {
    if (isControlled) {
      onTabChange?.(idx);
    } else {
      setInternalActive(idx);
    }
  };

  const tabBar = (
    <div
      className={"tab-bar" + (position === 'bottom' ? ' tab-bar-bottom' : '')}
      style={{
        height: 28,
        minHeight: 28,
        maxHeight: 28,
      }}
    >
      {tabs.map((tab, idx) => (
        <button
          key={tab.label}
          onClick={() => handleTabClick(idx)}
          className={["tab", "debug-tab", currentActive === idx ? "active" : "", position === "top" && currentActive === idx ? "tab-top-active" : "", position === "bottom" && currentActive === idx ? "tab-bottom-active" : ""].filter(Boolean).join(" ")}
          data-test="tabbutton"
          style={position === 'bottom' ? { color: 'var(--tab-fg)' } : {}}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {position === 'top' && tabBar}
      {/* Content ohne Padding, Panel übernimmt das */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{tabs[currentActive]?.content}</div>
      {position === 'bottom' && tabBar}
    </div>
  );
}; 