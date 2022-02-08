import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { db } from "src/firebase";
import { ref, onValue, off } from "firebase/database";
import { Input, message } from "antd";
import ViewCon from "@component/ViewCon"
const { Search } = Input;


export default function View() {
  const router = useRouter();
  const uid = router.query.id

  const [roomData, setRoomData] = useState();
  useEffect(() => {
    const listRef = ref(db, `list/${uid}`)
    onValue(listRef, data=>{
      console.log(data.key)
      setRoomData({
        ...data.val(),
        uid
      })
    })
    return () => {
      off(listRef)
    };
  }, [pwEnter]);
  
  const [pwEnter, setPwEnter] = useState(true);
  const onSearch = (e) => {
    const pw = roomData.password
    if(e == pw){
      setPwEnter(false);
      message.success('입장에 성공했습니다 :)')
    }else{
      message.error('암호가 틀렸습니다.');
    }
  }
  
  return (
    <>
      {roomData && (
        <>
        {roomData.password && pwEnter ? (
          <>
            <Search
             placeholder="암호를 입력하세요" 
             onSearch={onSearch} 
             enterButton 
            />
          </>
          ):(
          <>  
             <ViewCon uid={uid} />
          </>
          )}
        </>
        )
      }
    </>
  );
}
