import React from 'react'
import type { ReportFormData } from '../types'
import { getCategoryEvents } from '../utils/calendarMatcher'
import { Clock, Calendar, MapPin, Hash, Trophy, Flag, Sparkles } from 'lucide-react'

interface CompetitionInfoFormProps {
  categoryId: string
  formData: ReportFormData
  onChange: (field: keyof ReportFormData, value: any) => void
  onSetCurrentTime: () => void
  onAutoMatchEvent: () => void
}

const PRESET_SESSIONS = [
  { id: 'フリー走行', label: 'フリー走行' },
  { id: '公式予選', label: '公式予選' },
  { id: '決勝', label: '決勝' },
  { id: '公式練習', label: '公式練習' },
  { id: 'ウォームアップ', label: 'ウォームアップ' },
  { id: 'その他', label: 'その他' }
]

export const CompetitionInfoForm: React.FC<CompetitionInfoFormProps> = ({
  categoryId,
  formData,
  onChange,
  onSetCurrentTime,
  onAutoMatchEvent
}) => {
  const isCustomSession = formData.session === 'その他'
  const availableEvents = getCategoryEvents(categoryId)

  const handleSelectRound = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedEvent = availableEvents.find((ev) => ev.name === e.target.value)
    if (selectedEvent) {
      onChange('competitionName', selectedEvent.name)
    }
  }

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          大会・セッション基本情報
        </h2>
        <div className="flex items-center gap-2">
          {availableEvents.length > 0 && (
            <button
              type="button"
              onClick={onAutoMatchEvent}
              title="現在日時から直近・開催中の大会を自動判定してセット"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              大会自動判定
            </button>
          )}
          <button
            type="button"
            onClick={onSetCurrentTime}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md transition-colors"
          >
            <Clock className="w-3 h-3" />
            現在日時
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* 大会名 ＆ ラウンド選択 */}
        <div className="sm:col-span-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-400">
              大会名（競技会名称）
            </label>
            {availableEvents.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-slate-500">ラウンド選択:</span>
                <select
                  value={formData.competitionName}
                  onChange={handleSelectRound}
                  className="bg-slate-950 text-amber-400 border border-slate-700 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-red-500"
                >
                  <option value="">-- ラウンド一覧から選択 --</option>
                  {availableEvents.map((ev) => (
                    <option key={ev.round} value={ev.name}>
                      {ev.round} ({ev.circuit})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <input
            type="text"
            value={formData.competitionName}
            onChange={(e) => onChange('competitionName', e.target.value)}
            placeholder="例: 2026年 全日本スーパーフォーミュラ選手権 第 1 戦"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          />
        </div>

        {/* ゼッケン No */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Hash className="w-3.5 h-3.5 text-red-400" />
            ゼッケン No.（カーナンバー）
          </label>
          <input
            type="text"
            value={formData.carNumber}
            onChange={(e) => onChange('carNumber', e.target.value)}
            placeholder="例: 1"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-red-400 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          />
        </div>

        {/* セッション選択 */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
            <Flag className="w-3.5 h-3.5 text-amber-400" />
            セッション
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            {PRESET_SESSIONS.map(({ id, label }) => {
              const isSelected = formData.session === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChange('session', id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-950 ring-1 ring-red-400'
                      : 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              )
            })}

            {/* 「その他」選択時の自由入力欄 */}
            {isCustomSession && (
              <input
                type="text"
                value={formData.customSessionName || ''}
                onChange={(e) => onChange('customSessionName', e.target.value)}
                placeholder="セッション名を入力 (例: 専有走行, サファリ)"
                className="bg-slate-950 border border-red-500 rounded-lg px-2.5 py-1 text-xs text-amber-300 placeholder-slate-500 focus:outline-none flex-1 min-w-[150px]"
              />
            )}
          </div>
        </div>

        {/* 発生日付 */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            発生日
          </label>
          <input
            type="date"
            value={formData.incidentDate}
            onChange={(e) => onChange('incidentDate', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* 発生時刻 */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            発生時刻
          </label>
          <input
            type="time"
            value={formData.incidentTime}
            onChange={(e) => onChange('incidentTime', e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* 発生場所 */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            発生場所
          </label>
          <input
            type="text"
            value={formData.incidentLocation}
            onChange={(e) => onChange('incidentLocation', e.target.value)}
            placeholder="例: ピット作業エリア / ファストレーン"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>
      </div>
    </section>
  )
}
