import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import { Login } from './components/Login'
import { Chat } from './components/Chat'
import { SocketProvider } from './socketContext'
import { MainProvider } from './mainContext'
import './App.css'
import { ChakraProvider, Flex } from "@chakra-ui/react"
import { UsersProvider } from './usersContext'
import { DefaultPage } from './components/DefaultPage'

function App() {
  return (
    <ChakraProvider>
      <SocketProvider>
        <MainProvider>
          <UsersProvider>
            <Flex className="App" align='center' justifyContent='center'>
              <Router>
                <Switch>
                  <Route exact path='/' component={Login} />
                  <Route path='/chat' component={Chat} />
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
