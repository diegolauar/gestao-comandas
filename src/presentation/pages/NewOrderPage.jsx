import { useState, useEffect } from 'react'
import { useOrders }   from '../hooks/useOrders'
import { useProducts } from '../hooks/useProducts'
import { Icon, Field, PageHeader, ConfirmDialog } from '../components/UI'
import { ProductPicker } from '../components/ProductPicker'
import { S, colors } from '../styles/theme'
import { Money } from '@domain/value-objects'
import { useApp } from '../context/AppContext'

export default function NewOrderPage() {
  const { navigate } = useApp()
  const { create }           = useOrders()
  const { products, load }   = useProducts()
  const [client, setClient]  = useState('')
  const [obs,    setObs]     = useState('')
  const [items,  setItems]   = useState([])
  const [selProd,setSelProd] = useState('')
  const [selQty, setSelQty]  = useState(1)
  const [leaveConfirm, setLeaveConfirm] = useState(false)
  const [clientErr,    setClientErr]    = useState(false)

  useEffect(() => { load() }, [load])

  const fmt = Money.fmt

  const addItem = () => {
    const prod = products.find(p => p.id === selProd)
    if (!prod) return
    setItems(prev => {
      const existing = prev.find(i => i.productId === selProd)
      if (existing) {
        return prev.map(i => i.productId === selProd ? { ...i, qty: i.qty + +selQty } : i)
      }
      return [...prev, { productId: selProd, name: prod.name, qty: +selQty, price: prod.price }]
    })
    setSelProd('')
    setSelQty(1)
  }

  const removeItem  = (pid) => setItems(prev => prev.filter(i => i.productId !== pid))
  const changeQty   = (pid, delta) => setItems(prev =>
    prev.map(i => i.productId === pid ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
  )

  const total = items.reduce((s, i) => s + i.qty * Math.round(i.price * 100), 0) / 100

  const handleCancel = () => {
    if (items.length > 0) setLeaveConfirm(true)
    else navigate('orders')
  }

  const handleSubmit = async () => {
    if (!client.trim()) { setClientErr(true); return }
    setClientErr(false)
    const order = await create({ client, items, obs })
    if (order) navigate('orders')
  }

  return (
    <div style={{ ...S.pageWrapper, maxWidth: 720 }}>
      {leaveConfirm && (
        <ConfirmDialog
          message={`Você tem ${items.length} item(s) na comanda. Deseja sair sem salvar?`}
          onConfirm={() => navigate('orders')}
          onCancel={() => setLeaveConfirm(false)}
        />
      )}

      <PageHeader
        title="Nova Comanda"
        subtitle="Registre os itens — o pagamento é feito ao fechar a comanda"
      />

      <div style={S.card}>
        <Field label="Nome do Cliente">
          <input
            style={{ ...S.input, ...(clientErr ? { borderColor: colors.danger } : {}) }}
            value={client}
            onChange={e => { setClient(e.target.value); if (clientErr) setClientErr(false) }}
            placeholder="Nome do cliente (obrigatório)"
          />
          {clientErr && <div style={{ color: colors.danger, fontSize: 12, marginTop: 4 }}>Informe o nome do cliente</div>}
        </Field>

        <div style={{ borderTop: `1px solid ${colors.border}`, margin: '20px 0', paddingTop: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 13, textTransform: 'uppercase',
            letterSpacing: '.05em', color: colors.muted }}>
            Itens da Comanda
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <ProductPicker products={products} value={selProd} onChange={setSelProd} />
            <input style={{ ...S.input, width: 80 }} type="number" min="1" value={selQty}
              onChange={e => setSelQty(+e.target.value)} />
            <button style={S.btn()} onClick={addItem} disabled={!selProd}>
              <Icon name="plus" size={16} />
            </button>
          </div>

          {items.length === 0
            ? <div style={{ textAlign: 'center', padding: '24px 0', color: colors.muted,
                fontSize: 14, background: colors.card2, borderRadius: 8 }}>
                Nenhum item adicionado
              </div>
            : <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                {items.map((item, i) => (
                  <div key={item.productId} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px',
                    background: i % 2 === 0 ? colors.card2 : 'transparent',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <button
                          style={{ ...S.btnGhost, padding: '1px 9px', fontSize: 16 }}
                          onClick={() => changeQty(item.productId, -1)}
                        >−</button>
                        <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{item.qty}</span>
                        <button
                          style={{ ...S.btnGhost, padding: '1px 9px', fontSize: 16 }}
                          onClick={() => changeQty(item.productId, +1)}
                        >+</button>
                        <span style={{ fontSize: 12, color: colors.muted }}>× {fmt(item.price)}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 700 }}>{fmt(item.qty * Math.round(item.price * 100) / 100)}</span>
                      <button style={{ ...S.btnGhost, color: colors.danger, border: 'none', padding: 4 }}
                        onClick={() => removeItem(item.productId)}>
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
                  padding: '14px 16px', borderTop: `1px solid ${colors.border}`, background: colors.card2 }}>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>Total: {fmt(total)}</span>
                </div>
              </div>
          }
        </div>

        <Field label="Observações">
          <textarea style={{ ...S.input, minHeight: 70, resize: 'vertical' }}
            value={obs} onChange={e => setObs(e.target.value)}
            placeholder="Ex: Sem gelo, mesa 5..." />
        </Field>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button style={S.btnGhost} onClick={handleCancel}>Cancelar</button>
          <button style={S.btn()} onClick={handleSubmit}>
            <Icon name="check" size={16} /> Abrir Comanda
          </button>
        </div>
      </div>
    </div>
  )
}
