import React from 'react'
import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export const OfflinePage: React.FC = () => {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
        <WifiOff className="w-8 h-8 opacity-75" />
      </div>
      <h2 className="text-xl font-black text-slate-900 dark:text-white">
        Conexión a Internet Interrumpida
      </h2>
      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
        La transmisión de audio en vivo y el chat de Radio Escolar requieren una conexión a Internet activa para sincronizar en tiempo real.
      </p>
      <Button
        variant="primary"
        onClick={handleRetry}
        icon={<RefreshCw className="w-4 h-4" />}
      >
        Reintentar Conexión
      </Button>
    </div>
  )
}
