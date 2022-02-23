import { CLEAR_USER, SET_USER, NICK_CHANGE } from "./types";

export const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user,
  };
};

export const clearUser = () => {
  return {
    type: CLEAR_USER,
  };
};


export const nickChange = (nick) => {
  return {
    type: NICK_CHANGE,
    payload: nick,
  };
};

