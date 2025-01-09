<template>
  <div class='single-session'>
    <button class="delete-button" @click.prevent="handleDelete">
      <i class="fas fa-times"></i>
    </button>
    <NuxtLink :to="`/sessions/${sessionId}`">
      <div class="work-sessions__card-content">
        <header class="work-sessions__card-header">
          <h4 class="work-sessions__card-title">Session ID : {{ sessionId }}</h4>
        </header>
        <div class="work-sessions__card-body">
          <p><strong>Début :</strong> {{ startTime }}</p>
          <p><strong>Fin :</strong> {{ endTime }}</p>
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
import { useGlobalEvents } from '~/composable/useGlobalEvent'
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
})

const emit = defineEmits(['sessionDeleted'])
// ------------------

// ------ Const -----
const { $api } = useNuxtApp()
const token = useCookie('token')
const globalEvents = useGlobalEvents()
// ------------------

// ---- Function ----
const handleDelete = async (event: Event) => {
  event.preventDefault()
  event.stopPropagation()

  console.log('Suppression de la session:', props.sessionId)

  try {
    const response = await $api.delete(`/time-entries/${props.sessionId}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })

    if (response.status !== 200) {
      throw new Error('Erreur lors de la suppression de la session')
    }

    console.log('Session supprimée avec succès')
    emit('sessionDeleted', props.sessionId)
    console.log('Émission de l\'événement UPDATE_DAY')
    globalEvents.emitEvent(EGlobalEvent.UPDATE_DAY)
  } catch (error) {
    console.error('Erreur:', error)
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
