import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { Icon, PageHeader } from '../components/UI'
import { S, colors } from '../styles/theme'

const pad = n => String(n).padStart(2, '0')
const now = new Date()
const todayLabel = `${pad(now.getDate())}-${pad(now.getMonth()+1)}-${now.getFullYear()}`
const monthLabel = `${now.getFullYear()}-${pad(now.getMonth()+1)}`

const EXPORT_OPTIONS = [
  {
    type: 'today', label: 'Backup do Dia', icon: 'calendar', color: colors.success,
    desc: `Exporta todos os pedidos de hoje (${todayLabel})`,
    file: (fmt) => `K2_${todayLabel}.${fmt === 'excel' ? 'xlsx' : 'json'}`,
  },
  {
    type: 'month', label: 'Backup Mensal', icon: 'folder', color: colors.gold,
    desc: `Exporta todos os pedidos de ${monthLabel}`,
    file: (fmt) => `K2_${monthLabel}_completo.${fmt === 'excel' ? 'xlsx' : 'json'}`,
  },
  {
    type: 'all', label: 'Backup Completo', icon: 'backup', color: colors.warn,
    desc: 'Exporta todos os pedidos e produtos',
    file: (fmt) => `K2_backup_${todayLabel}.${fmt === 'excel' ? 'xlsx' : 'json'}`,
  },
]

export default function BackupPage() {
  const showToast = useToast()
  const [format, setFormat] = useState('json')
  const [loading, setLoading] = useState(false)

  const handleExport = async (type) => {
    setLoading(true)
    try {
      const result = await window.api.backup.export({ type, format })
      if (result.cancelled) return
      if (result.success) {
        showToast(`Exportado! ${result.totalOrders} pedido(s).`)
      } else {
        showToast(result.error || 'Erro ao exportar', 'error')
      }
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setLoading(true)
    try {
      const result = await window.api.backup.import()
      if (result.cancelled) return
      if (result.success) {
        showToast(`Importado: ${result.importedOrders} pedido(s), ${result.importedProducts} produto(s), ${result.importedCategories ?? 0} categoria(s)`)
      } else {
        showToast(result.error || 'Erro ao importar', 'error')
      }
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ ...S.pageWrapper, maxWidth: 900 }}>
      <PageHeader
        title="Backup & Arquivos"
        subtitle="Exporte seus dados em JSON ou Excel e guarde onde quiser"
      />

      {/* Formato */}
      <div style={{ ...S.card, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Formato de exportação:</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['json','JSON'],['excel','Excel (.xlsx)']].map(([k, l]) => (
            <button key={k} style={{
              ...S.btnGhost,
              background:  format === k ? colors.gold : 'transparent',
              color:       format === k ? '#000' : colors.muted,
              borderColor: format === k ? colors.gold : colors.border,
            }} onClick={() => setFormat(k)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Cards de exportação */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {EXPORT_OPTIONS.map(opt => (
          <div key={opt.type} style={S.card}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ background: opt.color + '22', borderRadius: 8, padding: 8 }}>
                <Icon name={opt.icon} size={18} color={opt.color} />
              </div>
              <span style={{ fontWeight: 700 }}>{opt.label}</span>
            </div>
            <p style={{ fontSize: 13, color: colors.muted, marginBottom: 14, lineHeight: 1.5 }}>{opt.desc}</p>
            <div style={{ fontSize: 12, color: colors.muted, marginBottom: 14, fontFamily: 'monospace',
              background: colors.card2, padding: '6px 10px', borderRadius: 6 }}>
              📄 {opt.file(format)}
            </div>
            <button
              style={{ ...S.btn(opt.color), width: '100%', justifyContent: 'center' }}
              onClick={() => handleExport(opt.type)}
              disabled={loading}
            >
              <Icon name="download" size={15} /> Exportar
            </button>
          </div>
        ))}
      </div>

      {/* Importar */}
      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Importar Arquivo JSON</div>
            <div style={{ fontSize: 13, color: colors.muted }}>Restaure pedidos e produtos a partir de um backup</div>
          </div>
          <button style={S.btn()} onClick={handleImport} disabled={loading}>
            <Icon name="upload" size={15} /> Selecionar arquivo
          </button>
        </div>
        <div style={{ background: colors.card2, borderRadius: 8, padding: '12px 16px', fontSize: 13, color: colors.muted }}>
          ⚠️ Apenas registros com IDs novos serão importados — duplicatas são ignoradas automaticamente.
        </div>
      </div>
    </div>
  )
}
