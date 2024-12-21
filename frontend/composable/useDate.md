# Documentation : Composable `useDateFormatter`

## Introduction
Le composable `useDateFormatter` permet de formater les dates en français avec différentes options, notamment :
- Formats courts ou longs.
- Affichage de l'heure avec des formats personnalisés (ex. `HH:mm` ou `HH:mm:ss`).
- Gestion des dates relatives (ex. "il y a 2 jours").

Ce composable est conçu pour une utilisation flexible et simple dans un projet Vue 3 ou Nuxt 3.

---

## Installation
Assurez-vous que le composable `useDateFormatter.js` est disponible dans le dossier `composables` de votre projet Nuxt 3.

---

## Importation
Dans un composant Vue, importez et utilisez le composable :

```javascript
import useDateFormatter from '@/composables/useDateFormatter';
```

---

## Méthodes disponibles

### `formatDate`
Formate une date en fonction des options spécifiées.

#### Arguments
- **`date`** *(String | Date)* : La date à formater.
- **`options`** *(Object)* : Options pour personnaliser le formatage.

#### Options disponibles
| Option          | Type      | Valeurs possibles                | Description                                                                 |
|------------------|-----------|----------------------------------|-----------------------------------------------------------------------------|
| `format`         | `String`  | `"short"`, `"long"`              | Définit le format de la date (court ou long).                              |
| `includeTime`    | `Boolean` | `true`, `false`                  | Indique si l'heure doit être incluse.                                      |
| `timeFormat`     | `String`  | `"HH:mm"`, `"HH:mm:ss"`          | Définit le format de l'heure si `includeTime` est activé.                  |
| `locale`         | `String`  | Par défaut : `"fr-FR"`            | Langue à utiliser pour le formatage.                                       |
| `customOptions`  | `Object`  | Options spécifiques pour `Intl`  | Permet de passer des options personnalisées pour un contrôle avancé.       |

#### Détail des `customOptions`
L'objet `customOptions` permet de passer des options détaillées directement à l'API `Intl.DateTimeFormat`. Voici la liste exhaustive des clés disponibles :

| Clé                  | Type       | Description                                                                 |
|-----------------------|------------|-----------------------------------------------------------------------------|
| `weekday`            | `String`   | Format des jours : `"narrow"` (D), `"short"` (dim.), `"long"` (dimanche). |
| `era`                | `String`   | Ère : `"narrow"` (A), `"short"` (AP. J.-C.), `"long"` (Après Jésus-Christ). |
| `year`               | `String`   | Format de l'année : `"numeric"` (2024), `"2-digit"` (24).                 |
| `month`              | `String`   | Format des mois : `"numeric"`, `"2-digit"`, `"narrow"` (D), `"short"` (Déc.), `"long"` (Décembre). |
| `day`                | `String`   | Format du jour : `"numeric"` (22), `"2-digit"` (22).                      |
| `hour`               | `String`   | Format des heures : `"numeric"` (15), `"2-digit"` (15).                    |
| `minute`             | `String`   | Format des minutes : `"numeric"` (30), `"2-digit"` (30).                  |
| `second`             | `String`   | Format des secondes : `"numeric"` (45), `"2-digit"` (45).                  |
| `timeZoneName`       | `String`   | Nom du fuseau horaire : `"short"` (GMT), `"long"` (heure normale de GMT). |
| `timeZone`           | `String`   | Définir explicitement un fuseau horaire (ex. `"UTC"`, `"Europe/Paris"`).  |
| `hour12`             | `Boolean`  | Format 12 heures (`true`) ou 24 heures (`false`).                           |
| `dayPeriod`          | `String`   | Format des périodes du jour : `"narrow"`, `"short"`, `"long"`.           |
| `fractionalSecondDigits` | `Number` | Nombre de chiffres pour les fractions de secondes (1-3).                   |

#### Exemples avec `customOptions`

**Exemple 1 : Date avec jour et mois longs**
```javascript
const customDate1 = formatDate('2024-12-22', {
  customOptions: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
});
// Résultat : "dimanche 22 décembre 2024"
```

**Exemple 2 : Date avec jour court et mois abrégé**
```javascript
const customDate2 = formatDate('2024-12-22', {
  customOptions: {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  },
});
// Résultat : "dim. 22 déc. 2024"
```

**Exemple 3 : Heure avec fuseau horaire**
```javascript
const customDate3 = formatDate('2024-12-22T15:30:45', {
  customOptions: {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Paris',
    timeZoneName: 'short',
  },
});
// Résultat : "15:30:45 GMT+1"
```

**Exemple 4 : Format 12 heures avec AM/PM**
```javascript
const customDate4 = formatDate('2024-12-22T15:30:45', {
  customOptions: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    dayPeriod: 'short',
  },
});
// Résultat : "03:30 PM"
```

**Exemple 5 : Combinaison avancée avec plusieurs options**
```javascript
const customDate5 = formatDate('2024-12-22T15:30:45.123', {
  customOptions: {
    weekday: 'long',
    era: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: true,
    timeZone: 'UTC',
    timeZoneName: 'long',
  },
});
// Résultat : "dimanche 22 décembre 2024 après J.-C., 03:30:45.123 UTC"
```

#### Exemple d'utilisation

```javascript
const { formatDate } = useDateFormatter();

// Exemple 1 : Format court sans heure
const shortDate = formatDate('2024-12-22', { format: 'short' });
// Résultat : "dim. 22 Déc. 2024"

// Exemple 2 : Format long avec heure en HH:mm
const longDateWithTime = formatDate('2024-12-22T15:30:00', {
  format: 'long',
  includeTime: true,
  timeFormat: 'HH:mm',
});
// Résultat : "22 décembre 2024, 15:30"

// Exemple 3 : Options personnalisées
const customDate = formatDate('2024-12-22', {
  customOptions: { weekday: 'long', month: 'long', year: 'numeric' },
});
// Résultat : "dimanche 22 décembre 2024"
```

---

### `formatRelativeDate`
Retourne une date relative (ex : "il y a 2 jours", "dans 3 jours").

#### Arguments
- **`date`** *(String | Date)* : La date pour laquelle obtenir une représentation relative.
- **`locale`** *(String)* : Langue à utiliser pour le formatage (par défaut : `"fr-FR"`).

#### Exemple d'utilisation

```javascript
const { formatRelativeDate } = useDateFormatter();

// Exemple 1 : Date dans le passé
const relativePast = formatRelativeDate('2024-12-20');
// Résultat : "il y a 2 jours"

// Exemple 2 : Date dans le futur
const relativeFuture = formatRelativeDate('2024-12-25');
// Résultat : "dans 3 jours"

// Exemple 3 : Aujourd'hui ou demain
const today = formatRelativeDate(new Date());
// Résultat : "Aujourd’hui"
```

---

## Notes complémentaires
1. Les formats standards suivent les conventions de l'API `Intl.DateTimeFormat`.
2. Les erreurs de formatage sont capturées et affichées dans la console.
3. Le composable prend en charge les ajustements avancés via l'option `customOptions`.

---

## Intégration Nuxt 3
Pour une utilisation globale, vous pouvez définir le composable dans un plugin et l'injecter dans vos composants.

Exemple de déclaration dans un plugin :

```javascript
// plugins/dateFormatter.js
import useDateFormatter from '@/composables/useDateFormatter';

export default defineNuxtPlugin(() => {
  return {
    provide: {
      dateFormatter: useDateFormatter(),
    },
  };
});
```

Utilisation dans un composant :

```javascript
const { formatDate } = useNuxtApp().$dateFormatter;
const formatted = formatDate('2024-12-22', { format: 'short' });
console.log(formatted); // "dim. 22 Déc. 2024"
```

---

## Conclusion
Le composable `useDateFormatter` offre une solution puissante et flexible pour gérer le formatage des dates et heures dans vos projets Vue 3/Nuxt 3. Adaptez les options selon vos besoins et profitez d'une gestion harmonieuse des dates ! 🚀
