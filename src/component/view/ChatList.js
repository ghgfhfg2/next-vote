import React, { useState, useEffect } from 'react'
import style from "styles/view.module.css";


function ChatList({chatList}) {
  
  
  
  return (
    <>
      <div className={style.room_chat_list}>
        <ul className={style.vote_list}>
        {
          chatList && chatList.map((el,idx)=>(
            <li key={idx}>
              <div className={style.profile}>
                <span>{el.name}</span>               
                <span className={style.date}>
                  {`${el.date.hour}:${el.date.min}`}
                </span>
              </div>
              <div className={style.con}>
                <div dangerouslySetInnerHTML={{ __html: el.chat }} className={style.desc} >
                  
                </div>
              </div>
            </li>
          ))
        }
        </ul>
      </div>
    </>
  )
}

export default ChatList