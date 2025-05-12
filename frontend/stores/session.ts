import { defineStore } from 'pinia';

export const useSessionStore = defineStore('session', () => {
  const isRunning = ref(false);
  const isPaused = ref(false);
  const sessionId = ref<string | null>(null); // Stocke l'ID de la session de travail

  function startSession() {
    isRunning.value = true;
    isPaused.value = false;
  }

  function pauseSession() {
    isPaused.value = true;
  }

  function resumeSession() {
    isPaused.value = false;
  }

  function stopSession() {
    isRunning.value = false;
    isPaused.value = false;
    sessionId.value = null;
  }

  return {
    isRunning,
    isPaused,
    sessionId,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
  };
});
