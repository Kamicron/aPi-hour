<template>
  <div class="auth-widget">
  <button class="btn" @click="getProfile()">getProfile</button>
    <div v-if="isLoggedIn" class="auth-widget__connected">
      <p v-if="profile">Bienvenue, {{ profile.name }}</p>
      <button @click="logout" class="btn">Déconnexion</button>
    </div>

    <div v-else class="auth-widget__form">
      <form @submit.prevent="handleAuth">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="auth-widget__input"
          required
        />
        <input
          v-model="password"
          type="password"
          placeholder="Mot de passe"
          class="auth-widget__input"
          required
        />
        <button type="submit" class="btn">
          {{ isRegistering ? 'Créer un compte' : 'Se connecter' }}
        </button>
      </form>
      <p @click="toggleAuthMode" class="auth-widget__toggle">
        {{ isRegistering ? 'Déjà inscrit ? Connectez-vous' : 'Créer un compte' }}
      </p>
    </div>
  </div>
</template>

<script setup lang='ts'>
// ----- Import -----
import { ref, onMounted  } from 'vue';
import { useRouter } from 'vue-router';
import { useNuxtApp, useCookie } from '#app';
import { jwtDecode } from 'jwt-decode';
import { useUserStore } from '../../stores/user';
import { useGlobalEvents } from '~/composable/useGlobalEvent';
import { EGlobalEvent } from '~/assets/ts/enums/global/globalEvent.enum';

// ------------------

// ------ Type ------

// ------------------

// ----- Define -----

// ------------------

// ------ Const -----
const router = useRouter();
const token = useCookie('token');
const { $api } = useNuxtApp();
const userStore = useUserStore();
// ------------------

// ---- Reactive ----
const email = ref('');
const password = ref('');
const userName = ref('');
const isLoggedIn = ref(false);
const isRegistering = ref(false);
const profile = ref()
// ------------------

// ---- Computed ----

// ------------------

// ------ Hooks -----
onMounted(async () => {
  if (token.value) {
    try {
      const decoded: any = jwtDecode(token.value);
      const currentTime = Date.now() / 1000;
      if (decoded.exp > currentTime) {
        isLoggedIn.value = true;

        getProfile()
      } else {
        logout();
      }
    } catch (err) {
      logout();
    }
  }
});
// ------------------

// --- Async Func ---
async function handleAuth() {
  try {
    const url = isRegistering.value ? '/auth/register' : '/auth/login';
    const response = await $api.post(url, {
      email: email.value,
      password: password.value,
    });

    userStore.token = response.data.access_token;

    getProfile()
    isLoggedIn.value = true; 
    useGlobalEvents().emitEvent<boolean>(EGlobalEvent.LOGGED, true)

  } catch (err) {
    console.error("Erreur d'authentification", err);
  }
}

async function getProfile() {
  profile.value = await userStore.fetchProfile($api);
}


// ------------------

// ---- Function ----
function toggleAuthMode() {
  isRegistering.value = !isRegistering.value;
}

function logout() {
  console.log('logout');
  
  useGlobalEvents().emitEvent<boolean>(EGlobalEvent.LOGGED, false)
  userStore.logout();
  isLoggedIn.value = false; 

  router.push('/')
}
// ------------------


// ------ Watch -----

// ------------------

</script>

<style lang="scss" scoped>
.auth-widget {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__form,
  &__connected {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__input {
    padding: 0.5rem;
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  &__button {
    background-color: #007bff;
    color: #fff;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
      background-color: #0056b3;
    }
  }

  &__toggle {
    cursor: pointer;
    color: #007bff;
    text-decoration: underline;
  }
}
</style>