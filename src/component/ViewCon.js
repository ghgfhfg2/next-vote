import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import { Button, message,Spin, Image } from "antd";
import { db } from "src/firebase";
import { ref as dRef, set, onValue, off, runTransaction, update } from "firebase/database";
import { getFormatDate } from "@component/CommonFunc";
import uuid from "react-uuid"
import style from "styles/view.module.css";
import { AiOutlineLike, AiTwotoneLike, AiOutlineTrophy } from "react-icons/ai";

import { FiExternalLink } from "react-icons/fi";
import { IoIosArrowUp,IoIosArrowDown,IoIosList } from "react-icons/io";
import { BiTargetLock } from "react-icons/bi";
import {useRouter} from 'next/router';
import imageCompression from 'browser-image-compression';  
import {
  getStorage,
  ref as sRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import SubmitForm from './view/SubmitForm';
import RoomInfo from './view/RoomInfo';

const storage = getStorage();


function ViewCon({uid}) {
  const [domWid, setDomWid] = useState()
  useEffect(() => {
    setDomWid(document.body.clientWidth)
    const script = document.createElement('script')
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }    
  }, [])

  const scrollBox = useRef();
  const formRef = useRef();
  const listRef = useRef([]);
  const voterRef = useRef([]);
  const router = useRouter();
  
  const userInfo = useSelector((state) => state.user.currentUser);
  const [roomData, setRoomData] = useState();
  const [finishVote, setFinishVote] = useState(false)
  const [voteListData, setVoteListData] = useState();
  const [listLength, setListLength] = useState()

  const [ranking, setRanking] = useState([]);
  useEffect(() => {
    let roomRef = dRef(db, `list/${uid}`)
      onValue(roomRef, data=>{
        if(!data.val().ing){
          setFinishVote(true)
        }
        setRoomData(data.val())
      })
      
      let voteRef = dRef(db, `vote_list/${uid}`)
      onValue(voteRef, data=>{
        let arr = [];
        data.forEach(el=>{
          arr.push({
            ...el.val(),
            uid:el.key
          })
        });     
        
        if(userInfo){
          arr.forEach(list=>{
            let check = list.user_uid.find(user=>{
              return user.uid === userInfo.uid
            })
            list.already_check = check ? true : false;
          })
        } 
        arr.sort((a,b)=>{
          return a.date.timestamp - b.date.timestamp;
        })
        setListLength(prev=>{
          return prev === arr.length ? prev : arr.length
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
  }, [userInfo]);

  

  const scrollToBottom = () => {
    scrollBox.current.scrollIntoView({block: "end"});
  }
  useEffect(() => {
    scrollToBottom();
  }, [listLength])


  //이미지 리사이즈
  const imageResize = async (file,size) => {
    if(file.type === 'image/svg+xml'){
      return file;
    }
    const options = {
      maxWidthOrHeight:size,
      fileType:file.type
    }
    try{
      const compressedFile = await imageCompression(file, options);
      const promise = imageCompression.getDataUrlFromFile(compressedFile);
      return promise;
    } catch (error) {
      console.log(error)
    }
    
  }
  //base64 to file
  const dataURLtoFile = (dataurl, fileName) => {
      let arr = dataurl.split(','),
          mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), 
          n = bstr.length, 
          u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], fileName, {type:mime});
  }


  const [clipImg, setClipImg] = useState([]);


  const [submitLoading, setSubmitLoading] = useState(false)

  const onFinish = (values) => {
    const linkRegex = /[\<\>\{\}\s]/g;
    values.title && values.title.replace(linkRegex,"")
    values.link = values.link ? values.link.replace(linkRegex,"") : ''
    values.img = values.img ? values.img.replace(linkRegex,"") : '';
    if(values.title.length > 30){
      message.error('제목이 너무 깁니다.');
      return;
    }
    if(values.link.length > 200){
      message.error('링크주소 경로가 너무 깁니다.');
      return;
    }
    if(values.img.length > 200){
      message.error('이미지주소 경로가 너무 깁니다.');
      return;
    }
    runTransaction(dRef(db,`list/${uid}/${userInfo.uid}`), pre => {
      if(pre && pre.submit_count && pre.submit_count >= roomData.max_vote){
        message.error(`최대 제안횟수를 초과했습니다.`);
        return;
      }else{
        setSubmitLoading(true);
        let files = clipImg;
        if(files.length > 0){
          values.image = [];
          files.forEach(el=>{
            let file = el.file;
            const metadata = {contentType:file.type};
            const storageRef = sRef(storage,`images/${uid}/${el.fileName}`);
            imageResize(file,400).then(data=>{     
              file = dataURLtoFile(data,file.name)
            })
            .then(()=>{
              const uploadTask = uploadBytesResumable(storageRef, file, metadata);
              uploadTask.on('state_changed',
                (snapshot) => {
                  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  switch (snapshot.state) {
                    case 'paused':
                      break;
                    case 'running':
                      break;
                  }
                },
                (error) => {
                  switch (error.code) {
                    case 'storage/unauthorized':
                      break;
                    case 'storage/canceled':
                      break;
                    // ...
                    case 'storage/unknown':
                      break;
                  }
                },
                () => {
                  getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    values.image = [...values.image,downloadURL]
                    if(values.image.length === files.length){
                      onSubmit(values);
                    }
                  })
                }
              )
            })
          })
        }else{
          onSubmit(values);
        }
          
        let res = {
          ...pre,
          submit_count : pre && pre.submit_count ? pre.submit_count+1 : 1,
        }        
        return res;
      }
    })
  };

  const onSubmit = (values) => {
    values.upload = '';
    const date = getFormatDate(new Date());
    const uid_ = uuid();   
    const val = {
      ...values,
      date,
      user_name:userInfo.displayName,
      vote_user:userInfo.uid,
      user_uid:[{uid:userInfo.uid,name:userInfo.displayName}],
      vote_count:1
    }
    set(dRef(db,`vote_list/${uid}/${uid_}`),{
      ...val
    });
    closeSubmitPop();  
    setSubmitLoading(false);
    
  }

  const onVote = (uid_,user_uid,vote_userId,already) => {
    let uidArr = [];    
    user_uid.map(user => {
      uidArr.push(user.uid)
    })
    if(roomData.cancel === 2){
      if(uidArr.includes(userInfo.uid)){
        message.error('이미 투표한 의견입니다.');
        return
      }
      if(roomData.type === 1 && roomData.vote_user && roomData.vote_user[userInfo.uid] && roomData.vote_user[userInfo.uid].vote_count >= 1){
        message.error('단일투표 입니다.');
        return;
      }
      update(dRef(db,`vote_list/${uid}/${uid_}`),{
        user_uid: [...user_uid,{uid:userInfo.uid,name:userInfo.displayName}]
      });
      runTransaction(dRef(db,`vote_list/${uid}/${uid_}/vote_count`),pre => {
        return pre ? ++pre : 1;
      });
  
      runTransaction(dRef(db,`list/${uid}/vote_user/${userInfo.uid}`), pre => {
        let res = {
          ...pre,
          vote_count : pre && pre.vote_count ? pre.vote_count+1 : 1,
        }
        return res;
      });
    }else if(already){      
      if(userInfo.uid === vote_userId){
        message.error('본인제안은 투표 취소할 수 없습니다.')
        return
      }else{
        let newUser = user_uid.filter(el=>el.uid !== userInfo.uid);
        update(dRef(db,`vote_list/${uid}/${uid_}`),{
          user_uid: [...newUser]
        });
        runTransaction(dRef(db,`vote_list/${uid}/${uid_}/vote_count`),pre => {
          return pre ? --pre : 0;
        });
    
        runTransaction(dRef(db,`list/${uid}/vote_user/${userInfo.uid}`), pre => {
          let res = {
            ...pre,
            vote_count : pre && pre.vote_count ? pre.vote_count-1 : 0,
          }
          return res;
        });
      }
    }else{
      update(dRef(db,`vote_list/${uid}/${uid_}`),{
        user_uid: [...user_uid,{uid:userInfo.uid,name:userInfo.displayName}]
      });
      runTransaction(dRef(db,`vote_list/${uid}/${uid_}/vote_count`),pre => {
        return pre ? ++pre : 1;
      });
  
      runTransaction(dRef(db,`list/${uid}/vote_user/${userInfo.uid}`), pre => {
        let res = {
          ...pre,
          vote_count : pre && pre.vote_count ? pre.vote_count+1 : 1,
        }
        return res;
      });      
    }
  }

  const submitBox = useRef()
  const [submitPop, setsubmitPop] = useState(false);
  const onSubmitPop = () => {
    setsubmitPop(true);
    submitBox.current.style.transform = 'translate(-50%,0)'
    submitBox.current.style.display = 'block'
  }
  const closeSubmitPop = () => {
    setsubmitPop(false);
    submitBox.current.style.transform = 'translate(-50%,100%)'   
    submitBox.current.style.display = 'none' 
    formRef.current.setFieldsValue({
      title:'',
      link:''
    });  
    setClipImg('');
    setTimeout(()=>{
      scrollToBottom();
    },500)  
  }

  const clipboard = (e) => {
    
    const date = new Date().getTime();
    let fileObj = {};
    if( e.type === 'paste' && !e.clipboardData.files[0]){
      message.error('이미지가 아닙니다')
      return
    }

    fileObj.file = e.type === 'paste' ? e.clipboardData.files[0] : e.target.files[0];
    const fileType = fileObj.file.type;
    if(fileType !== 'image/gif' && fileType !== 'image/png' && fileType !== 'image/jpeg'){
      message.error('지원하지않는 형식 입니다.')
      return
    }
    fileObj.fileName = e.type === 'paste' ? `${date}_copyImage.png` : `${date}_${fileObj.file.name}`;
    imageResize(fileObj.file,60).then(res=>{
      fileObj.thumbnail = res;
      setClipImg([...clipImg,fileObj])
    })
  }
  const removeClipImg = (idx) => {
    let arr = clipImg.concat();
    arr.splice(idx,1);
    setClipImg(arr)
  }    

  const onOutView = () => {
    router.back()
  }

  
  const onVoteFinish = () => {
    runTransaction(dRef(db,`list/${uid}/ing`), pre => {
      setFinishVote(true)
      return false;
    })
    message.success('투표가 종료되었습니다.')
  }

  const finishPopClose = () => {
    setFinishVote(false)
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
    ref.style.display = ref.style.display === 'none' ? 'flex' : 'none'
  }

  return <>
    <div className={style.view_con_box} style={{'--domWid':`${domWid}px`}}>
        {ranking.length > 0 && finishVote &&
          <div className={style.view_finish_pop}>
            <article className={style.view_finish_con}>
              <div className={style.view_finish_txt}>1위로 선정된 제안 <AiOutlineTrophy /></div>
              <dl>
                <dt>
                  {ranking[0].title}
                </dt>
                <dd>
                  {ranking[0].image &&
                  <div className="vote_img_list">
                    <Image.PreviewGroup>
                      {ranking[0].image.map((src,idx)=>(
                        <>
                        <Image key={idx} className={style.vote_img} src={src} />
                        </>
                        ))
                      }
                    </Image.PreviewGroup>
                  </div>
                  }
                  {ranking[0].link &&
                    <span className={style.vote_link}>
                      <a href={ranking[0].link} target="_blank">링크이동<FiExternalLink /></a>
                    </span>
                  }
                </dd>
              </dl>
            </article>
            <div className={style.view_finish_bg} onClick={finishPopClose}>
            </div>
          </div>
        }
      <div className={style.ranking_box}>
        {roomData &&
          <RoomInfo roomData={roomData} onOutView={onOutView} />
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
      <ul className={style.vote_list} ref={scrollBox}>
        {voteListData && voteListData.map((el,idx)=>(
          <li
           key={idx}
           ref={list=>listRef.current[idx] = list}
           data-uid={el.uid}
          >
            <div className={style.profile}>
              {roomData && roomData.sender && roomData.sender === 1 &&
                <span>{el.user_name}</span>
              }
              <span className={style.date}>{`${el.date.hour}:${el.date.min}`}</span>
            </div>
            <div className={style.con}>
              <div className={style.desc} style={roomData?.ing ? {marginRight:"10px"} : {}}>
                <span className={style.vote_tit}>{el.title}</span>
                {el.image &&
                <div className="vote_img_list">
                  <Image.PreviewGroup>
                    {el.image.map((src,idx)=>(
                      <>
                      <Image key={idx} className={style.vote_img} src={src} />
                      </>
                      ))
                    }
                  </Image.PreviewGroup>
                </div>
                }
                {el.link &&
                <span className={style.vote_link}>
                  <a href={el.link} target="_blank">링크이동<FiExternalLink /></a>
                </span>
                }                
              </div>
              <div className={style.right_con}>                
                {roomData && roomData.ing &&
                <div className={style.btn_box}>
                  <span className={style.count}>
                    {el.vote_count > 0 ? <>{el.vote_count}</> : `0`}
                  </span>
                  {userInfo && 
                  <Button className={style.btn_vote} onClick={()=>{onVote(el.uid,el.user_uid,el.vote_user,el.already_check)}}>
                    
                    {el.already_check ? (
                      <AiTwotoneLike className={style.ic_vote} />
                    ) : (
                      <AiOutlineLike className={style.ic_vote} />
                    )
                    }
                  </Button>
                  }
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
        {roomData && userInfo && roomData.host === userInfo.uid &&
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
        {submitLoading && 
          <div className={style.loading_box}>
            <Spin tip="Loading..."></Spin>
          </div>
        }        
        <SubmitForm onFinish={onFinish} roomData={roomData} formRef={formRef} imageResize={imageResize} removeClipImg={removeClipImg} clipImg={clipImg} clipboard={clipboard} />
      </div>
    </div>
  </>;
}

export default ViewCon;
