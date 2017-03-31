import {
  ADD_TO_ACTIVE_LIST,
  CLEAR_ACTIVE_LIST
} from '../actions/types';

const INITIAL_STATE = {
  activeList: [],
}

export default (state = INITIAL_STATE, action) => {
  console.log(action);

  switch (action.type) {
    case ADD_TO_ACTIVE_LIST:
      return [ ...state, action.payload ];
    case CLEAR_ACTIVE_LIST:
      return action.payload;
    default:
      return state;
  }
};
