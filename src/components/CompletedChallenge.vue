<template>
  <q-card
    :class="['challenge', 'bg-dark', 'text-white', options.expanded && 'expanded']"
    @click="() => onExpand(options.id)"
    v-if="!(!options.expanded && options.oneChallengeExpanded)"
  >
    <q-card-section class="menus">
      <q-btn
        color="white"
        round
        flat
        :icon="options.expanded === true ? 'expand_less' : 'expand_more'"
        class="caret"
      ></q-btn>
      <q-btn
        color="white"
        @click="e => e.stopPropagation()"
        round
        flat
        icon="more_vert"
        class="falafel"
      >
        <q-menu cover auto-close>
          <q-list>
            <q-item v-if="iAmAuthor" clickable @click="() => deleteChallenge = !deleteChallenge">
              <q-item-section>Delete Habit</q-item-section>
            </q-item>
            <q-item v-if="iAmAuthor" clickable @click="editHabit">
              <q-item-section>Edit Habit</q-item-section>
            </q-item>
            <q-item v-if="!iAmAuthor" clickable @click="() => leaveChallenge = !leaveChallenge">
              <q-item-section>Leave Habit</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card-section>

    <q-card-section class="content">
      <div class="icon-wrapper">
        <q-icon :name="getIconName(options.icon)" class="category-icon"></q-icon>
      </div>
      <div class="header">
        <div class="text-title">{{options.title}}</div>
        <div class="text-subtitle">{{readableFrequency}}</div>
        <p v-if="options.expanded">{{options.description}}</p>
      </div>
    </q-card-section>
    <q-card-section class="results flex flex-center">
      <div class="row results-row">
        <div class="col-xs-4 col-sm-4 col-md-4">
          <div class="number">
            <q-icon name="fas fa-flag-checkered" />
            {{formatDate(endDate)}}
          </div>
        </div>
        <div class="col-xs-4 col-sm-4 col-md-4">
          <div class="name">
            <q-icon name="fas fa-chart-line" />{{score}} %
          </div>
        </div>
        <div class="col-xs-4 col-sm-4 col-md-4">
          <div class="status">
            <q-icon name="fas fa-trophy" />
            {{leader}}
          </div>
        </div>
      </div>
    </q-card-section>
    <leader-board
      :members="sortedMembers"
      v-if="options.expanded === true && options.members.length > 1"
    ></leader-board>

    <q-card-actions class="weeks" v-if="options.expanded">
      <transition name="fade">
        <week
          v-if="isCurrentWeek(firstWeek) || options.expanded === true"
          :challenge="options"
          :loggedDays="loggedDays"
          :week="firstWeek"
          @noteProgressForDay="(day,e) => noteProgressForDay(day,e)"
        ></week>
      </transition>

      <div :class="`leftover-wrapper rows-${leftOverWeeks.length}`">
        <div
          v-for="(week, key) in leftOverWeeks"
          :key="key + 'leftOverWeeks' + options.title"
          class="row justify-between"
        >
          <transition name="fade">
            <week
              v-if="isCurrentWeek(week) || options.expanded === true"
              :challenge="options"
              :loggedDays="loggedDays"
              :week="week"
              @noteProgressForDay="(day,e) => noteProgressForDay(day,e)"
            ></week>
          </transition>
        </div>
      </div>
      <transition name="fade">
        <week
          v-if="isCurrentWeek(lastWeek) || options.expanded === true"
          :challenge="options"
          :loggedDays="loggedDays"
          :week="lastWeek"
          @noteProgressForDay="(day,e) => noteProgressForDay(day,e)"
        ></week>
      </transition>
    </q-card-actions>
    <q-linear-progress
      rounded
      stripe
      class="progress"
      style="height: 10px"
      color="warning"
      :value="-1"
    />
    <dialog-popup title="Note day" :model="noteProgress" align="center">
      <q-btn label="Complete" color="primary" @click="log('complete')" v-close-popup />
      <q-btn label="Fail" color="primary" @click="log('fail')" v-close-popup />
      <q-btn label="Skip" color="primary" @click="log('skip')" v-close-popup />
    </dialog-popup>
    <dialog-popup
      title="Are you sure you want to delete this Habit?"
      :model="deleteChallenge"
      :confirm="{label: 'Delete', onClick: removeChallenge}"
      :cancel="{label: 'Cancel', onClick: onDelete.bind(this)}"
    />
    <dialog-popup
      title="Are you sure you want to leave the Challenge?"
      :model="leaveChallenge"
      :confirm="{label: 'Leave', onClick: leaveChallengeAction}"
      :cancel="{label: 'Cancel', onClick: e => leaveChallenge = !leaveChallenge}"
    />
  </q-card>
</template>

<script>
import { date } from 'quasar'
import { ICON_MAP } from '../helpers/constants'
import { sort } from '../helpers/utils'
import week from './Week'
import LeaderBoard from './Leaderboard'
import DialogPopup from './DialogPopup.vue'

import {
  getFirstWeek,
  getLastWeek,
  getAllOtherWeeks,
  getReadableFrequency,
  getMonthWritten
} from '../helpers/calendar'

export default {
  name: 'Challenge',
  data() {
    return {
      noteProgress: false,
      expanded: false,
      deleteChallenge: false,
      leaveChallenge: false,
      firstWeek: null,
      lastWeek: null,
      leftOverWeeks: null
    }
  },
  components: {
    week,
    LeaderBoard,
    DialogPopup
  },
  props: ['options', 'onExpand'],
  computed: {
    loggedDays: {
      get() {
        const loggedDays =
          this.$store.state.app.myChallenges.find(
            challenge => challenge.id === this.options.id
          ).loggedDays || []
        return loggedDays.filter(
          day => day.user === this.$store.state.user.currentUser.uid
        )
      }
    },
    score: {
      get() {
        try {
          const completions = this.loggedDays.filter(l => l.status === 'complete').length
          // console.log('--------------------------------')
          // console.log('completions x', this.options.title)
          // console.log('completions x', completions)
          // console.log('this.challenge.duration x', this.options.duration)
          // console.log('score', (100 * completions) / this.options.duration)
          return Math.round((100 * completions) / this.options.duration)
        } catch {
          return 0
        }
      }
    },
    readableFrequency: {
      get() {
        return getReadableFrequency(
          this.options.frequency,
          this.options.perWeek,
          this.options.perMonth,
          this.options.specificDays
        )
      }
    },
    iAmAuthor: {
      get() {
        return (
          this.options.author === this.$store.state.user.currentUser.displayName
        )
      }
    },
    sortedMembers: {
      get() {
        try {
          return this.sortMembers(this.options.members || [])
        } catch {
          return []
        }
      }
    },
    leader: {
      get() {
        if (this.sortedMembers.length > 0) {
          return this.sortedMembers ? this.sortedMembers[0].name : ''
        }
        return null
      }
    },
    progress: {
      get() {
        let dt1 = new Date(this.options.startDate)
        let dt2 = new Date()
        let diff = Math.floor(
          (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
            Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
            (1000 * 60 * 60 * 24)
        )
        // If diff is 0, set to 1 (In case the challenge started today)
        diff = diff || 1
        return diff / (this.options.duration / 100) / 100
      }
    }
  },
  methods: {
    formatDate: function(date) {
      const day = date.getDate()
      const monthIndex = date.getMonth()
      const year = date.getFullYear()

      return day + ' ' + getMonthWritten(monthIndex) + ' ' + year
    },
    editHabit: function() {
      this.$store.commit('app/setActiveChallenge', this.options)
      this.$router.replace('/create?edit=true')
    },
    getCompletedDaysForUser: function(uid) {
      const challengeId = this.options.id

      const currentChallenge = this.$store.state.app.myChallenges.find(
        challenge => challenge.id === challengeId
      )
      const loggedDays = (currentChallenge && currentChallenge.loggedDays) || []

      return (
        loggedDays.filter(day => day.user === uid && day.status === 'complete')
          .length || 0
      )
    },
    onDelete() {
      console.log('onDelete')
      this.deleteChallenge = !this.deleteChallenge
    },
    sortMembers: function(users) {
      return sort(
        users.map(user => {
          return {
            ...user,
            completedDays: this.getCompletedDaysForUser(user.id)
          }
        }),
        'completedDays'
      )
    },
    getIconName: function(value) {
      return ICON_MAP[value]
    },
    calculateDays: function() {
      let startDate = new Date(this.options.startDate)
      this.endDate = new Date(this.options.startDate)
      const diffDays =
        Number(this.options.duration) === 0 ? 0 : Number(this.options.duration) - 1
      this.endDate.setDate(startDate.getDate() + diffDays)
      this.firstWeek = getFirstWeek({ startDate })
      this.lastWeek = getLastWeek({ endDate: this.endDate })
      this.leftOverWeeks = getAllOtherWeeks({
        duration: this.options.duration,
        startDate,
        endDate: this.endDate
      })
    },
    isCurrentWeek: function(week) {
      const today = new Date()
      const startOfWeek = week[0].date
      const endOfWeek = date.addToDate(week[0].date, { days: 7 })
      return (
        week.length > 0 &&
        date.isBetweenDates(today, startOfWeek, endOfWeek, {
          inclusiveFrom: true,
          inclusiveTo: true
        })
      )
    },
    getColor: function(day) {
      const log = this.loggedDays.find(loggedDay => {
        return new Date(loggedDay.date).getTime() === day.date.getTime()
      })
      if (!log) {
        return 'amber'
      }
      switch (log.status) {
        case 'complete':
          return 'green'
        case 'fail':
          return 'red'
        default:
          return 'amber'
      }
    },
    noteProgressForDay: function(day, e) {
      this.activeDay = day
      this.noteProgress = true
      e.preventDefault()
      e.stopPropagation()
    },
    removeChallenge: function() {
      this.$store.dispatch('app/deleteHabit', {
        challengeId: this.options.id
      })
    },
    leaveChallengeAction: function() {
      this.$store.dispatch('app/leaveChallenge', this.options.id)
    },
    log: function(status) {
      this.$store.dispatch('app/noteDayProgress', {
        day: {
          date: date.formatDate(this.activeDay.date, 'YYYY/MM/DD'),
          status,
          user: this.$store.state.user.currentUser.uid
        },
        challengeId: this.options.id
      })
      this.noteProgress = false
    }
  },
  created: function() {
    this.calculateDays()
  }
}
</script>

<style scoped lang="scss">
@import './src/css/breakpoints.scss';

.menus {
  position: absolute;
  right: 0;
  top: -8px;
  padding: 0;
  font-size: 3rem;
  color: white;
  z-index: 2;

  @include sm {
    top: 0;
  }
}
.challenge {
  margin-bottom: 16px;
  transition: min-height 0.5s ease;
  min-height: 192px;
}

.challenge.expanded {
  min-height: calc(100vh - 161px);
  transition: min-height 0.5s ease-in-out;
  width: 100%;

  .content {
    padding-bottom: 16px;
    margin-bottom: 16px;
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: min-height 0.5s ease-in-out;
}
.expand-enter,
.expand-leave-to {
  min-height: 0;
}

.leftover-wrapper,
.week-wrapper {
  max-height: 174px;
  transition: all 0.2s ease-in-out;
}

.rows-1 {
  max-height: 74px;
}

.rows-2 {
  max-height: 148px;
}

.rows-3 {
  max-height: 222px;
}

.rows-4 {
  max-height: 296px;
}

.rows-5 {
  max-height: 370px;
}

.rows-6 {
  max-height: 444px;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease-in-out;
  transition-delay: 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
  transition-delay: 0s;
}

.content {
  padding-bottom: 0;
  margin-bottom: 16px;
}

.weeks {
  padding-left: 16px;
  padding-right: 16px;
}

.week-wrapper,
.leftover-wrapper {
  width: 100%;
}

.week-wrapper {
  margin-bottom: 16px;
}

.invisible-buttons {
  visibility: hidden;
}

.icon-wrapper {
  display: inline-block;
  width: 48px;
  font-size: 32px;
  height: 54px;
  position: relative;
}

.icon-wrapper i {
  position: absolute;
  left: 0;
  right: 0;
  top: 12px;
  bottom: 0;
  margin: auto;
}

.header {
  display: inline-block;
  height: 54px;
  margin-left: 4px;

  @include sm {
    margin-left: 8px;
  }

  .text-title {
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.5rem;
    letter-spacing: 0.0125em;

    @include sm {
      font-size: 1.25rem;
      line-height: 2rem;
    }
  }

  .text-subtitle {
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.375rem;
    letter-spacing: 0.00714em;

    @include sm {
      font-size: 1rem;
    }
  }
}

.progress {
  position: absolute;
  bottom: 0;
}

.falafel,
.caret {
  font-size: 16px;

  @include sm {
    font-size: 20px;
  }
}

.results {
  width: 100%;
  margin-left: 0;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  margin-top: 45px;

  @include sm {
    width: 80%;
    font-size: 1rem;
    margin-left: 10%;
  }
}

.results-row {
  width: 100%;

  .q-icon {
    padding-right: 10px;
    font-size: 1.25rem;
  }
}
</style>