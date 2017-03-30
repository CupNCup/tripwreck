import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import promise from 'redux-promise';
import { createLogger } from 'redux-logger';
import firebase from 'firebase';
import ReduxThunk from 'redux-thunk';
import reducers from './reducers';
import Router from './Router';

class App extends Component {

  componentDidMount() {
    const config = {
      apiKey: "AIzaSyCg1PA-dy03iR4kAizhQxNjKe71NLYMl2E",
      authDomain: "tripwreck-df257.firebaseapp.com",
      databaseURL: "https://tripwreck-df257.firebaseio.com",
      storageBucket: "tripwreck-df257.appspot.com",
      messagingSenderId: "107796792843"
    };
    firebase.initializeApp(config);
  }

  render() {
    const logger = createLogger();
    const store = createStore(reducers, applyMiddleware(promise, logger, ReduxThunk));

    return (
      <Provider store={store}>
        <Router />
      </Provider>
    );
  }
}

export default App;
