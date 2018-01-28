import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
localStorage.debug = process.env.REACT_APP_DEBUG

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
