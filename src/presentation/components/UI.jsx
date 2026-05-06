import { useEffect } from 'react'
import { S, colors, statusColors, getCategoryColor } from '../styles/theme'

/* ─── ICON ───────────────────────────────────────────────────── */
const PATHS = {
  dashboard:  "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  products:   "M20 7l-8-4-8 4m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  orders:     "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  report:     "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  plus:       "M12 4v16m-8-8h16",
  edit:       "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:      "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  close:      "M6 18L18 6M6 6l12 12",
  check:      "M5 13l4 4L19 7",
  pack:       "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
  money:      "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
  search:     "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  warning:    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  img:        "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z",
  download:   "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  upload:     "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  folder:     "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
  calendar:   "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  backup:     "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  'chevron-right': "M9 18l6-6-6-6",
  'chevron-down':  "M6 9l6 6 6-6",
  tag:             "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z",
  layers:          "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  excel:      "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 13h2.5l1.5 2 1.5-2H16l-2.5 3.5L16 20h-2.5L12 18l-1.5 2H8l2.5-3.5L8 13z",
  print:      "M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z",
}

export const Icon = ({ name, size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={PATHS[name] || ''} />
  </svg>
)

/* ─── FIELD (label + input wrapper) ─────────────────────────── */
export const Field = ({ label, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={S.label}>{label}</label>
    {children}
  </div>
)

/* ─── STATUS BADGE ───────────────────────────────────────────── */
export const StatusBadge = ({ status }) => {
  const labels = { aberto: 'Aberto', entregue: 'Entregue', cancelado: 'Cancelado' }
  const color = statusColors[status] || colors.muted
  return <span style={S.badge(color)}>{labels[status] || status}</span>
}

/* ─── CATEGORY BADGE ─────────────────────────────────────────── */
export const CategoryBadge = ({ category }) => (
  <span style={S.badge(getCategoryColor(category))}>{category}</span>
)

/* ─── MODAL ──────────────────────────────────────────────────── */
export function Modal({ title, onClose, children, width = 520 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)',
      zIndex: 1000, display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: colors.card, border: `1px solid ${colors.border}`,
        borderRadius: 14, width: '100%', maxWidth: width,
        maxHeight: '90vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 24px', borderBottom: `1px solid ${colors.border}`,
        }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{title}</span>
          <button style={{ ...S.btnGhost, border: 'none', padding: 4 }} onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}

/* ─── CONFIRM DIALOG ─────────────────────────────────────────── */
export function ConfirmDialog({ message, onConfirm, onCancel }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onCancel])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ ...S.card, maxWidth: 360, width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: 12 }}>
          <Icon name="warning" size={32} color={colors.warn} />
        </div>
        <p style={{ marginBottom: 20, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button style={S.btn(colors.danger)} onClick={onConfirm}>Confirmar</button>
          <button style={S.btnGhost} onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}

/* ─── TOAST ──────────────────────────────────────────────────── */
export const Toast = ({ message, type }) => (
  <div style={{
    position: 'fixed', bottom: 28, right: 28, zIndex: 3000,
    background: type === 'error' ? colors.danger : colors.success,
    color: '#fff', padding: '12px 20px', borderRadius: 10,
    fontWeight: 600, fontSize: 14, boxShadow: '0 4px 24px rgba(0,0,0,.4)',
    animation: 'slideUp .25s ease',
  }}>{message}</div>
)

/* ─── PAGE HEADER ────────────────────────────────────────────── */
export const PageHeader = ({ title, subtitle, action }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12,
  }}>
    <div>
      <h1 style={S.pageTitle}>{title}</h1>
      {subtitle && <p style={S.pageSub}>{subtitle}</p>}
    </div>
    {action}
  </div>
)

/* ─── EMPTY STATE ────────────────────────────────────────────── */
export const EmptyState = ({ message = 'Nenhum item encontrado.' }) => (
  <div style={{ textAlign: 'center', padding: '60px 0', color: colors.muted }}>
    {message}
  </div>
)

/* ─── STAT CARD (dashboard) ──────────────────────────────────── */
export const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{ ...S.card, flex: 1, minWidth: 180 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: colors.muted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em' }}>
        {label}
      </span>
      <div style={{ background: color + '22', borderRadius: 8, padding: 7 }}>
        <Icon name={icon} size={16} color={color} />
      </div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>{sub}</div>}
  </div>
)
