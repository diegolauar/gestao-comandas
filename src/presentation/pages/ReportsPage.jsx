import { useState, useEffect } from 'react'
import { useReports } from '../hooks/useReports'
import { PageHeader } from '../components/UI'
import { S, colors } from '../styles/theme'
import { Money } from '@domain/value-objects'

const RANGES = [['today','Hoje'],['week','7 dias'],['month','30 dias'],['all','Tudo']]

export default function ReportsPage() {
  const { salesReport: r, loadSalesReport } = useReports()
  const [range, setRange] = useState('week')

  useEffect(() => { loadSalesReport(range) }, [range, loadSalesReport])

  const fmt = Money.fmt

  return (
    <div style={S.pageWrapper}>
      <PageHeader
        title="Relatórios"
        subtitle="Análise de vendas"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            {RANGES.map(([k, l]) => (
              <button key={k} style={{
                ...S.btnGhost,
                background:  range === k ? colors.gold : 'transparent',
                color:       range === k ? '#000' : colors.muted,
                borderColor: range === k ? colors.gold : colors.border,
              }} onClick={() => setRange(k)}>{l}</button>
            ))}
          </div>
        }
      />

      {!r ? <p style={{ color: colors.muted }}>Carregando...</p> : (
        <>
          {/* KPIs */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Faturamento', val: fmt(r.totalSales),  color: colors.success },
              { label: 'Comandas',    val: r.totalOrders,      color: colors.gold    },
              { label: 'Ticket Médio',val: fmt(r.avgTicket),   color: colors.warn    },
            ].map(k => (
              <div key={k.label} style={{ ...S.card, flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 12, color: colors.muted, fontWeight: 500, textTransform: 'uppercase',
                  letterSpacing: '.05em', marginBottom: 10 }}>{k.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: k.color }}>{k.val}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* Gráfico de barras — 7 dias */}
            <div style={S.card}>
              <div style={{ fontWeight: 600, marginBottom: 18 }}>Vendas dos últimos 7 dias</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
                {r.dailySales.map(({ day, total }) => {
                  const maxVal = Math.max(...r.dailySales.map(d => d.total), 1)
                  const pct = Math.max((total / maxVal) * 80, total > 0 ? 4 : 2)
                  return (
                    <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 10, color: colors.muted }}>
                        {total > 0 ? fmt(total).replace('R$','').trim() : ''}
                      </div>
                      <div style={{ width: '100%', borderRadius: '4px 4px 0 0',
                        background: total > 0 ? colors.gold : colors.border, height: pct }} />
                      <div style={{ fontSize: 11, color: colors.muted, textAlign: 'center' }}>{day}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Formas de pagamento */}
            <div style={S.card}>
              <div style={{ fontWeight: 600, marginBottom: 18 }}>Formas de Pagamento</div>
              {r.paymentBreakdown.length === 0
                ? <p style={{ color: colors.muted, fontSize: 14 }}>Sem dados no período</p>
                : r.paymentBreakdown.map(({ method, total }) => {
                  const pct = r.totalSales ? (total / r.totalSales) * 100 : 0
                  return (
                    <div key={method} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                        <span>{method}</span>
                        <span style={{ fontWeight: 600 }}>{fmt(total)} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div style={{ background: colors.card2, borderRadius: 9999, height: 6 }}>
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 9999,
                          background: colors.gold, transition: 'width .4s' }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Top produtos */}
          <div style={S.card}>
            <div style={{ fontWeight: 600, marginBottom: 18 }}>Produtos mais vendidos</div>
            {r.topProducts.length === 0
              ? <p style={{ color: colors.muted, fontSize: 14 }}>Sem vendas no período.</p>
              : <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: `1px solid ${colors.border}` }}>
                      {['#','Produto','Qtd. vendida','Faturamento'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', color: colors.muted, fontWeight: 600, fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {r.topProducts.map((p, i) => (
                      <tr key={p.name} style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <td style={{ padding: '10px 12px', color: colors.muted, fontWeight: 700 }}>#{i + 1}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{p.name}</td>
                        <td style={{ padding: '10px 12px', color: colors.muted }}>{p.qty}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: colors.gold }}>{fmt(p.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </>
      )}
    </div>
  )
}
