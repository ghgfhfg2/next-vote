import React, { useState, useEffect } from "react";
import { db } from "src/firebase";
import { ref, onValue, off } from "firebase/database";
import Link from "next/link";
import {MdOutlinePlaylistAdd} from "react-icons/md"
import ListUl from "./ListUl";
import { Input,Empty } from "antd";
const { Search } = Input;

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


  const onSearch = (e) => {
    const listRef = ref(db, 'list');
    get(listRef)
    .then(data=>{
      let listArr = [];
      data.forEach(el=>{
        if(el.val().title.includes(e) || (el.key === e)){
          listArr.push({
            ...el.val(),
            uid:el.key
          })
        }            
      })
      setListData(listArr)
    });
}
  
  
  return (
    <>
      <div className="content_box list_content_box">
        <Search 
          placeholder="방 제목 or 코드로 검색 가능합니다."  
          onSearch={onSearch} 
          enterButton 
          size="large" 
          className="search_input" 
        />
      </div>
      {listData && listData.length > 0 ? ( 
      <div className="content_box list_content_box">
        <ListUl listData={listData} />
      </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )
      }
      {/* <Link href="/regist">
        <button type="button" className="btn_write">
          <MdOutlinePlaylistAdd />
        </button>
      </Link> */}
    </>
  );
}

export default List;
