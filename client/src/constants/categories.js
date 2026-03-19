export const CATEGORIES = [
  { emoji: '🚀', label: '프로젝트' },
  { emoji: '💻', label: '개발' },
  { emoji: '📋', label: '업무' },
  { emoji: '📚', label: '학습' },
  { emoji: '💡', label: '아이디어' },
  { emoji: '📓', label: '노트' },
  { emoji: '🗓️', label: '일정' },
  { emoji: '🏠', label: '일상' },
  { emoji: '💰', label: '재정' },
  { emoji: '💪', label: '운동' },
  { emoji: '✈️', label: '여행' },
  { emoji: '📝', label: '기타' },
]

export const getCategoryEmoji = (label) => {
  const found = CATEGORIES.find((c) => c.label === label)
  return found ? found.emoji : '📋'
}