import { Popover, Spin, Tag, Tooltip } from 'antd';
import { printLine } from './modules/print';
import React from 'react';
import ReactDOM from 'react-dom';
import { LoadingOutlined, LinkOutlined } from '@ant-design/icons';

// console.log('Content script works!');
// console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

const style = document.createElement('style');
style.textContent = `
.ant-popover-inner {
  width: 440px;
  max-height: 180px;
}

.ant-popover-inner {
  overflow-y: auto;
}

.annotation-popover {
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  sans-serif;
}

.annotation-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.annotation-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.annotation-category {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ant-tooltip-inner{
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

::-webkit-scrollbar,
::-webkit-scrollbar-thumb {
  width: 7px;
  height: 7px;
  background-clip: padding-box;
  border-left: 0 solid transparent;
  border-radius: 8px;
}

::-webkit-scrollbar-thumb {
  -webkit-box-shadow: inset 0 0 0 8px;
  box-shadow: inset 0 0 0 8px;
  background-color: #7f7f7f;
  color: #D3D3D3;
}

:hover::-webkit-scrollbar-thumb {
  background-clip: padding-box;
  -webkit-box-shadow: inset 0 0 0 8px;
  box-shadow: inset 0 0 0 8px;
}

.ant-tag {
  max-width: 300px;
  text-overflow: ellipsis;
  overflow: hidden;
}
`;

const link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href =
  'https://fonts.googleapis.com/css2?family=DM+Sans:opsz@9..40&display=swap';

document.head.appendChild(style);
document.head.appendChild(link);

let previousStartDateValue = '';
let previousEndDateValue = '';
let previousSheetDataHash = '';
let previousWidth = '';

function getFromStorage(key) {
  return new Promise((resolve) => {
    if (chrome.runtime?.id) {
      chrome.runtime.sendMessage(
        { action: 'getFromStorage', key: key },
        function (response) {
          resolve(response.value);
        }
      );
    }
  });
}

function calculateDataHash(sheetData) {
  return JSON.stringify(sheetData);
}

const Loading = () => (
  <>
    <Spin
      indicator={
        <LoadingOutlined style={{ fontSize: 24, marginBottom: '15px' }} spin />
      }
    />
    <div style={{ color: '#2480FF' }}>GA4-Notes Loading...</div>
  </>
);

function showLoadingIndicator() {
  const content = document.querySelector('.app-content');
  content.style.position = 'relative';
  const label = document.createElement('div');
  label.style.position = 'absolute';
  label.style.top = '20px';
  label.style.right = '150px';
  label.style.zIndex = '999';
  label.style.textAlign = 'center';
  label.className = 'GA4-loading';

  ReactDOM.render(<Loading />, label);

  content.appendChild(label);
}

function hideLoadingIndicator() {
  document
    .querySelectorAll('.GA4-loading')
    .forEach((element) => element.remove());
}

let apiCall = true;

async function modifyPage() {
  const sheetId = await getFromStorage('sheetId');
  chrome.runtime.sendMessage({ action: 'getToken' }, async (tokenInfo) => {
    const token = tokenInfo?.token;
    if (token) {
      chrome.runtime.sendMessage(
        { action: 'getActiveTabInfo' },
        async (tabInfo) => {
          const currentTab = tabInfo?.tab;

          if (
            currentTab &&
            currentTab?.url?.includes('https://analytics.google.com/') &&
            sheetId &&
            token &&
            apiCall
          ) {
            showLoadingIndicator();
            try {
              const getData = await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:F`,
                {
                  method: 'GET',
                  headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json',
                  },
                }
              );
              let body = await getData.json();
              const dataHashInitial = calculateDataHash(body);
              if (!previousSheetDataHash) {
                previousSheetDataHash = dataHashInitial;
              }
              if (dataHashInitial !== previousSheetDataHash) {
                chrome.runtime.sendMessage({ action: 'reloadAnalytics' });
              } else {
                apiCall = false;
              }
            } catch (error) {
              // console.error('Error fetching data:', error);
            }
            hideLoadingIndicator();
          } else {
            if (!currentTab?.url?.includes('https://analytics.google.com/')) {
              apiCall = true;
            } else {
              apiCall = false;
            }
          }
        }
      );

      const datepicker = document.querySelector('ga-date-range-picker-v2');
      if (datepicker) {
        const startDateInput = datepicker.querySelector('.mat-start-date');
        const endDateInput = datepicker.querySelector('.mat-end-date');

        if (startDateInput && endDateInput) {
          const startDateValue = startDateInput.value;
          const endDateValue = endDateInput.value;

          const startInputDate = new Date(startDateValue);
          const endInputDate = new Date(endDateValue);

          const startYear = startInputDate.getFullYear();
          const startMonth = String(startInputDate.getMonth() + 1).padStart(
            2,
            '0'
          );
          const startDay = String(startInputDate.getDate()).padStart(2, '0');

          const endYear = endInputDate.getFullYear();
          const endMonth = String(endInputDate.getMonth() + 1).padStart(2, '0');
          const endDay = String(endInputDate.getDate()).padStart(2, '0');

          const startDateString = `${startYear}-${startMonth}-${startDay}`;
          const endDateString = `${endYear}-${endMonth}-${endDay}`;

          const rectElement = document.querySelector('.hover-rect');
          const widthValue = rectElement.getAttribute('width');
          if (
            (startDateValue !== previousStartDateValue ||
              endDateValue !== previousEndDateValue ||
              widthValue !== previousWidth) &&
            sheetId &&
            token
          ) {
            showLoadingIndicator();
            let response = await fetch(
              `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A:F`,
              {
                method: 'GET',
                async: true,
                headers: {
                  Authorization: 'Bearer ' + token,
                  'Content-Type': 'application/json',
                },
                contentType: 'json',
              }
            );

            let body = await response.json();
            const dataHash = calculateDataHash(body);

            const resultArray = [];

            (body?.values || []).forEach((item) => {
              const [title, description, date, category, link, name] = item;
              const existingObject = resultArray.find(
                (obj) => obj.date === date
              );

              if (existingObject) {
                existingObject.items.push({
                  title,
                  description,
                  category,
                  link,
                  name,
                });
              } else {
                resultArray.push({
                  date,
                  items: [{ title, description, category, link, name }],
                });
              }
            });

            const labelClass = 'GA4-Notes';
            document
              .querySelectorAll(`.${labelClass}`)
              .forEach((element) => element.remove());

            resultArray.forEach((value) => {
              const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
              if (value && value?.date && dateFormatRegex.test(value?.date)) {
                const targetDate = new Date(value?.date).getTime();
                const startDate = new Date(startDateString).getTime();
                const endDate = new Date(endDateString).getTime();
                const xAxisWidth = widthValue;

                // console.log('targetDate', targetDate);
                // console.log('startDate', startDate, startDateValue);
                // console.log('endDate', endDate, endDateValue);

                if (targetDate >= startDate && targetDate <= endDate) {
                  const chart = document.querySelector('.line-chart');
                  if (chart) {
                    let targetPosition;

                    const content = (
                      <div>
                        {value?.items?.map((item, index) => (
                          <div key={index} className="annotation-popover">
                            <div style={{ display: 'flex' }}>
                              <div style={{ marginTop: '4px' }}>
                                <svg
                                  width="18"
                                  zoomAndPan="magnify"
                                  viewBox="0 0 60 60"
                                  height="18"
                                  preserveAspectRatio="xMidYMid meet"
                                  version="1.0"
                                >
                                  <defs>
                                    <clipPath id="53decccab9">
                                      <path
                                        d="M 0.136719 3.582031 L 60 3.582031 L 60 56.082031 L 0.136719 56.082031 Z M 0.136719 3.582031 "
                                        clip-rule="nonzero"
                                      />
                                    </clipPath>
                                  </defs>
                                  <g clip-path="url(#53decccab9)">
                                    <path
                                      fill="#89ff40"
                                      d="M 0.136719 5.867188 L 0.136719 42.386719 C 0.136719 42.691406 0.195312 42.980469 0.3125 43.261719 C 0.429688 43.542969 0.597656 43.789062 0.8125 44.003906 C 1.03125 44.214844 1.277344 44.382812 1.5625 44.496094 C 1.84375 44.613281 2.140625 44.671875 2.445312 44.671875 L 20.90625 44.671875 L 30.136719 56.082031 L 39.367188 44.671875 L 57.828125 44.671875 C 58.136719 44.671875 58.429688 44.613281 58.710938 44.496094 C 58.996094 44.382812 59.246094 44.214844 59.460938 44.003906 C 59.675781 43.789062 59.84375 43.542969 59.960938 43.261719 C 60.078125 42.980469 60.136719 42.691406 60.136719 42.386719 L 60.136719 5.867188 C 60.136719 5.5625 60.078125 5.273438 59.960938 4.992188 C 59.84375 4.714844 59.675781 4.464844 59.460938 4.253906 C 59.246094 4.039062 58.996094 3.875 58.710938 3.757812 C 58.429688 3.640625 58.136719 3.582031 57.828125 3.582031 L 2.445312 3.582031 C 2.140625 3.582031 1.84375 3.640625 1.5625 3.757812 C 1.277344 3.875 1.03125 4.039062 0.8125 4.253906 C 0.597656 4.464844 0.429688 4.714844 0.3125 4.992188 C 0.195312 5.273438 0.136719 5.5625 0.136719 5.867188 Z M 0.136719 5.867188 "
                                      fill-opacity="1"
                                      fill-rule="nonzero"
                                    />
                                  </g>
                                  <path
                                    fill="#425ec5"
                                    d="M 45.136719 19.5625 L 15.136719 19.5625 C 14.832031 19.5625 14.535156 19.503906 14.253906 19.386719 C 13.972656 19.273438 13.722656 19.109375 13.503906 18.894531 C 13.289062 18.679688 13.121094 18.433594 13.003906 18.152344 C 12.886719 17.875 12.828125 17.582031 12.828125 17.28125 C 12.828125 16.976562 12.886719 16.6875 13.003906 16.40625 C 13.121094 16.125 13.289062 15.878906 13.503906 15.664062 C 13.722656 15.453125 13.972656 15.285156 14.253906 15.171875 C 14.535156 15.054688 14.832031 14.996094 15.136719 14.996094 L 45.136719 14.996094 C 45.441406 14.996094 45.738281 15.054688 46.019531 15.171875 C 46.304688 15.285156 46.550781 15.453125 46.769531 15.664062 C 46.984375 15.878906 47.152344 16.125 47.269531 16.40625 C 47.386719 16.6875 47.445312 16.976562 47.445312 17.28125 C 47.445312 17.582031 47.386719 17.875 47.269531 18.152344 C 47.152344 18.433594 46.984375 18.679688 46.769531 18.894531 C 46.550781 19.109375 46.304688 19.273438 46.019531 19.386719 C 45.738281 19.503906 45.441406 19.5625 45.136719 19.5625 Z M 45.136719 19.5625 "
                                    fill-opacity="1"
                                    fill-rule="nonzero"
                                  />
                                  <path
                                    fill="#425ec5"
                                    d="M 35.90625 33.257812 L 15.136719 33.257812 C 14.832031 33.257812 14.535156 33.199219 14.253906 33.085938 C 13.972656 32.96875 13.722656 32.804688 13.503906 32.589844 C 13.289062 32.375 13.121094 32.128906 13.003906 31.847656 C 12.886719 31.570312 12.828125 31.277344 12.828125 30.976562 C 12.828125 30.671875 12.886719 30.382812 13.003906 30.101562 C 13.121094 29.820312 13.289062 29.574219 13.503906 29.359375 C 13.722656 29.148438 13.972656 28.980469 14.253906 28.867188 C 14.535156 28.75 14.832031 28.691406 15.136719 28.691406 L 35.90625 28.691406 C 36.210938 28.691406 36.507812 28.75 36.789062 28.867188 C 37.074219 28.980469 37.320312 29.148438 37.539062 29.359375 C 37.753906 29.574219 37.921875 29.820312 38.039062 30.101562 C 38.15625 30.382812 38.214844 30.671875 38.214844 30.976562 C 38.214844 31.277344 38.15625 31.570312 38.039062 31.847656 C 37.921875 32.128906 37.753906 32.375 37.539062 32.589844 C 37.320312 32.804688 37.074219 32.96875 36.789062 33.085938 C 36.507812 33.199219 36.210938 33.257812 35.90625 33.257812 Z M 35.90625 33.257812 "
                                    fill-opacity="1"
                                    fill-rule="nonzero"
                                  />
                                </svg>
                              </div>
                              <div
                                style={{ marginLeft: '15px', width: '100%' }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  {item?.title && (
                                    <div
                                      className="annotation-title"
                                      style={{
                                        fontSize: '16px',
                                        color: '#0045b6',
                                        marginBottom: '10px',
                                      }}
                                    >
                                      {item?.title}
                                    </div>
                                  )}
                                </div>
                                {item?.description && (
                                  <div
                                    style={{ marginBottom: '10px' }}
                                    className="annotation-description"
                                  >
                                    {item?.description}
                                  </div>
                                )}
                                <div
                                  style={{
                                    marginBottom: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  {item?.category && (
                                    <Tag style={{ marginRight: '15px' }}>
                                      {item?.category}
                                    </Tag>
                                  )}
                                  {item?.name && (
                                    <Tooltip title={item?.name} color="#425FC7">
                                      <svg
                                        viewBox="0 0 448 512"
                                        width="14"
                                        height="14"
                                        fill="#000000"
                                      >
                                        <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" />
                                      </svg>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                              {item?.link && (
                                <div
                                  style={{
                                    marginLeft: '10px',
                                    color: 'blue',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => window.open(item?.link)}
                                >
                                  <LinkOutlined />
                                </div>
                              )}
                            </div>
                            {index !== value?.items?.length - 1 && <hr />}
                          </div>
                        ))}
                      </div>
                    );

                    const inputDateString = value?.date;
                    const inputDate = new Date(inputDateString);

                    const options = {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                    };
                    const formattedDate = inputDate.toLocaleDateString(
                      'en-US',
                      options
                    );

                    const Annotation = () => (
                      <div
                        className={
                          value?.items?.length > 1
                            ? 'popover-multiple'
                            : 'popover-single'
                        }
                      >
                        <Popover
                          content={content}
                          title={formattedDate}
                          trigger="click"
                        >
                          <div className="note-icon">
                            <svg
                              width="18"
                              zoomAndPan="magnify"
                              viewBox="0 0 60 60"
                              height="18"
                              preserveAspectRatio="xMidYMid meet"
                              version="1.0"
                            >
                              <defs>
                                <clipPath id="53decccab9">
                                  <path
                                    d="M 0.136719 3.582031 L 60 3.582031 L 60 56.082031 L 0.136719 56.082031 Z M 0.136719 3.582031 "
                                    clip-rule="nonzero"
                                  />
                                </clipPath>
                              </defs>
                              <g clip-path="url(#53decccab9)">
                                <path
                                  fill="#89ff40"
                                  className="comment-icon"
                                  d="M 0.136719 5.867188 L 0.136719 42.386719 C 0.136719 42.691406 0.195312 42.980469 0.3125 43.261719 C 0.429688 43.542969 0.597656 43.789062 0.8125 44.003906 C 1.03125 44.214844 1.277344 44.382812 1.5625 44.496094 C 1.84375 44.613281 2.140625 44.671875 2.445312 44.671875 L 20.90625 44.671875 L 30.136719 56.082031 L 39.367188 44.671875 L 57.828125 44.671875 C 58.136719 44.671875 58.429688 44.613281 58.710938 44.496094 C 58.996094 44.382812 59.246094 44.214844 59.460938 44.003906 C 59.675781 43.789062 59.84375 43.542969 59.960938 43.261719 C 60.078125 42.980469 60.136719 42.691406 60.136719 42.386719 L 60.136719 5.867188 C 60.136719 5.5625 60.078125 5.273438 59.960938 4.992188 C 59.84375 4.714844 59.675781 4.464844 59.460938 4.253906 C 59.246094 4.039062 58.996094 3.875 58.710938 3.757812 C 58.429688 3.640625 58.136719 3.582031 57.828125 3.582031 L 2.445312 3.582031 C 2.140625 3.582031 1.84375 3.640625 1.5625 3.757812 C 1.277344 3.875 1.03125 4.039062 0.8125 4.253906 C 0.597656 4.464844 0.429688 4.714844 0.3125 4.992188 C 0.195312 5.273438 0.136719 5.5625 0.136719 5.867188 Z M 0.136719 5.867188 "
                                  fill-opacity="1"
                                  fill-rule="nonzero"
                                />
                              </g>
                              <path
                                fill="#425ec5"
                                d="M 45.136719 19.5625 L 15.136719 19.5625 C 14.832031 19.5625 14.535156 19.503906 14.253906 19.386719 C 13.972656 19.273438 13.722656 19.109375 13.503906 18.894531 C 13.289062 18.679688 13.121094 18.433594 13.003906 18.152344 C 12.886719 17.875 12.828125 17.582031 12.828125 17.28125 C 12.828125 16.976562 12.886719 16.6875 13.003906 16.40625 C 13.121094 16.125 13.289062 15.878906 13.503906 15.664062 C 13.722656 15.453125 13.972656 15.285156 14.253906 15.171875 C 14.535156 15.054688 14.832031 14.996094 15.136719 14.996094 L 45.136719 14.996094 C 45.441406 14.996094 45.738281 15.054688 46.019531 15.171875 C 46.304688 15.285156 46.550781 15.453125 46.769531 15.664062 C 46.984375 15.878906 47.152344 16.125 47.269531 16.40625 C 47.386719 16.6875 47.445312 16.976562 47.445312 17.28125 C 47.445312 17.582031 47.386719 17.875 47.269531 18.152344 C 47.152344 18.433594 46.984375 18.679688 46.769531 18.894531 C 46.550781 19.109375 46.304688 19.273438 46.019531 19.386719 C 45.738281 19.503906 45.441406 19.5625 45.136719 19.5625 Z M 45.136719 19.5625 "
                                fill-opacity="1"
                                fill-rule="nonzero"
                              />
                              <path
                                fill="#425ec5"
                                d="M 35.90625 33.257812 L 15.136719 33.257812 C 14.832031 33.257812 14.535156 33.199219 14.253906 33.085938 C 13.972656 32.96875 13.722656 32.804688 13.503906 32.589844 C 13.289062 32.375 13.121094 32.128906 13.003906 31.847656 C 12.886719 31.570312 12.828125 31.277344 12.828125 30.976562 C 12.828125 30.671875 12.886719 30.382812 13.003906 30.101562 C 13.121094 29.820312 13.289062 29.574219 13.503906 29.359375 C 13.722656 29.148438 13.972656 28.980469 14.253906 28.867188 C 14.535156 28.75 14.832031 28.691406 15.136719 28.691406 L 35.90625 28.691406 C 36.210938 28.691406 36.507812 28.75 36.789062 28.867188 C 37.074219 28.980469 37.320312 29.148438 37.539062 29.359375 C 37.753906 29.574219 37.921875 29.820312 38.039062 30.101562 C 38.15625 30.382812 38.214844 30.671875 38.214844 30.976562 C 38.214844 31.277344 38.15625 31.570312 38.039062 31.847656 C 37.921875 32.128906 37.753906 32.375 37.539062 32.589844 C 37.320312 32.804688 37.074219 32.96875 36.789062 33.085938 C 36.507812 33.199219 36.210938 33.257812 35.90625 33.257812 Z M 35.90625 33.257812 "
                                fill-opacity="1"
                                fill-rule="nonzero"
                              />
                            </svg>
                          </div>
                        </Popover>
                      </div>
                    );

                    const label = document.createElement('div');
                    label.style.position = 'absolute';
                    label.style.left = `${targetPosition}px`;
                    label.style.top = '4px';
                    label.className = labelClass;

                    ReactDOM.render(<Annotation />, label);

                    chart.appendChild(label);
                    hideLoadingIndicator();
                  } else {
                    // console.log('Chart element not found.');
                  }
                }
              }
            });

            previousSheetDataHash = dataHash;
            previousStartDateValue = startDateValue;
            previousEndDateValue = endDateValue;
            previousWidth = widthValue;
          }
        } else {
          // console.log('Start or end date not found.');
        }
      } else {
        // console.log('Date picker not found.');
      }
    }
  });
}

// const observer = new MutationObserver(() => {
//   if (
//     document.querySelector('.line-chart') &&
//     document.querySelector('ga-date-range-picker-v2')
//   ) {
//     modifyPage();
//     observer.disconnect();
//   }
// });

setInterval(() => {
  modifyPage();
}, 5000);

// observer.observe(document.body, { childList: true, subtree: true });
