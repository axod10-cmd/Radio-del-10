import React from 'react'
import { BroadcastControls } from '../../components/studio/BroadcastControls'
import { ChatBox } from '../../components/chat/ChatBox'
import { Mic, ShieldCheck, Sparkles } from 'lucide-react'

export const StudioPage: React.FC = () => {

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider">
            <Mic className="w-4 h-4 animate-pulse" />
            <span>Consola de Transmisión WebRTC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Estudio Principal al Aire
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Permiso de Locución: Concedido</span>
          </span>
        </div>
      </div>

      {/* Main Console & Broadcaster Chat Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Controls (8 cols) */}
        <div className="lg:col-span-8">
          <BroadcastControls />
        </div>

        {/* Right Column: In-Studio Audience Chat (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Feedback de la Audiencia</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Podés leer los mensajes de los oyentes en tiempo real mientras transmitís.
            </p>
          </div>

          <ChatBox />
        </div>
      </div>
    </div>
  )
}
