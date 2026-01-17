export interface Member {
  id: string
  name: string
  color: string
  avatar?: string
  isFrequent: boolean
  createdAt: Date
}

export const MEMBER_COLORS = [
  '#A0826D', // 奶茶棕
  '#C9A88A', // 焦糖奶茶
  '#8B6F47', // 深焦糖
  '#D4B5A0', // 淺奶茶
  '#9B7E5E', // 巧克力奶茶
  '#B8956F', // 榛果奶茶
  '#7A5C42', // 黑糖奶茶
  '#CDB8A3', // 香vanilla奶茶
] as const
