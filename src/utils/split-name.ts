import type { Split } from '@/types/split'
import type { Member } from '@/types/member'

/**
 * Generate a user-friendly split name based on members
 * Examples:
 * - 1 member: "Alice's Split"
 * - 2 members: "Alice & Bob's Split"
 * - 3 members: "Alice, Bob & Charlie's Split"
 * - 4+ members: "Alice, Bob & 2 others' Split"
 */
export function generateSplitName(
  split: Split,
  getMemberById: (id: string) => Member | undefined
): string {
  if (!split.members || split.members.length === 0) {
    return 'Untitled Split'
  }

  // Get member names
  const memberNames = split.members
    .map(id => getMemberById(id)?.name)
    .filter(Boolean) as string[]

  if (memberNames.length === 0) {
    return 'Untitled Split'
  }

  if (memberNames.length === 1) {
    return `${memberNames[0]}'s Split`
  }

  if (memberNames.length === 2) {
    return `${memberNames[0]} & ${memberNames[1]}'s Split`
  }

  if (memberNames.length === 3) {
    return `${memberNames[0]}, ${memberNames[1]} & ${memberNames[2]}'s Split`
  }

  // For 4 or more members, show first 2 and count the rest
  const remaining = memberNames.length - 2
  return `${memberNames[0]}, ${memberNames[1]} & ${remaining} other${remaining > 1 ? 's' : ''}' Split`
}
