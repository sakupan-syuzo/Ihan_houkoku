import React from 'react'
import type { RaceCategory, ReportMode } from '../types'
import { Printer, RotateCcw, FileText, ShieldAlert, CheckSquare, Layers } from 'lucide-react'

interface HeaderProps {
  categories: RaceCategory[]
  selectedCategory: RaceCategory
  onSelectCategory: (category: RaceCategory) => void
  onReset: () => void
  onPrint: () => void
  isPreviewMode: boolean
  onTogglePreview: () => void
  reportMode: ReportMode
  onToggleReportMode: (mode: ReportMode) => void
  activeViolationCount: number
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onReset,
  onPrint,
  isPreviewMode,
  onTogglePreview,
  reportMode,
  onToggleReportMode,
  activeViolationCount
}) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 shadow-md no-print">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* ロゴ & タイトル */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-900/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-wide">技術違反報告書ジェネレーター</h1>
            <p className="text-xs text-slate-400">PWA オフライン動作対応 / 公式A4帳票出力</p>
          </div>
        </div>

        {/* コントロール群 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* カテゴリ選択プルダウン */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 focus-within:border-red-500 transition-colors">
            <label htmlFor="category-select" className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              カテゴリ:
            </label>
            <select
              id="category-select"
              value={selectedCategory.id}
              onChange={(e) => {
                const found = categories.find((c) => c.id === e.target.value)
                if (found) onSelectCategory(found)
              }}
              className="bg-transparent text-sm font-bold text-amber-400 focus:outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-100">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 帳票様式切替ボタングループ */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onToggleReportMode('selected_only')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                reportMode === 'selected_only'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="チェックした違反項目のみをA4にスッキリ抽出して出力"
            >
              <CheckSquare className="w-3 h-3" />
              該当違反のみ抽出
            </button>
            <button
              type="button"
              onClick={() => onToggleReportMode('full_sheet')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                reportMode === 'full_sheet'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="原本そのままの全項目チェックシート形式で出力"
            >
              <Layers className="w-3 h-3" />
              全項目様式
            </button>
          </div>

          {/* プレビュー切替ボタン（スマホ向け） */}
          <button
            onClick={onTogglePreview}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all md:hidden ${
              isPreviewMode
                ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/30'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {isPreviewMode ? '入力へ' : 'プレビュー'}
            {activeViolationCount > 0 && (
              <span className="bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold ml-0.5">
                {activeViolationCount}
              </span>
            )}
          </button>

          {/* 印刷・PDF出力ボタン */}
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50 transition-all active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            印刷 / PDF保存
          </button>

          {/* リセットボタン */}
          <button
            onClick={onReset}
            title="入力をクリア"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
