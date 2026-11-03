import React from 'react'
import { Link } from 'react-router-dom'
import { useRadio } from '../../context/RadioContext'
import { AudioPlayer } from '../../components/player/AudioPlayer'
import { ChatBox } from '../../components/chat/ChatBox'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import {
  Radio,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  Headphones,
  Award,
} from 'lucide-react'
import { ROUTES } from '../../config/constants'

export const HomePage: React.FC = () => {
  const { channels } = useRadio()

  return (
    <div className="space-y-10">
      {/* Hero Announcement Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-10 shadow-2xl">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Colegio Provincial N.º 10 — La Rioja, Argentina</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            La voz de nuestros estudiantes al aire.
          </h1>

          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed max-w-2xl">
            Transmisión oficial de Radio Escolar para la <strong>Expo Innovarte 2026</strong>. Sintonizá los cuatro canales periodísticos producidos por estudiantes de primer año y participá del chat en vivo.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link to={ROUTES.SCHEDULE}>
              <Button
                variant="secondary"
                size="sm"
                icon={<Calendar className="w-4 h-4" />}
                className="bg-white/90 hover:bg-white text-indigo-900 font-bold"
              >
                Ver Grilla de Programación
              </Button>
            </Link>
            <Link to={ROUTES.ARCHIVE}>
              <Button
                variant="ghost"
                size="sm"
                icon={<Headphones className="w-4 h-4" />}
                className="text-white hover:bg-white/10 border border-white/20"
              >
                Escuchar Grabaciones
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Broadcast & Chat Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Audio Player (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <AudioPlayer />

          {/* Quick Info Featurette */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                <Radio className="w-4 h-4" />
                <span>Audio WebRTC</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Transmisión en tiempo real sin latencia desde nuestro estudio escolar.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <Shield className="w-4 h-4" />
                <span>Chat Protegido</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Filtro automático de lenguaje y moderación por el equipo docente.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
                <Award className="w-4 h-4" />
                <span>Expo 2026</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Proyectos periodísticos y de investigación de 1er año.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Public Live Chat (5 cols) */}
        <div className="lg:col-span-5">
          <ChatBox />
        </div>
      </div>

      {/* 4 Canales de Expo Innovarte 2026 */}
      <section className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Expo Innovarte 2026</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Los Cuatro Canales Periodísticos
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Investigaciones sonoras, entrevistas y misterios escolares producidos por nuestros estudiantes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {channels.map((channel) => (
            <Card
              key={channel.id}
              hover
              padding="none"
              className="flex flex-col overflow-hidden group shadow-md"
            >
              {/* Top Accent Strip */}
              <div
                className="h-2.5 w-full transition-transform duration-300 group-hover:scale-y-125"
                style={{ backgroundColor: channel.color || '#6366f1' }}
              />

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: channel.color || '#6366f1' }}
                    >
                      {channel.name}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {channel.name}
                  </h3>

                  {channel.slogan && (
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 italic">
                      "{channel.slogan}"
                    </p>
                  )}

                  {channel.case_file && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-[11px] space-y-0.5">
                      <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">
                        Expediente de Investigación:
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">
                        {channel.case_file}
                      </span>
                    </div>
                  )}

                  {channel.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {channel.description}
                    </p>
                  )}
                </div>

                <Link
                  to={`/canal/${channel.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:gap-2.5 transition-all pt-2 border-t border-slate-100 dark:border-slate-800"
                >
                  <span>Ver Ficha del Canal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
