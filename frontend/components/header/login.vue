<template>
  <div class="auth-widget">
    <!-- <button class="btn" @click="getProfile()">getProfile</button> -->
    <div v-if="isLoggedIn" class="auth-widget__connected">
      <p v-if="profile">Bienvenue, <span class="auth-widget__connected--user">{{ profile.name }}</span> </p>
      <button @click="logout" class="btn">Déconnexion</button>
    </div>

    <div v-else>
      <button @click="isOpenModal = true" class="btn">
        {{ isRegistering ? 'Créer un compte' : 'Se connecter' }}
      </button>
    </div>
  </div>

  <modal v-model="isOpenModal">
    <login-modal @handleAuth="handleAuth" @close="isOpenModal = false" />
  </modal>
</template>

<script setup lang='ts'>
// ----- Import -----
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNuxtApp, useCookie } from '#app';
import { jwtDecode } from 'jwt-decode';
import { useUserStore } from '../../stores/user';
import { useGlobalEvents } from '../../composable/useGlobalEvent';
import { EGlobalEvent } from '../../assets/ts/enums/global/globalEvent.enum';

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

const isLoggedIn = ref(false);
const isRegistering = ref(false);
const profile = ref()
const isOpenModal = ref<boolean>(false)
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
async function handleAuth({ email, password, isRegistering }: {
  email: string;
  password: string;
  isRegistering: boolean;
}) {
  try {
    // Route correcte en fonction du mode
    const url = isRegistering ? '/users' : '/auth/login';

    // Ajout du champ `name` pour l'enregistrement
    const data = isRegistering
      ? { name: email.split('@')[0], email, password } // Nom généré à partir de l'email
      : { email, password };

    const response = await $api.post(url, data);

    // Si c'est une création, pas besoin de token immédiat
    if (!isRegistering) {
      userStore.token = response.data.access_token;
      getProfile();
      isLoggedIn.value = true;
    }

    isOpenModal.value = false;
  } catch (err) {
    console.error('Erreur d\'authentification', err);
  }
}


async function getProfile() {
  profile.value = await userStore.fetchProfile($api);
}


// ------------------

// ---- Function ----


function logout() {
  console.log('logout login');

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

  &__connected {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1rem;

    &--user {
      color: $color-secondary;
      font-weight: bold;
    }
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