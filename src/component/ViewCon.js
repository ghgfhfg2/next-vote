import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Form , Input, Button, message } from "antd";
import { db } from "src/firebase";
import { get, ref, set, onValue, off, runTransaction, update, remove } from "firebase/database";
import { getFormatDate } from "@component/CommonFunc";
import uuid from "react-uuid"
import style from "styles/view.module.css";
import form from "styles/form.module.css";
import { AiOutlineLike } from "react-icons/ai";
import { IoExitOutline } from "react-icons/io5";
import { IoIosArrowUp,IoIosArrowDown,IoIosList } from "react-icons/io";
import { BiTargetLock } from "react-icons/bi";
import {useRouter} from 'next/router';


function ViewCon({uid}) {
  const formRef = useRef();
  const listRef = useRef([]);
  const voterRef = useRef([]);
  const router = useRouter();
  
  const userInfo = useSelector((state) => state.user.currentUser);
  const [roomData, setRoomData] = useState();
  const [voteListData, setVoteListData] = useState();

  const [ranking, setRanking] = useState([]);
  useEffect(() => {
    let roomRef = ref(db, `list/${uid}`)
      onValue(roomRef, data=>{
        setRoomData(data.val())
      })
    
    let voteRef = ref(db, `vote_list/${uid}`)
      onValue(voteRef, data=>{
        let arr = [];
        data.forEach(el=>{
          arr.push({
            ...el.val(),
            uid:el.key
          })
        });     
        arr.sort((a,b)=>{
          return a.date.timestamp - b.date.timestamp;
        })
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
    const linkRegex = /[\<\>\{\}\s]/g;
    values.title && values.title.replace(linkRegex,"")
    values.link = values.link ? values.link.replace(linkRegex,"") : ''
    values.img = values.img ? values.img.replace(linkRegex,"") : ''
    runTransaction(ref(db,`list/${uid}/${userInfo.uid}`), pre => {
      if(pre && pre.submit_count && pre.submit_count >= roomData.max_vote){
        message.error(`최대 제안횟수를 초과했습니다.`);
        return;
      }else{
        onSubmit(values);
        closeSubmitPop();    
        let res = {
          ...pre,
          submit_count : pre && pre.submit_count ? pre.submit_count+1 : 1,
        }
        setTimeout(()=>{
          scrollToBottom();
        },10)
        return res;
      }
    })
  };

  const onSubmit = (values) => {
    const date = getFormatDate(new Date());
    const uid_ = uuid();
    const val = {
      ...values,
      date,
      user_name:userInfo.displayName,
      user_uid:[{uid:userInfo.uid,name:userInfo.displayName}],
      vote_count:1
    }
    set(ref(db,`vote_list/${uid}/${uid_}`),{
      ...val
    });
  }

  const onVote = (uid_,user_uid) => {
    let uidArr = [];
    user_uid.map(user => {
      uidArr.push(user.uid)
    })
    if(uidArr.includes(userInfo.uid)){
      message.error('이미 투표한 의견입니다.');
      return
    }
    if(roomData.type === 1 && roomData.vote_user && roomData.vote_user[userInfo.uid] && roomData.vote_user[userInfo.uid].vote_count >= 1){
      message.error('단일투표 입니다.');
      return;
    }
    update(ref(db,`vote_list/${uid}/${uid_}`),{
      user_uid: [...user_uid,{uid:userInfo.uid,name:userInfo.displayName}]
    });
    runTransaction(ref(db,`vote_list/${uid}/${uid_}/vote_count`),pre => {
      return pre ? ++pre : 1;
    });

    runTransaction(ref(db,`list/${uid}/vote_user/${userInfo.uid}`), pre => {
      let res = {
        ...pre,
        vote_count : pre && pre.vote_count ? pre.vote_count+1 : 1,
      }
      return res;
    });
  }

  const submitBox = useRef()
  const [submitPop, setsubmitPop] = useState(false);
  const onSubmitPop = () => {
    setsubmitPop(true);
    submitBox.current.style.transform = 'translate(-50%,0)'
  }
  const closeSubmitPop = () => {
    setsubmitPop(false);
    submitBox.current.style.transform = 'translate(-50%,100%)'
    formRef.current.setFieldsValue({
      title:'',
      link:''
    });    
  }

  const onOutView = () => {
    router.back()
  }

  const onVoteFinish = () => {
    runTransaction(ref(db,`list/${uid}/ing`), pre => {
      return false;
    })
    message.success('투표가 종료되었습니다.')
  }

  const onMoveList = (uid) => {
    listRef.current.map(el=>{
      if(el.dataset.uid === uid){
        el.scrollIntoView({ behavior: 'smooth', block: "center" });
        el.classList.add('ani_shake');
        setTimeout(() => {
          el.classList.remove('ani_shake')
        }, 500);
      }
    })
  }
  
  const [rankView, setrankView] = useState(false)
  const toggleRanking = () => {
    setrankView(!rankView);
  }

  const viewVoterList = (idx) => {
    let ref = voterRef.current[idx]
    console.log(ref)
    ref.style.display = ref.style.display === 'none' ? 'flex' : 'none'
  }

  return <>
    
    <div className={style.view_con_box}>
      <div className={style.ranking_box}>
        {roomData &&
        <div className={style.room_data}>
          <div className={style.room_left}>
            <ul className={style.room_info}>
              <li>
                {roomData.type === 1 ? `단일투표` : `중복투표`}
              </li>
              <li>{`${roomData.max_vote}회 제안가능`}</li>
              <li>{roomData.voter === 1 ? `공개투표` : `비밀투표`}</li>
              {roomData.add.includes('link') && <li>링크</li>}
              {roomData.add.includes('img') && <li>이미지</li>}
            </ul>
            <h2>{roomData.title}</h2>
          </div>
          <button type="button" className={style.room_out} onClick={onOutView}>
            <IoExitOutline />
          </button>
        </div>
        }
        {voteListData && voteListData.length > 0 && rankView &&
        <ul className={style.ranking}>
          {ranking.map((el,idx)=>(
            <li key={idx} onClick={()=>onMoveList(el.uid)}>
              <span className={style.rank}>{idx+1}</span>
              <div className={style.rank_con}>
                <div className={style.desc}>
                  <span className={style.vote_tit}>{el.title}</span>
                </div>                
              </div>
              <div  className={style.ic_target}>
                <BiTargetLock style={{marginRight:"4px",fontSize:"13px"}} />이동
              </div>
            </li>
          ))}
        </ul>
        }
        <button type="button" className={style.btn_fold} onClick={toggleRanking}>
        {rankView ? (
          <><IoIosArrowUp />랭킹숨기기</>
        ):(
          <><IoIosArrowDown />랭킹보기</>
        )}
        </button>
      </div>
      <ul className={style.vote_list}>
        {voteListData && voteListData.map((el,idx)=>(
          <li
           key={idx}
           ref={list=>listRef.current[idx] = list}
           data-uid={el.uid}
          >
            <div className={style.profile}>
              <span>{el.user_name}</span>
              <span className={style.date}>{`${el.date.hour}:${el.date.min}`}</span>
            </div>
            <div className={style.con}>
              <div className={style.desc}>
                <span className={style.vote_tit}>{el.title}</span>
                {el.img &&
                <span className={style.vote_link}>
                  <img src={el.img} className={style.vote_img} alt={el.title} />
                </span>
                }
                {el.link &&
                <span className={style.vote_link}>
                  <a href={el.link} target="_blank">{el.link}</a>
                </span>
                }                
              </div>
              <div className={style.right_con}>                
                {roomData && roomData.ing &&
                <div className={style.btn_box}>
                  <span className={style.count}>
                    {el.vote_count > 0 ? <>{el.vote_count}</> : `0`}
                  </span>
                  <Button className={style.btn_vote} onClick={()=>{onVote(el.uid,el.user_uid)}}><AiOutlineLike className={style.ic_vote} /></Button>
                </div>
                }
                {roomData && roomData.voter === 1 && 
                  <>
                    <button type='button' className={style.btn_vote_list_view} onClick={()=>{viewVoterList(idx)}}>
                      <IoIosList />
                      목록
                    </button>
                    <ul style={{display:"none"}} ref={voter => voterRef.current[idx] = voter}>
                      {el.user_uid.map((user,idx2)=>(
                        <li>{idx2+1} {user.name}</li>
                      ))}
                    </ul>    
                  </> 
                }         
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className={style.empty}></div>
      {roomData && roomData.ing ? (
        <div className={style.btn_open_box}>
        <button type="button" className={style.btn_open} onClick={onSubmitPop}>의견제안</button>
        {roomData && roomData.host === userInfo.uid &&
          <button type="button" className={style.btn_finish} onClick={onVoteFinish}>투표종료</button>
        }
        </div>
      ) : (
        <div className={style.btn_open_box}>
          <div className={style.finish_txt}>투표가 종료되었습니다</div>
        </div>
      )}
      
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
            <Input placeholder="제목" maxLength={30} />
          </Form.Item>
          {roomData && roomData.add && roomData.add.includes('link') &&
          <Form.Item
            className={form.item}
            name="link"
          >
            <Input placeholder="링크주소" maxLength={50} />
          </Form.Item>
          }
          {roomData && roomData.add && roomData.add.includes('img') &&
          <Form.Item
            className={form.item}
            name="img"
          >
            <Input placeholder="이미지주소" maxLength={100} />
          </Form.Item>
          }
          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
            제안하기
          </Button>
        </Form>
      </div>
    </div>
  </>;
}

export default ViewCon;
