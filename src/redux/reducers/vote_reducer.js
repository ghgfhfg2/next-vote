import { SET_VOTE_LIST, CLEAR_VOTE_LIST } from "../actions/types";

const initState = {
  voteList: [],
  isLoading: true,
};

const vote = (state = initState, action) => {
  switch (action.type) {
    case SET_VOTE_LIST:
      return {
        ...state,
        voteList: [...state.voteList,action.payload],
        isLoading: false,
      };
    case CLEAR_VOTE_LIST:
      return {
        ...state,
        voteList: [],
        isLoading: false,
      };
    default:
      return state;
  }
};


export default vote;
