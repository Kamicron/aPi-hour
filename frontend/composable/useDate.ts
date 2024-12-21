export default function useDateFormatter() {
  const defaultLocale = 'fr-FR';

  // Fonction pour formater les dates
  const formatDate = (date, options = {}) => {
    const {
      format = 'long', // "short" ou "long"
      includeTime = false, // Inclure l'heure ou non
      timeFormat = 'HH:mm', // Format de l'heure : "HH:mm" ou "HH:mm:ss"
      locale = defaultLocale, // Langue (par défaut : français)
      customOptions = {}, // Options personnalisées
    } = options;

    // Préconfiguration des formats standards
    const dateOptions = format === 'short'
      ? { year: 'numeric', month: 'short', day: '2-digit', weekday: 'short' }
      : { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };

    // Ajout de l'heure si demandé
    if (includeTime) {
      const timeOptions = timeFormat === 'HH:mm:ss'
        ? { hour: '2-digit', minute: '2-digit', second: '2-digit' }
        : { hour: '2-digit', minute: '2-digit' };

      Object.assign(dateOptions, timeOptions);
    }

    // Fusion avec les options personnalisées
    const finalOptions = { ...dateOptions, ...customOptions };

    try {
      const formattedDate = new Intl.DateTimeFormat(locale, finalOptions).format(new Date(date));

      // Post-traitement pour corriger le format souhaité (dim. 22 Déc. 2024)
      if (format === 'short' && dateOptions.weekday === 'short' && dateOptions.month === 'short') {
        return formattedDate.replace(/\b(\w+)\.? (\d{2})\/?\s*(\w+)\b/i, (match, day, dayNumber, month) => {
          return `${day}. ${dayNumber} ${month}`;
        });
      }

      return formattedDate;
    } catch (error) {
      console.error('Erreur lors du formatage de la date :', error);
      return null;
    }
  };

  // Fonction pour obtenir une date relative (ex : "il y a 2 jours")
  const formatRelativeDate = (date, locale = defaultLocale) => {
    try {
      const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      const diff = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24); // Différence en jours

      if (Math.abs(diff) < 1) {
        return diff < 0 ? 'Aujourd’hui' : 'Demain';
      } else if (diff < 0) {
        return formatter.format(Math.ceil(diff), 'day');
      } else {
        return formatter.format(Math.floor(diff), 'day');
      }
    } catch (error) {
      console.error('Erreur lors du formatage de la date relative :', error);
      return null;
    }
  };

  return {
    formatDate,
    formatRelativeDate,
  };
}
