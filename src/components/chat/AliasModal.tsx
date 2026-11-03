import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { isValidAlias, sanitizeAlias } from '../../utils/sanitize'
import { ShieldCheck, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'

export interface AliasModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveAlias: (alias: string) => void
}

export const AliasModal: React.FC<AliasModalProps> = ({ isOpen, onClose, onSaveAlias }) => {
  const [alias, setAlias] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRules, setShowRules] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleaned = sanitizeAlias(alias)
    const validation = isValidAlias(cleaned)
    if (!validation.valid) {
      setError(validation.error || 'Alias inválido')
      return
    }

    if (!acceptedTerms) {
      setError('Debés aceptar las normas de convivencia para participar del chat')
      return
    }

    sessionStorage.setItem('chat_alias', cleaned)
    sessionStorage.setItem('chat_terms_accepted', 'true')
    onSaveAlias(cleaned)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ingreso al Chat de Radio Escolar" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/40 text-xs text-indigo-700 dark:text-indigo-300">
          <MessageSquare className="w-5 h-5 shrink-0" />
          <span>
            Para comentar en vivo no necesitás registrarte. Solo elegí un apodo público y respetá a la comunidad escolar.
          </span>
        </div>

        <Input
          label="Tu Alias o Apodo (visible para todos)"
          placeholder="Ej: Sofi10, MateoR, OyenteLaRioja"
          value={alias}
          onChange={(e) => {
            setAlias(e.target.value)
            setError(null)
          }}
          error={error || undefined}
          helperText="De 2 a 20 caracteres. No utilices nombres reales completos ni datos personales."
          autoFocus
        />

        {/* Normas de convivencia */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/70 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => setShowRules(!showRules)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Normas de Convivencia y Seguridad Escolar
            </span>
            {showRules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRules && (
            <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 pl-4 list-disc border-t border-slate-200 dark:border-slate-800 pt-2">
              <li>Mantené siempre un trato cordial, respetuoso y constructivo.</li>
              <li>No se toleran insultos, groserías, burlas ni lenguaje ofensivo.</li>
              <li>Prohibido el acoso, amenazas o discriminación de cualquier tipo.</li>
              <li>No compartas datos personales propios ni de compañeros/as (teléfono, domicilio, redes personales).</li>
              <li>No se permite publicar enlaces a sitios externos ni publicidad.</li>
              <li>El chat cuenta con filtro automático y moderación activa por docentes.</li>
            </ul>
          )}
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>
            He leído y acepto las normas de convivencia del Colegio Provincial N.º 10.
          </span>
        </label>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={!alias.trim() || !acceptedTerms}>
            Entrar al Chat
          </Button>
        </div>
      </form>
    </Modal>
  )
}
