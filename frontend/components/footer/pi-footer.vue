<template>
  <footer class="footer">
    <div class="footer__version">
      <p>Version {{ version }}</p>
      <p>
        <NuxtLink to="/patch-note">Voir le patch note</NuxtLink>
      </p>
    </div>
    <div class="footer__copyright">
      © 2024 aPi-Hour. Tous droits réservés.
    </div>
  </footer>
</template>

<script setup lang="ts">
// ----- Import -----

// ------------------

// ------ Type ------

// ------------------

// ----- Define -----

// ------------------

// ------ Const -----

// ------------------

// ---- Reactive ----
import { ref, onMounted } from 'vue';

const version = ref('');

// ------------------

// ---- Computed ----

// ------------------

// ------ Hooks -----
onMounted(async () => {
  try {
    // Charger le fichier JSON depuis le dossier public
    const response = await fetch('/patch-notes.json');
    if (!response.ok) {
      throw new Error('Impossible de charger le fichier patch-notes.json');
    }

    const patchNotes = await response.json();

    // La version la plus récente est la première dans le tableau
    version.value = patchNotes[0]?.version || 'Inconnue';
  } catch (error) {
    console.error('Erreur lors du chargement de la version:', error);
    version.value = 'Erreur';
  }
});

// ------------------

// --- Async Func ---

// ------------------

// ---- Function ----

// ------------------

// ------ Watch -----

// ------------------
</script>

<style lang="scss" scoped>
.footer {
  background-color: $color-surface;
  color: $color-text-primary;
  padding: $spacing-large;
  font-family: $font-family-base;
  box-shadow: $box-shadow-light;

  display: flex;
  flex-direction: column;
  gap: $spacing-medium;
  justify-content: center;
  align-items: center;

  &__version {
    display: flex;
    flex-direction: column;
    gap: $spacing-small;
    justify-content: center;
    align-items: center;

    a {
      color: $color-primary-light;
      text-decoration: none;
      transition: color 0.3s ease-in-out;

      &:hover {
        color: $color-secondary;
      }
    }
  }

  &__copyright {
    margin-top: $spacing-large;
    text-align: center;
    font-size: $font-size-small;
    color: $color-text-secondary;
  }
}
</style>
