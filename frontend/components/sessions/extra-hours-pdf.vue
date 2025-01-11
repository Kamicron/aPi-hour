<template>
    <div class="extra-hours-pdf">
      <h2>Générer PDF des heures supplémentaires</h2>
      <div class="extra-hours-pdf__input">
        <label>
          Mois:
          <input
            class="pi-input"
            type="month"
            v-model="selectedMonth"
            :max="currentMonth"
          />
        </label>
      </div>
      <button
        class="btn"
        @click="generatePDF"
        :disabled="!selectedMonth || loading"
      >
        <pi-loader v-if="loading" />
        <span v-else>Générer PDF</span>
      </button>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNuxtApp, useCookie } from '#app';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const { $api } = useNuxtApp();
const token = useCookie('token');

const selectedMonth = ref('');
const loading = ref(false);
const logoBase64 = ref('');

// Get current month in YYYY-MM format
const currentMonth = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});

// Fonction pour charger et convertir l'image en base64
const loadLogo = async () => {
  try {
    const response = await fetch('/logo_colored.png');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erreur lors du chargement du logo:', error);
    return null;
  }
};

const generatePDF = async () => {
  if (!selectedMonth.value) return;
  
  loading.value = true;
  try {
    // Charger le logo
    const logoData = await loadLogo();

    // Récupérer les heures supplémentaires
    const hoursResponse = await $api.post(
      "/time-entries/calculate-with-rates",
      { month: selectedMonth.value },
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );

    // Récupérer les congés
    const [year, month] = selectedMonth.value.split('-');
    const vacationsResponse = await $api.get('/time-entries/month', {
      params: { 
        year: parseInt(year), 
        month: parseInt(month)
      },
      headers: { Authorization: `Bearer ${token.value}` },
    });

    const hoursData = hoursResponse.data;
    const vacations = vacationsResponse.data.vacations;

    // Create PDF with larger page margins
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 }
    });

    // Définir les couleurs de la charte graphique
    const colorBackground = '#20242b';
    const colorSurface = '#2b333f';
    const colorPrimary = '#4f668d';
    const colorSecondary = '#ecc130';
    const colorTextPrimary = '#e1e1e1';

    // Configuration des styles de tableau communs
    const tableStyles = {
      headStyles: {
        fillColor: colorPrimary,
        textColor: colorTextPrimary,
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: { top: 6, right: 4, bottom: 6, left: 4 },
        overflow: 'linebreak'
      },
      bodyStyles: {
        textColor: colorBackground,
        fontSize: 10,
        cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: '#f4f6f8'
      },
      margin: { top: 20, left: 15, right: 15 },
      tableWidth: 180 // Largeur fixe pour tous les tableaux
    };

    // Ajouter un en-tête avec fond coloré
    doc.setFillColor(colorBackground);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');

    // Ajouter le logo s'il a été chargé avec succès
    if (logoData) {
      doc.addImage(logoData, 'PNG', 15, 8, 22, 22);
    }

    // Add title
    doc.setFontSize(22);
    doc.setTextColor(colorTextPrimary);
    doc.text(`Résumé des heures supplémentaires`, 45, 20);
    doc.setFontSize(14);
    doc.text(`${month}/${year}`, 45, 30);

    // Add total summary with custom styling
    doc.autoTable({
      startY: 50,
      head: [['Type', 'Heures']],
      body: [
        ['Total heures à 25%', `${Number(hoursData.totalExtra25Hours).toFixed(2)}h`],
        ['Total heures à 50%', `${Number(hoursData.totalExtra50Hours).toFixed(2)}h`],
      ],
      ...tableStyles,
      columnStyles: {
        0: { cellWidth: 140 },
        1: { cellWidth: 40, halign: 'right' }
      }
    });

    // Add weekly details
    let yPosition = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.setTextColor(colorPrimary);
    doc.text('Détails par semaine', 15, yPosition);

    const weeklyTableData = hoursData.weeklyDetails.map(week => [
      `${new Date(week.weekStart).toLocaleDateString('fr-FR')} au ${new Date(week.weekEnd).toLocaleDateString('fr-FR')}`,
      `${Number(week.workedHours).toFixed(2)}h`,
      `${Number(week.extra25Hours).toFixed(2)}h`,
      `${Number(week.extra50Hours).toFixed(2)}h`,
    ]);

    doc.autoTable({
      startY: yPosition + 10,
      head: [['Semaine', 'H. travaillées', 'H. 25%', 'H. 50%']],
      body: weeklyTableData,
      ...tableStyles,
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40, halign: 'right' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      }
    });

    // Add vacation details if any
    if (vacations && vacations.length > 0) {
      yPosition = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(16);
      doc.setTextColor(colorPrimary);
      doc.text('Périodes de congés', 15, yPosition);

      const vacationTableData = vacations.map(vacation => {
        const startDate = new Date(vacation.startDate);
        const endDate = new Date(vacation.endDate);
        const daysCount = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        return [
          `${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`,
          vacation.status,
          vacation.reason || 'Non spécifié',
          `${daysCount} jour${daysCount > 1 ? 's' : ''}`
        ];
      });

      // Calculer le total des jours de congés
      const totalDays = vacationTableData.reduce((total, vacation) => {
        return total + parseInt(vacation[3]);
      }, 0);

      doc.autoTable({
        startY: yPosition + 10,
        head: [['Période', 'Statut', 'Motif', 'Durée']],
        body: vacationTableData,
        foot: [['Total', '', '', `${totalDays} jour${totalDays > 1 ? 's' : ''}`]],
        ...tableStyles,
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 30 },
          2: { cellWidth: 50 },
          3: { cellWidth: 30, halign: 'right' }
        },
        footStyles: {
          fillColor: colorSecondary,
          textColor: colorBackground,
          fontStyle: 'bold',
          halign: 'right',
          fontSize: 11
        },
        showFoot: 'lastPage'
      });
    }

    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(9);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`heures-sup-${selectedMonth.value}.pdf`);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.extra-hours-pdf {
  display: flex;
  flex-direction: column;
  gap: $spacing-medium;

  &__input {
    label {
      display: flex;
      flex-direction: column;
      gap: $spacing-small;
    }
  }
}
</style>
