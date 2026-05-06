import logo from '@assets/logo.png'
import { Icon } from './UI'
import { colors } from '../styles/theme'
import { useApp } from '../context/AppContext'

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',     icon: 'dashboard' },
  { id: 'products',   label: 'Produtos',      icon: 'pack'      },
  { id: 'categories', label: 'Categorias',    icon: 'tag'       },
  { id: 'orders',     label: 'Comandas',      icon: 'orders'    },
  { id: 'neworder',   label: 'Nova Comanda',  icon: 'plus'      },
  { id: 'reports',    label: 'Relatórios',    icon: 'report'    },
  { id: 'backup',     label: 'Backup',        icon: 'backup'    },
]

export function Sidebar() {
  const { page, navigate, openOrderCount } = useApp()

  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      background: colors.card,
      borderRight: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{
        padding: '16px 12px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <img
          src={logo}
          alt="K2 Emporium"
          style={{ width: 160, height: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(n => {
          const active = page === n.id
          return (
            <button
              key={n.id}
              onClick={() => navigate(n.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                background: active ? colors.gold + '22' : 'transparent',
                color: active ? colors.gold : colors.muted,
                border: 'none',
                borderRadius: 8,
                padding: '10px 12px',
                cursor: 'pointer',
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                textAlign: 'left',
                transition: 'background .15s, color .15s',
                position: 'relative',
              }}
            >
              <Icon name={n.icon} size={17} color={active ? colors.gold : colors.muted} />
              <span>{n.label}</span>

              {n.id === 'orders' && openOrderCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: colors.warn,
                  color: '#000',
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '1px 7px',
                }}>
                  {openOrderCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div style={{
        padding: '12px 16px',
        borderTop: `1px solid ${colors.border}`,
        fontSize: 12,
        color: colors.muted,
      }}>
        {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
      </div>
    </aside>
  )
}
