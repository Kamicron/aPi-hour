<template>
  <div class='single-session'>
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
  </div>
</template>

<script setup lang='ts'>
// ----- Import -----

// ------------------

// ------ Type ------

// ------------------

// ----- Define -----
defineProps({
  sessionId: {type: String, required: true},
  startTime: {type: String, default: ''},
  endTime: {type: String, default: ''},
  workTime: {type: String, default: ''},
  pauseTime: {type: String, default: ''},
})
// ------------------

// ------ Const -----

// ------------------

// ---- Reactive ----

// ------------------

// ---- Computed ----

// ------------------

// ------ Hooks -----

// ------------------

// --- Async Func ---

// ------------------

// ---- Function ----

// ------------------


// ------ Watch -----

// ------------------

</script>

<style lang='scss' scoped>
.single-session {
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
