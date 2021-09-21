import { theme as defaultChakraTheme } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react'

const defaultTheme = {
  styles: {
    global: (props: any) => ({
      "html, body": {
        fontSize: "sm",
        background: props.colorMode === "dark" ? "gray.700" : "gray.200",
        color: props.colorMode === "dark" ? "gray.400" : "gray.600",
        lineHeight: "tall",
      },
      a: {
        color: props.colorMode === "dark" ? "teal.300" : "teal.500",
      },
      '& .room > .heading, & .form': {
        color: props.colorMode === "dark" ? "white" : "gray.600",
        background: props.colorMode === "dark" ? "gray.600" : "gray.300",
      },
      '& .form .absolute-label': {
        color: props.colorMode === "dark" ? "white" : "gray.500",
      },
      '& .form': {
        background: 'transparent',
        '& input, & textarea': {
          background: props.colorMode === "dark" ? "gray.600" : "gray.300",
        },
        // color: props.colorMode === "dark" ? "white" : "white",
        '& button': {
          color: props.colorMode === "dark" ? "gray.600" : "white",
          background: props.colorMode === "dark" ? "yellow.300" : "blue.400",
        },
        '& button:disabled': {
          background: props.colorMode === "dark" ? "gray.500" : "gray.500",
          color: props.colorMode === "dark" ? "white" : "white", // props.colorMode === "dark" ? "white" : "gray.500",
        },
      },
    }),
  },
  sizes: {
    xs: '320px',
    sm: '620px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
  },
  colors: {
    ...defaultChakraTheme.colors,
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
  Button: {
    variants: {
      outline: (props: any) => ({
        bg: props.colorMode === "dark" ? "red.300" : "red.500",
        color: props.colorMode === "dark" ? "white" : "gray.500",
      }),
    },
  },
  MenuList: {
    
    bg: 'gray.300',
    // background: props.colorMode === "dark" ? "red.300" : "red.500",
    
  },
  MenuItem: {
    border: '1px solid red',
    color: 'white',
    bg: 'gray.300',
  }
}

const {
  sizes: {
    xs: xs0,
    sm: sm0,
    md: md0,
    lg: lg0,
    xl: xl0
  }
} = defaultTheme

export const xs = Number(xs0.split('px')[0])
export const sm = Number(sm0.split('px')[0])
export const md = Number(md0.split('px')[0])
export const lg = Number(lg0.split('px')[0])
export const xl = Number(xl0.split('px')[0])

export const theme = extendTheme(defaultTheme)
