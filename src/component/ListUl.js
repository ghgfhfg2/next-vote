import React from 'react';
import style from "styles/list.module.css";
import Link from "next/link";
import { Popconfirm, message } from 'antd';
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
            <li key={idx} >
              <Link href={`/view/${el.uid}`}>
              <dl>
                <dt>
                  {el.ing ? (
                    <span className={style.state_ing}>진행중</span>
                    ):(
                    <span className={style.state_end}>종료</span>
                  )}
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
              <Popconfirm
                title="해당 방을 삭제하시겠습니까?"
                onConfirm={()=>onDel(el.uid)}
                okText="네"
                cancelText="아니요"
              >
                <button type="button" className={style.btn_del}><aiIcon.AiOutlineDelete /></button>
              </Popconfirm>
            }
          </div>
          </>
        ))}
    </ul>
  )
}

export default ListUl