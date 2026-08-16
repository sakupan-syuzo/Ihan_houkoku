import React, { useState } from 'react'
import type { RaceCategory, RuleArticle, RuleItem, ViolationInputState } from '../types'
import { ChevronDown, ChevronRight, AlertTriangle, CheckSquare, Square, Edit3 } from 'lucide-react'

interface DynamicViolationFormProps {
  category: RaceCategory
  violations: Record<string, ViolationInputState>
  onUpdateViolation: (itemId: string, update: Partial<ViolationInputState>) => void
  additionalNotes: string
  onNotesChange: (notes: string) => void
}

export const DynamicViolationForm: React.FC<DynamicViolationFormProps> = ({
  category,
  violations,
  onUpdateViolation,
  additionalNotes,
  onNotesChange
}) => {
  // すべてのアコーディオンをデフォルトで開くか、または開閉状態を管理
  const [openArticles, setOpenArticles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    category.articles.forEach((art, index) => {
      // 最初の2つ、または違反があるものは開く
      initial[art.articleNo] = index < 2
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

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            規則条項別 違反選択・詳細入力
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            適用規則書: <span className="text-slate-300 font-medium">{category.rulebookName}</span>
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
                    ? 'border-red-500/50 bg-slate-900/90 shadow-md shadow-red-950/30'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                {/* アコーディオンヘッダー */}
                <button
                  type="button"
                  onClick={() => toggleArticle(article.articleNo)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      {article.articleNo}
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      {article.articleTitle}
                    </span>
                    {articleViolations > 0 && (
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {articleViolations}件 選択中
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400">
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </button>

                {/* アコーディオン本体 */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-4">
                    {article.sections.map((section) => (
                      <div key={section.sectionNo} className="space-y-2 pt-2 first:pt-0">
                        {section.sectionNo !== '―' && (
                          <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-amber-400" />
              その他 / 特記事項・補足メモ（フリースペース）
            </label>
            <span className="text-[11px] text-slate-400">※帳票の「その他」欄に印字されます</span>
          </div>
          <textarea
            value={additionalNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="その他の違反事項、状況詳細、指示内容や補足事項があれば自由に入力してください..."
            rows={3}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors resize-y"
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
}

const ViolationItemCard: React.FC<ViolationItemCardProps> = ({ item, state, onUpdate }) => {
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

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        isChecked
          ? 'bg-red-950/20 border-red-500/60 ring-1 ring-red-500/40'
          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-2.5 cursor-pointer" onClick={handleToggle}>
        <div className="mt-0.5 text-red-500 flex-shrink-0">
          {isChecked ? (
            <CheckSquare className="w-4 h-4 fill-red-500 text-slate-950" />
          ) : (
            <Square className="w-4 h-4 text-slate-500" />
          )}
        </div>
        <div className="text-xs sm:text-sm font-medium text-slate-200 leading-snug select-none">
          {item.text}
        </div>
      </div>

      {/* 追記項目エリア（チェックON時に展開） */}
      {isChecked && (
        <div className="mt-3 pt-2.5 border-t border-red-500/20 pl-7 space-y-2.5">
          {/* テキスト入力付き */}
          {item.inputType === 'checkbox_with_text' && (
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                {item.inputLabel || '詳細内容'}：
              </label>
              <input
                type="text"
                value={state.textValue || ''}
                onChange={(e) => onUpdate({ textValue: e.target.value })}
                placeholder="具体的な作業内容・状況を記入"
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
          )}

          {/* 数値入力付き */}
          {item.inputType === 'checkbox_with_number' && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-amber-300 whitespace-nowrap">
                {item.inputLabel || '数値'}：
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={state.numberValue || ''}
                  onChange={(e) => onUpdate({ numberValue: e.target.value })}
                  placeholder="例: 7"
                  className="w-20 bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs font-bold text-center text-red-400 focus:outline-none focus:border-red-500"
                />
                {item.inputUnit && (
                  <span className="text-xs text-slate-400 font-semibold">{item.inputUnit}</span>
                )}
              </div>
            </div>
          )}

          {/* サブチェックボックス群（服装・装備品など） */}
          {item.inputType === 'checkbox_with_suboptions' && item.subOptions && (
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1.5">
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
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
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
