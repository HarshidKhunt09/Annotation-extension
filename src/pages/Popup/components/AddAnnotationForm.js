import { Button, Col, DatePicker, Form, Input, Row, message } from 'antd';
import React, { useState } from 'react';

const { Item } = Form;
const { TextArea } = Input;

const AddAnnotationForm = () => {
  const [form] = Form.useForm();
  const [validationTriggered, setValidationTriggered] = useState(false);
  const [loading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const reloadGoogleAnalyticsTabs = async () => {
    const tabs = await chrome.tabs.query({});

    tabs.forEach((tab) => {
      if (tab.url && tab.url.includes('https://analytics.google.com/')) {
        chrome.tabs.reload(tab.id);
      }
    });
  };

  const success = () => {
    messageApi.open({
      type: 'success',
      content: 'Annotation added successfully',
    });
  };

  const onFinish = async (values) => {
    setIsLoading(true);
    const items = await chrome.storage.local.get();
    const range = 'Sheet1!A:E';
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${items?.sheetId}/values/${range}:append?valueInputOption=RAW`;

    const inputDate = new Date(values?.date);

    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const day = String(inputDate.getDate()).padStart(2, '0');

    const requestBody = {
      values: [
        [
          values?.title?.trim(),
          values?.description?.trim(),
          `${year}-${month}-${day}`,
          values?.category?.trim(),
          values?.url?.trim(),
          items?.email,
        ],
      ],
    };

    chrome.identity.getAuthToken(
      { interactive: false },
      async function (token) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            // console.log(`Failed to fetch data. Status: ${response.status}`);
            return;
          }

          const responseBody = await response.json();

          if (responseBody) {
            form.resetFields();
            setIsLoading(false);
            success();
            reloadGoogleAnalyticsTabs();
          }
        } catch (error) {
          // console.log('Error:', error);
          messageApi.open({
            type: 'error',
            content: 'Something went wrong!',
          });
        }
      }
    );
  };

  return (
    <div className="m-20 width-500">
      {contextHolder}
      <h2 className="add-annotation">Add Annotation</h2>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => setValidationTriggered(true)}
        validateTrigger={validationTriggered ? 'onChange' : 'onSubmit'}
      >
        <Row gutter={[16, 8]}>
          <Col xs={12}>
            <Item
              label="Title"
              name="title"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Please enter title!',
                },
              ]}
            >
              <Input allowClear placeholder="Enter Title" maxLength={70} />
            </Item>
          </Col>
          <Col xs={12}>
            <Item
              label="Date"
              name="date"
              rules={[
                {
                  required: true,
                  message: 'Please enter date!',
                },
              ]}
            >
              <DatePicker
                allowClear
                placeholder="Enter Date"
                format="YYYY/MM/DD"
              />
            </Item>
          </Col>
          <Col xs={24}>
            <Item
              label="Description"
              name="description"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Please enter description!',
                },
              ]}
            >
              <TextArea
                rows={3}
                allowClear
                placeholder="Enter Description"
                maxLength={100}
              />
            </Item>
          </Col>
          <Col xs={12}>
            <Item label="Category" name="category">
              <Input allowClear placeholder="Enter Category" maxLength={70} />
            </Item>
          </Col>
          <Col xs={12}>
            <Item
              label="URL"
              name="url"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) {
                      return Promise?.resolve();
                    }
                    const REGEX =
                      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
                    if (!REGEX?.test(value)) {
                      // eslint-disable-next-line prefer-promise-reject-errors
                      return Promise?.reject('Invalid URL!');
                    }
                    return Promise?.resolve();
                  },
                },
              ]}
            >
              <Input allowClear placeholder="Enter URL" />
            </Item>
          </Col>
        </Row>
        <div className="d-flex justify-center align-center mt-7">
          <Button
            type="primary"
            onClick={form.submit}
            className="mt-10"
            size="large"
            loading={loading}
          >
            Add Annotation
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AddAnnotationForm;
