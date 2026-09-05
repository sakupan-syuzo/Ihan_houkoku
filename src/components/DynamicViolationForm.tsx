import React, { useState } from 'react'
import type { RaceCategory, RuleArticle, RuleItem, ViolationInputState } from '../types'
import { ChevronDown, ChevronRight, AlertTriangle, CheckSquare, Square, Edit3 } from 'lucide-react'

interface DynamicViolationFormProps {
  category: RaceCategory
  violations: Record<string, ViolationInputState>
  onUpdateViolation: (itemId: string, update: Partial<ViolationInputState>) => void
  additionalNotes: string
  onNotesChange: (notes: string) => void
  isDarkMode: boolean
}

export const DynamicViolationForm: React.FC<DynamicViolationFormProps> = ({
  category,
  violations,
  onUpdateViolation,
  additionalNotes,
  onNotesChange,
  isDarkMode
}) => {
  // すべてのアコーディオンをデフォルトで閉じておく
  const [openArticles, setOpenArticles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    category.articles.forEach((art) => {
      // 最初からすべてのアコーディオンを閉じる
      initial[art.articleNo] = false
    })
    return initial
  })

  const toggleArticle = (articleNo: string) => {
    setOpenArticles((prev) => ({
      ...prev,
      [articleNo]: !prev[articleNo]
    }))
  }

  // カテゴリ内の違反項目数カウント
  const getArticleViolationCount = (article: RuleArticle) => {
    let count = 0
    article.sections.forEach((sec) => {
      sec.items.forEach((item) => {
        if (violations[item.id]?.checked) count++
      })
    })
    return count
  }

  // テーマ色定義
  const theme = {
    cardBg: isDarkMode ? 'bg-slate-900/60' : 'bg-white',
    cardBgSolid: isDarkMode ? 'bg-slate-900' : 'bg-white',
    border: isDarkMode ? 'border-slate-800' : 'border-gray-300',
    text: isDarkMode ? 'text-slate-200' : 'text-gray-900',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-gray-600',
    textHighlight: isDarkMode ? 'text-amber-400' : 'text-amber-600',
    textAccent: isDarkMode ? 'text-slate-300' : 'text-gray-800',
    badgeBg: isDarkMode ? 'bg-slate-800' : 'bg-gray-200',
    badgeBorder: isDarkMode ? 'border-slate-700' : 'border-gray-300',
    inputBg: isDarkMode ? 'bg-slate-950' : 'bg-gray-50',
    inputBorder: isDarkMode ? 'border-slate-700' : 'border-gray-300',
    inputText: isDarkMode ? 'text-slate-100' : 'text-gray-900',
    placeholder: isDarkMode ? 'placeholder-slate-500' : 'placeholder-gray-400',
    hoverBg: isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50',
    itemBg: isDarkMode ? 'bg-slate-950/60' : 'bg-gray-50',
    itemBorder: isDarkMode ? 'border-slate-800' : 'border-gray-200',
    itemHoverBorder: isDarkMode ? 'hover:border-slate-700' : 'hover:border-gray-300'
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-sm font-bold ${theme.text} flex items-center gap-2`}>
            <AlertTriangle className="w-4 h-4 text-red-500" />
            規則条項別 違反選択・詳細入力
          </h2>
          <p className={`text-xs ${theme.textMuted} mt-0.5`}>
            適用規則書: <span className={`${theme.textAccent} font-medium`}>{category.rulebookName}</span>
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {category.articles
          .filter((art) => art.articleNo !== 'その他')
          .map((article) => {
            const isOpen = !!openArticles[article.articleNo]
            const articleViolations = getArticleViolationCount(article)

            return (
              <div
                key={article.articleNo}
                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                  articleViolations > 0
                    ? `border-red-500/50 ${isDarkMode ? 'bg-slate-900/90' : 'bg-red-50'} shadow-md ${isDarkMode ? 'shadow-red-950/30' : 'shadow-red-200'}`
                    : `${theme.border} ${theme.cardBg}`
                }`}
              >
                {/* アコーディオンヘッダー */}
                <button
                  type="button"
                  onClick={() => toggleArticle(article.articleNo)}
                  className={`w-full px-4 py-3 flex items-center justify-between text-left ${theme.hoverBg} transition-colors`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-black px-2 py-0.5 rounded ${theme.badgeBg} ${theme.textHighlight} border ${theme.badgeBorder}`}>
                      {article.articleNo}
                    </span>
                    <span className={`text-sm font-bold ${theme.text}`}>
                      {article.articleTitle}
                    </span>
                    {articleViolations > 0 && (
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {articleViolations}件 選択中
                      </span>
                    )}
                  </div>
                  <div className={theme.textMuted}>
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </button>

                {/* アコーディオン本体 */}
                {isOpen && (
                  <div className={`px-4 pb-4 pt-1 border-t ${isDarkMode ? 'border-slate-800/80' : 'border-gray-200'} space-y-4`}>
                    {article.sections.map((section) => (
                      <div key={section.sectionNo} className="space-y-2 pt-2 first:pt-0">
                        {section.sectionNo !== '―' && (
                          <div className={`text-xs font-bold ${theme.textMuted} flex items-center gap-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-amber-400' : 'bg-amber-600'}`} />
                            項: {section.sectionNo}
                          </div>
                        )}

                        <div className="space-y-2.5 pl-1 sm:pl-2">
                          {section.items.map((item) => {
                            const state = violations[item.id] || { checked: false }
                            return (
                              <ViolationItemCard
                                key={item.id}
                                item={item}
                                state={state}
                                onUpdate={(update) => onUpdateViolation(item.id, update)}
                                isDarkMode={isDarkMode}
                              />
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

        {/* フリースペース（その他 / 特記事項入力欄） */}
        <div className={`${theme.cardBgSolid} border ${theme.border} rounded-xl p-4 shadow-lg space-y-2.5`}>
          <div className="flex items-center justify-between">
            <label className={`text-sm font-bold ${theme.text} flex items-center gap-2`}>
              <Edit3 className={`w-4 h-4 ${theme.textHighlight}`} />
              その他 / 特記事項・補足メモ（フリースペース）
            </label>
            <span className={`text-[11px] ${theme.textMuted}`}>※帳票の「その他」欄に印字されます</span>
          </div>
          <textarea
            value={additionalNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="その他の違反事項、状況詳細、指示内容や補足事項があれば自由に入力してください..."
            rows={3}
            className={`w-full ${theme.inputBg} border ${theme.inputBorder} rounded-lg p-2.5 text-xs sm:text-sm ${theme.inputText} ${theme.placeholder} focus:outline-none focus:border-red-500 transition-colors resize-y`}
          />
        </div>
      </div>
    </section>
  )
}

interface ViolationItemCardProps {
  item: RuleItem
  state: ViolationInputState
  onUpdate: (update: Partial<ViolationInputState>) => void
  isDarkMode: boolean
}

const ViolationItemCard: React.FC<ViolationItemCardProps> = ({ item, state, onUpdate, isDarkMode }) => {
  const isChecked = state.checked

  const handleToggle = () => {
    onUpdate({ checked: !isChecked })
  }

  const handleSubOptionToggle = (opt: string) => {
    const current = state.selectedSubOptions || []
    const next = current.includes(opt)
      ? current.filter((o) => o !== opt)
      : [...current, opt]
    onUpdate({ selectedSubOptions: next })
  }

  const theme = {
    itemBg: isDarkMode ? 'bg-slate-950/60' : 'bg-gray-50',
    itemBorder: isDarkMode ? 'border-slate-800' : 'border-gray-200',
    itemHoverBorder: isDarkMode ? 'hover:border-slate-700' : 'hover:border-gray-300',
    text: isDarkMode ? 'text-slate-200' : 'text-gray-900',
    textHighlight: isDarkMode ? 'text-amber-300' : 'text-amber-700',
    inputBg: isDarkMode ? 'bg-slate-900' : 'bg-white',
    inputBorder: isDarkMode ? 'border-slate-700' : 'border-gray-300',
    inputText: isDarkMode ? 'text-slate-100' : 'text-gray-900',
    placeholder: isDarkMode ? 'placeholder-slate-500' : 'placeholder-gray-400',
    btnBg: isDarkMode ? 'bg-slate-900' : 'bg-white',
    btnText: isDarkMode ? 'text-slate-300' : 'text-gray-700',
    btnHoverBg: isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
  }

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        isChecked
          ? isDarkMode
            ? 'bg-red-950/20 border-red-500/60 ring-1 ring-red-500/40'
            : 'bg-red-50 border-red-400 ring-1 ring-red-300'
          : `${theme.itemBg} ${theme.itemBorder} ${theme.itemHoverBorder}`
      }`}
    >
      <div className="flex items-start gap-2.5 cursor-pointer" onClick={handleToggle}>
        <div className="mt-0.5 text-red-500 flex-shrink-0">
          {isChecked ? (
            <CheckSquare className={`w-4 h-4 fill-red-500 ${isDarkMode ? 'text-slate-950' : 'text-white'}`} />
          ) : (
            <Square className={`w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
          )}
        </div>
        <div className={`text-xs sm:text-sm font-medium ${theme.text} leading-snug select-none`}>
          {item.text}
        </div>
      </div>

      {/* 追記項目エリア（チェックON時に展開） */}
      {isChecked && (
        <div className={`mt-3 pt-2.5 border-t ${isDarkMode ? 'border-red-500/20' : 'border-red-300'} pl-7 space-y-2.5`}>
          {/* テキスト入力付き */}
          {item.inputType === 'checkbox_with_text' && (
            <div>
              <label className={`block text-xs font-semibold ${theme.textHighlight} mb-1`}>
                {item.inputLabel || '詳細内容'}：
              </label>
              <input
                type="text"
                value={state.textValue || ''}
                onChange={(e) => onUpdate({ textValue: e.target.value })}
                placeholder="具体的な作業内容・状況を記入"
                className={`w-full ${theme.inputBg} border ${theme.inputBorder} rounded-md px-2.5 py-1.5 text-xs ${theme.inputText} ${theme.placeholder} focus:outline-none focus:border-red-500`}
              />
            </div>
          )}

          {/* 数値入力付き */}
          {item.inputType === 'checkbox_with_number' && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <label className={`text-xs font-semibold ${theme.textHighlight}`}>
                {item.inputLabel || '数値'}：
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={state.numberValue || ''}
                  onChange={(e) => onUpdate({ numberValue: e.target.value })}
                  placeholder="例: 7"
                  className={`w-20 ${theme.inputBg} border ${theme.inputBorder} rounded-md px-2.5 py-1.5 text-xs font-bold text-center text-red-400 focus:outline-none focus:border-red-500`}
                />
                {item.inputUnit && (
                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'} font-semibold`}>{item.inputUnit}</span>
                )}
              </div>
            </div>
          )}

          {/* サブチェックボックス群（服装・装備品など） */}
          {item.inputType === 'checkbox_with_suboptions' && item.subOptions && (
            <div>
              <label className={`block text-xs font-semibold ${theme.textHighlight} mb-1.5`}>
                該当する不備項目を選択：
              </label>
              <div className="flex flex-wrap gap-1.5">
                {item.subOptions.map((opt) => {
                  const isSubChecked = (state.selectedSubOptions || []).includes(opt)
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSubOptionToggle(opt)}
                      className={`px-2 py-1 rounded text-xs font-medium border transition-all ${
                        isSubChecked
                          ? 'bg-red-600 text-white border-red-500 shadow-sm'
                          : `${theme.btnBg} ${theme.btnText} ${theme.inputBorder} ${theme.btnHoverBg}`
                      }`}
                    >
                      {isSubChecked ? '☑ ' : '□ '}
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
