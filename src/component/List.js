import React, { useState, useEffect } from "react";
import style from "styles/list.module.css";
import { db } from "src/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

function List() {
  const [listData, setListData] = useState();
  useEffect(() => {
    let listArr = [];
    
  }, []);
  return (
    <>
      <ul className={style.list}>
        {listData &&
          listData.map((el, idx) => (
            <li key={idx}>
              <dl>
                <dt>{el.title}</dt>
                <dd>
                  <a href={el.url} target="_blank">
                    바로가기
                  </a>
                </dd>
              </dl>
            </li>
          ))}
      </ul>
    </>
  );
}

export default List;
