import React from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { Login } from '~/pages/login'
import { Chat } from '~/pages/chat'
import { SocketProvider } from './context/socketContext'
import { MainProvider } from './context/mainContext'
import './App.css'
import { ChakraProvider } from '@chakra-ui/react'
import { UsersProvider } from './context/usersContext'
import { DefaultPage } from '~/common/components/DefaultPage'
// import { Admin } from '~/pages/admin'
import { Dashboard } from '~/common/containers/Dashboard'
import { theme } from '~/common/chakra/theme'
import { CookiesProvider } from 'react-cookie'
import Snowfall from 'react-snowfall'

const mothsMapping: { [key: string]: number } = {
  '10': 50, // Nov
  '11': 250, // Dec
  '0': 10, // Jan
}
const currentMonth = new Date().getMonth()
const snowFlakeCountMap = new Map()

for (const month in mothsMapping) snowFlakeCountMap.set(Number(month), mothsMapping[String(month)])
const currSnowflakeCountVal = snowFlakeCountMap.get(currentMonth)

function App() {
  return (
    <CookiesProvider>
      <ChakraProvider theme={theme}>
        <SocketProvider>
          <MainProvider>
            <UsersProvider>
              <div className="App" style={{ display: 'flex', alignItems: "center", justifyContent: "center" }}>
                {!!currSnowflakeCountVal && <Snowfall snowflakeCount={currSnowflakeCountVal} />}
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
