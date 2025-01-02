<template>
  <div class="patch-notes">
    <header>
      <h1>Historique des Versions</h1>
    </header>
    <main>
      <section v-for="version in patchNotes" :key="version.version" class="version-section">
        <h2 class="version-title">Version {{ version.version }} - {{ dateFormating(version.date) }}</h2>
        <div v-if="version.changes.feat && version.changes.feat.length" class="changes feat">
          <h3>Nouveautés</h3>
          <ul>
            <li v-for="change in version.changes.feat" :key="change">{{ change }}</li>
          </ul>
        </div>
        <div v-if="version.changes.fix && version.changes.fix.length" class="changes fix">
          <h3>Corrections</h3>
          <ul>
            <li v-for="change in version.changes.fix" :key="change">{{ change }}</li>
          </ul>
        </div>
        <div v-if="version.changes.init && version.changes.init.length" class="changes init">
          <h3>Initialisations</h3>
          <ul>
            <li v-for="change in version.changes.init" :key="change">{{ change }}</li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang='ts'>
import { ref, onMounted } from 'vue';
import useDateFormatter from '../../composable/useDate';

const patchNotes = ref([]);
const customOptions = ref({
      weekday: 'long',
      year: 'numeric',
      Week: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Paris',
    })


const fetchPatchNotes = async () => {
  try {
    const response = await fetch('/patch-notes.json');
    patchNotes.value = await response.json();
  } catch (error) {
    console.error('Erreur lors du chargement des patch notes :', error);
  }
};

onMounted(fetchPatchNotes);

function dateFormating(date: Date)  {
  return useDateFormatter().formatDate(date, {
    customOptions: customOptions,
  });
}
</script>

<style scoped lang="scss">
/* Variables globales respectées */
.patch-notes {
  font-family: $font-family-base;
  background-color: $color-background;
  color: $color-text-primary;
  padding: $spacing-large;
}

header {
  text-align: center;
  margin-bottom: $spacing-large;
}

header h1 {
  color: $color-primary-light;
}

.version-section {
  margin-bottom: $spacing-large;
  padding: $spacing-large;
  background-color: $color-surface;
  border-radius: $border-radius;
  box-shadow: $box-shadow-light;
}

.version-title {
  font-size: $font-size-large;
  color: $color-primary-light;
  margin-bottom: $spacing-large;
  border-bottom: 1px solid $color-primary-light;
}

.changes {
  margin-bottom: $spacing-medium;
}

.changes h3 {
  font-size: $font-size-base;
  color: $color-secondary;
  margin-bottom: $spacing-small;
}

ul {
  list-style: none;
  padding: 0;
}

ul li {
  position: relative;
  margin-bottom: $spacing-small;
  padding-left: $spacing-large;
  font-size: $font-size-small;
  color: $color-text-secondary;
}

ul li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: $color-primary-light;
}
</style>
