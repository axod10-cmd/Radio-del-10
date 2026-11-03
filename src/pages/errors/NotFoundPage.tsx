import React from 'react'
import { Link } from 'react-router-dom'
import { Radio, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { ROUTES } from '../../config/constants'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
        <Radio className="w-8 h-8 opacity-70" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white">404</h1>
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
        Frecuencia no encontrada
      </h2>
      <p className="text-xs text-slate-500 max-w-sm">
        La página o transmisión que estás buscando no existe o fue movida.
      </p>
      <Link to={ROUTES.HOME}>
        <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
          Volver a Radio Escolar
        </Button>
      </Link>
    </div>
  )
}
