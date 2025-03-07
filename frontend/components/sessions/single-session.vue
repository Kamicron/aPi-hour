<template>
  <div class='single-session'>
    <button class="delete-button" @click.prevent="handleDelete">
      <i class="fas fa-times"></i>
    </button>
    <NuxtLink :to="`/sessions/${sessionId}`">
      <div class="work-sessions__card-content">
        <header class="work-sessions__card-header">
          <h4 class="work-sessions__card-title">Session N°{{ sessionNumber }} du {{ formattedSessionDate }}</h4>
        </header>
        <div class="work-sessions__card-body">
          <p><strong>Début :</strong> {{ formattedStartTime }}</p>
          <p><strong>Fin :</strong> {{ formattedEndTime }}</p>
          <p><strong>Temps de travail :</strong> {{ workTime }}</p>
          <p><strong>Temps de pause :</strong> {{ pauseTime }}</p>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang='ts'>
// ----- Import -----
import { useNuxtApp, useCookie } from '#app'
import { EGlobalEvent } from '~/assets/ts/enums/global/globalEvent.enum'
import { useGlobalEvents } from '~/composables/useGlobalEvent'
import { EToast } from '~/assets/ts/enums/toast.enum'
import { useAxiosError } from '~/composables/useAxiosError'
import { computed } from 'vue'
import useDateFormatter from '~/composables/useDate'

// ------------------

// ------ Type ------

// ------------------

// ----- Define -----
const props = defineProps({
  sessionId: { type: String, required: true },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  workTime: { type: String, default: '' },
  pauseTime: { type: String, default: '' },
  index: { type: Number, required: true },
})

const emit = defineEmits(['sessionDeleted'])
// ------------------

// ------ Const -----
const { $api } = useNuxtApp()
const token = useCookie('token')
const globalEvents = useGlobalEvents()

const { $toast } = useNuxtApp()
const { getErrorMessage } = useAxiosError()

const dateFormatter = useDateFormatter()

const formattedSessionDate = computed(() => {
  // Parse la date au format DD/MM/YYYY HH:mm:ss
  const [datePart, timePart] = props.startTime.split(' ');
  const [day, month, year] = datePart.split('/');
  const [hours, minutes, seconds] = timePart.split(':');
  
  // Crée la date avec le bon ordre des composants
  const date = new Date(year, month - 1, day, hours, minutes, seconds);
  
  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  return date.toLocaleDateString('fr-FR', options);
})

const formattedStartTime = computed(() => {
  return dateFormatter.formatDate(props.startTime, {
    customOptions: {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
  })
})

const formattedEndTime = computed(() => {
  if (!props.endTime) return 'En cours'
  return dateFormatter.formatDate(props.endTime, {
    customOptions: {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
  })
})

const sessionNumber = computed(() => props.index + 1)
// ------------------

// ---- Function ----
const handleDelete = async (event: Event) => {
  event.preventDefault()
  event.stopPropagation()
  try {
    const response = await $api.delete(`/time-entries/${props.sessionId}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })

    if (response.status !== 200) {
      throw new Error('Erreur lors de la suppression de la session')
    }

    emit('sessionDeleted', props.sessionId)
    globalEvents.emitEvent(EGlobalEvent.UPDATE_DAY)
    $toast.show({
      message: 'Session supprimée avec succès.',
      type: EToast.SUCCESS,
      duration: 3000
    })

  } catch (error) {
    console.error('Erreur:', error)
    $toast.show({
      message: getErrorMessage(error),
      type: EToast.ERROR,
      duration: 5000
    })
  }
}
// ------------------
</script>

<style lang='scss' scoped>
.single-session {
  position: relative;
  background-color: $color-background;
  border-radius: $border-radius;
  box-shadow: $box-shadow-light;
  padding: $spacing-large;
  margin-bottom: $spacing-medium;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  .delete-button {
    position: absolute;
    top: $spacing-small;
    right: $spacing-small;
    background-color: transparent;
    border: none;
    color: $color-text-secondary;
    font-size: $font-size-large;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 2;

    &:hover {
      background-color: $color-danger;
      color: $color-text-primary;
    }
  }

  .work-sessions__card-header {
    border-bottom: 1px solid $color-text-secondary;
    padding-bottom: $spacing-small;
    margin-bottom: $spacing-medium;
  }

  .work-sessions__card-title {
    font-size: $font-size-large;
    font-weight: bold;
    color: $color-primary-light;
  }

  .work-sessions__card-body p {
    margin: $spacing-small 0;
    color: $color-text-primary;
    font-size: $font-size-base;

    strong {
      color: $color-text-secondary;
    }
  }
}
</style>
