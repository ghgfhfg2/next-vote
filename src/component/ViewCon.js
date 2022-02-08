import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { Form , Input, Button, message } from "antd";
import { db } from "src/firebase";
import { ref, set, onValue, off, runTransaction  } from "firebase/database";
import { getFormatDate } from "@component/CommonFunc";
import uuid from "react-uuid"

function ViewCon({uid}) {
  const userInfo = useSelector((state) => state.user.currentUser);

  const [voteList, setVoteList] = useState([]);
  useEffect(() => {
    const voteRef = ref(db, `vote_list/${uid}`)
    onValue(voteRef, data=>{
      let arr = [];
      data.forEach(el=>{
        arr.push({
          ...el.val(),
          uid:el.key
        })
      })
      setVoteList(arr)
    })
    
    return () => {
      off(voteRef)
    };
  }, []);
  

  const onFinish = (values) => {
    const date = getFormatDate(new Date());
    const uid_ = uuid()
    set(ref(db,`vote_list/${uid}/${uid_}`),{
      ...values,
      date,
      user_name:userInfo.displayName,
      user_uid:userInfo.uid
    })
  };

  const onVote = (uid_) => {
    runTransaction(ref(db,`vote_list/${uid}/${uid_}/vote_count`),pre => {
      return pre ? ++pre : 1;
    })
  }

  return <>
    <div className="view_con_box">
      <ul className="ranking">
        <li></li>
      </ul>
      <ul className="vote_list">
        {voteList && voteList.map((el,idx)=>(
          <li key={idx}>
            {el.title}
            <Button onClick={()=>{onVote(el.uid)}}>투표</Button>
          </li>
        ))}
      </ul>
      <Form
        name="basic"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="title"
          rules={[{ required: true, message: "제목은 필수입니다." }]}
        >
          <Input placeholder="제목" />
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button type="primary" htmlType="submit" style={{ width: "50%" }}>
            Submit
          </Button>
        </div>
      </Form>
    </div>
  </>;
}

export default ViewCon;
