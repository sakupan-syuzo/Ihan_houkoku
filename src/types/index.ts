export type InputType =
  | 'checkbox'
  | 'checkbox_with_text'
  | 'checkbox_with_number'
  | 'checkbox_with_suboptions'

export type ReportMode = 'selected_only' | 'full_sheet'

export interface RuleItem {
  id: string
  text: string
  inputType: InputType
  inputLabel?: string
  inputUnit?: string
  subOptions?: string[]
}

export interface RuleSection {
  sectionNo: string
  items: RuleItem[]
}

export interface RuleArticle {
  articleNo: string
  articleTitle: string
  sections: RuleSection[]
}

export interface RaceCategory {
  id: string
  name: string
  fullName: string
  rulebookName: string
  reportTitle: string
  reportVer: string
  articles: RuleArticle[]
}

export interface RulesData {
  version: string
  lastUpdated: string
  categories: RaceCategory[]
}

export interface ViolationInputState {
  checked: boolean
  textValue?: string
  numberValue?: number | string
  selectedSubOptions?: string[]
}

export interface ReportFormData {
  categoryId: string
  competitionName: string
  roundNo: string
  session: string // 'フリー走行' | '公式予選' | '決勝' | '公式練習' | 'ウォームアップ' | string
  customSessionName?: string // 「その他」選択時の自由入力
  carNumber: string
  incidentDate: string // YYYY-MM-DD
  incidentTime: string // HH:mm
  incidentLocation: string
  violations: Record<string, ViolationInputState>
  additionalNotes: string // フリースペース（特記事項・その他）
  entrantSignTime: string
  techDelegateSignTime: string
  chiefTechSignTime: string
}
