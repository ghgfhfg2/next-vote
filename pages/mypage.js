import React, {useState,useEffect} from 'react';
import { useDispatch,useSelector } from "react-redux";
import { auth } from "src/firebase";
import { signOut } from "firebase/auth";
import { clearUser } from "@redux/actions/user_action";
import {useRouter} from 'next/router';
import { db } from "src/firebase";
import { ref, onValue, remove, get } from "firebase/database";
import ListUl from "../src/component/ListUl";

function Mypage() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const router = useRouter();

  const [listData, setListData] = useState();
  const listRef = ref(db, `list`);
  useEffect(() => {
    onValue(listRef, data=>{
      let listArr = [];
      data.forEach(el=>{
        if(el.val().host === userInfo.uid) listArr.push({...el.val(),uid:el.key})
      })
      setListData(listArr)
    });
  }, [])
  
  const onDel = (uid) => {
    get(ref(db,`vote_list/${uid}`))
    .then(data=>{
      if(data.val()){
        remove(ref(db,`vote_list/${uid}`))
      }
    })
    remove(ref(db,`list/${uid}`))
  }

  //로그아웃
  const googleSignOut = () => {
    signOut(auth)
      .then(() => {
        router.push('/');
        dispatch(clearUser());
      })
      .catch((error) => {
        console.log(error);
      });
  };

  
  return (
    <div className='mypage_box'>
      <div className='profile_box'>
        <div className='profile'>
          <div>
            <span className='name'>{userInfo.displayName}</span>님 환영합니다.
          </div>
          <button type='button' className='btn_logout' onClick={googleSignOut}>로그아웃</button>
        </div>
      </div>
      <dl className='my_list'>
        <dt className='tit'>내가 만든 방</dt>
        <dd>
          {listData && <ListUl router={router} listData={listData} onDel={onDel} />}
        </dd>
      </dl>

    </div>
  )
}

export default Mypage