import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
// import reportWebVitals from './reportWebVitals'
import { disableReactDevTools } from '@fvilers/disable-react-devtools'
import './index.css'
import '~/fix.react-contextmenu.scss'
import '~/fix.simple-react-lightbox.scss'
import '~/fix.emoji-picker-react.scss'
import '~/fix.react-kanban.scss'

if (process.env.NODE_ENV === 'production')
  disableReactDevTools()

// ReactDOM.render(<App />, document.getElementById('root'))

// @ts-ignore
ReactDOM.createRoot(document.getElementById('root')).render(<App />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals()
