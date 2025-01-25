# Plugin Toast pour Nuxt 3

Un plugin de notification toast moderne et configurable pour Nuxt 3, offrant une expérience utilisateur fluide avec des animations élégantes.

## Caractéristiques

- 🎨 4 types de notifications : success, error, warning, info
- 🔄 Animations fluides d'entrée et de sortie
- 📱 Design responsive
- ⚙️ Configuration globale (position, couleurs, police)
- 🎯 Positionnement automatique et intelligent
- ❌ Fermeture automatique ou manuelle

## Installation

1. Copiez les fichiers suivants dans votre projet Nuxt 3 :
   ```bash
   # Créez les dossiers nécessaires
   mkdir -p components/ui
   mkdir -p plugins/toast
   mkdir -p assets/ts/enums

   # Copiez les fichiers
   cp Toast.vue components/ui/
   cp toast/index.ts plugins/toast/
   ```

2. Créez l'enum pour les types de toast dans `assets/ts/enums/toast.enum.ts` :
   ```typescript
   export enum EToast {
     SUCCESS = 'success',
     ERROR = 'error',
     WARNING = 'warning',
     INFO = 'info',
   }
   ```

3. Assurez-vous que votre `nuxt.config.ts` est configuré pour détecter les plugins :
   ```typescript
   export default defineNuxtConfig({
     // ... autres configurations
     plugins: [
       '~/plugins/toast'
     ]
   })
   ```

## Configuration

### Configuration globale des styles et de la position

Vous pouvez configurer globalement l'apparence et le comportement des toasts au démarrage de votre application :

```typescript
// Dans votre app.vue ou un plugin
import { EToast } from '~/assets/ts/enums/toast.enum'
const { $toast } = useNuxtApp()

$toast.configure({
  position: {
    top: 20,
    right: 20
  },
  styles: {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    types: {
      [EToast.SUCCESS]: {
        backgroundColor: '#48BB78',
        color: '#ffffff',
        borderColor: '#2F855A'
      },
      [EToast.ERROR]: {
        backgroundColor: '#F56565',
        color: '#ffffff',
        borderColor: '#C53030'
      },
      [EToast.WARNING]: {
        backgroundColor: '#ED8936',
        color: '#ffffff',
        borderColor: '#C05621'
      },
      [EToast.INFO]: {
        backgroundColor: '#4299E1',
        color: '#ffffff',
        borderColor: '#2B6CB0'
      }
    }
  }
})
```

### Utilisation basique

```typescript
import { EToast } from '~/assets/ts/enums/toast.enum'
const { $toast } = useNuxtApp()

// Afficher une notification de succès
$toast.show({
  message: 'Opération réussie !',
  type: EToast.SUCCESS
})

// Afficher une notification d'erreur
$toast.show({
  message: 'Une erreur est survenue',
  type: EToast.ERROR,
  duration: 5000
})
```

### Options disponibles

#### Options pour show()

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| message | string | required | Le message à afficher |
| type | EToast | EToast.INFO | Le type de notification |
| duration | number | 3000 | Durée d'affichage en millisecondes |
| dismissible | boolean | true | Si la notification peut être fermée manuellement |
| icon | string | '' | Emoji ou caractère à utiliser comme icône |

#### Options de configuration globale

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| position.top | number | 20 | Distance depuis le haut de l'écran |
| position.right | number | 20 | Distance depuis la droite de l'écran |
| styles.fontFamily | string | 'inherit' | Police de caractères globale |
| styles.fontSize | string | '0.95rem' | Taille de la police |
| styles.types.*.backgroundColor | string | - | Couleur de fond par type |
| styles.types.*.color | string | - | Couleur du texte par type |
| styles.types.*.borderColor | string | - | Couleur de la bordure par type |

## Exemple complet

```vue
<script setup>
import { EToast } from '~/assets/ts/enums/toast.enum'
const { $toast } = useNuxtApp()

// Configuration globale
onMounted(() => {
  $toast.configure({
    position: {
      top: 20,
      right: 20
    },
    styles: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: '14px',
      types: {
        [EToast.SUCCESS]: {
          backgroundColor: '#48BB78',
          color: '#ffffff',
          borderColor: '#2F855A'
        }
      }
    }
  })
})

// Exemple d'utilisation
const showSuccessToast = () => {
  $toast.show({
    message: 'Opération réussie !',
    type: EToast.SUCCESS,
    duration: 3000,
    icon: '✅'
  })
}
</script>
```

## Conseils d'utilisation

1. Configurez les styles globalement au démarrage de l'application
2. Utilisez des messages courts et concis
3. Choisissez le bon type de notification selon le contexte
4. Ajoutez des icônes pour améliorer la compréhension
5. Adaptez la durée d'affichage à la longueur du message
6. Évitez d'afficher trop de notifications simultanément
