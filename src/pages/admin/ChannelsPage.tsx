import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Channel } from '../../types/database'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Toggle } from '../../components/ui/Toggle'
import { Spinner } from '../../components/ui/Spinner'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { slugify } from '../../utils/validators'

export const ChannelsPage: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null)
  const [name, setName] = useState('')
  const [slogan, setSlogan] = useState('')
  const [caseFile, setCaseFile] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  // Delete confirm
  const [deletingChannel, setDeletingChannel] = useState<Channel | null>(null)

  const loadChannels = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setChannels(data || [])
    } catch (err) {
      console.error('Error loading channels:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChannels()
  }, [])

  const handleOpenCreate = () => {
    setEditingChannel(null)
    setName('')
    setSlogan('')
    setCaseFile('')
    setDescription('')
    setColor('#6366f1')
    setIsActive(true)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (ch: Channel) => {
    setEditingChannel(ch)
    setName(ch.name)
    setSlogan(ch.slogan || '')
    setCaseFile(ch.case_file || '')
    setDescription(ch.description || '')
    setColor(ch.color || '#6366f1')
    setIsActive(ch.is_active !== false)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    try {
      const slug = slugify(name)
      if (editingChannel) {
        const { error } = await supabase
          .from('channels')
          .update({
            name,
            slug,
            slogan,
            case_file: caseFile,
            description,
            color,
            is_active: isActive,
          })
          .eq('id', editingChannel.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('channels').insert({
          name,
          slug,
          slogan,
          case_file: caseFile,
          description,
          color,
          is_active: isActive,
        })

        if (error) throw error
      }

      await loadChannels()
      setIsModalOpen(false)
    } catch (err) {
      console.error('Error saving channel:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingChannel) return
    try {
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', deletingChannel.id)

      if (error) throw error
      await loadChannels()
      setDeletingChannel(null)
    } catch (err) {
      console.error('Error deleting channel:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Administración de Canales
          </h1>
          <p className="text-xs text-slate-500">
            Gestioná los canales de transmisión escolar para la Expo Innovarte 2026 e institucionales.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Nuevo Canal
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Cargando canales escolares..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {channels.map((ch) => (
            <Card key={ch.id} padding="none" className="flex flex-col overflow-hidden shadow-sm">
              <div className="h-3 w-full" style={{ backgroundColor: ch.color || '#6366f1' }} />
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: ch.color || '#6366f1' }}
                    >
                      {ch.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        ch.is_active ? 'text-emerald-500' : 'text-slate-400'
                      }`}
                    >
                      {ch.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {ch.name}
                  </h3>

                  {ch.slogan && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{ch.slogan}"
                    </p>
                  )}

                  {ch.case_file && (
                    <p className="text-[11px] text-slate-500">
                      Expediente: <strong className="text-slate-700 dark:text-slate-300">{ch.case_file}</strong>
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(ch)}
                    icon={<Edit2 className="w-3.5 h-3.5" />}
                    className="text-xs py-1 px-2.5"
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeletingChannel(ch)}
                    icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                    className="text-xs py-1 px-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingChannel ? `Editar Canal: ${editingChannel.name}` : 'Crear Nuevo Canal'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nombre del Canal"
            placeholder="Ej: Enigma TV, Alerta 10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Eslogan Institucional"
            placeholder="Ej: Investigar antes de afirmar"
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
          />

          <Input
            label="Expediente de Investigación"
            placeholder="Ej: La estación de las sombras"
            value={caseFile}
            onChange={(e) => setCaseFile(e.target.value)}
          />

          <Textarea
            label="Descripción del Canal"
            placeholder="Breve reseña sobre el equipo de primer año y sus temáticas."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Color Identificador
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0"
              />
              <span className="font-mono text-xs">{color}</span>
            </div>
          </div>

          <Toggle
            label="Canal Activo"
            description="Si está desactivado no se mostrará en la grilla pública ni en el estudio."
            checked={isActive}
            onChange={setIsActive}
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saving}>
              {editingChannel ? 'Guardar Cambios' : 'Crear Canal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingChannel}
        onClose={() => setDeletingChannel(null)}
        onConfirm={handleDelete}
        title="¿Eliminar Canal?"
        message={`Estás por eliminar el canal "${deletingChannel?.name}". Esta acción no se puede deshacer.`}
        confirmText="Eliminar Definitivamente"
        variant="danger"
      />
    </div>
  )
}
