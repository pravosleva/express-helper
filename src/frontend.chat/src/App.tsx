import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { Login } from '~/pages/login'
import { Chat } from '~/pages/chat'
import { SocketProvider } from './socketContext'
import { MainProvider } from './mainContext'
import './App.css'
import { ChakraProvider, Flex } from "@chakra-ui/react"
import { UsersProvider } from './usersContext'
import { DefaultPage } from '~/common/components/DefaultPage'
import { Admin } from '~/pages/admin'
import { theme } from '~/common/chakra/theme'

function App() {
  return (
    <ChakraProvider theme={theme}>
      <SocketProvider>
        <MainProvider>
          <UsersProvider>
            <Flex className="App" align='center' justifyContent='center'>
              <Router>
                <Switch>
                  <Route exact path='/' component={Login} />
                  <Route path='/chat' component={Chat} />
                  <Route path='/admin' component={Admin} />
                  <Route path='*' component={DefaultPage} />
                </Switch>
              </Router>
            </Flex>
          </UsersProvider>
        </MainProvider>
      </SocketProvider>
    </ChakraProvider>
  );
}

export default App;
