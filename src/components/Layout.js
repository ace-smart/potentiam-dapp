import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { Container } from 'semantic-ui-react';
import Header from './Header';

export default props => {
  return (
    <Router>
      <Container>
        <Header />
        {props.children}
      </Container>
    </Router>
  );
};
