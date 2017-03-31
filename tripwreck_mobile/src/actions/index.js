import axios from 'axios';
import firebase from 'firebase';
import { Actions } from 'react-native-router-flux';
import { store } from '../reducers';
import {
  SEARCH_INPUT_CHANGE,
  SEARCH_RESTAURANT,
  SELECTED_RESTAURANT,
  EMAIL_CHANGED,
  PASSWORD_CHANGED,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAIL,
  LOGIN_USER_START,
  ADD_TO_ACTIVE_LIST,
  CLEAR_ACTIVE_LIST
} from './types';


export const searchInputChange = (text) => {
  return {
    type: SEARCH_INPUT_CHANGE,
    payload: text
  };
};

export const searchRestaurant = (restaurant) => {
  const request = axios.get(`http://localhost:4567/store/search/?${restaurant}`)

  return {
    type: SEARCH_RESTAURANT,
    payload: request
  };
};

export const setSelectedRestaurant = (restaurant) => {
  Actions.DetailPage();
  return {
    type: SELECTED_RESTAURANT,
    payload: restaurant
  };
};

export const addToActiveList = (restaurant) => {
  return {
    type: ADD_TO_ACTIVE_LIST,
    payload: restaurant
  };
};

export const clearActiveList = () => {
  return {
    type: CLEAR_ACTIVE_LIST,
    payload: []
  }
}

export const emailChanged = (text) => {
  return  {
    type: EMAIL_CHANGED,
    payload: text
  };
};

export const passwordChanged = (text) => {
  return {
    type: PASSWORD_CHANGED,
    payload: text
  };
};

export const loginUser = ({ email, password }) => {
  return (dispatch) => {
    dispatch({ type: LOGIN_USER_START})
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(user => loginUserSuccess(dispatch, user))
      .catch(() => {
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then(user => loginUserSuccess(dispatch, user))
          .catch(() => loginUserFail(dispatch));
      });
  };
};

const loginUserFail = (dispatch) => {
  dispatch({ type: LOGIN_USER_FAIL });
}

const loginUserSuccess = (dispatch, user) => {
  dispatch({
    type: LOGIN_USER_SUCCESS,
    payload: user
  });

  Actions.main();
};
