import React from 'react'
import type { RaceCategory, ReportFormData, ReportMode, RuleArticle, RuleItem, RuleSection, ViolationInputState } from '../types'

interface ReportDocumentProps {
  category: RaceCategory
  formData: ReportFormData
  violations: Record<string, ViolationInputState>
  mode: ReportMode
}

export const ReportDocument: React.FC<ReportDocumentProps> = ({
  category,
  formData,
  violations,
  mode
}) => {
  // 日付の分割（年・月・日）
  const parseDate = (dateStr: string) => {
    if (!dateStr) return { year: '　　', month: '　', day: '　' }
    const parts = dateStr.split('-')
    return {
      year: parts[0] || '　　',
      month: parts[1] ? String(parseInt(parts[1], 10)) : '　',
      day: parts[2] ? String(parseInt(parts[2], 10)) : '　'
    }
  }

  // 時刻の分割（時・分）
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: '　', minute: '　' }
    const parts = timeStr.split(':')
    return {
      hour: parts[0] || '　',
      minute: parts[1] || '　'
    }
  }

  const { year, month, day } = parseDate(formData.incidentDate)
  const { hour, minute } = parseTime(formData.incidentTime)

  // セッション判定ロジック
  const isFreePractice = formData.session === 'フリー走行'
  const isQualifying = formData.session === '公式予選' || formData.session === '予選'
  const isRace = formData.session === '決勝'

  // 基本3つ（フリー走行 / 予選 / 決勝）以外のカスタムセッション
  const isExtraSession = !isFreePractice && !isQualifying && !isRace
  const extraSessionLabel = formData.session === 'その他'
    ? (formData.customSessionName || 'その他')
    : formData.session

  // 関連条項のスマート改行フォーマッター
  const renderArticleTitle = (article: RuleArticle) => {
    const prefix = category.id === 'sf' ? 'SF 統一規則' : category.id === 'sfl' ? 'SFL 統一規則' : ''

    if (article.articleNo.includes('第34条')) {
      return (
        <div className="leading-tight">
          {prefix && <div className="text-[9px] text-slate-700 font-sans">{prefix}</div>}
          <div className="font-bold">{article.articleNo}</div>
          <div className="text-[9.5px]">レースの中断</div>
          <div className="text-[9.5px]">およびレースの再開</div>
        </div>
      )
    }

    if (article.articleNo.includes('第22条')) {
      return (
        <div className="leading-tight">
          {prefix && <div className="text-[9px] text-slate-700 font-sans">{prefix}</div>}
          <div className="font-bold">{article.articleNo}</div>
          <div className="text-[9.5px]">書類検査</div>
          <div className="text-[9.5px]">および車両検査</div>
        </div>
      )
    }

    return (
      <div className="leading-tight">
        {prefix && <div className="text-[9px] text-slate-700 font-sans">{prefix}</div>}
        <div className="font-bold">{article.articleNo}</div>
        <div className="text-[10px]">{article.articleTitle}</div>
      </div>
    )
  }

  // 該当違反抽出モード用のフィルタリング
  const getSelectedArticles = (): { article: RuleArticle; sections: { section: RuleSection; items: RuleItem[] }[] }[] => {
    const result: { article: RuleArticle; sections: { section: RuleSection; items: RuleItem[] }[] }[] = []

    category.articles.forEach((article) => {
      const selectedSections: { section: RuleSection; items: RuleItem[] }[] = []

      article.sections.forEach((sec) => {
        const selectedItems = sec.items.filter((item) => violations[item.id]?.checked)
        if (selectedItems.length > 0) {
          selectedSections.push({ section: sec, items: selectedItems })
        }
      })

      if (selectedSections.length > 0) {
        result.push({ article, sections: selectedSections })
      }
    })

    return result
  }

  const selectedArticles = getSelectedArticles()
  const isSelectedOnly = mode === 'selected_only'

  return (
    <div className={`a4-sheet-preview font-serif text-black leading-tight bg-white ${isSelectedOnly ? 'mode-selected-only' : 'mode-full-sheet'}`}>
      {/* 上部コンテンツブロック（ヘッダー + 表） */}
      <div className="report-main-content">
        {/* 1. タイトル */}
        <div className="mb-4 text-center">
          <div className="inline-block border border-black px-6 py-1 bg-white shadow-xs">
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-black font-serif">
              {category.reportTitle}
            </h1>
          </div>
        </div>

        {/* 2. 大会ヘッダー基本情報 */}
        <div className="space-y-2 mb-3.5 text-xs sm:text-sm text-black">
          {/* 大会名 */}
          <div className="flex items-baseline">
            <span className="font-bold whitespace-nowrap mr-1 text-sm">大会名：</span>
            <div className="flex-1 border-b border-black pb-0.5 px-2 font-sans font-medium min-h-[1.3rem] text-sm">
              {formData.competitionName || '　'}
            </div>
          </div>

          {/* セッション & ゼッケン */}
          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <span className="font-bold">セッション：</span>
              <div className="flex items-center gap-2.5 font-sans">
                {/* フリー走行 */}
                <span className="flex items-center gap-0.5">
                  <span className="font-mono text-sm leading-none">
                    {isFreePractice ? '☑' : '□'}
                  </span>
                  <span>フリー走行</span>
                </span>

                {/* 予選 */}
                <span className="flex items-center gap-0.5">
                  <span className="font-mono text-sm leading-none">
                    {isQualifying ? '☑' : '□'}
                  </span>
                  <span>予選</span>
                </span>

                {/* 決勝 */}
                <span className="flex items-center gap-0.5">
                  <span className="font-mono text-sm leading-none">
                    {isRace ? '☑' : '□'}
                  </span>
                  <span>決勝</span>
                </span>

                {/* 決勝の右側に切り替わって表示される追加セッション */}
                {isExtraSession && (
                  <span className="flex items-center gap-0.5 font-bold">
                    <span className="font-mono text-sm leading-none">☑</span>
                    <span>{extraSessionLabel}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-baseline">
              <span className="font-bold mr-1">ゼッケンNo.：</span>
              <div className="border-b border-black px-3 font-sans font-bold text-base min-w-[60px] text-center">
                {formData.carNumber ? `# ${formData.carNumber}` : '#　'}
              </div>
            </div>
          </div>

          {/* 発生日時 & 発生場所 */}
          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-baseline">
              <span className="font-bold mr-1">発生日時：</span>
              <div className="border-b border-black px-1 font-sans">
                <span>{year}</span> 年 <span>{month}</span> 月 <span>{day}</span> 日 <span>{hour}</span> 時 <span>{minute}</span> 分
              </div>
            </div>

            <div className="flex items-baseline flex-1 max-w-xs ml-2">
              <span className="font-bold whitespace-nowrap mr-1">発生場所：</span>
              <div className="border-b border-black flex-1 px-2 font-sans min-h-[1.2rem]">
                {formData.incidentLocation || '　'}
              </div>
            </div>
          </div>
        </div>

        {/* 3. 違反内容 表セクション */}
        <div className="mb-2">
          <div className="font-bold text-xs sm:text-sm mb-1 text-black flex items-center justify-between">
            <span>違反内容：</span>
            {isSelectedOnly && (
              <span className="text-[11px] font-normal text-slate-600">
                （該当違反項目 抽出形式）
              </span>
            )}
          </div>

          <table className={`report-table w-full border-collapse border border-black ${isSelectedOnly ? 'text-xs sm:text-sm' : 'text-[8.5px] sm:text-[9.5px]'}`}>
            <thead>
              <tr className="report-table-header-cell border-b border-black bg-slate-100">
                <th className="border border-black py-1 px-1 w-[20%] text-center font-bold">
                  関連条項
                </th>
                <th className="border border-black py-1 px-0.5 w-[7%] text-center font-bold">
                  項
                </th>
                <th className="border border-black py-1 px-2 w-[73%] text-center font-bold">
                  違反内容
                </th>
              </tr>
            </thead>
            <tbody>
              {/* ① 該当違反のみ抽出モード */}
              {isSelectedOnly ? (
                selectedArticles.length > 0 ? (
                  selectedArticles.map(({ article, sections }) => {
                    const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0)
                    let isFirst = true

                    return sections.map(({ section, items }) => {
                      return items.map((item, itemIdx) => {
                        const state = violations[item.id] || { checked: false }
                        const showArticleCell = isFirst
                        if (showArticleCell) isFirst = false

                        return (
                          <tr key={item.id} className="border-b border-black">
                            {showArticleCell && (
                              <td
                                rowSpan={totalItems}
                                className="border border-black px-1.5 py-2.5 text-center align-middle font-sans font-semibold text-xs leading-tight"
                              >
                                {renderArticleTitle(article)}
                              </td>
                            )}

                            {itemIdx === 0 && (
                              <td
                                rowSpan={items.length}
                                className="border border-black px-1 py-2.5 text-center align-middle font-sans font-bold text-xs"
                              >
                                {section.sectionNo}
                              </td>
                            )}

                            <td className="border border-black px-3 py-2.5 align-middle font-sans">
                              <div className="flex items-start gap-1.5 leading-snug">
                                <span className="font-mono text-sm leading-none mt-0.5">☑</span>
                                <span className="font-bold text-black text-sm">{item.text}</span>
                              </div>

                              {item.inputType === 'checkbox_with_number' && (
                                <div className="mt-1 pl-4 flex items-baseline gap-1 text-xs">
                                  <span>{item.inputLabel || '数量'}：</span>
                                  <span className="border-b border-black font-bold px-3 text-center min-w-[45px]">
                                    {state.numberValue || '　'}
                                  </span>
                                  <span>{item.inputUnit || ''}</span>
                                </div>
                              )}

                              {item.inputType === 'checkbox_with_text' && (
                                <div className="mt-1 pl-4 flex items-baseline gap-1 text-xs">
                                  <span className="whitespace-nowrap">{item.inputLabel || '内容'}：</span>
                                  <span className="border-b border-black font-medium flex-1 px-1 min-h-[1.2rem]">
                                    {state.textValue || '　'}
                                  </span>
                                </div>
                              )}

                              {item.inputType === 'checkbox_with_suboptions' && item.subOptions && (
                                <div className="mt-1 pl-4 text-xs">
                                  <span>（</span>
                                  {item.subOptions.map((opt, idx) => {
                                    const isSubChecked = (state.selectedSubOptions || []).includes(opt)
                                    return (
                                      <React.Fragment key={opt}>
                                        <span className={isSubChecked ? 'font-bold underline' : ''}>
                                          {isSubChecked ? '☑' : '□'}
                                          {opt}
                                        </span>
                                        {idx < item.subOptions!.length - 1 && <span className="mx-1"></span>}
                                      </React.Fragment>
                                    )
                                  })}
                                  <span>）</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    })
                  })
                ) : (
                  <tr className="border-b border-black">
                    <td colSpan={3} className="border border-black py-8 text-center text-slate-500 font-sans text-xs sm:text-sm">
                      （現在チェックされている違反項目はありません。上のフォームから違反項目を選択してください）
                    </td>
                  </tr>
                )
              ) : (
                /* ② 全項目様式 */
                category.articles.map((article) => {
                  const totalItemsInArticle = article.sections.reduce(
                    (sum, sec) => sum + sec.items.length,
                    0
                  )
                  let isFirstItemOfArticle = true

                  return article.sections.map((section) => {
                    return section.items.map((item, itemIdx) => {
                      const state = violations[item.id] || { checked: false }
                      const showArticleCell = isFirstItemOfArticle
                      if (showArticleCell) isFirstItemOfArticle = false

                      return (
                        <tr key={item.id} className="border-b border-black">
                          {showArticleCell && (
                            <td
                              rowSpan={totalItemsInArticle}
                              className="border border-black px-0.5 py-0.5 text-center align-middle font-sans font-semibold text-[8.5px]"
                            >
                              {renderArticleTitle(article)}
                            </td>
                          )}

                          {itemIdx === 0 && (
                            <td
                              rowSpan={section.items.length}
                              className="border border-black px-0.5 py-0.5 text-center align-middle font-sans font-bold text-[8.5px]"
                            >
                              {section.sectionNo}
                            </td>
                          )}

                          <td className="border border-black px-1.5 py-0.5 align-middle font-sans text-[8.5px] sm:text-[9px]">
                            <div className="flex items-start gap-1 leading-tight">
                              <span className="font-mono text-[9px] leading-none mt-0.5">
                                {state.checked ? '☑' : '□'}
                              </span>
                              <span className={state.checked ? 'font-bold text-black' : 'text-slate-800'}>
                                {item.text}
                              </span>
                            </div>

                            {item.inputType === 'checkbox_with_number' && (
                              <div className="mt-0.5 pl-2.5 flex items-baseline gap-1 text-[8px]">
                                <span>{item.inputLabel || '数量'}：</span>
                                <span className="border-b border-black font-bold px-1.5 text-center min-w-[20px]">
                                  {state.checked && state.numberValue ? state.numberValue : '　'}
                                </span>
                                <span>{item.inputUnit || ''}</span>
                              </div>
                            )}

                            {item.inputType === 'checkbox_with_text' && (
                              <div className="mt-0.5 pl-2.5 flex items-baseline gap-1 text-[8px]">
                                <span className="whitespace-nowrap">{item.inputLabel || '内容'}：</span>
                                <span className="border-b border-black font-medium flex-1 px-1 min-h-[0.8rem]">
                                  {state.checked && state.textValue ? state.textValue : '　'}
                                </span>
                              </div>
                            )}

                            {item.inputType === 'checkbox_with_suboptions' && item.subOptions && (
                              <div className="mt-0.5 pl-2.5 text-[8px]">
                                <span>（</span>
                                {item.subOptions.map((opt, idx) => {
                                  const isSubChecked = (state.selectedSubOptions || []).includes(opt)
                                  return (
                                    <React.Fragment key={opt}>
                                      <span className={state.checked && isSubChecked ? 'font-bold underline' : ''}>
                                        {state.checked && isSubChecked ? '☑' : '□'}
                                        {opt}
                                      </span>
                                      {idx < item.subOptions!.length - 1 && <span className="mx-0.5"></span>}
                                    </React.Fragment>
                                  )
                                })}
                                <span>）</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  })
                })
              )}

              {/* 4. フリースペース（その他 / 特記事項行） */}
              <tr className="border-b border-black">
                <td className="border border-black px-1.5 py-2 text-center align-middle font-sans font-bold text-xs">
                  その他
                </td>
                <td className="border border-black px-0.5 py-2 text-center align-middle font-sans text-xs">
                  ―
                </td>
                <td className="border border-black px-3 py-2 align-top font-sans">
                  <div className="flex items-start gap-1">
                    <span className="font-mono text-xs leading-none mt-0.5">
                      {formData.additionalNotes ? '☑' : '□'}
                    </span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-800 mb-1">
                        特記事項・補足メモ（フリースペース）：
                      </div>
                      <div className={`text-xs text-black whitespace-pre-wrap ${isSelectedOnly ? 'min-h-[4.5rem]' : 'min-h-[1.5rem]'}`}>
                        {formData.additionalNotes || '　\n　'}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. 最下部フッター署名欄（用紙最下部に固定配置） */}
      <div className="report-signatures-container pt-4 pb-1 space-y-3.5 text-xs sm:text-sm font-sans">
        {/* エントラント代表署名 */}
        <div className="flex items-center justify-between border-b border-slate-400 pb-0.5">
          <div className="flex items-baseline flex-1">
            <span className="font-bold underline whitespace-nowrap mr-2 text-sm">エントラント代表署名：</span>
            <span className="border-b border-black flex-1 min-h-[1.4rem]"></span>
          </div>
          <div className="w-32 text-right font-serif text-xs">
            （　　時　　分）
          </div>
        </div>

        {/* 担当技術委員署名 */}
        <div className="flex items-center justify-between border-b border-slate-400 pb-0.5">
          <div className="flex items-baseline flex-1">
            <span className="font-bold underline whitespace-nowrap mr-2 text-sm">担当技術委員署名：</span>
            <span className="border-b border-black flex-1 min-h-[1.4rem]"></span>
          </div>
          <div className="w-32 text-right font-serif text-xs">
            （　　時　　分）
          </div>
        </div>

        {/* 技術委員長署名 */}
        <div className="flex items-center justify-between border-b border-slate-400 pb-0.5">
          <div className="flex items-baseline flex-1">
            <span className="font-bold underline whitespace-nowrap mr-2 text-sm">技術委員長署名：</span>
            <span className="border-b border-black flex-1 min-h-[1.4rem]"></span>
          </div>
          <div className="w-32 text-right font-serif text-xs">
            （　　時　　分）
          </div>
        </div>
      </div>
    </div>
  )
}
