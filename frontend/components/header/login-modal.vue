<template>
  <div class="login-modal">
    <input
      v-model="email"
      type="email"
      placeholder="Email"
      class="pi-input"
      required
    />
    <input
      v-model="password"
      type="password"
      placeholder="Mot de passe"
      class="pi-input"
      required
    />
    <p @click="toggleAuthMode" class="auth-widget__toggle">
      {{ isRegistering ? 'Déjà inscrit ? Connectez-vous' : 'Créer un compte' }}
    </p>
    <button @click="handleSubmit" class="btn">
      {{ isRegistering ? 'Créer un compte' : 'Se connecter' }}
    </button>
    <button @click="closeModal" class="btn">Annuler</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { defineEmits } from 'vue';


const emit = defineEmits(['handleAuth', 'close']);

const isRegistering = ref(false);
const email = ref('');
const password = ref('');

function toggleAuthMode() {
  isRegistering.value = !isRegistering.value;
}

function handleSubmit() {
  emit('handleAuth', { email: email.value, password: password.value, isRegistering: isRegistering.value });
}

function closeModal() {
  emit('close');
}
</script>

<style lang="scss" scoped>
.login-modal {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .auth-widget__toggle {
    cursor: pointer;
    color: $color-primary;
    text-align: center;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
