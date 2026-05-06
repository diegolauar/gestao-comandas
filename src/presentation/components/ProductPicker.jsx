import { useState, useEffect, useRef } from 'react'
import { S, colors } from '../styles/theme'
import { Money } from '@domain/value-objects'

export function ProductPicker({ products, value, onChange }) {
  const [query,     setQuery]     = useState('')
  const [open,      setOpen]      = useState(false)
  const [highlight, setHighlight] = useState(0)
  const containerRef = useRef()

  // Quando o pai reseta value para '' (após adicionar), limpa o campo
  useEffect(() => {
    if (!value) setQuery('')
  }, [value])

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const normalize = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const q = normalize(query)

  const filtered = products
    .filter(p =>
      normalize(p.name).includes(q) ||
      normalize(p.category).includes(q)
    )
    .slice(0, 10)

  const select = (product) => {
    onChange(product.id)
    setQuery(product.name)
    setOpen(false)
    setHighlight(0)
  }

  const handleInput = (e) => {
    setQuery(e.target.value)
    setOpen(true)
    setHighlight(0)
    if (!e.target.value) onChange('')
  }

  const handleKeyDown = (e) => {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      select(filtered[highlight])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showDropdown = open && query.length > 0 && filtered.length > 0

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1 }}>
      <input
        style={S.input}
        value={query}
        onChange={handleInput}
        onFocus={() => query && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar produto..."
        autoComplete="off"
      />

      {showDropdown && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          zIndex: 200, background: colors.card,
          border: `1px solid ${colors.border}`, borderRadius: 8,
          maxHeight: 300, overflowY: 'auto',
          boxShadow: '0 8px 24px rgba(0,0,0,.5)',
        }}>
          {filtered.map((p, i) => (
            <div
              key={p.id}
              onMouseDown={() => p.stock > 0 && select(p)}
              onMouseEnter={() => p.stock > 0 && setHighlight(i)}
              style={{
                padding: '10px 14px',
                cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: p.stock === 0 ? 0.45 : 1,
                background: i === highlight && p.stock > 0 ? colors.card2 : 'transparent',
                borderBottom: i < filtered.length - 1 ? `1px solid ${colors.border}` : 'none',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: colors.muted }}>
                  {p.category} · {p.stock > 0 ? `${p.stock} em estoque` : 'Sem estoque'}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.gold }}>
                  {Money.fmt(p.price)}
                </div>
                {p.stock === 0 && (
                  <div style={{ fontSize: 11, color: colors.danger }}>indisponível</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
