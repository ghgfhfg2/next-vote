import React from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth, provider } from "src/firebase";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "@redux/actions/user_action";

export default function Login() {
  let dispatch = useDispatch();
  

  return (
    <>
      <button type="button">
        login
      </button>
      <button type="button">
        logout
      </button>
    </>
  );
}
