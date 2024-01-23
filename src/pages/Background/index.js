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
// import { getFunctions, httpsCallable } from '../../firebase-functions';
// import {
//   getFirestore,
//   collection,
//   query as firestoreQuery,
//   where,
//   getDocs,
// } from 'firebase/firestore';

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
  const configs = {
    apiKey: 'AIzaSyBz2NXNZ_3PJAawNDUoIolW5cuO9x7i4Xs',
    authDomain: 'ga4-notes-3e831.firebaseapp.com',
    projectId: 'ga4-notes-3e831',
    storageBucket: 'ga4-notes-3e831.appspot.com',
    messagingSenderId: '81175638260',
    appId: '1:81175638260:web:45af8a000f082a4186eea1',
  };

  const app = !getApps().length ? initializeApp(configs) : getApp();
  // const functions = getFunctions(app);
  const database = getDatabase(app);
  const userRef = ref(database, 'users');
  // const db = getFirestore(app);

  // if (message.action === 'loadFirebase') {
  //   const userQuery = query(
  //     userRef,
  //     orderByChild('email'),
  //     equalTo(message?.userData?.email)
  //   );

  //   try {
  //     const createStripeCustomer = httpsCallable(
  //       functions,
  //       'createStripeCustomer'
  //     );

  //     const fetchQuery = async () => {
  //       const snapshot = await get(userQuery);
  //       if (snapshot.exists()) {
  //         console.log('SEND SENDSENDSENDSEND');
  //         sendResponse({ isExist: true });
  //       } else {
  //         const newUserRef = push(userRef);
  //         await set(newUserRef, message?.userData);

  //         await createStripeCustomer({
  //           body: {
  //             email: message?.userData?.email,
  //             displayName: message?.userData?.name,
  //           },
  //         });
  //         sendResponse({ userRef: newUserRef });
  //       }
  //     };

  //     fetchQuery();
  //   } catch (error) {
  //     sendResponse({ error: 'Error processing loadFirebase message' });
  //   }
  //   return true;
  // }
  if (message.action === 'launchWindow') {
    (async () => {
      try {
        function revokeToken() {
          return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken(
              { interactive: false },
              (current_token) => {
                if (chrome.runtime.lastError) {
                  resolve('No token to revoke');
                  return;
                }
                if (!chrome.runtime.lastError) {
                  chrome.identity.removeCachedAuthToken({
                    token: current_token,
                  });
                  const xhr = new XMLHttpRequest();
                  xhr.open(
                    'GET',
                    'https://accounts.google.com/o/oauth2/revoke?token=' +
                      current_token
                  );
                  xhr.onload = function () {
                    if (xhr.status === 200) {
                      resolve('Token revoked successfully');
                    } else {
                      reject(new Error('Token revocation failed'));
                    }
                  };
                  xhr.onerror = function () {
                    reject(new Error('Network error'));
                  };
                  xhr.send();
                } else {
                  reject(new Error('Failed to get current token'));
                }
              }
            );
          });
        }

        const revokeResponse = await revokeToken();

        if (revokeResponse) {
          await new Promise((resolve) => {
            chrome.identity.clearAllCachedAuthTokens(resolve);
          });
          const token = await new Promise((resolve) => {
            chrome.identity.getAuthToken({ interactive: true }, resolve);
          });

          const response = await fetch(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            {
              headers: {
                Authorization: 'Bearer ' + token,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();

          if (data?.email) {
            const userQuery = query(
              userRef,
              orderByChild('email'),
              equalTo(data?.email)
            );

            try {
              // const createStripeCustomer = httpsCallable(
              //   functions,
              //   'createStripeCustomer'
              // );

              const fetchQuery = async () => {
                const snapshot = await get(userQuery);
                if (snapshot.exists()) {
                  chrome.storage.local.set({
                    email: data?.email,
                  });
                  chrome.storage.local.set({
                    name: data?.name,
                  });
                  sendResponse({ isExist: true });
                } else {
                  const newUserRef = push(userRef);
                  await set(newUserRef, data);

                  // await createStripeCustomer({
                  //   body: {
                  //     email: data?.email,
                  //     displayName: data?.name,
                  //   },
                  // });
                  if (newUserRef) {
                    chrome.storage.local.set({
                      email: data?.email,
                    });
                    chrome.storage.local.set({
                      name: data?.name,
                    });
                    sendResponse({ userRef: newUserRef });
                  }
                }
              };

              fetchQuery();
            } catch (error) {
              sendResponse({ error: 'Error processing loadFirebase message' });
            }
          }
        }
      } catch (error) {
        console.log('Error fetching user details:', error);
      }
    })();

    return true;
  }

  // if (message.action === 'checkout') {
  //   async function getUserDetailsByEmail(email) {
  //     try {
  //       const snapshot = await get(userRef);

  //       if (snapshot.exists()) {
  //         for (const userId in snapshot.val()) {
  //           const user = snapshot.val()[userId];
  //           if (user.email === email) {
  //             return user;
  //           }
  //         }
  //       }
  //       return null;
  //     } catch (error) {
  //       console.log('Error retrieving user details:', error);
  //     }
  //   }

  //   const userDetails = await getUserDetailsByEmail(message?.userEmail);

  //   if (userDetails) {
  //     const createCheckoutSession = httpsCallable(
  //       functions,
  //       'createCheckoutSession'
  //     );

  //     const res = await createCheckoutSession({
  //       body: {
  //         userId: userDetails?.email,
  //         customerId: userDetails?.stripeCustomerId,
  //         priceId: 'price_1OVSQzSGGj4CCc5lelUcVYRs',
  //       },
  //     });

  //     if (res?.data?.sessionUrl) {
  //       chrome.tabs.create({ url: res?.data?.sessionUrl });
  //     }
  //   } else {
  //     console.log('User not found with the specified email.');
  //   }
  //   return true;
  // }
});

chrome.runtime.onInstalled.addListener(() => {
  revokeToken(() => {
    chrome.identity.clearAllCachedAuthTokens(() => {
      chrome.storage.local.clear();
      console.log('Google Auth token revoked and storage cleared');
    });
  });
});

function revokeToken(callback) {
  chrome.identity.getAuthToken(
    { interactive: false },
    function (current_token) {
      if (!chrome.runtime.lastError) {
        const revokeUrl =
          'https://accounts.google.com/o/oauth2/revoke?token=' + current_token;

        chrome.identity.launchWebAuthFlow(
          {
            url: revokeUrl,
            interactive: false,
          },
          function () {
            if (chrome.runtime.lastError) {
              callback(new Error('Token revocation failed'));
            } else {
              callback(null);
            }
          }
        );
      } else {
        callback(new Error('Failed to get current token'));
      }
    }
  );
}
