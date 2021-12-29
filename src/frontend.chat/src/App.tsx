import React from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { Login } from '~/pages/login'
import { Chat } from '~/pages/chat'
import { SocketProvider } from './socketContext'
import { MainProvider } from './mainContext'
import './App.css'
import { ChakraProvider } from '@chakra-ui/react'
import { UsersProvider } from './usersContext'
import { DefaultPage } from '~/common/components/DefaultPage'
// import { Admin } from '~/pages/admin'
import { Dashboard } from '~/common/containers/Dashboard'
import { theme } from '~/common/chakra/theme'
import { CookiesProvider } from 'react-cookie'
import Snowfall from 'react-snowfall'

const month = new Date().getMonth()
const isSnowRequired = [0, 10, 11].includes(month)

function App() {
  return (
    <CookiesProvider>
      <ChakraProvider theme={theme}>
        <SocketProvider>
          <MainProvider>
            <UsersProvider>
              <div className="App" style={{ display: 'flex', alignItems: "center", justifyContent: "center" }}>
                {isSnowRequired && <Snowfall />}
                <Router>
                  <Switch>
                    <Route exact path="/" component={Login} />
                    <Route path="/chat" component={Chat} />
                    <Route path="/admin" component={Dashboard} />
                    <Route path="*" component={DefaultPage} />
                  </Switch>
                </Router>
              </div>
            </UsersProvider>
          </MainProvider>
        </SocketProvider>
      </ChakraProvider>
    </CookiesProvider>
  )
}

export default App
