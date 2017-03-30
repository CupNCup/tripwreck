import {
  SEARCH_INPUT_CHANGE,
  SEARCH_RESTAURANT,
  SELECTED_RESTAURANT
} from '../actions/types';

const INITIAL_STATE = {
  searchInput: '',
  searchResults: [],
  selectedRestaurant: {}
}

export default (state = INITIAL_STATE, action) => {
  console.log(action);

  switch (action.type) {
    case SEARCH_INPUT_CHANGE:
      return { ...state, searchInput: action.payload };
    case SEARCH_RESTAURANT:
      return { ...state, searchResults: action.payload.data };
    case SELECTED_RESTAURANT:
      return { ...state, selectedRestaurant: action.payload };
    default:
      return state;
  }
};
