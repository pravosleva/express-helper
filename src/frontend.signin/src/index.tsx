import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from '~/App';
import reportWebVitals from './reportWebVitals';
import CssBaseline from '@material-ui/core/CssBaseline'
import { GlobalCss, theme } from '~/common/mui/theme'
import { ThemeProvider } from '@material-ui/core/styles'
import { HashRouter, Switch, Route } from 'react-router-dom'
import { NotifsContextProvider, MainContextProvider } from './common/context'
import 'react-notifications-component/dist/theme.css'
// preferred way to import (from `v4`). Uses `animate__` prefix.
import 'animate.css/animate.min.css'

// const { REACT_APP_EXTERNAL_ROUTING } = process.env

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <GlobalCss />
        <MainContextProvider>
          <NotifsContextProvider>
            <Switch>
              <Route key='/' path='/' exact={true} component={App} />
            </Switch>
          </NotifsContextProvider>
        </MainContextProvider>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
