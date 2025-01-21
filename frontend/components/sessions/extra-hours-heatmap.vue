<template>
  <bento-card title="Heat map">
    <div class="heatmap-container">
      <div class="months-row">
        <div v-for="month in monthLabels" :key="month.date" class="month-label">{{ month.label }}</div>
      </div>
      <div class="days-container">
        <div class="day-labels">
          <div v-for="day in ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']" :key="day" class="day-label">{{ day }}</div>
        </div>
        <div class="grid-container">
          <div v-for="(week, index) in weeksData" :key="index" class="week-column">
            <div v-for="(day, index) in week.days" :key="index" 
                 class="grid-cell"
                 :class="getCellClass(day.hours)"
                 :title="getCellTitle(day)">
            </div>
          </div>
        </div>
      </div>
      <div class="legend">
        <div class="legend-item">Moins</div>
        <div v-for="level in 5" :key="level" 
             class="legend-cell" 
             :class="`level-${level}`"
             :title="getLegendTitle(level)">
        </div>
        <div class="legend-item">Plus</div>
      </div>
    </div>
  </bento-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useNuxtApp, useCookie } from '#app';

const { $api } = useNuxtApp();
const token = useCookie('token');
const extraHours = ref<Record<string, number>>({});

const legendLevels = [
  { class: '0', label: '0h' },
  { class: '1', label: '0-1h' },
  { class: '2', label: '1-2h' },
  { class: '3', label: '2-3h' },
  { class: '4', label: '3h+' },
];

// Fonction pour obtenir la classe CSS en fonction du nombre d'heures
function getCellClass(hours: number | null) {
  if (!hours) return 'empty';
  if (hours <= 1) return 'level-1';
  if (hours <= 2) return 'level-2';
  if (hours <= 3) return 'level-3';
  if (hours <= 5) return 'level-4';
  return 'level-5';
}

// Fonction pour formater la date en français
function formatDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

// Fonction pour créer une date sans le décalage horaire
function createDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

// Fonction pour formater une date en ISO sans le décalage horaire
function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Fonction pour obtenir le tooltip
function getCellTitle(day: { date: string, hours: number | null }) {
  const date = createDate(day.date);
  if (!day.hours) return `${formatDate(date)} : Pas d'heures supplémentaires`;
  return `${formatDate(date)} : ${day.hours.toFixed(1)}h supplémentaires`;
}

function getLegendTitle(level: number) {
  switch(level) {
    case 1: return 'Jusqu\'à 1 heure'
    case 2: return 'Jusqu\'à 2 heures'
    case 3: return 'Jusqu\'à 3 heures'
    case 4: return 'Jusqu\'à 5 heures'
    case 5: return 'Plus de 5 heures'
    default: return ''
  }
}

// Génère les données pour l'affichage
const weeksData = computed(() => {
  const weeks = [];
  const now = new Date();
  now.setMonth(now.getMonth() + 1, 0);
  now.setHours(12, 0, 0, 0);

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 11);
  startDate.setDate(1);
  startDate.setHours(12, 0, 0, 0);

  // Trouver le premier lundi
  let currentDate = new Date(startDate);
  while (currentDate.getDay() !== 1) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  while (currentDate <= now) {
    const week = {
      weekStart: new Date(currentDate),
      days: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + i);
        const dateStr = formatDateToISO(date);
        return {
          date: dateStr,
          hours: extraHours.value[dateStr] || null
        };
      })
    };
    
    weeks.push(week);
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
});

// Génère les labels des mois
const monthLabels = computed(() => {
  const labels = [];
  const now = new Date();
  now.setMonth(now.getMonth() + 1, 0);
  
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 11);
  startDate.setDate(1);

  let currentDate = new Date(startDate);
  let currentMonth = -1;
  let weekCounter = 0;

  while (currentDate <= now) {
    const month = currentDate.getMonth();
    if (month !== currentMonth) {
      labels.push({
        date: new Date(currentDate),
        label: new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(currentDate),
        column: weekCounter
      });
      currentMonth = month;
    }
    currentDate.setDate(currentDate.getDate() + 7);
    weekCounter++;
  }
  
  return labels;
});

// Fonction pour charger les données
const fetchExtraHours = async () => {
  try {
    const response = await $api.get(`/time-entries/extra-hours-heatmap`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    console.log('Extra hours data:', response.data);
    extraHours.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des heures supplémentaires:', error);
  }
};

onMounted(() => {
  fetchExtraHours();
});
</script>

<style lang="scss" scoped>
.heatmap-container {
  font-size: 12px;
  padding: 20px;
}

.months-row {
  display: flex;
  margin-left: 50px;
  margin-bottom: 12px;
}

.month-label {
  width: 55px; /* ~4 semaines + gap */
  text-align: left;
  color: $color-text-primary;
  font-size: 12px;
}

.days-container {
  display: flex;
}

.day-labels {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 50px;
}

.day-label {
  height: 13px;
  text-align: right;
  padding-right: 12px;
  color: $color-text-primary;
  font-size: 12px;
}

.grid-container {
  display: flex;
  gap: 2px;
  flex: 1;
}

.week-column {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.grid-cell {
  width: 13px;
  height: 13px;
  border-radius: 2px;
  background-color: $color-text-primary;
}

.legend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 25px;
  margin-left: 50px;
  font-size: 12px;
  color: #586069;
}

.legend-cell {
  width: 13px;
  height: 13px;
  border-radius: 2px;
}

.legend-item {
  margin: 0 6px;
}

.empty {
  background-color: #20242b;
}

.level-1 {
  background-color: #0a4020;

}

.level-2 {
  background-color: #216e39;
}

.level-3 {
  background-color: #30a14e;
}

.level-4 {
  background-color: #40c463;

}

.level-5 {
  background-color: #9be9a8;
}
</style>
