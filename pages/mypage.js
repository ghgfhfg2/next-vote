import React, {useState,useEffect} from 'react';
import { useDispatch,useSelector } from "react-redux";
import { auth } from "src/firebase";
import { signOut } from "firebase/auth";
import { clearUser } from "@redux/actions/user_action";
import {useRouter} from 'next/router';
import { db } from "src/firebase";
import { ref, onValue, remove, get, off } from "firebase/database";
import ListUl from "../src/component/ListUl";

function Mypage() {
  const userInfo = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const router = useRouter();

  const [listData, setListData] = useState();
  useEffect(() => {
    const listRef = ref(db, `list`);
    onValue(listRef, data=>{
      let listArr = [];
      data.forEach(el=>{
        el.val().vote_user && console.log(el.val().vote_user.forEach)
        /*
        let vote_check = false;
        el.val().vote_user && el.val().vote_user.forEach(user => {
          console.log(user)
          if(user === userInfo.uid) vote_check = true;
        })
        if(el.val().host === userInfo.uid || vote_check) listArr.push({...el.val(),uid:el.key})
        */
      })
      setListData(listArr)
    });
    return () => {
      off(listRef)
    };
  }, [])
  
  const onDel = async (uid) => {
    let roomId = await get(ref(db,`user/${userInfo.uid}/room`))
    .then(data => data.val() && data.val().indexOf(`${uid}`))
    roomId && remove(ref(db,`user/${userInfo.uid}/room/${roomId}`))
    
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
        <dt className='tit'>참여중인 방</dt>
        <dd>
          {listData && <ListUl router={router} listData={listData} onDel={onDel} />}
        </dd>
      </dl>

    </div>
  )
}

export default Mypage