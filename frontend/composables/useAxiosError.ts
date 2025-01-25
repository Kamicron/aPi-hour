import { AxiosError } from 'axios'
import { EHttpError } from '~/assets/ts/enums/http-error.enum'

interface ErrorResponse {
  message?: string
  error?: string
  statusCode?: number
}

export const useAxiosError = () => {
  const getErrorMessage = (error: unknown): string => {
    if (!(error instanceof AxiosError)) {
      return 'Une erreur inattendue est survenue'
    }

    const statusCode = error.response?.status
    const data = error.response?.data as ErrorResponse | undefined

    // Messages d'erreur personnalisés en fonction du code HTTP
    const httpErrorMessages: Record<number, string> = {
      [EHttpError.BAD_REQUEST]: 'Les données envoyées sont invalides',
      [EHttpError.UNAUTHORIZED]: 'Vous devez être connecté pour effectuer cette action',
      [EHttpError.FORBIDDEN]: 'Vous n\'avez pas les droits nécessaires',
      [EHttpError.NOT_FOUND]: 'La ressource demandée n\'existe pas',
      [EHttpError.CONFLICT]: 'Cette opération crée un conflit avec les données existantes',
      [EHttpError.INTERNAL_SERVER_ERROR]: 'Une erreur est survenue sur le serveur',
      [EHttpError.SERVICE_UNAVAILABLE]: 'Le service est temporairement indisponible'
    }

    // Messages d'erreur spécifiques en fonction du message d'erreur de l'API
    const apiErrorMessages: Record<string, string> = {
      'Invalid credentials': 'Identifiants invalides',
      'User already exists': 'Cet utilisateur existe déjà',
      'Email already exists': 'Cette adresse email est déjà utilisée',
      'Invalid token': 'Votre session a expiré, veuillez vous reconnecter',
      'Password too weak': 'Le mot de passe est trop faible',
      // Ajoutez d'autres messages spécifiques ici
    }

    // Priorité au message spécifique de l'API s'il existe
    if (data?.message && apiErrorMessages[data.message]) {
      return apiErrorMessages[data.message]
    }

    // Sinon, utiliser le message d'erreur HTTP générique
    if (statusCode && httpErrorMessages[statusCode]) {
      return httpErrorMessages[statusCode]
    }

    // Message par défaut si aucun autre message n'est trouvé
    return data?.message || 'Une erreur est survenue lors de la communication avec le serveur'
  }

  return {
    getErrorMessage
  }
}
