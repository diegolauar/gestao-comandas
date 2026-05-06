import { useState, useEffect } from 'react'
import { useOrders } from '../hooks/useOrders'
import { Icon, Modal, StatusBadge, PageHeader, ConfirmDialog } from '../components/UI'
import { S, colors } from '../styles/theme'
import { Money } from '@domain/value-objects'
import { PAYMENT_METHODS } from '@domain/entities'
import { useApp } from '../context/AppContext'

const STATUS_FILTERS = ['todos', 'aberto', 'entregue', 'cancelado']

export default function OrdersPage() {
  const { navigate, setOrders: syncOrders } = useApp()
  const { orders, load, updateStatus, finalize, remove } = useOrders()
  const [search,       setSearch]      = useState('')
  const [statusFilter, setStatusFilter]= useState('todos')
  const [detail,       setDetail]      = useState(null)
  const [finalizing,   setFinalizing]  = useState(false)
  const [selPayment,   setSelPayment]  = useState('')
  const [confirm,      setConfirm]     = useState(null)

  useEffect(() => { load() }, [load])
  useEffect(() => { syncOrders(orders) }, [orders, syncOrders])

  const fmt = Money.fmt

  const filtered = orders
    .filter(o => statusFilter === 'todos' || o.status === statusFilter)
    .filter(o => !search || o.client.toLowerCase().includes(search.toLowerCase()))

  const openDetail = o => { setDetail(o); setFinalizing(false); setSelPayment('') }

  const printReceipt = (order) => {
    const area = document.getElementById('print-receipt')
    if (!area) return
    const itemRows = order.items.map(i => {
      const sub = fmt(i.qty * Math.round(i.price * 100) / 100)
      return `<tr><td>${i.name}</td><td>${i.qty}x</td><td>${fmt(i.price)}</td><td>${sub}</td></tr>`
    }).join('')
    area.innerHTML = `
      <h2>K2 Emporium</h2>
      <hr class="pr-divider"/>
      <div class="pr-meta">Cliente: <strong>${order.client}</strong></div>
      <div class="pr-meta">Data: ${new Date(order.date).toLocaleString('pt-BR')}</div>
      ${order.payment ? `<div class="pr-meta">Pagamento: ${order.payment}</div>` : ''}
      <hr class="pr-divider"/>
      <table>
        <thead><tr><th>Item</th><th>Qtd</th><th>Preço</th><th>Total</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <hr class="pr-divider"/>
      <div class="pr-total">Total: ${fmt(order.total)}</div>
      ${order.obs ? `<div class="pr-obs">Obs: ${order.obs}</div>` : ''}
    `
    window.print()
  }

  const handleFinalize = async () => {
    if (!selPayment) return
    const ok = await finalize(detail.id, selPayment)
    if (ok) setDetail(null)
  }

  const handleCancel = async (id) => {
    await updateStatus(id, 'cancelado')
    setDetail(null)
  }

  return (
    <div style={S.pageWrapper}>
      <div id="print-receipt" aria-hidden="true" />

      {confirm && (
        <ConfirmDialog
          message={`Remover a comanda de "${confirm.client}"? O estoque será devolvido.`}
          onConfirm={() => { remove(confirm.id); setConfirm(null); setDetail(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}

      <PageHeader
        title="Comandas"
        subtitle={`${filtered.length} comanda(s) — ${fmt(filtered.reduce((s, o) => s + o.total, 0))}`}
        action={
          <button style={S.btn()} onClick={() => navigate('neworder')}>
            <Icon name="plus" size={16} /> Nova Comanda
          </button>
        }
      />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <Icon name="search" size={16} color={colors.muted} />
          </div>
          <input style={{ ...S.input, paddingLeft: 34 }} placeholder="Buscar por cliente..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {STATUS_FILTERS.map(s => (
            <button key={s} style={{
              ...S.btnGhost, textTransform: 'capitalize',
              background: statusFilter === s ? colors.gold : 'transparent',
              color:       statusFilter === s ? '#000' : colors.muted,
              borderColor: statusFilter === s ? colors.gold : colors.border,
            }} onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: colors.card2, textAlign: 'left' }}>
              {['Cliente', 'Data/Hora', 'Itens', 'Pagamento', 'Total', 'Status', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', color: colors.muted, fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: colors.muted }}>Nenhuma comanda encontrada</td></tr>
            )}
            {filtered.map((o, i) => (
              <tr key={o.id} style={{
                borderTop: `1px solid ${colors.border}`,
                background: i % 2 ? colors.card2 + '22' : 'transparent',
                cursor: 'pointer',
              }} onClick={() => openDetail(o)}>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>{o.client}</td>
                <td style={{ padding: '14px 16px', color: colors.muted, whiteSpace: 'nowrap' }}>
                  {new Date(o.date).toLocaleDateString('pt-BR')} {new Date(o.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ padding: '14px 16px', color: colors.muted }}>{o.items.length} item(s)</td>
                <td style={{ padding: '14px 16px', color: o.payment ? colors.text : colors.muted }}>
                  {o.payment || '—'}
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: colors.gold }}>{fmt(o.total)}</td>
                <td style={{ padding: '14px 16px' }}><StatusBadge status={o.status} /></td>
                <td style={{ padding: '14px 16px' }}>
                  <button style={{ ...S.btnGhost, fontSize: 12, padding: '5px 10px' }}
                    onClick={e => { e.stopPropagation(); openDetail(o) }}>Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de detalhe */}
      {detail && (
        <Modal title={`Comanda — ${detail.client}`} onClose={() => setDetail(null)} width={560}>

          {/* Info cabeçalho */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: colors.muted }}>Data</div>
              <div style={{ fontWeight: 600 }}>{new Date(detail.date).toLocaleString('pt-BR')}</div>
            </div>
            {detail.payment && (
              <div>
                <div style={{ fontSize: 12, color: colors.muted }}>Pagamento</div>
                <div style={{ fontWeight: 600 }}>{detail.payment}</div>
              </div>
            )}
            <StatusBadge status={detail.status} />
          </div>

          {/* Itens */}
          <div style={{ background: colors.card2, borderRadius: 8, padding: 16, marginBottom: 16 }}>
            {detail.items.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: `1px solid ${colors.border}` }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: colors.muted }}>{item.qty}x {fmt(item.price)}</div>
                </div>
                <span style={{ fontWeight: 700 }}>{fmt(item.subtotal ?? item.qty * item.price)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>Total: {fmt(detail.total)}</span>
            </div>
          </div>

          {detail.obs && (
            <div style={{ background: colors.card2, borderRadius: 8, padding: 12, marginBottom: 16,
              fontSize: 13, color: colors.muted }}>
              <strong style={{ color: colors.text }}>Obs:</strong> {detail.obs}
            </div>
          )}

          {/* Fechar comanda (seleção de pagamento) */}
          {detail.status === 'aberto' && !finalizing && (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button style={S.btnGhost} onClick={() => printReceipt(detail)}>
                <Icon name="print" size={14} /> Imprimir
              </button>
              <button style={{ ...S.btnGhost, color: colors.danger }}
                onClick={() => handleCancel(detail.id)}>
                <Icon name="close" size={14} /> Cancelar comanda
              </button>
              <button style={{ ...S.btnGhost }}
                onClick={() => navigate('editorder', detail)}>
                <Icon name="edit" size={14} /> Editar
              </button>
              <button style={S.btn(colors.success)}
                onClick={() => setFinalizing(true)}>
                <Icon name="money" size={14} /> Fechar Comanda
              </button>
            </div>
          )}

          {/* Seletor de pagamento ao fechar */}
          {detail.status === 'aberto' && finalizing && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12, color: colors.gold }}>
                Selecione a forma de pagamento:
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {PAYMENT_METHODS.map(p => (
                  <button key={p} style={{
                    ...S.btnGhost, flex: 1,
                    background:   selPayment === p ? colors.gold : 'transparent',
                    color:        selPayment === p ? '#000' : colors.muted,
                    borderColor:  selPayment === p ? colors.gold : colors.border,
                    justifyContent: 'center',
                  }} onClick={() => setSelPayment(p)}>{p}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button style={S.btnGhost} onClick={() => setFinalizing(false)}>Voltar</button>
                <button style={S.btn()} onClick={handleFinalize} disabled={!selPayment}>
                  <Icon name="check" size={14} /> Confirmar Pagamento
                </button>
              </div>
            </div>
          )}

          {/* Ações para comandas finalizadas */}
          {detail.status !== 'aberto' && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button style={S.btnGhost} onClick={() => printReceipt(detail)}>
                <Icon name="print" size={14} /> Imprimir
              </button>
              <button style={{ ...S.btnGhost, color: colors.danger }}
                onClick={() => setConfirm(detail)}>
                <Icon name="trash" size={14} /> Excluir
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
