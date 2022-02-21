import React from 'react';
import Link from "next/link";
import {useRouter} from 'next/router';
import * as aiIcon from "react-icons/ai"
import { RiUser3Line,RiUser3Fill,RiSearchFill,RiSearchLine } from "react-icons/ri"
import { IoIosListBox,IoIosList } from "react-icons/io"
import {RiFileAddFill,RiFileAddLine} from "react-icons/ri"

function Footer() {
  const router = useRouter()
  const path = router.pathname;
  return (
    <>
      <footer className='footer'>
        <Link href="/">
          <span>
          {path === '/' ? <IoIosListBox /> : <IoIosList />}
          목록
          </span>
        </Link>
        <Link href="/regist">
          <span>
          {path === '/regist' ? <RiFileAddFill /> : <RiFileAddLine />}
          등록
          </span>
        </Link>
        <Link href="/search">
          <span>
          {path === '/search' ? <RiSearchFill /> : <RiSearchLine />}
          검색
          </span>
        </Link>
        <Link href="/mypage">
          <span>
          {path === '/mypage' ? <RiUser3Fill /> : <RiUser3Line />}
          마이페이지
          </span>
        </Link>
      </footer>
    </>
 )
}

export default Footer