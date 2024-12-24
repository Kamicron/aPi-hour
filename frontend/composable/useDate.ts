export default function useDateFormatter() {
  const defaultLocale = "fr-FR";

  // Fonction pour formater les dates
  const formatDate = (date, options = {}) => {
    const {
      format = "long", // "short" ou "long"
      includeTime = false, // Inclure l'heure ou non
      timeFormat = "HH:mm", // Format de l'heure : "HH:mm" ou "HH:mm:ss"
      locale = defaultLocale, // Langue (par défaut : français)
      customOptions = {}, // Options personnalisées
    } = options;

    try {
      // Si customOptions est défini, utiliser uniquement ces options
      if (Object.keys(customOptions).length > 0) {
        return new Intl.DateTimeFormat(locale, customOptions).format(
          new Date(date)
        );
      }

      // Préconfiguration des formats standards
      const dateOptions =
        format === "short"
          ? {
              year: "numeric",
              month: "short",
              day: "2-digit",
              weekday: "short",
            }
          : { year: "numeric", month: "long", day: "numeric", weekday: "long" };

      // Ajout de l'heure si demandé
      if (includeTime) {
        const timeOptions =
          timeFormat === "HH:mm:ss"
            ? { hour: "2-digit", minute: "2-digit", second: "2-digit" }
            : { hour: "2-digit", minute: "2-digit" };

        Object.assign(dateOptions, timeOptions);
      }

      // Fusion avec les options personnalisées
      const finalOptions = { ...dateOptions, ...customOptions };

      const formattedDate = new Intl.DateTimeFormat(
        locale,
        finalOptions
      ).format(new Date(date));

      // Post-traitement pour ajuster le format français
      const dateTimeParts = formattedDate.split("à ");

      if (includeTime) {
        const [datePart, timePart] = dateTimeParts;
        return `${datePart} à ${timePart}`; // Ajoute "à" entre la date et l'heure
      }

      return formattedDate;
    } catch (error) {
      console.error("Erreur lors du formatage de la date :", error);
      return null;
    }
  };

  // Fonction pour obtenir une date relative (ex : "il y a 2 jours")
  const formatRelativeDate = (date, locale = defaultLocale) => {
    try {
      const formatter = new Intl.RelativeTimeFormat(locale, {
        numeric: "auto",
      });
      const diff = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24); // Différence en jours

      if (Math.abs(diff) < 1) {
        return diff < 0 ? "Aujourd’hui" : "Demain";
      } else if (diff < 0) {
        return formatter.format(Math.ceil(diff), "day");
      } else {
        return formatter.format(Math.floor(diff), "day");
      }
    } catch (error) {
      console.error("Erreur lors du formatage de la date relative :", error);
      return null;
    }
  };

  // Fonction pour calculer la durée entre deux dates
  const calculateDuration = (startDate, endDate, options = {}) => {
    const { locale = defaultLocale, customOptions = {} } = options;

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffInMs = Math.abs(end - start);

      // Calcul des composants de la durée
      const totalSeconds = Math.floor(diffInMs / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalDays = Math.floor(totalHours / 24);

      const durationParts = {
        day: totalDays,
        hour: totalHours % 24,
        minute: totalMinutes % 60,
        second: totalSeconds % 60,
      };

      // Formatage des parties selon les customOptions
      const formattedParts = Object.entries(customOptions).map(
        ([key, value]) => {
          if (durationParts[key] !== undefined && value === "2-digit") {
            return String(durationParts[key]).padStart(2, "0");
          }
          return null;
        }
      );

      return formattedParts.filter((part) => part !== null).join(":");
    } catch (error) {
      console.error("Erreur lors du calcul de la durée :", error);
      return null;
    }
  };

  return {
    formatDate,
    formatRelativeDate,
    calculateDuration,
  };
}
