import { Button, Col, Form, Input, Row, message } from 'antd';
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { SCREENS } from '../../../../utils/constant';

const { Item } = Form;

const SheetForm = () => {
  const { dispatch } = useContext(AppContext);
  const [form] = Form?.useForm();
  const [validationTriggered, setValidationTriggered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    setIsLoading(true);
    const match = values?.sheetUrl?.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const sheetId = match?.[1];

    try {
      const reloadGoogleAnalyticsTabs = async () => {
        const tabs = await chrome.tabs.query({});

        tabs?.forEach((tab) => {
          if (tab?.url && tab?.url?.includes('https://analytics.google.com/')) {
            chrome.tabs.reload(tab.id);
          }
        });
      };

      chrome.identity.getAuthToken(
        { interactive: false },
        async function (token) {
          if (chrome.runtime.lastError) {
            // console.log(chrome.runtime.lastError.message);
            setIsLoading(false);
            return;
          }

          try {
            const response = await fetch(
              `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:G`,
              {
                method: 'GET',
                headers: {
                  Authorization: 'Bearer ' + token,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (!response.ok) {
              // console.log(`Failed to fetch data. Status: ${response.status}`);
              if (response?.status === 403) {
                messageApi.open({
                  type: 'error',
                  content:
                    "You Don't have permission to access this spreadsheet",
                });
              }
              return;
            }

            const body = await response.json();

            if (body?.values?.length > 0) {
              reloadGoogleAnalyticsTabs();
            }

            if (body) {
              chrome.storage.local.set({ sheetId: sheetId });
              dispatch({
                type: 'SET_CURRENT_SCREEN',
                data: SCREENS?.ADD_ANNOTATION,
              });
            }
          } catch (fetchError) {
            // console.log('Error fetching data:', fetchError);
            messageApi.open({
              type: 'error',
              content: 'Something went wrong!',
            });
          } finally {
            setIsLoading(false);
          }
        }
      );
    } catch (storageError) {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex justify-center align-center content-height width-398">
      {contextHolder}
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        onFinishFailed={() => setValidationTriggered(true)}
        validateTrigger={validationTriggered ? 'onChange' : 'onSubmit'}
        className="sheet-form"
      >
        <Row>
          <Col xs={24}>
            <Item
              label="Enter Google Spreadsheet URL"
              name="sheetUrl"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Please enter google spreadsheet url!',
                },
                {
                  validator: (_, value) => {
                    const isValidUrl =
                      value && value.match(/\/d\/([a-zA-Z0-9-_]+)/);

                    if (!value) {
                      return Promise?.resolve();
                    }
                    if (!isValidUrl) {
                      return Promise.reject('Invalid Google Spreadsheet URL!');
                    }

                    return Promise.resolve();
                  },
                },
              ]}
              help="Required to store your annotations."
            >
              <Input allowClear placeholder="Enter Google Spreadsheet URL" />
            </Item>
          </Col>
        </Row>
        <div className="d-flex justify-center align-center btn-submit">
          <Button
            type="primary"
            onClick={form.submit}
            className="mt-10"
            size="large"
            loading={isLoading}
          >
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SheetForm;
