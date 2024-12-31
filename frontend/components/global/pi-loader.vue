<template>
  <div class="loader">
    <!-- SVG fixe -->
    <img src="/logo_sans_aiguille.svg" alt="Logo fixe" class="base-logo" />

    <!-- Superposition pour les animations -->
    <svg class="overlay" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900">
      <!-- Aiguilles -->
      <line
        class="hour-hand"
        x1="446.06"
        y1="428.32"
        x2="446.06"
        y2="300.32"
      />
      <line
        class="minute-hand"
        x1="446.06"
        y1="428.32"
        x2="530.06"
        y2="350.32"
      />
      <!-- Pupilles -->
      <circle class="pupil left-pupil" cx="310.06" cy="170.78" r="18" />
      <circle class="pupil right-pupil" cx="580.06" cy="170.78" r="18" />
    </svg>
  </div>
</template>

<script setup lang="ts">
// Pas de logique nécessaire
</script>

<style scoped>
.loader {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
}

/* Image SVG fixe */
.base-logo {
  width: 100%;
  height: auto;
  position: absolute;
  top: 0;
  left: 0;
}

/* Superposition pour les animations */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Pupilles */
.pupil {
  fill: #000;
  animation: move-pupil 3s ease-in-out infinite alternate;
}

.left-pupil {
  transform-origin: 290.06px 170.78px;
}

.right-pupil {
  transform-origin: 520.06px 170.78px;
}

/* Aiguilles */
.hour-hand,
.minute-hand {
  stroke: #ecc130; /* Couleur jaune */
  stroke-width: 8px;
  stroke-linecap: round;
  transform-origin: 446.06px 428.32px;
}

.hour-hand {
  animation: swing-hour 1.5s ease-in-out infinite;
}

.minute-hand {
  animation: swing-minute 1s ease-in-out infinite;
}

/* Animations */
@keyframes swing-hour {
  0% {
    transform: rotate(-25deg);
  }
  50% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-25deg);
  }
}

@keyframes swing-minute {
  0% {
    transform: rotate(30deg);
  }
  50% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(30deg);
  }
}

@keyframes move-pupil {
  0% {
    transform: translate(-5px, -3px);
  }
  50% {
    transform: translate(5px, 3px);
  }
  100% {
    transform: translate(-5px, -3px);
  }
}
</style>
