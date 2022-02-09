import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { setVoteList } from "@redux/actions/vote_action";
import { Form , Input, Button, message } from "antd";
import { db } from "src/firebase";
import { ref, set, onValue, off, runTransaction, query, limitToLast } from "firebase/database";
import { getFormatDate } from "@component/CommonFunc";
import uuid from "react-uuid"
import style from "styles/view.module.css";
import form from "styles/form.module.css";
import { AiOutlineLike } from "react-icons/ai";


function ViewCon({uid}) {
  let dispatch = useDispatch();
  const formRef = useRef()
  
  const userInfo = useSelector((state) => state.user.currentUser);
  const [voteListData, setVoteListData] = useState();

  const [ranking, setRanking] = useState([]);
  useEffect(() => {
    let voteRef = ref(db, `vote_list/${uid}`)
      onValue(voteRef, data=>{
        let arr = [];
        data.forEach(el=>{
          arr.push({
            ...el.val(),
            uid:el.key
          })
        });     
        setVoteListData(arr)
        let rankArr = arr.concat();
        rankArr = rankArr.sort((a,b)=>{
          return b.vote_count - a.vote_count;
        }).slice(0,3);
        setRanking(rankArr)
      })
    return () => {
      off(voteRef)
    };
  }, []);

  const scrollToBottom = () => {
    const h = document.body.scrollHeight
    window.scrollTo(0,h);
  }
  useEffect(() => {
    scrollToBottom();
  }, [voteListData])

  const onFinish = (values) => {
    const date = getFormatDate(new Date());
    const uid_ = uuid();
    const val = {
      ...values,
      date,
      user_name:userInfo.displayName,
      user_uid:userInfo.uid,
      vote_count:0
    }
    set(ref(db,`vote_list/${uid}/${uid_}`),{
      ...val
    })
    dispatch(setVoteList(val));    
    closeSubmitPop();
    formRef.current.setFieldsValue({
      title:undefined
    })
  };

  const onVote = (uid_) => {
    runTransaction(ref(db,`vote_list/${uid}/${uid_}/vote_count`),pre => {
      return pre ? ++pre : 1;
    })
  }

  const submitBox = useRef()
  const [submitPop, setsubmitPop] = useState(false);
  const onSubmitPop = () => {
    setsubmitPop(true);
    submitBox.current.style.transform = 'translateY(0)'
  }
  const closeSubmitPop = () => {
    setsubmitPop(false);
    submitBox.current.style.transform = 'translateY(100%)'
    setTimeout(()=>{
      scrollToBottom();
    },10)
  }

  return <>
    <div className={style.view_con_box}>
      <div className={style.ranking_box}>
        {voteListData && voteListData.length > 0 && 
        <ul className={style.ranking}>
          {ranking.map((el,idx)=>(
            <li key={idx}>
              <span className={style.rank}>{idx+1}</span>
              <div className={style.rank_con}>
                <div className={style.title_box}>
                  {el.title}
                </div>
                <div className={style.btn_box}>
                  <span className={style.count}>
                    {el.vote_count > 0 ? <>{el.vote_count}</> : `0`}
                  </span>
                  <Button className={style.btn_vote} onClick={()=>{onVote(el.uid)}}><AiOutlineLike className={style.ic_vote} /></Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        }
      </div>
      <ul className={style.vote_list}>
        {voteListData && voteListData.map((el,idx)=>(
          <li key={idx}>
            <div className={style.profile}>
              <span>{el.user_name}</span>
              <span className={style.date}>{`${el.date.hour}:${el.date.min}`}</span>
            </div>
            <div className={style.con}>
              {el.title}
              <div className={style.btn_box}>
                <span className={style.count}>
                  {el.vote_count > 0 ? <>{el.vote_count}</> : `0`}
                </span>
                <Button className={style.btn_vote} onClick={()=>{onVote(el.uid)}}><AiOutlineLike className={style.ic_vote} /></Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className={style.empty}></div>
      <button type="button" className={style.btn_open} onClick={onSubmitPop}>의견내기</button>
      {submitPop &&
        <div className={style.bg_box} onClick={closeSubmitPop}></div>
      }
      <div ref={submitBox} className={style.submit_box}>        
        <Form
          name="basic"
          onFinish={onFinish}
          autoComplete="off"
          className={form.form}
          ref={formRef}
        >
          <Form.Item
            className={form.item}
            name="title"
            rules={[{ required: true, message: "제목은 필수입니다." }]}
          >
            <Input placeholder="제목" />
          </Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Submit
            </Button>
        </Form>
      </div>
    </div>
  </>;
}

export default ViewCon;
