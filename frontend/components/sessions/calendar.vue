<template>
  <div class="calendar">
    <h2>Calendrier</h2>
    <div class="calendar__header">
      <button class="btn" @click="changeMonth(-1)">&lt;</button>
      <h2>{{ monthName }} {{ currentYear }}</h2>
      <button class="btn" @click="changeMonth(1)">&gt;</button>
    </div>
    <div class="calendar__grid">
      <div class="calendar__day" v-for="day in daysOfWeek" :key="day">
        {{ day }}
      </div>
      <div v-for="day in paddedDays" :key="day.date.toISOString()" :class="[
        'calendar__cell',
        {
          'calendar__cell--inactive': day.isInactive,
          'calendar__cell--today': isToday(day.date),
          'calendar__cell--selected': isSelected(day.date),
          'calendar__cell--session': day.hasSession,
          'calendar__cell--vacation': day.hasVacation,
          'calendar__cell--public-holiday': day.isPublicHoliday, // Nouvelle classe pour les jours fériés
        },
      ]" @click="selectDay(day.date)">
        <span class="date">{{ day.date.getDate() }}</span>
      </div>
    </div>
    <div class="calendar__footer" v-if="selectedDate">
      Date sélectionnée : {{ new Date(selectedDate).toLocaleDateString('fr-FR') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useNuxtApp, useCookie, useRoute } from '#app';
import { useGlobalEvents } from '~/composable/useGlobalEvent';
import { EGlobalEvent } from '~/assets/ts/enums/global/globalEvent.enum';
import { emit } from 'process';

const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());
const selectedDate = ref(null);
const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const emits = defineEmits(['pick-date', 'currentMonth']);

const { $api } = useNuxtApp();
const token = useCookie('token');
const timeEntries = ref([]);
const vacations = ref([]);
const route = useRoute();

const selectDay = (date: Date) => {
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  selectedDate.value = localDate;
  emits('pick-date', localDate);
};

useGlobalEvents().subscribeTo(EGlobalEvent.UPDATE_CALENDAR, () => {
  fetchTimeEntriesAndVacations();
});

// Vérifie et applique la date passée dans l'URL
function initializeDateFromQuery() {
  const queryDate = route.query.date;
  if (queryDate) {
    const parsedDate = new Date(queryDate);
    if (!isNaN(parsedDate.getTime())) {
      selectDay(parsedDate);
      currentYear.value = parsedDate.getFullYear();
      currentMonth.value = parsedDate.getMonth();
    } else {
      console.warn("Le paramètre ?date= est invalide:", queryDate);
    }
  }
}

watch(route, initializeDateFromQuery, { immediate: true });

const monthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleString('fr-FR', {
    month: 'long',
  });
});

const hasSessionOnDay = (date: Date) => {
  return timeEntries.value.some((entry) => {
    const entryDate = new Date(entry.startTime);
    return (
      entryDate.getFullYear() === date.getFullYear() &&
      entryDate.getMonth() === date.getMonth() &&
      entryDate.getDate() === date.getDate()
    );
  });
};

const hasVacationOnDay = (date: Date) => {
  const vacation = vacations.value.find((vacation) => {
    const startDate = new Date(vacation.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(vacation.endDate);
    endDate.setHours(23, 59, 59, 999);

    return date >= startDate && date <= endDate;
  });

  if (vacation) {
    return vacation.status === 'public_holiday' ? 'public_holiday' : 'vacation';
  }
  return null;
};



const paddedDays = computed(() => {
  const days = [];
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1);
  const lastDayOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0);

  const startPadding = (firstDayOfMonth.getDay() + 6) % 7; // Lundi = 0
  const endPadding = 42 - (startPadding + lastDayOfMonth.getDate());

  // Days of the previous month
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value, -i);
    const vacationStatus = hasVacationOnDay(date);
    days.push({
      date,
      isInactive: true,
      hasVacation: vacationStatus === 'vacation',
      isPublicHoliday: vacationStatus === 'public_holiday',
      hasSession: hasSessionOnDay(date),
    });
  }

  // Days of the current month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i);
    const vacationStatus = hasVacationOnDay(date);
    days.push({
      date,
      isInactive: false,
      hasVacation: vacationStatus === 'vacation',
      isPublicHoliday: vacationStatus === 'public_holiday',
      hasSession: hasSessionOnDay(date),
    });
  }

  // Days of the next month
  for (let i = 1; i <= endPadding; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i);
    const vacationStatus = hasVacationOnDay(date);
    days.push({
      date,
      isInactive: true,
      hasVacation: vacationStatus === 'vacation',
      isPublicHoliday: vacationStatus === 'public_holiday',
      hasSession: hasSessionOnDay(date),
    });
  }

  return days;
});


const changeMonth = (direction) => {
  currentMonth.value += direction;
  if (currentMonth.value < 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else if (currentMonth.value > 11) {
    currentMonth.value = 0;
    currentYear.value++;
  }
  const formattedMonth = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, "0")}`;
  console.log("currentMonth.value", formattedMonth);

  emits("currentMonth", formattedMonth); // Emit dans le format 'YYYY-MM'
};

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const isSelected = (date: Date) => {
  return (
    selectedDate.value &&
    date.getFullYear() === selectedDate.value.getFullYear() &&
    date.getMonth() === selectedDate.value.getMonth() &&
    date.getDate() === selectedDate.value.getDate()
  );
};

async function fetchTimeEntriesAndVacations() {
  try {
    const response = await $api.get('/time-entries/month', {
      params: { year: currentYear.value, month: currentMonth.value + 1 },
      headers: { Authorization: `Bearer ${token.value}` },
    });
    timeEntries.value = response.data.timeEntries;
    vacations.value = response.data.vacations;
  } catch (err) {
    console.error('Erreur lors de la récupération des données', err);
  }
}

watch([currentMonth, currentYear], fetchTimeEntriesAndVacations, { immediate: true });
</script>

<style lang="scss">
.calendar {
  color: $color-text-primary;
  padding: $spacing-large;
  min-width: 450px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
  }

  &__day {
    font-weight: bold;
    text-align: center;
  }

  &__cell {
    padding: 1rem;
    text-align: center;
    cursor: pointer;
    border: 1px solid $color-text-primary;
    border-radius: 4px;


    &--inactive {
      background-color: $color-surface;

      .date {
        color: $color-text-secondary
      }
    }

    &--vacation {
      border: 2px solid $color-danger;
      font-weight: bold;

      .date {
        color: $color-danger
      }
    }

    &--public-holiday {
      border: 2px solid $color-success;

      .date {
        color: $color-success;
        font-weight: bold;
      }
    }

    &--today {
      background-color: $color-primary;
      font-weight: bold;
    }

    &--selected {
      background-color: $color-primary-light;
      font-weight: bold;

      .date {
        color: $color-primary
      }
    }

    &--session {
      border: 2px solid $color-secondary;
      font-weight: bold;

      .date {
        color: $color-secondary
      }
    }

    &:hover {
      background-color: $color-secondary;

      .date {
        color: $color-background
      }
    }
  }

  &__footer {
    margin-top: 1rem;
    text-align: center;
    font-weight: bold;
  }
}
</style>
