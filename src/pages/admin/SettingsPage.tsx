import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { RadioSettings } from '../../types/database'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { Toggle } from '../../components/ui/Toggle'
import { Spinner } from '../../components/ui/Spinner'
import { Save, CheckCircle } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<RadioSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form fields
  const [radioName, setRadioName] = useState('RADIO ESCOLAR')
  const [institutionName, setInstitutionName] = useState('Colegio Provincial N.º 10')
  const [welcomeMessage, setWelcomeMessage] = useState('¡Bienvenidos a Radio Escolar!')
  const [primaryColor, setPrimaryColor] = useState('#6366f1')
  const [retentionDays, setRetentionDays] = useState(90)
  const [allowSimultaneous, setAllowSimultaneous] = useState(false)
  const [privacyPolicy, setPrivacyPolicy] = useState('')

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('radio_settings')
          .select('*')
          .limit(1)
          .maybeSingle()

        if (error) throw error
        if (data) {
          setSettings(data)
          setRadioName(data.radio_name || 'RADIO ESCOLAR')
          setInstitutionName(data.institution_name || 'Colegio Provincial N.º 10')
          setWelcomeMessage(data.welcome_message || '¡Bienvenidos a Radio Escolar!')
          setPrimaryColor(data.primary_color || '#6366f1')
          setRetentionDays(data.recording_retention_days || 90)
          setAllowSimultaneous(data.allow_simultaneous_broadcasts || false)
          setPrivacyPolicy(data.privacy_policy || '')
        }
      } catch (err) {
        console.error('Error loading settings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)

    try {
      if (settings?.id) {
        const { error } = await supabase
          .from('radio_settings')
          .update({
            radio_name: radioName,
            institution_name: institutionName,
            welcome_message: welcomeMessage,
            primary_color: primaryColor,
            recording_retention_days: retentionDays,
            allow_simultaneous_broadcasts: allowSimultaneous,
            privacy_policy: privacyPolicy,
          })
          .eq('id', settings.id)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('radio_settings')
          .insert({
            radio_name: radioName,
            institution_name: institutionName,
            welcome_message: welcomeMessage,
            primary_color: primaryColor,
            recording_retention_days: retentionDays,
            allow_simultaneous_broadcasts: allowSimultaneous,
            privacy_policy: privacyPolicy,
          })
          .select()
          .single()

        if (error) throw error
        if (data) setSettings(data)
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" text="Cargando configuración institucional..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Configuración General de la Radio
        </h1>
        <p className="text-xs text-slate-500">
          Personalizá la identidad del Colegio Provincial N.º 10, políticas de transmisión y retención de grabaciones.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Configuración guardada exitosamente.</span>
          </div>
        )}

        {/* Identity */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Identidad Institucional
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre de la Radio"
              value={radioName}
              onChange={(e) => setRadioName(e.target.value)}
              required
            />

            <Input
              label="Institución Educativa"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Mensaje de Bienvenida"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Color Primario Institucional
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0"
              />
              <span className="font-mono text-xs">{primaryColor}</span>
            </div>
          </div>
        </Card>

        {/* Transmission & Security Rules */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Reglas de Transmisión en Vivo
          </h3>

          <Toggle
            label="Permitir Transmisiones Simultáneas"
            description="Por seguridad, la plataforma impide que dos programas o canales transmitan al mismo tiempo para no generar interferencias, a menos que esta opción esté explícitamente activada."
            checked={allowSimultaneous}
            onChange={setAllowSimultaneous}
          />

          <div className="space-y-1.5 max-w-xs">
            <Input
              label="Días de Conservación de Grabaciones"
              type="number"
              min="7"
              max="365"
              value={retentionDays.toString()}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              helperText="Periodo antes de la depuración automática de archivos no publicados."
            />
          </div>
        </Card>

        {/* Privacy Policy */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Políticas de Privacidad y Consentimiento de Menores
          </h3>

          <Textarea
            label="Términos y Normativas del Colegio"
            rows={5}
            value={privacyPolicy}
            onChange={(e) => setPrivacyPolicy(e.target.value)}
            placeholder="Normativas aplicables a la transmisión y publicación de voces de estudiantes menores de edad..."
          />
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={saving}
            icon={<Save className="w-5 h-5" />}
          >
            Guardar Configuración
          </Button>
        </div>
      </form>
    </div>
  )
}
