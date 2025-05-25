import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: true,
  },
  modules: [
    '@nuxt/test-utils/module',
    '@vueuse/nuxt',
    'shadcn-nuxt',
  ],
  typescript: {
    typeCheck: true,
  },
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
  ssr: false,
});
