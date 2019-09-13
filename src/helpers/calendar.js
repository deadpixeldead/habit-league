const WEEK_MASK = [
  {
    label: 'M'
  },
  {
    label: 'T'
  },
  {
    label: 'W'
  },
  {
    label: 'T'
  },
  {
    label: 'F'
  },
  {
    label: 'S'
  },
  {
    label: 'S'
  }
]

export const getFirstWeek = ({ startDate }) => {
  let split = startDate.getDay() - 1
  split = split > -1 ? split : 6

  return WEEK_MASK
    .map((day, index) => {
      let newDate = new Date(startDate)
      let today = new Date()

      // Set hours to zero, so that comparisons work properly
      newDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)

      if (index >= split) {
        newDate.setDate(newDate.getDate() + (index - split))
        return {
          label: day.label,
          date: newDate,
          isInFuture: newDate > today
        }
      }
      newDate.setDate(newDate.getDate() - (split - index))
      return {
        ...day,
        date: newDate,
        isBeforeHabitStart: true
      }
    })
}

export const getLastWeek = ({ endDate }) => {
  let lastWeekSplit = endDate.getDay() - 1
  lastWeekSplit = lastWeekSplit > -1 ? lastWeekSplit : 6

  return WEEK_MASK
    .map((day, index) => {
      let newDate = new Date(endDate)
      let today = new Date()

      // Set hours to zero, so that comparisons work properly
      newDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)

      if (index <= lastWeekSplit) {
        newDate.setDate(newDate.getDate() - (lastWeekSplit - index))
        return {
          label: day.label,
          date: newDate,
          isInFuture: newDate > today
        }
      }
      newDate.setDate(newDate.getDate() - (lastWeekSplit - index))
      return {
        ...day,
        date: newDate,
        isAfterHabitEnds: true
      }
    })
}

export const getAllOtherWeeks = ({ duration, startDate, endDate, bla }) => {
  let split = startDate.getDay() - 1
  split = split > -1 ? split : 6
  let lastWeekSplit = endDate.getDay() - 1
  lastWeekSplit = lastWeekSplit > -1 ? lastWeekSplit : 6
  const leftOverDays = duration - (7 - split) - (lastWeekSplit)
  const prototype = [...new Array(leftOverDays / 7)]
  return prototype.map((week, weekIndex) => {
    return WEEK_MASK.map((day, index) => {
      let newDate = new Date(startDate)
      newDate.setDate(startDate.getDate() + (7 - split + index) + (weekIndex * 7))
      return {
        label: day.label,
        date: newDate,
        isInFuture: newDate > new Date()
      }
    })
  })
}

export const isChallengePast = (challenge) => {
  const startDate = new Date(challenge.startDate)
  const endDate = new Date(challenge.startDate)
  const today = new Date()
  endDate.setDate(startDate.getDate() + Number(challenge.duration))
  return endDate.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0)
}