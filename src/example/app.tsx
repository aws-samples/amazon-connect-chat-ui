import React from 'react';
import './styles/global.scss';
import { ChatWidget } from '../components';
import { props } from './env/development';

function App() {
  return (
    <div className="App">
      <div className="sidebar">
          <ChatWidget {...{props}}/>
      </div>
    </div>
  );
}

export default App;
