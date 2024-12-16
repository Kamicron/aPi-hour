// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true, 
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true }, 
  devServer: {
    port: 3001,
  },
  plugins: ['~/plugins/pinia'],
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000', // URL par défaut si .env est manquant
    },
  },
  components: [
    { path: '~/components/', pathPrefix: false }
  ],
})
