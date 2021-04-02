import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import {
  Link
} from "react-router-dom";
import { Menu } from 'semantic-ui-react';

import web3 from '../contracts/web3';
import ptm from '../contracts/ptm';
import controller from '../contracts/controller';

export default () => {
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
    web3.eth.getAccounts().then(addr => {
        setAccount(addr[0]);
    });
}, []);

  return (
    <Menu style={{ marginTop: '10px' }}>
      <Menu.Menu position="left">
        <Link to="/vault">
          <a className="item">Vault</a>
        </Link>

        <Link to="/trans">
          <a className="item">Transaction</a>
        </Link>

        {isAdmin ? (
          <>
            <Link to="/control">
              <a className="item">Controller</a>
            </Link>
          </>
        ) : (<></>)}
        
      </Menu.Menu>
      <Menu.Menu position="right">
          <p className="item">{account}</p>
      </Menu.Menu>
    </Menu>
  );
};
