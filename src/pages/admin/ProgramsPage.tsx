import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Program, Channel, ProgramStatus } from '../../types/database'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Plus, Edit2, Trash2, Clock } from 'lucide-react'
import { formatDate } from '../../utils/formatters'

interface ProgramWithChannel extends Program {
  channel?: Channel
}

export const ProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<ProgramWithChannel[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [channelId, setChannelId] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [status, setStatus] = useState<ProgramStatus>('scheduled')
  const [saving, setSaving] = useState(false)

  // Delete confirm
  const [deletingProgram, setDeletingProgram] = useState<Program | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [progsRes, chansRes] = await Promise.all([
        supabase
          .from('programs')
          .select('*, channel:channels(*)')
          .order('scheduled_date', { ascending: false }),
        supabase.from('channels').select('*').eq('is_active', true),
      ])

      setPrograms(progsRes.data || [])
      setChannels(chansRes.data || [])
    } catch (err) {
      console.error('Error loading programs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingProgram(null)
    setName('')
    setDescription('')
    setChannelId(channels[0]?.id || '')
    setScheduledDate(new Date().toISOString().split('T')[0])
    setTimeStart('10:00')
    setTimeEnd('11:00')
    setStatus('scheduled')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (prog: Program) => {
    setEditingProgram(prog)
    setName(prog.name)
    setDescription(prog.description || '')
    setChannelId(prog.channel_id)
    setScheduledDate(prog.scheduled_date || '')
    setTimeStart(prog.scheduled_time_start || '')
    setTimeEnd(prog.scheduled_time_end || '')
    setStatus(prog.status)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !channelId) return

    setSaving(true)
    try {
      if (editingProgram) {
        const { error } = await supabase
          .from('programs')
          .update({
            name,
            description,
            channel_id: channelId,
            scheduled_date: scheduledDate || null,
            scheduled_time_start: timeStart || null,
            scheduled_time_end: timeEnd || null,
            status,
          })
          .eq('id', editingProgram.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('programs').insert({
          name,
          description,
          channel_id: channelId,
          scheduled_date: scheduledDate || null,
          scheduled_time_start: timeStart || null,
          scheduled_time_end: timeEnd || null,
          status,
        })

        if (error) throw error
      }

      await loadData()
      setIsModalOpen(false)
    } catch (err) {
      console.error('Error saving program:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingProgram) return
    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', deletingProgram.id)

      if (error) throw error
      await loadData()
      setDeletingProgram(null)
    } catch (err) {
      console.error('Error deleting program:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Programación de Emisiones
          </h1>
          <p className="text-xs text-slate-500">
            Organizá la grilla horaria de transmisiones para los canales de primer año.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Agendar Programa
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Cargando grilla..." />
        </div>
      ) : (
        <Card padding="none" className="overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-3.5">Programa</th>
                <th className="px-4 py-3.5">Canal</th>
                <th className="px-4 py-3.5">Fecha y Horario</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {programs.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3.5">
                    <strong className="block text-slate-900 dark:text-white font-bold">
                      {p.name}
                    </strong>
                    {p.description && (
                      <span className="text-[11px] text-slate-400 line-clamp-1">
                        {p.description}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: p.channel?.color || '#6366f1' }}
                    >
                      {p.channel?.name || 'Canal'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        {p.scheduled_date ? formatDate(p.scheduled_date) : 'Sin fecha'}
                        {p.scheduled_time_start ? ` • ${p.scheduled_time_start.slice(0, 5)}` : ''}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <Badge
                      variant={
                        p.status === 'live'
                          ? 'live'
                          : p.status === 'completed'
                          ? 'default'
                          : 'info'
                      }
                    >
                      {p.status}
                    </Badge>
                  </td>

                  <td className="px-5 py-3.5 text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(p)}
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                      className="text-xs py-1 px-2.5"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeletingProgram(p)}
                      icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                      className="text-xs py-1 px-2 text-rose-500 hover:bg-rose-50"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProgram ? 'Editar Programa' : 'Agendar Nueva Emisión'}
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nombre del Programa"
            placeholder="Ej: Crónicas de La Rioja, Expediente Secreto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label="Canal Asignado"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            options={channels.map((c) => ({ value: c.id, label: c.name }))}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Fecha"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
            <Input
              label="Hora Inicio"
              type="time"
              value={timeStart}
              onChange={(e) => setTimeStart(e.target.value)}
            />
            <Input
              label="Hora Fin"
              type="time"
              value={timeEnd}
              onChange={(e) => setTimeEnd(e.target.value)}
            />
          </div>

          <Select
            label="Estado de la Emisión"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProgramStatus)}
            options={[
              { value: 'scheduled', label: 'Programado' },
              { value: 'live', label: 'En el Aire' },
              { value: 'completed', label: 'Completado' },
              { value: 'cancelled', label: 'Cancelado' },
            ]}
          />

          <Textarea
            label="Descripción o Sinopsis"
            placeholder="Detalles sobre los temas que abordarán los estudiantes."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={saving}>
              {editingProgram ? 'Guardar Cambios' : 'Agendar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingProgram}
        onClose={() => setDeletingProgram(null)}
        onConfirm={handleDelete}
        title="¿Eliminar Programa?"
        message={`Estás por eliminar "${deletingProgram?.name}".`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  )
}
