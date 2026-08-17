import React, { useState, useEffect } from 'react'
import rulesDataRaw from './data/rulesData.json'
import type { RaceCategory, ReportFormData, ReportMode, RulesData, ViolationInputState } from './types'
import { Header } from './components/Header'
import { CompetitionInfoForm } from './components/CompetitionInfoForm'
import { DynamicViolationForm } from './components/DynamicViolationForm'
import { ReportDocument } from './components/ReportDocument'
import { findClosestEvent } from './utils/calendarMatcher'
import { FileText, Eye, Printer, ShieldCheck } from 'lucide-react'

const rulesData = rulesDataRaw as unknown as RulesData
const STORAGE_KEY = 'motorsport_violation_report_v1'

export const App: React.FC = () => {
  const categories = rulesData.categories
  const [selectedCategory, setSelectedCategory] = useState<RaceCategory>(categories[0])
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false)
  const [reportMode, setReportMode] = useState<ReportMode>('selected_only')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : false // デフォルトはライトモード
  })

  // テーマ変更をローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  // フォームデータ初期値
  const [formData, setFormData] = useState<ReportFormData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse saved form data', e)
      }
    }

    // 初回起動時は現在時刻から直近の大会を自動判定
    const initialEvent = findClosestEvent(categories[0].id)
    return {
      categoryId: categories[0].id,
      competitionName: initialEvent?.name || '2026 年 全日本スーパーフォーミュラ選手権 第 1 戦',
      roundNo: initialEvent?.round || '1',
      session: '公式予選',
      carNumber: '1',
      incidentDate: new Date().toISOString().split('T')[0],
      incidentTime: new Date().toTimeString().slice(0, 5),
      incidentLocation: 'ピット作業エリア',
      violations: {},
      additionalNotes: '',
      entrantSignTime: '',
      techDelegateSignTime: '',
      chiefTechSignTime: ''
    }
  })

  // ローカルストレージ自動保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
  }, [formData])

  // カテゴリ変更時のハンドラー（カレンダーから直近の大会を自動セット）
  const handleSelectCategory = (cat: RaceCategory) => {
    setSelectedCategory(cat)
    const closestEvent = findClosestEvent(cat.id, formData.incidentDate)
    setFormData((prev) => ({
      ...prev,
      categoryId: cat.id,
      competitionName: closestEvent?.name || (cat.id === 'sf' 
        ? '2026 年 全日本スーパーフォーミュラ選手権 第 1 戦'
        : cat.id === 'sgt'
        ? '2026 AUTOBACS SUPER GT Round 1'
        : cat.id === 'sfl'
        ? '2026 全日本スーパーフォーミュラ・ライツ選手権 第 1 戦'
        : cat.id === 'stai'
        ? 'ENEOS スーパー耐久シリーズ 2026 第 1 戦'
        : '2026 JAF公認 競技大会')
    }))
  }

  // 大会情報更新
  const handleFormChange = (field: keyof ReportFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  // 現在日時のセット ＆ 大会自動判定
  const handleSetCurrentTime = () => {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    setFormData((prev) => ({
      ...prev,
      incidentDate: dateStr,
      incidentTime: now.toTimeString().slice(0, 5)
    }))
  }

  // 大会自動判定ボタン
  const handleAutoMatchEvent = () => {
    const matched = findClosestEvent(selectedCategory.id, formData.incidentDate)
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        competitionName: matched.name
      }))
    }
  }

  // 違反項目更新
  const handleUpdateViolation = (itemId: string, update: Partial<ViolationInputState>) => {
    setFormData((prev) => {
      const current = prev.violations[itemId] || { checked: false }
      return {
        ...prev,
        violations: {
          ...prev.violations,
          [itemId]: {
            ...current,
            ...update
          }
        }
      }
    })
  }

  // リセット
  const handleReset = () => {
    if (window.confirm('入力内容を初期化してもよろしいですか？')) {
      const closestEvent = findClosestEvent(selectedCategory.id)
      const resetData: ReportFormData = {
        categoryId: selectedCategory.id,
        competitionName: closestEvent?.name || '',
        roundNo: closestEvent?.round || '',
        session: '公式予選',
        carNumber: '',
        incidentDate: new Date().toISOString().split('T')[0],
        incidentTime: new Date().toTimeString().slice(0, 5),
        incidentLocation: 'ピット作業エリア',
        violations: {},
        additionalNotes: '',
        entrantSignTime: '',
        techDelegateSignTime: '',
        chiefTechSignTime: ''
      }
      setFormData(resetData)
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // 印刷実行
  const handlePrint = () => {
    window.print()
  }

  // 選択中の違反数
  const activeViolationCount = Object.values(formData.violations).filter((v) => v.checked).length

  // テーマによる動的クラス
  const theme = {
    bg: isDarkMode ? 'bg-slate-950' : 'bg-gray-50',
    text: isDarkMode ? 'text-slate-100' : 'text-slate-900',
    cardBg: isDarkMode ? 'bg-slate-900/80' : 'bg-white',
    border: isDarkMode ? 'border-slate-800' : 'border-gray-300'
  }

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} flex flex-col`}>
      {/* 画面ヘッダー（ナビゲーション & モード切替） */}
      <Header
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onReset={handleReset}
        onPrint={handlePrint}
        isPreviewMode={isPreviewMode}
        onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
        reportMode={reportMode}
        onToggleReportMode={setReportMode}
        activeViolationCount={activeViolationCount}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 print:p-0 print:m-0 print:max-w-none">
        {/* モード切替タブ（スマホ用） */}
        <div className={`flex border-b ${theme.border} mb-6 no-print md:hidden`}>
          <button
            onClick={() => setIsPreviewMode(false)}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              !isPreviewMode
                ? `border-red-500 text-red-400 ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-100'}`
                : `border-transparent ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            入力フォーム
          </button>
          <button
            onClick={() => setIsPreviewMode(true)}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              isPreviewMode
                ? `border-amber-500 text-amber-400 ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-100'}`
                : `border-transparent ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            帳票プレビュー
            {activeViolationCount > 0 && (
              <span className="bg-red-600 text-white rounded-full px-1.5 py-0.2 text-[10px]">
                {activeViolationCount}
              </span>
            )}
          </button>
        </div>

        {/* 2カラム表示 (PC時) または タブ表示 (スマホ時) */}
        <div className="print-container-wrapper grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 左側: 入力フォームエリア */}
          <div
            className={`space-y-6 lg:col-span-5 xl:col-span-5 ${
              isPreviewMode ? 'hidden lg:block' : 'block'
            } no-print`}
          >
            {/* 大会基本情報フォーム（カレンダー自動判定連動） */}
            <CompetitionInfoForm
              categoryId={selectedCategory.id}
              formData={formData}
              onChange={handleFormChange}
              onSetCurrentTime={handleSetCurrentTime}
              onAutoMatchEvent={handleAutoMatchEvent}
              isDarkMode={isDarkMode}
            />

            {/* 規則条文に基づく動的違反フォーム ＋ フリースペース */}
            <DynamicViolationForm
              category={selectedCategory}
              violations={formData.violations}
              onUpdateViolation={handleUpdateViolation}
              additionalNotes={formData.additionalNotes}
              onNotesChange={(notes) => handleFormChange('additionalNotes', notes)}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* 右側: A4公式帳票プレビューエリア */}
          <div
            className={`print-target-container lg:col-span-7 xl:col-span-7 ${
              !isPreviewMode ? 'hidden lg:block print:!block' : 'block'
            }`}
          >
            <div className="lg:sticky lg:top-20 print:static">
              <div className="flex items-center justify-between mb-3 no-print">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'} flex items-center gap-1`}>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    公式帳票 A4 印刷プレビュー
                  </span>
                  <span className={`text-[11px] font-semibold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-gray-200 border-gray-300 text-amber-700'} px-2 py-0.5 rounded border`}>
                    {reportMode === 'selected_only' ? '該当違反のみ抽出' : '全項目様式'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="text-xs font-bold text-white bg-red-600 hover:bg-red-500 border border-red-500 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg shadow-red-950 transition-all active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  印刷 / PDF保存
                </button>
              </div>

              {/* 印刷・帳票コンポーネント本体 */}
              <div className={`${theme.cardBg} p-2 sm:p-6 rounded-xl border ${theme.border} overflow-x-auto shadow-inner flex justify-center print:bg-transparent print:border-none print:p-0 print:shadow-none print:overflow-visible`}>
                <ReportDocument
                  category={selectedCategory}
                  formData={formData}
                  violations={formData.violations}
                  mode={reportMode}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
