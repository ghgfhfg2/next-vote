import React from 'react';
import style from "styles/list.module.css";
import Link from "next/link";
import {useRouter} from 'next/router';
import * as ioIcon from 'react-icons/io5'; 
import * as aiIcon from 'react-icons/ai';

function ListUl({listData, onDel}) {
  const router = useRouter();
  const path = router.pathname;

  
  return (
    <ul className={style.list}>
      {listData.map((el, idx) => (
          <>
          <div className={style.list_box}>
            <li key={idx} className={el.ing ? `ing` : `end`}>
              <Link href={`/view/${el.uid}`}>
              <dl>
                <dt>
                  <span className={style.tit}>{el.title}
                  {el.password && <aiIcon.AiOutlineLock style={{position:"relative",top:"2px",marginLeft:"5px"}} />}
                  </span>
                </dt>
                <dd>
                  <button type="button"><ioIcon.IoEnterOutline /></button>
                </dd>
              </dl>
              </Link>
            </li>
            {path.includes('mypage') && 
              <button type="button" onClick={()=>onDel(el.uid)} className={style.btn_del}><aiIcon.AiOutlineDelete /></button>
            }
          </div>
          </>
        ))}
    </ul>
  )
}

export default ListUl