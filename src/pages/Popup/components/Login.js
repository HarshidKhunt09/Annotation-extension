import React, { useContext, useState } from 'react';
// import {
//   getFirestore,
//   collection,
//   where,
//   getDocs,
//   addDoc,
// } from 'firebase/firestore';
// import { query, orderByChild, equalTo, get, push } from 'firebase/database';
import { SCREENS } from '../../../../utils/constant';
import { AppContext } from '../context/AppContext';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

// const fireStore = getFirestore(app);
// const userCollection = collection(fireStore, 'users');

const Login = () => {
  const { dispatch } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);

  // const handleBtn = () => {
  //   chrome.identity.getAuthToken(
  //     { interactive: false },
  //     function (current_token) {
  //       console.log(current_token);
  //       const tokenInfoEndpoint = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${current_token}`;
  //       fetch(tokenInfoEndpoint)
  //         .then((response) => {
  //           if (!response.ok) {
  //             throw new Error(`HTTP error! Status: ${response.status}`);
  //           }
  //           return response.json();
  //         })
  //         .then((tokenInfo) => {
  //           // Access the information, including expiry date
  //           const expiresIn = tokenInfo.expires_in;
  //           console.log(`Token expires in handle ${expiresIn} seconds`);
  //         })
  //         .catch((error) => {
  //           console.error('Error fetching token info:', error);
  //         });
  //     }
  //   );
  // };

  return (
    <div className="width-398">
      <div className="connect-account">
        Connect your Google account to add annotations to your Google Analytics
        4 charts.
      </div>
      <div className="d-flex justify-center align-center content-height">
        <button
          type="button"
          class="google-button"
          aria-label="google-sign"
          tabindex="0"
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true);

            // Wrap the entire code in an immediately invoked async function
            // (async () => {
            //   try {
            //     // Clear cached auth tokens
            //     await new Promise((resolve) => {
            //       chrome.identity.clearAllCachedAuthTokens(resolve);
            //     });

            //     // Get auth token interactively
            //     const token = await new Promise((resolve) => {
            //       chrome.identity.getAuthToken({ interactive: true }, resolve);
            //     });

            //     // Introduce a delay before making the fetch call
            //     await new Promise((resolve) => setTimeout(resolve, 1000));

            //     const response = await fetch(
            //       'https://www.googleapis.com/oauth2/v2/userinfo',
            //       {
            //         headers: {
            //           Authorization: 'Bearer ' + token,
            //         },
            //       }
            //     );

            //     if (!response.ok) {
            //       throw new Error(`HTTP error! Status: ${response.status}`);
            //     }

            //     const data = await response.json();

            //     if (data?.email) {
            //       console.log('Before firebase');

            //       // Introduce a delay before making the sendMessage call
            //       await new Promise((resolve) => setTimeout(resolve, 1000));

            //       const firebaseResponse = await new Promise((resolve) => {
            //         chrome.runtime.sendMessage(
            //           {
            //             action: 'loadFirebase',
            //             userData: data,
            //           },
            //           resolve
            //         );
            //       });

            //       console.log('RES LOGIN', firebaseResponse);

            //       if (!firebaseResponse?.error) {
            //         chrome.storage.local.set({
            //           email: data?.email,
            //         });
            //         chrome.storage.local.set({
            //           name: data?.name,
            //         });

            //         console.log(data);
            //       }
            //     }
            //   } catch (error) {
            //     console.log('Error fetching user details:', error);
            //   } finally {
            //     // setIsLoading(false);
            //   }
            // })();

            const res = await chrome.runtime.sendMessage({
              action: 'launchWindow',
            });

            if (res) {
              dispatch({
                type: 'SET_CURRENT_SCREEN',
                data: SCREENS?.SHEET,
              });
            }
          }}
        >
          <div class="d-flex align-center justify-center">
            {isLoading ? (
              <div style={{ marginRight: '12px' }}>
                <Spin
                  indicator={
                    <LoadingOutlined
                      style={{
                        fontSize: 24,
                      }}
                      spin
                    />
                  }
                />
              </div>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M23.3986 12.2574C23.4124 11.4589 23.3297 10.6604 23.155 9.88477H12.2314V14.1941H18.6449C18.4012 15.7223 17.5415 17.0808 16.268 17.9619L16.245 18.1042L19.6977 20.7752L19.9368 20.7981C22.1298 18.7742 23.3986 15.7958 23.3986 12.2574Z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12.2315 23.6119C15.3716 23.6119 18.0105 22.5793 19.9369 20.7986L16.2681 17.9579C15.0774 18.7564 13.6659 19.1603 12.2361 19.119C9.22021 19.1006 6.55369 17.1547 5.61581 14.291L5.47789 14.3048L1.88728 17.0767L1.84131 17.2052C3.80902 21.1382 7.83178 23.6165 12.2315 23.6119Z"
                  fill="#34A853"
                ></path>
                <path
                  d="M5.61132 14.2943C5.35846 13.5554 5.22514 12.7798 5.22514 11.9951C5.22973 11.2149 5.35846 10.4393 5.60213 9.69583L5.59753 9.54439L1.96094 6.72656L1.84141 6.78163C0.186327 10.063 0.186327 13.9272 1.84141 17.2085L5.61132 14.2943Z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12.2315 4.8777C13.9003 4.85016 15.5094 5.46972 16.7278 6.60786L20.0104 3.40912C17.9047 1.43573 15.1141 0.357244 12.2269 0.389369C7.82711 0.389369 3.80434 2.863 1.83203 6.79143L5.59275 9.70563C6.53982 6.84191 9.21094 4.89605 12.2315 4.8777Z"
                  fill="#EB4335"
                ></path>
              </svg>
            )}
            <span class="google-button-text">Continue with Google</span>
          </div>
        </button>
      </div>
      <div className="analytic-data">
        Don't worry! We don't store your analytics data.
      </div>
      <div className="disclosure-data">
        Disclosure: GA4 Notes use and transfer to any other app of information
        received from Google APIs will adhere to{' '}
        <span
          onClick={() => {
            chrome.tabs.update({
              url: 'https://developers.google.com/terms/api-services-user-data-policy',
            });
          }}
          className="policy-link"
          style={{ cursor: 'pointer' }}
        >
          Google API Services User Data Policy
        </span>
        , including the Limited Use requirements.
      </div>
      <div
        className="guide pointer"
        onClick={() =>
          window.open(
            'https://www.loom.com/share/a43c5ab228164733aab1f0d14b126518?sid=02976834-515c-423a-889e-6d73fbd767d4'
          )
        }
      >
        2-min Video Guide
      </div>
      {/* <Button onClick={handleBtn}>This is Button</Button> */}
    </div>
  );
};

export default Login;
