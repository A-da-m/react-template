import * as React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import Home from './pages/home'

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact component={Home} path='/' />
        {/* You can add more routes here */}
      </Switch>
    </BrowserRouter>
  )
}

ReactDOM.render(<App /> , document.getElementById('root'))
