import calendarDataRaw from '../data/calendarData.json'

export interface EventSchedule {
  round: string
  name: string
  circuit: string
  startDate: string
  endDate: string
}

interface CalendarData {
  year: number
  schedules: Record<string, EventSchedule[]>
}

const calendarData = calendarDataRaw as CalendarData

/**
 * 指定されたカテゴリと日付から、直近・開催中の大会スケジュールを自動検索する
 */
export function findClosestEvent(categoryId: string, targetDateStr?: string): EventSchedule | null {
  const events = calendarData.schedules[categoryId]
  if (!events || events.length === 0) return null

  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date()
  const targetTime = targetDate.getTime()

  // 1. レースウィーク中（木曜〜月曜までの猶予を持たせる）
  for (const event of events) {
    const start = new Date(event.startDate).getTime() - 2 * 24 * 60 * 60 * 1000 // 2日前（搬入日）
    const end = new Date(event.endDate).getTime() + 1 * 24 * 60 * 60 * 1000 // 1日後（翌日）

    if (targetTime >= start && targetTime <= end) {
      return event
    }
  }

  // 2. 直近で最も近いイベントを探す（最小差分の日程）
  let closestEvent: EventSchedule = events[0]
  let minDiff = Infinity

  for (const event of events) {
    const eventTime = new Date(event.startDate).getTime()
    const diff = Math.abs(eventTime - targetTime)
    if (diff < minDiff) {
      minDiff = diff
      closestEvent = event
    }
  }

  return closestEvent
}

export function getCategoryEvents(categoryId: string): EventSchedule[] {
  return calendarData.schedules[categoryId] || []
}
