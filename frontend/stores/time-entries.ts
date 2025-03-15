import { defineStore } from 'pinia';

interface TimeEntry {
  id: string;
  date: string;
  duration: number;
  description?: string;
}

interface TimeEntryDetails {
  sessionId: string;
  startTime: string;
  endTime: string;
  workTime: number;
  pauseTime: number;
}

interface TimeEntriesResponse {
  totalWorkTime: number;
  totalPauseTime: number;
  details: TimeEntryDetails[];
}

interface TimeEntriesState {
  timeEntries: TimeEntriesResponse | null;
}

export const useTimeEntriesStore = defineStore('timeEntries', {
  state: (): TimeEntriesState => ({
    timeEntries: null,
  }),

  actions: {
    setTimeEntries(entries: TimeEntriesResponse) {
      this.timeEntries = entries;
    },

    addTimeEntry(entry: TimeEntryDetails) {
      if (!this.timeEntries) {
        this.timeEntries = {
          totalWorkTime: entry.workTime,
          totalPauseTime: entry.pauseTime,
          details: [entry],
        };
      } else {
        this.timeEntries.details.push(entry);
        this.timeEntries.totalWorkTime += entry.workTime;
        this.timeEntries.totalPauseTime += entry.pauseTime;
      }
    },

    updateTimeEntry(sessionId: string, updatedEntry: Partial<TimeEntryDetails>) {
      if (!this.timeEntries) return;

      const index = this.timeEntries.details.findIndex(entry => entry.sessionId === sessionId);
      if (index !== -1) {
        // Soustraire les anciennes valeurs des totaux
        this.timeEntries.totalWorkTime -= this.timeEntries.details[index].workTime;
        this.timeEntries.totalPauseTime -= this.timeEntries.details[index].pauseTime;

        // Mettre à jour l'entrée
        this.timeEntries.details[index] = {
          ...this.timeEntries.details[index],
          ...updatedEntry,
        };

        // Ajouter les nouvelles valeurs aux totaux
        this.timeEntries.totalWorkTime += this.timeEntries.details[index].workTime;
        this.timeEntries.totalPauseTime += this.timeEntries.details[index].pauseTime;
      }
    },

    deleteTimeEntry(sessionId: string) {
      if (!this.timeEntries) return;

      const index = this.timeEntries.details.findIndex(entry => entry.sessionId === sessionId);
      if (index !== -1) {
        // Soustraire les valeurs des totaux
        this.timeEntries.totalWorkTime -= this.timeEntries.details[index].workTime;
        this.timeEntries.totalPauseTime -= this.timeEntries.details[index].pauseTime;

        // Supprimer l'entrée
        this.timeEntries.details.splice(index, 1);
      }
    },

    clearTimeEntries() {
      this.timeEntries = null;
    }
  },
});
