import React from "react";
import { Form, Input, Button, Checkbox, Radio } from "antd";
import { db } from "src/firebase";
import { ref, set } from "firebase/database";
import uuid from "react-uuid"
import { getFormatDate } from "@component/CommonFunc"

function regist() {
  const onFinish = (values) => {
    const date = getFormatDate(new Date());
    const uid = uuid();
    console.log(values)
    set(ref(db,`list/${uid}`),{
      ...values,
      date
    })
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <>
      <Form
        name="basic"
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        initialValues={{ 
          type: 1 ,
          voter: 1,
          password: ''
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="제목"
          name="title"
          rules={[{ required: true, message: "제목은 필수입니다." }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="추가"
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
          <Radio.Group>
            <Radio.Button value={1}>단일투표</Radio.Button>
            <Radio.Button value={2}>중복투표</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="투표자공개"
          name="voter"
        >
          <Radio.Group>
            <Radio.Button value={1}>공개투표</Radio.Button>
            <Radio.Button value={2}>비밀투표</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label="비밀방"
          name="password"
        >
          <Input placeholder="암호가 없으면 공개방으로 생성됩니다." />
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button type="primary" htmlType="submit" style={{ width: "50%" }}>
            Submit
          </Button>
        </div>
      </Form>
    </>
  );
}

export default regist;
