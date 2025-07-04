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
      style={{
        display: 'flex',
        borderTop: position === 'bottom' ? '1px solid #e0e0e0' : undefined,
        borderBottom: position === 'top' ? '1px solid #e0e0e0' : undefined,
        background: '#fafafa',
        height: 28,
        minHeight: 28,
        maxHeight: 28,
      }}
    >
      {tabs.map((tab, idx) => (
        <button
          key={tab.label}
          onClick={() => handleTabClick(idx)}
          style={{
            padding: '4px 14px',
            border: 'none',
            borderBottom: position === 'top' && currentActive === idx ? '2px solid #1976d2' : 'none',
            borderTop: position === 'bottom' && currentActive === idx ? '2px solid #1976d2' : 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: currentActive === idx ? 600 : 400,
            color: currentActive === idx ? '#1976d2' : '#333',
            height: '100%',
          }}
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