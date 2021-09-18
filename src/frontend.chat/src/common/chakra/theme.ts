import { theme as defaultTheme } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  sizes: {
    xs: '320px',
    sm: '620px',
    md: '960px',
    lg: '1280px',
    // xl: '1920px',
  },
  colors: {
    ...defaultTheme.colors,
    brand: {
      100: '#f7fafc',
      // ...
      900: '#1a202c',
    },
    main: {
      50: '#fffff0',
      100: '#fefcbf',
      200: '#faf089',
      300: '#f6e05e',
      400: '#ecc94b',
      500: '#d69e2e',
      600: '#b7791f',
      700: '#975a16',
      800: '#744210',
      900: '#5F370E',
    },
    secondary: {
      background: '#FBF7EF',
      link: '#4A5568',
      card: '#ffffff',
      inputHelper: '#CBD5E0',
    },
    navItem: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
    },
  },
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
})
