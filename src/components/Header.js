import React from 'react';
import {
  Link
} from "react-router-dom";
import { Menu } from 'semantic-ui-react';

export default () => {
  return (
    <Menu style={{ marginTop: '10px' }}>
      <Menu.Menu position="left">
        <Link to="/">
          <a className="item">Vault</a>
        </Link>

        <Link to="/trans">
          <a className="item">Transaction</a>
        </Link>

        <Link to="/control">
          <a className="item">Controller</a>
        </Link>
      </Menu.Menu>
    </Menu>
  );
};
