import React from 'react'
import type { RaceCategory, ReportMode } from '../types'
import { Printer, RotateCcw, FileText, ShieldAlert, CheckSquare, Layers, Sun, Moon } from 'lucide-react'

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
  isDarkMode: boolean
  onToggleDarkMode: () => void
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
  activeViolationCount,
  isDarkMode,
  onToggleDarkMode
}) => {
  const theme = {
    bg: isDarkMode ? 'bg-slate-950' : 'bg-white',
    border: isDarkMode ? 'border-slate-800' : 'border-gray-200',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-gray-600',
    cardBg: isDarkMode ? 'bg-slate-900' : 'bg-gray-100',
    borderInput: isDarkMode ? 'border-slate-700' : 'border-gray-300'
  }

  return (
    <header className={`${theme.bg} border-b ${theme.border} sticky top-0 z-30 shadow-md no-print`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* ロゴ & タイトル */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-900/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-lg font-bold ${theme.text} tracking-wide`}>技術違反報告書ジェネレーター</h1>
            <p className={`text-xs ${theme.textMuted}`}>PWA オフライン動作対応 / 公式A4帳票出力</p>
          </div>
        </div>

        {/* コントロール群 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* カテゴリ選択プルダウン */}
          <div className={`flex items-center gap-1.5 ${theme.cardBg} border ${theme.borderInput} rounded-lg px-2.5 py-1.5 focus-within:border-red-500 transition-colors`}>
            <label htmlFor="category-select" className={`text-xs font-semibold ${theme.textMuted} whitespace-nowrap`}>
              カテゴリ:
            </label>
            <select
              id="category-select"
              value={selectedCategory.id}
              onChange={(e) => {
                const found = categories.find((c) => c.id === e.target.value)
                if (found) onSelectCategory(found)
              }}
              className={`bg-transparent text-sm font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-700'} focus:outline-none cursor-pointer`}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className={isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 帳票様式切替ボタングループ */}
          <div className={`flex items-center ${theme.cardBg} border ${theme.borderInput} rounded-lg p-0.5`}>
            <button
              type="button"
              onClick={() => onToggleReportMode('selected_only')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                reportMode === 'selected_only'
                  ? 'bg-red-600 text-white shadow-xs'
                  : `${theme.textMuted} ${isDarkMode ? 'hover:text-slate-200' : 'hover:text-gray-800'}`
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
                  : `${theme.textMuted} ${isDarkMode ? 'hover:text-slate-200' : 'hover:text-gray-800'}`
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
                : `${theme.cardBg} ${theme.borderInput} ${theme.text} ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`
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

          {/* テーマ切り替えボタン */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            className={`p-1.5 rounded-lg border transition-all ${
              isDarkMode
                ? 'text-amber-400 hover:text-amber-300 bg-slate-800 border-slate-700 hover:bg-slate-700'
                : 'text-gray-600 hover:text-gray-800 bg-gray-100 border-gray-300 hover:bg-gray-200'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* リセットボタン */}
          <button
            onClick={onReset}
            title="入力をクリア"
            className={`p-1.5 rounded-lg border transition-colors ${
              isDarkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200 border-gray-300'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
