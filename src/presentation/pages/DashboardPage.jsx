import { useEffect } from 'react'
import { useReports } from '../hooks/useReports'
import { StatCard, PageHeader, Icon, StatusBadge } from '../components/UI'
import { S, colors } from '../styles/theme'
import { Money } from '@domain/value-objects'
import { useApp } from '../context/AppContext'

export default function DashboardPage() {
  const { navigate } = useApp()
  const { dashboard: d, loadDashboard } = useReports()

  useEffect(() => {
    loadDashboard()
    const interval = setInterval(loadDashboard, 30000)
    return () => clearInterval(interval)
  }, [loadDashboard])

  if (!d) return (
    <div style={{ ...S.pageWrapper, color: colors.muted }}>Carregando...</div>
  )

  const fmt = Money.fmt

  return (
    <div style={S.pageWrapper}>
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
      />

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard label="Vendas hoje"     value={fmt(d.totalToday)}     sub={`${d.ordersToday} comanda(s)`}    color={colors.success} icon="money"  />
        <StatCard label="Total entregue"  value={fmt(d.deliveredTotal)}  sub="todos os tempos"                  color={colors.gold}    icon="check"  />
        <StatCard label="Comandas abertas"value={d.openOrders}           sub="aguardando fechamento"            color={colors.warn}    icon="orders" />
        <StatCard label="Produtos"        value={d.totalProducts}        sub={`${d.lowStockItems.length} com estoque baixo`}
          color={d.lowStockItems.length > 0 ? colors.danger : colors.muted} icon="pack" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Comandas abertas hoje */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 600 }}>Comandas de hoje</span>
            <button style={S.btnGhost} onClick={() => navigate('orders')}>Ver todas</button>
          </div>
          {d.recentOrders.length === 0
            ? <p style={{ color: colors.muted, fontSize: 14 }}>Nenhuma comanda hoje ainda.</p>
            : d.recentOrders.map(o => (
              <div key={o.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: `1px solid ${colors.border}`, gap: 8,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{o.client}</div>
                  <div style={{ fontSize: 12, color: colors.muted }}>{o.items} item(s)</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{fmt(o.total)}</div>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))
          }
        </div>

        {/* Estoque baixo */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 600 }}>Estoque baixo</span>
            <button style={S.btnGhost} onClick={() => navigate('products')}>Ver produtos</button>
          </div>
          {d.lowStockItems.length === 0
            ? <p style={{ color: colors.muted, fontSize: 14 }}>Todos os produtos com estoque normal.</p>
            : d.lowStockItems.map(p => (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: `1px solid ${colors.border}`,
              }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                <span style={S.badge(colors.danger)}>{p.stock} un.</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
