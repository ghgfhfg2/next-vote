import { SET_USER, CLEAR_USER, NICK_CHANGE } from "../actions/types";

const initState = {
  currentUser: null,
  isLoading: true,
};

const user = (state = initState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        currentUser: action.payload,
        isLoading: false,
      };
    case CLEAR_USER:
      return {
        ...state,
        currentUser: null,
        isLoading: false,
      };
    case NICK_CHANGE:
      return {
        ...state,
        currentUser: {...state.currentUser,displayName:action.payload},
        isLoading: false,
      };
    default:
      return state;
  }
};



export default user;
