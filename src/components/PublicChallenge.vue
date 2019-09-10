<template>
    <q-card class="challenge text-white" @click="() => expanded = !expanded">
      <q-card-section>
        <div class="icon-wrapper">
          <q-icon :name="getIconName(options.category)" class="category-icon">
          </q-icon>
        </div>
        <div class="header">
          <div class="text-h6">{{options.title}}</div>
          <div class="text-subtitle2">by John Doe</div>
        </div>
      </q-card-section>

      <q-card-section class="justify-end row">
         <q-btn color="amber" label="Join Challenge" @click="e => joinChallenge(e)"/>
      </q-card-section>

      <!-- <q-separator dark /> -->

      <q-card-actions>

      </q-card-actions>
      <q-linear-progress rounded stripe style="height: 10px" color="warning" :value="progress" />
      <q-dialog v-model="noteProgress">
        <q-card>
          <q-card-section>
            <div class="text-h6">Are you sure you want to join this challenge?</div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn label="Confirm" color="primary" @click="confirm()" v-close-popup />
            <q-btn label="Cancel" color="primary" @click="cancel()" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </q-card>
</template>

<style>
</style>

<script>
import { ICON_MAP } from '../helpers/constants'

export default {
  name: 'Challenge',
  data () {
    return {
      noteProgress: false,
      expanded: false
    }
  },
  props: ['options'],
  computed: {
    progress: {
      get () {
        let dt1 = new Date(this.options.startDate)
        let dt2 = new Date()
        let diff = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24))
        // If diff is 0, set to 1 (In case the challenge started today)
        diff = diff || 1
        return (diff / (this.options.duration / 100)) / 100
      }
    }
  },
  methods: {
    getIconName: function (value) {
      return ICON_MAP[value]
    },
    joinChallenge: function (e) {
      this.noteProgress = true
      e.preventDefault()
      e.stopPropagation()
    },
    confirm: function () {
      console.log('confirm')
      this.$store.dispatch('app/joinChallenge', this.options.id)
    },
    cancel: function () {}
  },
  created: function () {
  }
}
</script>

<style>
.caret {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  font-size: 3rem;
  color: white;
}
.challenge {
  margin-bottom: 16px;
  background: linear-gradient(to bottom, #3a404d, #181c26);
}

.leaderboard-row {
  width: calc(100% + 32px);
  height: 48px;
  line-height: 48px;
  margin-left: -16px;
}
.leaderboard-row:nth-child(1) {
  background: #fa6855;
}
.leaderboard-row:nth-child(2) {
  background: #e0574f;
}
.leaderboard-row:nth-child(3) {
  background: #d7514d;
}

.number {
  background: white;
  color: black;
  text-align: center;
  border-radius: 50%;
  padding: 0;
  min-height: 0;
  height: 2rem;
  width: 2rem;
  min-width: 2rem;
  min-height: 2rem;
  margin-left: 1rem;
  margin-top: 0.5rem;
  line-height: 2rem;
}

.name {
  margin-left: 3rem;
}

.status {
  margin-left: 10rem;
}

.week-wrapper, .leftover-wrapper {
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
  position:absolute; /*it can be fixed too*/
  left:0; right:0;
  top:0; bottom:0;
  margin:auto;
}

.header {
  display: inline-block;
  height: 54px;
}
</style>