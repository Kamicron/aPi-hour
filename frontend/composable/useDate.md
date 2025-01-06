# Documentation : Composable `useDateFormatter`

## Introduction
Le composable `useDateFormatter` permet de gérer les dates et durées dans vos projets Vue 3 ou Nuxt 3 avec flexibilité et simplicité. Il inclut :
- La gestion des formats de date courts ou longs.
- L'affichage de l'heure avec des options personnalisées.
- Le calcul et le formatage des durées (ex. `jj:hh:mm:ss`).
- La gestion des dates relatives (ex. "il y a 2 jours").

---

## Installation
Assurez-vous que le composable `useDateFormatter.js` est disponible dans le dossier `composables` de votre projet Nuxt 3.

---

## Importation
Dans un composant Vue, importez et utilisez le composable :

```javascript
import useDateFormatter from '../../composable/useDate';
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
| `month`              | `String`   | Format des mois : `"numeric"`, `"2-digit"`, `"narrow"`, `"short"`, `"long"`. |
| `day`                | `String`   | Format du jour : `"numeric"` (22), `"2-digit"` (22).                      |
| `hour`               | `String`   | Format des heures : `"numeric"` (15), `"2-digit"` (15).                    |
| `minute`             | `String`   | Format des minutes : `"numeric"` (30), `"2-digit"` (30).                  |
| `second`             | `String`   | Format des secondes : `"numeric"` (45), `"2-digit"` (45).                  |
| `timeZoneName`       | `String`   | Nom du fuseau horaire : `"short"` (GMT), `"long"` (heure normale de GMT). |
| `timeZone`           | `String`   | Définir explicitement un fuseau horaire (ex. `"UTC"`, `"Europe/Paris"`).  |
| `hour12`             | `Boolean`  | Format 12 heures (`true`) ou 24 heures (`false`).                           |
| `dayPeriod`          | `String`   | Format des périodes du jour : `"narrow"`, `"short"`, `"long"`.           |
| `fractionalSecondDigits` | `Number` | Nombre de chiffres pour les fractions de secondes (1-3).                   |

#### Exemples sans `customOptions`

**Exemple 1 : Date avec le format long**
```javascript
import useDateFormatter from '../../composable/useDate';
const formattedDate1 = useDateFormatter().formatDate(new Date(), { format: 'long' });
// Résultat : "dimanche 22 décembre 2024"
```

**Exemple 2 : Date avec heure incluse**
```javascript
import useDateFormatter from '../../composable/useDate';
const formattedDate2 = useDateFormatter().formatDate(new Date(), { format: 'long', includeTime: true });
// Résultat : "dimanche 22 décembre 2024 à 15:30"
```

**Exemple 3 : Format court sans heure**
```javascript
import useDateFormatter from '../../composable/useDate';
const formattedDate3 = useDateFormatter().formatDate(new Date(), { format: 'short' });
// Résultat : "22 déc. 2024"
```

#### Exemples avec `customOptions`

**Exemple 1 : Date avec jour et mois longs**
```javascript
import useDateFormatter from '../../composable/useDate';
const formattedDate1 = useDateFormatter().formatDate('2024-12-22', {
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
import useDateFormatter from '../../composable/useDate';
const formattedDate2 = useDateFormatter().formatDate('2024-12-22', {
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
import useDateFormatter from '../../composable/useDate';
const formattedDate3 = useDateFormatter().formatDate('2024-12-22T15:30:45', {
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
import useDateFormatter from '../../composable/useDate';
const formattedDate4 = useDateFormatter().formatDate('2024-12-22T15:30:45', {
  customOptions: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    dayPeriod: 'short',
  },
});
// Résultat : "03:30 PM"
```


**Exemple 5 : Format avec fractions de secondes et fuseau horaire long**
```javascript
import useDateFormatter from '../../composable/useDate';
const formattedDate5 = useDateFormatter().formatDate('2024-12-22T15:30:45.123', {
  customOptions: {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    timeZone: 'UTC',
    timeZoneName: 'long',
  },
});
// Résultat : "15:30:45.123 Temps universel coordonné"
```

---

### `calculateDuration`
Calcule et formate la durée entre deux dates en fonction des options spécifiées.

#### Arguments
- **`startDate`** *(String | Date)* : Date de début.
- **`endDate`** *(String | Date)* : Date de fin.
- **`options`** *(Object)* : Options pour personnaliser le formatage.

#### Options disponibles
| Option          | Type      | Description                                                                 |
|------------------|-----------|-----------------------------------------------------------------------------|
| `locale`         | `String`  | Langue à utiliser pour le formatage (par défaut : `"fr-FR"`).             |
| `customOptions`  | `Object`  | Options spécifiques pour définir les unités (`day`, `hour`, `minute`, etc.). |

#### Exemples avec `customOptions`

**Exemple 1 : Durée avec toutes les unités**
```javascript
import useDateFormatter from '../../composable/useDate';
const duration1 = useDateFormatter().calculateDuration('2024-12-20T08:30:00', '2024-12-22T18:45:30', {
  customOptions: {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  },
});
// Résultat : "02:10:15:30"
```

**Exemple 2 : Durée limitée à 24 heures**
```javascript
import useDateFormatter from '../../composable/useDate';
const duration2 = useDateFormatter().calculateDuration('2024-12-20T08:30:00', '2024-12-22T18:45:30', {
  customOptions: {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  },
});
// Résultat : "58:15:30"
```

---

### `formatRelativeDate`
Retourne une date relative (ex : "il y a 2 jours", "dans 3 jours").

#### Arguments
- **`date`** *(String | Date)* : La date pour laquelle obtenir une représentation relative.
- **`locale`** *(String)* : Langue à utiliser pour le formatage (par défaut : `"fr-FR"`).

#### Exemple d'utilisation

```javascript
import useDateFormatter from '../../composable/useDate';
const { formatRelativeDate } = useDateFormatter();

// Exemple 1 : Date dans le passé
const relativePast = useDateFormatter().formatRelativeDate('2024-12-20');
// Résultat : "il y a 2 jours"

// Exemple 2 : Date dans le futur
const relativeFuture = useDateFormatter().formatRelativeDate('2024-12-25');
// Résultat : "dans 3 jours"

// Exemple 3 : Aujourd'hui ou demain
const today = useDateFormatter().formatRelativeDate(new Date());
// Résultat : "Aujourd’hui"
```

---

## Conclusion
Le composable `useDateFormatter` offre une solution puissante et flexible pour gérer le formatage des dates et heures, ainsi que le calcul des durées dans vos projets Vue 3/Nuxt 3. Adaptez les options selon vos besoins et profitez d'une gestion harmonieuse des dates ! 🚀
