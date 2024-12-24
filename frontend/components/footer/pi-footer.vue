<template>
  <footer class="footer">
    <div class="footer__version">
      <p>Version {{ version }}</p>
      <p>
        <NuxtLink to="/patch-note">Voir le patch note</NuxtLink>
      </p>
    </div>
    <div class="footer__copyright">
      © 2024 Mon Site. Tous droits réservés.
    </div>
  </footer>
</template>

<script setup lang='ts'>
// ----- Import -----

// ------------------

// ------ Type ------

// ------------------

// ----- Define -----

// ------------------

// ------ Const -----
const version = 0.5
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
    transition: color 0.3s ease-in-out; // Corrigé : durée plus réaliste pour une transition de couleur

    a {
      color: $color-primary-light;
      text-decoration: none; // Ajout : pour éviter les soulignements non désirés
      transition: color 0.3s ease-in-out; // Ajout : transition pour l'effet de hover

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