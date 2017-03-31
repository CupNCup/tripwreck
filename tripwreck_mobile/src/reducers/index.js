import { combineReducers } from 'redux';
import SearchBarReducer from './SearchBarReducer';
import AuthReducer from './AuthReducer';
import ListReducer from './ListReducer';

export default combineReducers({
  auth: AuthReducer,
  searchInput: SearchBarReducer,
  activeList: ListReducer
});
