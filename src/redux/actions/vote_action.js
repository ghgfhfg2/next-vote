import { SET_VOTE_LIST, CLEAR_VOTE_LIST } from "./types";

export const setVoteList = (list) => {
  return {
    type: SET_VOTE_LIST,
    payload: list,
  };
};

export const clearVoteList = () => {
  return {
    type: CLEAR_VOTE_LIST
  };
};
