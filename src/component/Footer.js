import React, {useState, useEffect, useRef} from 'react';
import Link from "next/link";
import {useRouter} from 'next/router';
import * as aiIcon from "react-icons/ai"
import { RiUser3Line,RiUser3Fill,RiSearchFill,RiSearchLine } from "react-icons/ri"
import { IoIosListBox,IoIosList } from "react-icons/io"
import {RiFileAddFill,RiFileAddLine} from "react-icons/ri"
import {AiOutlineDownload} from "react-icons/ai"

function Footer() {
  const appInstallBtn = useRef();
  const [appInstall, setAppInstall] = useState(false)
  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      appInstallBtn.current = e
    });
    if(appInstallBtn.current){
      setAppInstall(true)
    }else{
      setAppInstall(false)
    }
    
  }, []);  

  const onAppInstall = () => {
    if(!appInstallBtn.current) return false;
    appInstallBtn.current.prompt();
    appInstallBtn.current.userChoice.then((choiceResult) => {
      //설치 했을 때
      if (choiceResult.outcome === "accepted") {
        setAppInstall(false)
      } 
    });
  }
  const router = useRouter()
  const path = router.pathname;
  return (
    <>
      <footer className='footer'>
        {appInstall &&
        <button type="button" className='ic_btn_app_down' onClick={onAppInstall}>
          <AiOutlineDownload />
          <span>앱설치</span>
        </button>
        }
        <Link href="/">
          <a>
          {path === '/' ? <IoIosListBox /> : <IoIosList />}
          <span>목록</span>
          </a>
        </Link>
        <Link href="/search">
          <a>
          {path === '/search' ? <RiSearchFill /> : <RiSearchLine />}
          <span>검색</span>
          </a>
        </Link>
        <Link href="/regist">
          <a>
          {path === '/regist' ? <RiFileAddFill /> : <RiFileAddLine />}
          <span>등록</span>
          </a>
        </Link>
        <Link href="/mypage">
          <a>
          {path === '/mypage' ? <RiUser3Fill /> : <RiUser3Line />}
          <span>내 정보</span>
          </a>
        </Link>
      </footer>
    </>
 )
}

export default Footer