import React, {useReducer} from 'react';
import ReactDom from 'react-dom';
import PasswordCreate from './pages/PasswordCreate';

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const App = () => {

  // const [app, dispatch] = useReducer(appReducer, initState);

  return (
    <div>
        <PasswordCreate />
    </div>
  )
}

ReactDom.render(<App />, mainElement);
