import React, { useState, useEffect } from "react";
import style from "styles/list.module.css";
import { db } from "src/firebase";
import { ref, onValue, off } from "firebase/database";
import Link from "next/link";
import {useRouter} from 'next/router'

function List() {
  const router = useRouter();
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
  
  const onRouter = () => {
    router.push('/regist')
  }

  
  return (
    <>
      <div className="content_box">
        <ul className={style.list}>
          {listData &&
            listData.map((el, idx) => (
              <li key={idx}>
                <dl>
                  <dt>{el.title}</dt>
                  <dd>
                    <Link href={`/view/${el.uid}`}>
                      입장
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
