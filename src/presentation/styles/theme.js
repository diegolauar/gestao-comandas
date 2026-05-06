// Paleta de cores
export const colors = {
  bg:      '#0a0a0a',
  bg2:     '#111111',
  card:    '#1a1a1a',
  card2:   '#222222',
  border:  '#2a2a2a',
  text:    '#f0f0f0',
  muted:   '#888888',
  gold:    '#D4AF37',
  gold2:   '#F0D060',
  danger:  '#e63946',
  warn:    '#f4a261',
  success: '#3fcf8e',
}

export const statusColors = {
  aberto:    colors.warn,
  entregue:  colors.success,
  cancelado: colors.danger,
}

export const categoryColors = {
  'Cerveja':      '#f4a261',
  'Refrigerante': '#e63946',
  'Água':         '#4f8ef7',
  'Vinho':        '#c77dff',
  'Destilado':    '#f9c74f',
  'Carne':        '#e07a5f',
  'Frios':        '#81b29a',
  'Outro':        '#888888',
}

const _PALETTE = [
  '#f4a261','#e63946','#4f8ef7','#c77dff',
  '#f9c74f','#e07a5f','#81b29a','#3fcf8e',
  '#5bcce0','#e07db8','#d4905b','#7b9fe0',
]
function _hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return Math.abs(h)
}
export function getCategoryColor(name) {
  return categoryColors[name] || _PALETTE[_hash(name) % _PALETTE.length]
}

// Estilos reutilizáveis — use como: style={S.card}
export const S = {
  card: {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
    padding: '20px 24px',
  },

  input: {
    background: colors.card2,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    color: colors.text,
    padding: '9px 12px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    transition: 'border-color .15s',
  },

  // uso: style={S.btn()}  ou  S.btn(colors.danger)
  btn: (bg = colors.gold) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: bg,
    color: bg === colors.gold ? '#000' : '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '9px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity .15s',
  }),

  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    color: colors.muted,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 13,
    cursor: 'pointer',
  },

  // uso: style={S.badge(colors.warn)}
  badge: (color) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 600,
    background: color + '22',
    color: color,
  }),

  label: {
    display: 'block',
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '.05em',
  },

  pageWrapper: {
    padding: '32px 28px',
    maxWidth: 1100,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: 700,
  },

  pageSub: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
}
