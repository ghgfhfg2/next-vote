import React, {useState} from "react";
import { useSelector } from "react-redux";
import { Form, Input, Button, Checkbox, Radio } from "antd";
import { db } from "src/firebase";
import { ref, set, runTransaction } from "firebase/database";
import uuid from "react-uuid";
import { getFormatDate } from "@component/CommonFunc";
import {useRouter} from 'next/router'

function Regist() {
  const router = useRouter();
  const userInfo = useSelector((state) => state.user.currentUser);

  const onFinish = (values) => {
    const date = getFormatDate(new Date());
    const uid = uuid();
    runTransaction(ref(db,`user/${userInfo.uid}`), pre => {
      let res = pre ? pre : {room:[]};
      res.room = [...res.room, uid]
      return res;
    });
    set(ref(db,`list/${uid}`),{
      ...values,
      date,
      ing: true,
      host: userInfo.uid,
      vote_user:''
    });
    router.push(`/view/${uid}`);
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const [sliderNum, setSliderNum] = useState(3)
  const onSlider = (e) => {
    setSliderNum(e)
  }
  return (
    <>
      <div className="regist_box">
        <Form
          name="basic"
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 17 }}
          initialValues={{ 
            type: 1 ,
            voter: 1,
            password: '',
            max_vote: 1,
            add:''
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="write_form"
        >
          <Form.Item
            label="제목"
            name="title"
            rules={[{ required: true, message: "제목은 필수입니다." }]}
          >
            <Input maxLength={30} />
          </Form.Item>
          <Form.Item
            label="추가로 입력 가능한 항목"
            name="add"
          >
            <Checkbox.Group>
              <Checkbox value="link">링크</Checkbox>
              <Checkbox value="img">이미지</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item
            label="투표방식"
            name="type"
          >
            <Radio.Group size="large">
              <Radio.Button value={1}>단일투표</Radio.Button>
              <Radio.Button value={2}>중복투표</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="최대 제안 횟수"
            name="max_vote"
          >
            <Radio.Group size="large">
              <Radio.Button value={1}>1회</Radio.Button>
              <Radio.Button value={2}>2회</Radio.Button>
              <Radio.Button value={3}>3회</Radio.Button>
              <Radio.Button value={4}>4회</Radio.Button>
              <Radio.Button value={5}>5회</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="투표자공개"
            name="voter"
          >
            <Radio.Group size="large">
              <Radio.Button value={1}>공개투표</Radio.Button>
              <Radio.Button value={2}>비밀투표</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="비밀번호"
            name="password"
          >
            <Input placeholder="암호가 없으면 공개방으로 생성됩니다." maxLength={15} />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "center",padding:"1rem" }}>
            <Button size="large" type="primary" htmlType="submit" style={{ width: "100%" }}>
              방 생성하기
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}

export default Regist;
