import React, { useState, useEffect } from "react";
import Top from "@component/Top";
import "styles/globals.css";
import "antd/dist/antd.css";
import wrapper from "@redux/store/configureStore";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@redux/actions/user_action";
import { auth } from "src/firebase";
import {useRouter} from 'next/router'
import Login from "./login";
import Loading from "../src/component/Loading";

function App({ Component, pageProps }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [authCheck, setAuthCheck] = useState(true);
  const [isLoading, setisLoading] = useState(true)
  auth.onAuthStateChanged((user) => {
    if (user) {
      dispatch(setUser(user));
    } else {
      dispatch(clearUser());
    }
    setisLoading(false)
  });
  const onRouter = () => {
    router.push('/regist')
  }
  return (
    <>
      <Top />
      <div id="content">  
        {isLoading && 
          <Loading />
        }
        {authCheck ? (
            <Component {...pageProps} />
          ) : (
            <Login />
          )
        }
      </div>
    </>
  );
}

export default wrapper.withRedux(App);
