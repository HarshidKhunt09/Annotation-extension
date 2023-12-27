import { getApp, getApps, initializeApp } from '../../firebase-app';
import {
  getDatabase,
  ref,
  set,
  equalTo,
  get,
  orderByChild,
  push,
  query,
} from '../../firebase-database';

// console.log('Background Script Loaded');

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.alarms.create('periodicUpdate', {
//     when: 1000,
//     periodInMinutes: 0.05,
//   });
// });

// chrome.alarms.onAlarm.addListener((alarm) => {
//   if (alarm.name === 'periodicUpdate') {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       const activeTab = tabs[0];
//       if (activeTab) {
//         chrome.scripting.executeScript({
//           target: { tabId: activeTab.id },
//           function: modifyPage,
//         });
//       }
//     });
//   }
// });

// function modifyPage() {
//   document.body.style.backgroundColor = 'lightblue';

//   const datepicker = document.querySelector('ga-date-range-picker-v2');

//   const chart = document.querySelector('.line-chart');

//   console.log(chart);

//   if (datepicker) {
//     const startDateInput = datepicker.querySelector('.mat-start-date');
//     const endDateInput = datepicker.querySelector('.mat-end-date');

//     if (startDateInput && endDateInput) {
//       const startDateValue = startDateInput.value;
//       const endDateValue = endDateInput.value;

//       console.log('Start Date:', startDateValue);
//       console.log('End Date:', endDateValue);

//       const targetDate = new Date('2023-11-19').getTime();
//       const startDate = new Date('2023-11-12').getTime();
//       const endDate = new Date('2023-12-06').getTime();
//       const xAxisWidth = 696;

//       const chart = document.querySelector('.line-chart');
//       const targetPosition =
//         ((targetDate - startDate) / (endDate - startDate)) * xAxisWidth;

//       const label = document.createElement('div');
//       label.textContent = 'H';
//       label.style.position = 'absolute';
//       label.style.left = `${targetPosition}px`;
//       label.style.top = '0';
//       label.style.backgroundColor = 'red';

//       chart.appendChild(label);
//     } else {
//       console.error('Start or end date input elements not found.');
//     }
//   } else {
//     console.error('Date picker element not found.');
//   }
// }

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'saveToStorage') {
    chrome.storage.local.set({ [request.key]: request.value });
  } else if (request.action === 'getFromStorage') {
    chrome.storage.local.get(request.key, function (result) {
      sendResponse({ value: result[request.key] });
    });
    return true;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getActiveTabInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      sendResponse({ tab: activeTab });
    });
    return true;
  }
  if (message.action === 'reloadAnalytics') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab.url.includes('https://analytics.google.com/')) {
        chrome.tabs.reload(activeTab.id);
      }
    });
    return true;
  }
  if (message.action === 'getToken') {
    try {
      chrome.identity.getAuthToken(
        { interactive: false },
        function (current_token) {
          if (chrome.runtime.lastError) {
            // console.log(chrome.runtime.lastError.message);
            return;
          }
          sendResponse({ token: current_token });
        }
      );
    } catch (error) {
      // console.log(error.message);
    }
    return true;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'loadFirebase') {
    const configs = {
      apiKey: 'AIzaSyBz2NXNZ_3PJAawNDUoIolW5cuO9x7i4Xs',
      authDomain: 'ga4-notes-3e831.firebaseapp.com',
      projectId: 'ga4-notes-3e831',
      storageBucket: 'ga4-notes-3e831.appspot.com',
      messagingSenderId: '81175638260',
      appId: '1:81175638260:web:45af8a000f082a4186eea1',
    };

    const app = !getApps().length ? initializeApp(configs) : getApp();
    const database = getDatabase(app);
    const userRef = ref(database, 'users');

    const userQuery = query(
      userRef,
      orderByChild('email'),
      equalTo(message?.userData?.email)
    );

    try {
      const fetchQuery = async () => {
        const snapshot = await get(userQuery);
        if (snapshot.exists()) {
          sendResponse({ isExist: true });
        } else {
          const newUserRef = push(userRef);
          await set(newUserRef, message?.userData);
          sendResponse({ userRef: newUserRef });
        }
      };

      fetchQuery();
    } catch (error) {
      sendResponse({ error: 'Error processing loadFirebase message' });
    }
    return true;
  }
});
