import React from 'react';
import ReactDom from 'react-dom';
import OnBoard from './pages/OnBoard';
import PasswordCreate from './pages/PasswordCreate';

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const App = () => {
  return (
    <h1>
      <PasswordCreate/>
    </h1>
  )
}

ReactDom.render(<App />, mainElement);
