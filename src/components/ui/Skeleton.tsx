import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SkeletonLineProps {
  width?: string;
  height?: string;
  className?: string;
}

interface SkeletonCardProps {
  height?: string;
  className?: string;
}

interface SkeletonCircleProps {
  size?: string;
  className?: string;
}

// ─── Base skeleton block ──────────────────────────────────────────────────────

function SkeletonBase({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`bg-slate-100 rounded-lg animate-skeleton ${className}`}
    />
  );
}

// ─── Line variant ─────────────────────────────────────────────────────────────

export function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }: SkeletonLineProps) {
  return <SkeletonBase className={`${width} ${height} ${className}`} />;
}

// ─── Card variant ─────────────────────────────────────────────────────────────

export function SkeletonCard({ height = 'h-24', className = '' }: SkeletonCardProps) {
  return (
    <div className={`rounded-2xl overflow-hidden animate-skeleton ${className}`}>
      <SkeletonBase className={`w-full ${height} rounded-2xl`} />
    </div>
  );
}

// ─── Circle variant ───────────────────────────────────────────────────────────

export function SkeletonCircle({ size = 'w-10 h-10', className = '' }: SkeletonCircleProps) {
  return <SkeletonBase className={`${size} rounded-full ${className}`} />;
}

// ─── Table row skeleton (composite) ──────────────────────────────────────────

export function SkeletonTableRow() {
  return (
    <tr className="border-b border-slate-50">
      {[20, 60, 55, 52, 58].map((w, i) => (
        <td key={i} className="py-3 px-3">
          <SkeletonLine width={`w-${w === 20 ? '5' : w === 60 ? '16' : w === 55 ? '14' : w === 52 ? '12' : '16'}`} height="h-3" />
        </td>
      ))}
    </tr>
  );
}

// ─── TX Hash card skeleton ────────────────────────────────────────────────────

export function SkeletonTxCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 text-left shadow-sm space-y-3">
      <div className="flex items-center gap-1.5">
        <SkeletonCircle size="w-3.5 h-3.5" />
        <SkeletonLine width="w-48" height="h-3" />
      </div>
      <SkeletonLine width="w-36" height="h-5" />
      <SkeletonLine width="w-full" height="h-3" />
      <SkeletonLine width="w-40" height="h-3" />
    </div>
  );
}
