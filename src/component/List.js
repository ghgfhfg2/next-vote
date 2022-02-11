import React, { useState, useEffect } from "react";
import style from "styles/list.module.css";
import { db } from "src/firebase";
import { ref, onValue, off } from "firebase/database";
import Link from "next/link";
import * as ioIcon from 'react-icons/io5'; 
import * as bsIcon from 'react-icons/bs';

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
      setListData(listArr)
    });
    return () => {
      off(listRef)
    };
  }, []);
  
  
  return (
    <>
      <div className="content_box">
        <ul className={style.list}>
          {listData &&
            listData.map((el, idx) => (
              <li key={idx}>
                <dl>
                  <dt>
                    <span className={style.tit}>{el.title}</span>
                    <span className={style.limit}><bsIcon.BsPerson />1/3</span>
                  </dt>
                  <dd>
                    <Link href={`/view/${el.uid}`}>
                      <button type="button"><ioIcon.IoEnterOutline /></button>
                    </Link>
                  </dd>
                </dl>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
}

export default List;
