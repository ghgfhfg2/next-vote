import React, { useState, useEffect } from "react";
import { db } from "src/firebase";
import { ref, onValue, off } from "firebase/database";
import Link from "next/link";
import {MdOutlinePlaylistAdd} from "react-icons/md"
import ListUl from "./ListUl";

function List() {
  const [listData, setListData] = useState();
  useEffect(() => {
    const listRef = ref(db, 'list');
    onValue(listRef, data=>{
      let listArr = [];
      data.forEach(el=>{
        listArr.push({
          ...el.val(),
          uid:el.key
        })
      })
      listArr.sort((a,b)=>{
        return b.date.timestamp - a.date.timestamp;
      })
      setListData(listArr)
    });
    return () => {
      off(listRef)
    };
  }, []);
  
  
  return (
    <>
      <div className="content_box list_content_box">
        {listData && <ListUl listData={listData} />}
      </div>
      {/* <Link href="/regist">
        <button type="button" className="btn_write">
          <MdOutlinePlaylistAdd />
        </button>
      </Link> */}
    </>
  );
}

export default List;
