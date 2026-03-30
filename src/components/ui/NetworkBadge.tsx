import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NetworkType = 'polygon' | 'solana';

interface NetworkBadgeProps {
  network: NetworkType;
  size?: 'sm' | 'md';
}

// ─── Polygon SVG icon ─────────────────────────────────────────────────────────

function PolygonIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M21.092 12.693c-.369-.215-.848-.215-1.254 0l-2.879 1.654-1.955 1.078-2.879 1.653c-.369.216-.848.216-1.254 0l-2.288-1.294c-.369-.215-.627-.61-.627-1.042V12.19c0-.431.221-.826.627-1.042l2.251-1.258c.369-.215.848-.215 1.254 0l2.251 1.258c.369.215.627.61.627 1.042v1.653l1.955-1.115v-1.653c0-.431-.221-.826-.627-1.042l-4.169-2.372c-.369-.215-.848-.215-1.254 0L6.642 10.034c-.406.216-.627.61-.627 1.042v4.781c0 .431.221.826.627 1.042l4.206 2.372c.369.215.848.215 1.254 0l2.879-1.618 1.955-1.114 2.879-1.618c.369-.215.848-.215 1.254 0l2.251 1.258c.369.215.627.61.627 1.042v2.552c0 .431-.221.826-.627 1.042l-2.251 1.294c-.369.215-.848.215-1.254 0l-2.251-1.294c-.369-.215-.627-.61-.627-1.042v-1.653l-1.955 1.114v1.653c0 .431.221.826.627 1.042l4.206 2.372c.369.215.848.215 1.254 0l4.206-2.372c.369-.215.627-.61.627-1.042v-4.781c0-.431-.221-.826-.627-1.042l-4.243-2.408z"/>
    </svg>
  );
}

// ─── Solana icon (gradient diamond) ──────────────────────────────────────────

function SolanaIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M6.4 22.4l2.133-2.133h17.067l-2.133 2.133H6.4zm0-5.333l2.133-2.134h17.067l-2.133 2.134H6.4zm19.2-7.467L23.467 11.7H6.4l2.133-2.1h17.067z"/>
    </svg>
  );
}

// ─── Config per network ───────────────────────────────────────────────────────

const NETWORK_CONFIG: Record<NetworkType, {
  label: string;
  bg: string;
  text: string;
  icon: React.ReactNode;
  iconSm: React.ReactNode;
}> = {
  polygon: {
    label: 'Polygon',
    bg: '#F0EBFF',
    text: '#7B3FE4',
    icon: <PolygonIcon size={14} />,
    iconSm: <PolygonIcon size={11} />,
  },
  solana: {
    label: 'Solana',
    bg: '#E6F7EF',
    text: '#0F6E56',
    icon: <SolanaIcon size={14} />,
    iconSm: <SolanaIcon size={11} />,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function NetworkBadge({ network, size = 'md' }: NetworkBadgeProps) {
  const cfg = NETWORK_CONFIG[network];
  const isSmall = size === 'sm';

  return (
    <span
      aria-label={`Red: ${cfg.label}`}
      className={`
        inline-flex items-center gap-1 font-semibold rounded-full border
        transition-all duration-150
        ${isSmall
          ? 'px-2 py-0.5 text-xs'
          : 'px-2.5 py-1 text-xs'
        }
      `}
      style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: `${cfg.text}30` }}
    >
      {isSmall ? cfg.iconSm : cfg.icon}
      {cfg.label}
    </span>
  );
}
