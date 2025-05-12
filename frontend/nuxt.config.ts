// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://site-assets.fontawesome.com/releases/v6.4.2/css/all.css',
          crossorigin: 'anonymous'
        }
      ]
    }
  },
  ssr: true,
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  devServer: {
    port: 3001
  },
  css: [
    '~/assets/scss/stylesheet.scss',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "~/assets/scss/variables.scss";
            @import "~/assets/scss/mixins.scss";
            @import "~/assets/scss/buttons.scss";
            @import "~/assets/scss/inputs.scss";
          `,
          
        },
      },
    },
  },
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000', // URL par défaut si .env est manquant
    },
  },
  plugins: ['~/plugins/fontawesome.js'],
  components: [
    { path: '~/components/', pathPrefix: false }
  ],
})
