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
  const googleHandler = async () => {
    provider.setCustomParameters({ prompt: "select_account" });
    const auth = getAuth();
    signInWithRedirect(auth, provider);
  };
  const auth = getAuth();
  auth &&
  getRedirectResult(auth)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access Google APIs.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      // The signed-in user info.
      const user = result.user;
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });

  const googleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("logged out");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <button type="button" onClick={googleHandler}>
        login
      </button>
      <button type="button" onClick={googleSignOut}>
        logout
      </button>
    </>
  );
}
