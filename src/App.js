import React, { Component, useEffect, useState } from 'react';
import {
  Switch,
  Route,
  Link
} from "react-router-dom";
import web3 from './contracts/web3';
import { Button } from 'semantic-ui-react';
import Layout from './components/Layout';
import Vault from './components/Vault';
import Transaction from './components/Transaction';
import Controller from './components/Controller';
import controller from './contracts/controller';
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [isAdmin, setAdmin] = useState(false);

  useEffect(() => {
    if (!account) return;

    controller.methods.admin().call().then(address => {
      if (address === account) setAdmin(true);
    })

    controller.methods.governance().call().then(address => {
        if (address === account) setAdmin(true);
    })
  }, [account])

  useEffect(() => {
    window.ethereum.enable()

    web3.eth.getAccounts().then(addr => {
        setAccount(addr[0]);
    });
  }, []);

  return (
    <div className="App">
      <Layout>
        <Switch>
          <Route path="/vault">
            <Vault />
          </Route>
          <Route path="/trans">
            <Transaction />
          </Route>
          {isAdmin ? (
            <>
              <Route path="/control">
                <Controller />
              </Route>
            </>
          ) : (<></>)}
          
        </Switch>
      </Layout>
    </div>
  );
}

export default App;
