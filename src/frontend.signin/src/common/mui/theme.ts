import red from '@material-ui/core/colors/red'
import { createMuiTheme, Theme, withStyles } from '@material-ui/core/styles'
// import { Breakpoint } from '@material-ui/core/styles/createBreakpoints'
// See also: https://material-ui.com/guides/typescript/#customization-of-theme

// Like this: https://github.com/mui-org/material-ui/blob/master/examples/create-react-app-with-typescript/src/theme.tsx
// See also: https://material-ui.com/ru/styles/basics/
export const defaultTheme = {
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
}

export const { breakpoints: { values: { md } } } = defaultTheme

export const GlobalCss = withStyles((theme: Theme) => ({
  // @global is handled by jss-plugin-global.
  '@global': {
    // You should target [class*="MuiButton-root"] instead if you nest themes.
    // '.MuiButton-root': {}
    // See also: https://material-ui.com/ru/customization/components/
    code: {
      background: 'rgba(250, 239, 240, 0.78)',
      // boxShadow: '0px 0px 3px rgba(0, 0, 0, 0.2)',
      color: '#b44437',
      padding: '3px 4px',
      borderRadius: '5px',
      margin: '0 1px',
      fontSize: '0.9em',
      fontWeight: '500',
      letterSpacing: '0.3px',
    },
    a: {
      color: theme.palette.primary.main,
    },
    body: {
      overflowX: 'hidden',
    },
  },
}))(() => null)

export const theme = createMuiTheme(defaultTheme)