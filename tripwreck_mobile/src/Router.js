import React from 'react';
import { Scene, Router, Actions } from 'react-native-router-flux';
import SearchPage from './components/Search_Components/SearchPage';
import LoginForm from './components/Login_Components/LoginForm';
import DetailPage from './components/Details_Components/DetailPage';

const RouterComponent = () => {
  return (
    <Router sceneStyle={{ paddingTop: 65 }}>
      <Scene key="auth">
        <Scene key="login" component={LoginForm} title="Login" initial/>
      </Scene>
      <Scene key="main">
        <Scene key="SearchPage" component={SearchPage} title="Search" />
        <Scene key="DetailPage" component={DetailPage} title="Detail" />
      </Scene>
    </Router>
  )
};

export default RouterComponent;
