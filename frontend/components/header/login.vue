<template>
  <div class="auth-widget">
    <!-- Si l'utilisateur est connecté -->
    <div v-if="isLoggedIn" class="auth-widget__connected">
      <p>Bienvenue, {{ userName }}</p>
      <button @click="logout" class="auth-widget__button">Déconnexion</button>
    </div>

    <!-- Si l'utilisateur n'est pas connecté -->
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
        <button type="submit" class="auth-widget__button">
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
import { ref, computed, onMounted  } from 'vue';
import { useRouter } from 'vue-router';
import { useNuxtApp, useCookie } from '#app';
import { jwtDecode } from 'jwt-decode';

// ------------------

// ------ Type ------

// ------------------

// ----- Define -----

// ------------------

// ------ Const -----
const router = useRouter();
const token = useCookie('token');
const { $api } = useNuxtApp();
// ------------------

// ---- Reactive ----
const email = ref('');
const password = ref('');
const userName = ref('');
const isLoggedIn = ref(false);
const isRegistering = ref(false);
const userProfile = ref()
// ------------------

// ---- Computed ----

// ------------------

// ------ Hooks -----
onMounted(() => {
  if (token.value) {
    try {
      const decoded: any = jwtDecode(token.value);
      const currentTime = Date.now() / 1000;
      if (decoded.exp > currentTime) {
        userName.value = decoded.sub; // Exemple : email ou nom d'utilisateur
        isLoggedIn.value = true;
        userProfile.value = getProfile()
        console.log('userProfile.value', userProfile.value);
        
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
    token.value = response.data.access_token;

    const decoded: any = jwtDecode(response.data.access_token);
    userName.value = decoded.sub;
    isLoggedIn.value = true;
  } catch (err) {
    console.error('Erreur d\'authentification', err);
  }
}

async function getProfile() {
  try {
    const profile = await $api.get('/user/profile');
    return profile
  } catch (error) {
    console.error('Erreur lors de la récupération du compte', error);
  }
}
// ------------------

// ---- Function ----
function toggleAuthMode() {
  isRegistering.value = !isRegistering.value;
}

function logout() {
  token.value = null;
  isLoggedIn.value = false;
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