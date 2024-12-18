<template>
  <div class="calendar">
    <div class="calendar__header">
      <button @click="changeMonth(-1)">&lt;</button>
      <h2>{{ monthName }} {{ currentYear }}</h2>
      <button @click="changeMonth(1)">&gt;</button>
    </div>
    <div class="calendar__grid">
      <div class="calendar__day" v-for="day in daysOfWeek" :key="day">
        {{ day }}
      </div>
      <div v-for="day in paddedDays" :key="day.date" :class="[
        'calendar__cell',
        {
          'calendar__cell--inactive': day.isInactive,
          'calendar__cell--today': isToday(day.date),
          'calendar__cell--selected': isSelected(day.date),
          'calendar__cell--session': hasSessionOnDay(day.date), // Nouvelle classe
        }
      ]" @click="selectDay(day.date)">
        <span>{{ day.date.getDate() }}</span>
      </div>
    </div>
    <div class="calendar__footer" v-if="selectedDate">
      Date sélectionnée : {{ new Date(selectedDate).toLocaleDateString('fr-FR') }}
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNuxtApp, useCookie } from '#app';
import { watch } from 'vue';

const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth());
const selectedDate = ref(null);
const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const emits = defineEmits(['pick-date'])

const { $api } = useNuxtApp();
const token = useCookie('token');
const timeEntries = ref([]);

const monthName = computed(() => {
  return new Date(currentYear.value, currentMonth.value).toLocaleString('fr-FR', {
    month: 'long',
  });
});

const hasSessionOnDay = (date) => {
  return timeEntries.value.some((entry) => {
    const entryDate = new Date(entry.startTime);
    const localEntryDate = new Date(
      entryDate.getUTCFullYear(),
      entryDate.getUTCMonth(),
      entryDate.getUTCDate()
    );

    return (
      localEntryDate.getFullYear() === date.getFullYear() &&
      localEntryDate.getMonth() === date.getMonth() &&
      localEntryDate.getDate() === date.getDate()
    );
  });
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
    days.push({ date, isInactive: true });
  }

  // Days of the current month
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i);
    days.push({ date, isInactive: false });
  }

  // Days of the next month
  for (let i = 1; i <= endPadding; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i);
    days.push({ date, isInactive: true });
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
};

const selectDay = (date) => {
  // Fixe la date sélectionnée à minuit en temps local
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  selectedDate.value = localDate;
  emits('pick-date', localDate); // Émet la date corrigée
};


const isToday = (date) => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const isSelected = (date) => {
  return (
    selectedDate.value &&
    date.getFullYear() === selectedDate.value.getFullYear() &&
    date.getMonth() === selectedDate.value.getMonth() &&
    date.getDate() === selectedDate.value.getDate()
  );
};

async function fetchTimeEntriesForMonth() {
  try {
    const response = await $api.get('/time-entries/month', {
      params: {
        year: currentYear.value,
        month: currentMonth.value + 1, // Car JS commence les mois à 0
      },
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });
    timeEntries.value = response.data;
  } catch (err) {
    console.error("Erreur lors de la récupération des sessions", err);
  }
}

watch([currentMonth, currentYear], () => {
  fetchTimeEntriesForMonth();
}, { immediate: true }); // `immediate: true` pour charger dès le montage

</script>

<style lang="scss">
.calendar {
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
    border: 1px solid #ddd;
    border-radius: 4px;

    &--inactive {
      color: #aaa;
      background-color: #f9f9f9;
    }

    &--today {
      background-color: #ffecb3;
      font-weight: bold;
    }

    &--selected {
      background-color: #b3d9ff;
      font-weight: bold;
    }

    &:hover {
      background-color: #eef;
    }
  }

  &__footer {
    margin-top: 1rem;
    text-align: center;
    font-weight: bold;
  }
}

.calendar__cell--session {
  border: 2px solid #0288d1; // Bordure plus marquée
  font-weight: bold;
  color: #01579b;
}

</style>
