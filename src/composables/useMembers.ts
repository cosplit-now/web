import { ref, computed } from 'vue'
import type { Member } from '@/types/member'
import { saveToStorage, loadFromStorage, storageKeys } from '@/utils/storage'
import { getColorForIndex } from '@/utils/colors'

const members = ref<Member[]>([])

export function useMembers() {
  // Load members from storage
  const loadMembers = () => {
    const saved = loadFromStorage<Member[]>(storageKeys.MEMBERS)
    if (saved) {
      members.value = saved
    }
  }

  // Save members to storage
  const saveMembers = () => {
    saveToStorage(storageKeys.MEMBERS, members.value)
  }

  // Add a new member
  const addMember = (name: string, isFrequent: boolean = false) => {
    const newMember: Member = {
      id: crypto.randomUUID(),
      name,
      color: getColorForIndex(members.value.length),
      isFrequent,
      createdAt: new Date()
    }

    members.value.push(newMember)
    saveMembers()
    return newMember
  }

  // Update member
  const updateMember = (id: string, updates: Partial<Member>) => {
    const index = members.value.findIndex(m => m.id === id)
    if (index >= 0) {
      members.value[index] = { ...members.value[index], ...updates }
      saveMembers()
    }
  }

  // Delete member
  const deleteMember = (id: string) => {
    members.value = members.value.filter(m => m.id !== id)
    saveMembers()
  }

  // Get member by ID
  const getMemberById = (id: string) => {
    return members.value.find(m => m.id === id)
  }

  // Computed: Frequent members
  const frequentMembers = computed(() => {
    return members.value.filter(m => m.isFrequent)
  })

  // Toggle frequent status
  const toggleFrequent = (id: string) => {
    const member = getMemberById(id)
    if (member) {
      updateMember(id, { isFrequent: !member.isFrequent })
    }
  }

  // Initialize
  loadMembers()

  return {
    members,
    frequentMembers,
    addMember,
    updateMember,
    deleteMember,
    getMemberById,
    toggleFrequent,
    loadMembers,
    saveMembers
  }
}
