// ============================================
// Universal Project Manager - Dropdown Button Component
// ============================================

import { useRef } from 'react';

export interface DropdownItem {
  icon: string;
  label: string;
  onClick: () => void;
}

interface DropdownButtonProps {
  label: string;
  isOpen: boolean;
  onClick: () => void;
  items: DropdownItem[];
}

export default function DropdownButton({
  label,
  isOpen,
  onClick,
  items,
}: DropdownButtonProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }} className="dropdown-container">
      <button
        onClick={onClick}
        style={{
          height: '40px',
          padding: '10px 20px',
          background: '#2a2a2a',
          color: '#e0e0e0',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.95rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#3a3a3a';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#2a2a2a';
        }}>
        {label}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '48px',
            left: '0',
            background: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            padding: '8px 0',
            minWidth: '200px',
            zIndex: 1000,
          }}>
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
              }}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                color: '#e0e0e0',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#3a3a3a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
