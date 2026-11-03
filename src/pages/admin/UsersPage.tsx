import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Profile, UserRole } from '../../types/database'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Toggle } from '../../components/ui/Toggle'
import {
  Users,
  Mic,
  MicOff,
  CheckCircle,
  XCircle,
  Search,
  Filter,
} from 'lucide-react'

export const UsersPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Edit / Permission modal
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editRole, setEditRole] = useState<UserRole>('alumno')
  const [editCanBroadcast, setEditCanBroadcast] = useState(false)
  const [editIsActive, setEditIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (err) {
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleOpenEdit = (user: Profile) => {
    setSelectedUser(user)
    setEditRole(user.role)
    setEditCanBroadcast(user.can_broadcast || false)
    setEditIsActive(user.is_active !== false)
    setIsEditOpen(true)
  }

  const handleSavePermissions = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: editRole,
          can_broadcast: editCanBroadcast,
          is_active: editIsActive,
        })
        .eq('id', selectedUser.id)

      if (error) throw error
      await loadUsers()
      setIsEditOpen(false)
    } catch (err) {
      console.error('Error saving user permissions:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleQuickBroadcast = async (user: Profile) => {
    try {
      const nextState = !user.can_broadcast
      const { error } = await supabase
        .from('profiles')
        .update({ can_broadcast: nextState })
        .eq('id', user.id)

      if (error) throw error
      setProfiles((prev) =>
        prev.map((p) => (p.id === user.id ? { ...p, can_broadcast: nextState } : p))
      )
    } catch (err) {
      console.error('Error toggling broadcast:', err)
    }
  }

  const filteredUsers = profiles.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.display_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase()))

    const matchesRole = roleFilter === 'all' || p.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Usuarios y Permisos de Locución
          </h1>
          <p className="text-xs text-slate-500">
            Autorizá alumnos locutores, gestioná docentes y configurá roles de acceso.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100"
          >
            <option value="all">Todos los Roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="docente">Docentes</option>
            <option value="alumno">Alumnos</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" text="Cargando directorio de usuarios..." />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-8 text-center text-slate-400">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold">No se encontraron usuarios</p>
        </Card>
      ) : (
        <Card padding="none" className="overflow-x-auto shadow-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-3.5">Usuario / Alumno</th>
                <th className="px-4 py-3.5">Rol</th>
                <th className="px-4 py-3.5">Habilitado Transmisión</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <strong className="block text-slate-900 dark:text-white font-bold">
                      {u.display_name}
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      {u.email || u.full_name}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <Badge
                      variant={
                        u.role === 'superadmin'
                          ? 'danger'
                          : u.role === 'docente'
                          ? 'info'
                          : 'default'
                      }
                    >
                      {u.role}
                    </Badge>
                  </td>

                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => handleToggleQuickBroadcast(u)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        u.can_broadcast || u.role !== 'alumno'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {u.can_broadcast || u.role !== 'alumno' ? (
                        <>
                          <Mic className="w-3.5 h-3.5" />
                          <span>Autorizado al Aire</span>
                        </>
                      ) : (
                        <>
                          <MicOff className="w-3.5 h-3.5" />
                          <span>Sin Autorización</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                      {u.is_active !== false ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      {u.is_active !== false ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(u)}
                      className="text-xs py-1"
                    >
                      Editar Permisos
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Edit Permissions Modal */}
      {selectedUser && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Editar Permisos: ${selectedUser.display_name}`}
          size="md"
        >
          <div className="space-y-4">
            <Select
              label="Rol en la Plataforma"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as UserRole)}
              options={[
                { value: 'alumno', label: 'Alumno (Locutor si se autoriza)' },
                { value: 'docente', label: 'Docente (Transmisión y moderación)' },
                { value: 'superadmin', label: 'Superadministrador (Control total)' },
              ]}
            />

            <Toggle
              label="Permiso de Locución al Aire"
              description="Permite al alumno ingresar a la consola del estudio y abrir micrófono para transmitir."
              checked={editCanBroadcast || editRole !== 'alumno'}
              onChange={setEditCanBroadcast}
              disabled={editRole !== 'alumno'}
            />

            <Toggle
              label="Estado de la Cuenta"
              description="Desactivar esta opción suspende el acceso al sistema."
              checked={editIsActive}
              onChange={setEditIsActive}
            />

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSavePermissions}
                isLoading={saving}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
