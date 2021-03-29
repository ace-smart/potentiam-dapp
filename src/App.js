import React, { Component, useEffect } from 'react';
import {
  Switch,
  Route,
  Link
} from "react-router-dom";
import web3 from './contracts/web3';
import { Button } from 'semantic-ui-react';
import Layout from './components/Layout';
import Vault from './components/Vault';
import './App.css';

function App() {
  useEffect(() => {
    window.ethereum.enable()
  }, []);

  return (
    <div className="App">
      <Layout>
        <Switch>
          <Route path="/">
            <Vault />
          </Route>
          <Route path="/trans"></Route>
          <Route path="/control"></Route>
        </Switch>
      </Layout>
    </div>
  );
}

export default App;
