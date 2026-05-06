import { useState, useEffect, useRef, useMemo } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { Icon, Field, Modal, ConfirmDialog, CategoryBadge, PageHeader, EmptyState } from '../components/UI'
import { S, colors } from '../styles/theme'
import { Money } from '@domain/value-objects'
import { Product } from '@domain/entities'

const BLANK = { id: '', name: '', category: '', price: '', unit: 'Garrafa', stock: '', image: '' }

const imgSrc = (img) => img.startsWith('data:') ? img : `app-img://${img}`

const ERR_STYLE = { borderColor: colors.danger }
const ErrMsg = ({ msg }) => msg
  ? <span style={{ fontSize: 11, color: colors.danger, marginTop: 4, display: 'block' }}>{msg}</span>
  : null

export default function ProductsPage() {
  const { products, load, save, remove } = useProducts()
  const { categories, load: loadCategories } = useCategories()

  const [search,      setSearch]      = useState('')
  const [modal,       setModal]       = useState(false)
  const [confirm,     setConfirm]     = useState(null)
  const [form,        setForm]        = useState(BLANK)
  const [errors,      setErrors]      = useState({})
  const [stockTarget, setStockTarget] = useState(null)
  const [stockOp,     setStockOp]     = useState('add')
  const [stockQty,    setStockQty]    = useState('')
  const [stockHistory,setStockHistory]= useState([])
  const [showHistory, setShowHistory] = useState(false)
  const imgRef = useRef()

  useEffect(() => { load(); loadCategories() }, [load, loadCategories])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const validate = () => {
    const e = {}
    if (!form.name.trim())   e.name     = 'Nome é obrigatório'
    if (!form.category)      e.category = 'Selecione uma categoria'
    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0)
                             e.price    = 'Preço inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const openNew  = () => { setForm({ ...BLANK, category: categories[0]?.name || '' }); setErrors({}); setModal(true) }
  const openEdit = (p) => { setForm({ ...p }); setErrors({}); setModal(true) }

  const openStock = async (p) => {
    setStockTarget(p)
    setStockOp('add')
    setStockQty('')
    setShowHistory(false)
    const history = await window.api.stockMovements.list(p.id)
    setStockHistory(history)
  }

  const previewStock = useMemo(() => {
    if (!stockTarget) return 0
    const qty = Number(stockQty) || 0
    if (stockOp === 'add') return stockTarget.stock + qty
    if (stockOp === 'sub') return Math.max(0, stockTarget.stock - qty)
    return qty
  }, [stockTarget, stockOp, stockQty])

  const handleImg = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const filename = await window.api.images.save({ dataUrl: ev.target.result })
      setForm(f => ({ ...f, image: filename }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!validate()) return
    const ok = await save(form)
    if (ok) { setModal(false); setErrors({}) }
  }

  const handleStockSave = async () => {
    if (!stockTarget || stockQty === '') return
    const ok = await save({ ...stockTarget, stock: previewStock })
    if (ok) {
      await window.api.stockMovements.record({
        productId:   stockTarget.id,
        productName: stockTarget.name,
        type:        stockOp === 'add' ? 'entrada' : stockOp === 'sub' ? 'saida' : 'ajuste',
        qty:         Number(stockQty),
        prevStock:   stockTarget.stock,
        newStock:    previewStock,
      })
      setStockTarget(null)
    }
  }

  const fmt = Money.fmt

  return (
    <div style={S.pageWrapper}>
      {confirm && (
        <ConfirmDialog
          message={`Remover "${confirm.name}"? O estoque será perdido.`}
          onConfirm={() => { remove(confirm.id, confirm.name); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}

      <PageHeader
        title="Produtos"
        subtitle={`${products.length} produto(s) cadastrado(s)`}
        action={<button style={S.btn()} onClick={openNew}><Icon name="plus" size={16} /> Novo Produto</button>}
      />

      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 360 }}>
        <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <Icon name="search" size={16} color={colors.muted} />
        </div>
        <input
          style={{ ...S.input, paddingLeft: 34 }}
          placeholder="Buscar produto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ ...S.card, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              background: colors.card2, borderRadius: 8, height: 120, marginBottom: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              {p.image
                ? <img src={imgSrc(p.image)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Icon name="img" size={32} color={colors.border} />}
            </div>

            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{p.name}</div>
            <CategoryBadge category={p.category} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: colors.gold }}>{fmt(p.price)}</div>
                <div style={{ fontSize: 12, color: colors.muted }}>por {p.unit}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: p.stock === 0 ? colors.danger : p.stock <= 5 ? colors.warn : colors.text }}>
                  {p.stock === 0 ? 'Sem estoque' : `${p.stock} em estoque`}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button style={{ ...S.btnGhost, flex: 1, justifyContent: 'center' }} onClick={() => openEdit(p)}>
                <Icon name="edit" size={14} /> Editar
              </button>
              <button title="Ajustar estoque" style={{ ...S.btnGhost, padding: '8px 10px' }} onClick={() => openStock(p)}>
                <Icon name="layers" size={14} />
              </button>
              <button
                style={{ ...S.btnGhost, color: colors.danger, borderColor: colors.danger + '44', padding: '8px 10px' }}
                onClick={() => setConfirm(p)}
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState message="Nenhum produto encontrado." />}
      </div>

      {/* Modal produto */}
      {modal && (
        <Modal title={form.id ? 'Editar Produto' : 'Novo Produto'} onClose={() => setModal(false)}>
          <Field label="Nome do Produto">
            <input
              style={{ ...S.input, ...(errors.name && ERR_STYLE) }}
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(p => ({ ...p, name: '' })) }}
              placeholder="Ex: Heineken 600ml"
            />
            <ErrMsg msg={errors.name} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Categoria">
              <select
                style={{ ...S.input, ...(errors.category && ERR_STYLE) }}
                value={form.category}
                onChange={e => { setForm(f => ({ ...f, category: e.target.value })); setErrors(p => ({ ...p, category: '' })) }}
              >
                <option value="">Selecione...</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <ErrMsg msg={errors.category} />
            </Field>
            <Field label="Unidade">
              <select style={S.input} value={form.unit}
                onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                {Product.UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Preço de Venda (R$)">
              <input
                style={{ ...S.input, ...(errors.price && ERR_STYLE) }}
                type="number" min="0" step="0.01"
                value={form.price}
                onChange={e => { setForm(f => ({ ...f, price: e.target.value })); setErrors(p => ({ ...p, price: '' })) }}
                placeholder="0,00"
              />
              <ErrMsg msg={errors.price} />
            </Field>
            <Field label="Estoque">
              <input style={S.input} type="number" min="0" value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
            </Field>
          </div>

          <Field label="Foto do Produto">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 64, height: 64, background: colors.card2, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
              }}>
                {form.image
                  ? <img src={imgSrc(form.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <Icon name="img" size={24} color={colors.border} />}
              </div>
              <div>
                <button style={S.btn(colors.card2)} onClick={() => imgRef.current.click()}>
                  Escolher imagem
                </button>
                {form.image && (
                  <button style={{ ...S.btnGhost, marginLeft: 8, fontSize: 12 }}
                    onClick={() => setForm(f => ({ ...f, image: '' }))}>Remover</button>
                )}
                <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />
              </div>
            </div>
          </Field>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button style={S.btnGhost} onClick={() => setModal(false)}>Cancelar</button>
            <button style={S.btn()} onClick={handleSave}>
              <Icon name="check" size={14} /> Salvar Produto
            </button>
          </div>
        </Modal>
      )}

      {/* Modal ajuste de estoque */}
      {stockTarget && (
        <Modal title={`Ajustar Estoque — ${stockTarget.name}`} onClose={() => setStockTarget(null)} width={440}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: '.05em' }}>Estoque atual</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: colors.gold, marginTop: 4 }}>{stockTarget.stock}</div>
          </div>

          <Field label="Operação">
            <div style={{ display: 'flex', gap: 8 }}>
              {[['add','Adicionar'], ['sub','Remover'], ['set','Definir']].map(([op, label]) => (
                <button key={op}
                  style={{
                    ...S.btnGhost, flex: 1, justifyContent: 'center',
                    ...(stockOp === op && { background: colors.gold + '22', color: colors.gold, borderColor: colors.gold }),
                  }}
                  onClick={() => setStockOp(op)}>
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Quantidade">
            <input style={S.input} type="number" min="0" value={stockQty}
              onChange={e => setStockQty(e.target.value)} placeholder="0" autoFocus />
          </Field>

          {stockQty !== '' && (
            <div style={{ padding: '12px 16px', background: colors.card2, borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
              <span style={{ color: colors.muted, fontSize: 13 }}>Novo estoque: </span>
              <span style={{ fontWeight: 700, fontSize: 20, color: colors.text }}>{previewStock}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button style={S.btnGhost} onClick={() => setStockTarget(null)}>Cancelar</button>
            <button style={S.btn()} onClick={handleStockSave} disabled={stockQty === ''}>
              <Icon name="check" size={14} /> Confirmar
            </button>
          </div>

          {/* Histórico */}
          <div style={{ marginTop: 20, borderTop: `1px solid ${colors.border}`, paddingTop: 16 }}>
            <button
              style={{ ...S.btnGhost, width: '100%', justifyContent: 'center', fontSize: 12 }}
              onClick={() => setShowHistory(h => !h)}
            >
              <Icon name={showHistory ? 'chevron-down' : 'chevron-right'} size={13} />
              {showHistory ? 'Ocultar' : 'Ver'} histórico de movimentações
            </button>

            {showHistory && (
              <div style={{ marginTop: 12, maxHeight: 220, overflowY: 'auto' }}>
                {stockHistory.length === 0
                  ? <p style={{ textAlign: 'center', color: colors.muted, fontSize: 13, padding: '12px 0' }}>
                      Nenhuma movimentação registrada.
                    </p>
                  : stockHistory.map(m => {
                      const isEntrada = m.type === 'entrada'
                      const isSaida   = m.type === 'saida'
                      const typeColor = isEntrada ? colors.success : isSaida ? colors.danger : colors.gold
                      const typeLabel = isEntrada ? 'entrada' : isSaida ? 'saída' : 'ajuste'
                      const sign      = isEntrada ? '+' : isSaida ? '−' : '='
                      return (
                        <div key={m.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 4px', borderBottom: `1px solid ${colors.border}`, fontSize: 13,
                        }}>
                          <div>
                            <span style={{ color: typeColor, fontWeight: 700 }}>{sign}{m.qty}</span>
                            <span style={{ color: colors.muted, marginLeft: 8 }}>{typeLabel}</span>
                          </div>
                          <div style={{ textAlign: 'right', color: colors.muted, fontSize: 12 }}>
                            <div>{m.prev_stock} → {m.new_stock}</div>
                            <div>{new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      )
                    })
                }
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
