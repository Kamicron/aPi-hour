<template>
  <div>
    <!-- Ici votre header -->
    <header>
      <Login />
    </header>

    <!-- Contenu principal -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer>
      <p>© 2024 Votre Projet</p>
    </footer>
  </div>
</template>

<script setup lang="ts">

// definePageMeta({
//   middleware: 'auth.global', // Middleware appliqué globalement
// });
</script>
