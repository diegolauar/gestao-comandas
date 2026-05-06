import { useState, useEffect } from 'react'
import { useCategories } from '../hooks/useCategories'
import { Icon, Field, Modal, ConfirmDialog, PageHeader, EmptyState } from '../components/UI'
import { S, colors, getCategoryColor } from '../styles/theme'

const BLANK = { id: '', name: '' }

export default function CategoriesPage() {
  const { categories, load, save, remove } = useCategories()
  const [modal,   setModal]   = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [form,    setForm]    = useState(BLANK)

  useEffect(() => { load() }, [load])

  const openNew  = () => { setForm({ ...BLANK }); setModal(true) }
  const openEdit = (c) => { setForm({ ...c }); setModal(true) }

  const handleSave = async () => {
    if (!form.name.trim()) return
    const isNew = !form.id
    const id    = form.id || crypto.randomUUID()
    const ok    = await save({ id, name: form.name.trim(), isNew })
    if (ok) setModal(false)
  }

  return (
    <div style={S.pageWrapper}>
      {confirm && (
        <ConfirmDialog
          message={`Remover categoria "${confirm.name}"?`}
          onConfirm={() => { remove(confirm.id, confirm.name); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}

      <PageHeader
        title="Categorias"
        subtitle={`${categories.length} categoria(s) cadastrada(s)`}
        action={
          <button style={S.btn()} onClick={openNew}>
            <Icon name="plus" size={16} /> Nova Categoria
          </button>
        }
      />

      {categories.length === 0
        ? <EmptyState message="Nenhuma categoria cadastrada." />
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {categories.map(c => {
              const color = getCategoryColor(c.name)
              return (
                <div key={c.id} style={{
                  ...S.card,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderLeft: `4px solid ${color}`,
                }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      style={{ ...S.btnGhost, padding: '6px 8px' }}
                      onClick={() => openEdit(c)}
                    >
                      <Icon name="edit" size={14} />
                    </button>
                    <button
                      style={{ ...S.btnGhost, color: colors.danger, borderColor: colors.danger + '44', padding: '6px 8px' }}
                      onClick={() => setConfirm(c)}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )
      }

      {modal && (
        <Modal
          title={form.id ? 'Editar Categoria' : 'Nova Categoria'}
          onClose={() => setModal(false)}
          width={400}
        >
          <Field label="Nome da Categoria">
            <input
              style={S.input}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Cerveja, Refrigerante..."
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </Field>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button style={S.btnGhost} onClick={() => setModal(false)}>Cancelar</button>
            <button style={S.btn()} onClick={handleSave}>
              <Icon name="check" size={14} /> Salvar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
