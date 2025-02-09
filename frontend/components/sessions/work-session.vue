<template>
  <div class="work-sessions">
    <div v-if="profileStore.profile" class="work-sessions__layout">
      <calendar class="work-sessions__layout--calendar" @pick-date="handleDatePicked"
        @currentMonth="updateCurrentMonth" />
      <resume-session class="work-sessions__layout--resume" :selected-date="selectedDate" />
      <extra-hours-display class="work-sessions__layout--display" />
      <set_vacation class="work-sessions__layout--vacation" />
      <extra-hours-rate :currentMonth="currentMonth" class="work-sessions__layout--rate" />
      <extra-hours-pdf class="work-sessions__layout--generate"/>
      <extra-hours-heatmap class="work-sessions__layout--heatmap" @pick-date="handleDatePicked"/>
      <bento-card title="Mes jours non travaillés" class="work-sessions__layout--vacation_table">
        <vacation-list />
      </bento-card>
    </div>
    <div v-else>
      Veuillez vous connecter
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useNuxtApp, useCookie } from '#app';
import { useUserStore } from '../../stores/user';
import VacationList from '~/components/vacation/vacation-list.vue';

const { $api } = useNuxtApp();
const token = useCookie('token');
const profileStore = useUserStore();

const currentMonth = ref('2025-01');

const updateCurrentMonth = (newMonth) => {
  currentMonth.value = newMonth; 
};

// Variables réactives
const selectedDate = ref(new Date().toISOString().slice(0, 10));
const summary = ref<any | null>(null);


// Calcul dynamique de l'objectif quotidien en fonction du profil
const userProfile = computed(() => {
  if (!profileStore.profile) {
    return { weeklyHoursGoal: 35, workingDaysPerWeek: 5 }; // Valeurs par défaut si le profil n'est pas encore chargé
  }

  return {
    weeklyHoursGoal: profileStore.profile.weeklyHoursGoal || 35,
    workingDaysPerWeek: profileStore.profile.workingDaysPerWeek || 5,
  };
});

const dailyWorkGoal = computed(() => {
  if (!userProfile.value) return 0;
  return (userProfile.value.weeklyHoursGoal / userProfile.value.workingDaysPerWeek) * 3600; // En secondes
});


// Méthode pour récupérer les sessions par date
async function fetchSessions() {
  try {
    const response = await $api.get(`/time-entries/date/${selectedDate.value}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    summary.value = response.data;

  } catch (error) {
    console.error('Erreur lors de la récupération des sessions', error);
  }
}



function handleDatePicked(date: Date) {
  selectedDate.value = date.toISOString().slice(0, 10);
  fetchSessions();
}

// Récupérer les sessions au montage
fetchSessions();
</script>

<style lang="scss" scoped>
.work-sessions {
  margin: $spacing-large;

  &__layout {
    display: grid;
    grid-template-columns: 1fr 1fr 2fr 2fr 1fr 1fr;
    grid-template-rows: 0.5fr 1fr;
    grid-column-gap: $spacing-large;
    grid-row-gap: $spacing-large;

    &--calendar {
      grid-area: 1 / 1 / 3 / 3;
    }

    &--resume {
      grid-area: 1 / 3 / 3 / 5;
    }

    &--display {
      grid-area: 1 / 5 / 2 / 7;
    }

    &--vacation {
      grid-area: 4 / 4 / 5 / 7;
    }

    &--rate {
      grid-area: 3 / 1 / 5 / 4;
    }

    &--generate {
      grid-area: 2 / 5 / 3 / 7;
    }

    &--heatmap {
      grid-area: 3 / 4 / 4 / 7;
    }

    &--vacation_table {
      grid-area: 5 / 1 / 6 / 7;
    }
  }

  // Media queries pour l'adaptation sur les appareils
  @media (max-width: 1280px) {
    &__layout {
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: auto auto auto;

      &--calendar {
        grid-area: 1 / 1 / 2 / 4; // Pleine largeur
      }

      &--resume {
        grid-area: 2 / 1 / 3 / 4; // Pleine largeur
      }

      &--display {
        grid-area: 3 / 1 / 4 / 4; // Pleine largeur
      }

      &--vacation {
        grid-area: 4 / 1 / 5 / 4; // Pleine largeur
      }

      &--rate {
        grid-area: 5 / 1 / 6 / 4; // Pleine largeur
      }

      &--generate {
        grid-area: 6 / 1 / 7 / 4; // Pleine largeur
      }

      &--heatmap {
        grid-area: 7 / 1 / 8 / 4; // Pleine largeur
      }
    }
  }

  @media (max-width: 768px) {
    &__layout {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto auto auto;
      grid-column-gap: $spacing-large;
      grid-row-gap: $spacing-large;

      &--calendar {
        grid-area: 1 / 1 / 2 / 2; // Colonne unique
        height: 622px;
      }

      &--resume {
        max-height: 622px !important;

        grid-area: 2 / 1 / 3 / 2; // Colonne unique
      }

      &--display {
        grid-area: 3 / 1 / 4 / 2; // Colonne unique
      }

      &--vacation {
        grid-area: 4 / 1 / 5 / 2; // Colonne unique
      }

      &--rate {
        grid-area: 5 / 1 / 6 / 2; // Colonne unique
      }
    }
  }
}
</style>
