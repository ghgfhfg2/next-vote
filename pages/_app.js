import React, { useState, useEffect } from "react";
import Link from "next/link";
import Top from "@component/Top";
import "styles/App.css";
import "antd/dist/antd.css";
import wrapper from "@redux/store/configureStore";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@redux/actions/user_action";
import { auth } from "src/firebase";
import {useRouter} from 'next/router'
import Login from "./login";
import Loading from "../src/component/Loading";
import Footer from "@component/Footer";


function App({ Component, pageProps }) {
  const dispatch = useDispatch();
  const router = useRouter();  
  const path = router.pathname;
  const [authCheck, setAuthCheck] = useState(true);
  const [isLoading, setisLoading] = useState(true)
  auth.onAuthStateChanged((user) => {
    if (user) {
      dispatch(setUser(user));
      setAuthCheck(true)
    } else {
      dispatch(clearUser());
      setAuthCheck(false)
    }
    setisLoading(false)
  });

  return (
    <>
      
      <div id="content">  
        {isLoading && 
          <Loading />
        }
        {authCheck ? (
            <>
            <Component {...pageProps} />
            {!path.includes('/view') && 
              <>
              <div className="empty_box"></div>
              <Footer />
              </>
            }
            </>
          ) : (
            <Login />
          )
        }
      </div>      
    </>
  );
}

export default wrapper.withRedux(App);
