import { themes as prismThemes } from 'prism-react-renderer';

const config = {
  title: 'Két Keréken',
  tagline: 'Kerékpáros közösségi webalkalmazás projekt-dokumentációja',
  favicon: 'img/favicon.png',

  url: 'http://localhost:8090',
  baseUrl: '/dokumentacio/',

  organizationName: 'ketkereken',
  projectName: 'ketkereken-dokumentacio',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'hu',
    locales: ['hu'],
  },

  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig: ({
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Két Keréken',
      logo: {
        alt: 'Két Keréken logó',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Dokumentáció',
        },
        {
          type: 'doc',
          docId: 'melleklet',
          position: 'left',
          label: 'Melléklet',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Oldalak',
          items: [
            { label: 'Főoldal', to: '/dokumentacio/' },
            { label: 'Bevezetés', to: '/dokumentacio/bevezetes' },
            { label: 'Melléklet', to: '/dokumentacio/melleklet' },
          ],
        },
        {
          title: 'Fő témák',
          items: [
            { label: 'Adatbázis', to: '/dokumentacio/adatbazis' },
            { label: 'Backend', to: '/dokumentacio/backend' },
            { label: 'Frontend', to: '/dokumentacio/frontend' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Két Keréken dokumentáció · Készítette: Hermann Zsombor és Srámli Dávid Bence`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  }),
};

export default config;