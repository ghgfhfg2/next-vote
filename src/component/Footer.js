import React from 'react';
import Link from "next/link";
import {useRouter} from 'next/router';
import * as aiIcon from "react-icons/ai"
import { RiUser3Line,RiUser3Fill,RiSearchFill,RiSearchLine } from "react-icons/ri"
import { IoIosListBox,IoIosList } from "react-icons/io"

function Footer() {
  const router = useRouter()
  const path = router.pathname;
  return (
    <>
      <footer className='footer'>
        <Link href="/">
          <span>
          {path === '/' ? <IoIosListBox /> : <IoIosList />}
          list
          </span>
        </Link>
        <Link href="/search">
          <span>
          {path === '/search' ? <RiSearchFill /> : <RiSearchLine />}
          search
          </span>
        </Link>
        <Link href="/mypage">
          <span>
          {path === '/mypage' ? <RiUser3Fill /> : <RiUser3Line />}
          my
          </span>
        </Link>
      </footer>
    </>
 )
}

export default Footer