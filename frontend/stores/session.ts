import { defineStore } from 'pinia';

export const useSessionStore = defineStore('session', () => {
  const isRunning = ref(false);
  const isPaused = ref(false);
  const sessionId = ref<string | null>(null); // Stocke l'ID de la session de travail

  function startSession() {
    isRunning.value = true;
    isPaused.value = false;
    console.log('Session démarrée');
  }

  function pauseSession() {
    isPaused.value = true;
    console.log('Session en pause');
  }

  function resumeSession() {
    isPaused.value = false;
    console.log('Session reprise');
  }

  function stopSession() {
    isRunning.value = false;
    isPaused.value = false;
    sessionId.value = null;
    console.log('Session arrêtée');
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
