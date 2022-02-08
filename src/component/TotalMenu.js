import React from "react";
import { Button } from "antd";
import * as antIcon from "react-icons/ai";
import style from "styles/nav.module.css";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { signInWithPopup, GoogleAuthProvider, signOut, getAuth, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, provider } from "src/firebase";
import { setUser, clearUser } from "@redux/actions/user_action";

function TotalMenu({ visible, onCloseMenu }) {
  const userInfo = useSelector((state) => state.user.currentUser);

  //로그인
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

  //로그아웃
  const googleSignOut = () => {
    signOut(auth)
      .then(() => {
        dispatch(clearUser());
        console.log("logged out");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //메뉴닫기
  const onLinkCheck = (e) => {
    if (e.target.tagName === "A") onCloseMenu();
  };
  return (
    <>
      <nav
        className={
          visible ? `${style[`nav-box`]} ${style.on}` : `${style[`nav-box`]}`
        }
      >
        {userInfo ? (
          <>
            <span>{userInfo.displayName}</span>
            <button type="button" onClick={googleSignOut}>
              logout
            </button>
          </>
        ) : (
          <>
            <Button onClick={googleHandler}>login</Button>
          </>
        )}
        <button
          type="button"
          className={style[`btn-close`]}
          onClick={onCloseMenu}
        >
          <antIcon.AiOutlineClose />
        </button>
        <ul className={style.nav} onClick={onLinkCheck}>
          {userInfo && userInfo.email === "sooya1207@gmail.com" && (
            <li>
              <Link href="/regist">
                <a>등록</a>
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <div
        onClick={onCloseMenu}
        className={visible ? `${style.bg} ${style.on}` : `${style.bg}`}
      ></div>
    </>
  );
}

export default TotalMenu;
