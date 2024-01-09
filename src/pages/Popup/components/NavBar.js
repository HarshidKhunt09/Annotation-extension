import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { SCREENS } from '../../../../utils/constant';
import { Layout } from 'antd';
const { Header } = Layout;

const NavBar = () => {
  const {
    dispatch,
    state: { currentScreen },
  } = useContext(AppContext);
  const [token, setToken] = useState();

  useEffect(() => {
    const fetchToken = async () => {
      chrome.identity.getAuthToken(
        { interactive: false },
        function (current_token) {
          if (chrome.runtime.lastError) {
            // console.log(chrome.runtime.lastError.message);
            setToken();
            return;
          }
          setToken(current_token);
        }
      );
    };

    if (currentScreen !== SCREENS?.LOGIN) {
      fetchToken();
    }
  }, [currentScreen]);

  const handleLogout = () => {
    function revokeToken(callback) {
      chrome.identity.getAuthToken(
        { interactive: false },
        function (current_token) {
          if (!chrome.runtime.lastError) {
            chrome.identity.removeCachedAuthToken({ token: current_token });
            const xhr = new XMLHttpRequest();
            xhr.open(
              'GET',
              'https://accounts.google.com/o/oauth2/revoke?token=' +
                current_token
            );
            xhr.onload = function () {
              if (xhr.status === 200) {
                callback(null);
              } else {
                callback(new Error('Token revocation failed'));
              }
            };
            xhr.onerror = function () {
              callback(new Error('Network error'));
            };
            xhr.send();
          } else {
            callback(new Error('Failed to get current token'));
          }
        }
      );
    }

    chrome.storage.local.clear();
    revokeToken(function () {
      chrome.identity.clearAllCachedAuthTokens(() => {
        setToken();
        dispatch({
          type: 'SET_CURRENT_SCREEN',
          data: SCREENS?.LOGIN,
        });
        const reloadGoogleAnalyticsTabs = async () => {
          const tabs = await chrome.tabs.query({});

          tabs.forEach((tab) => {
            if (tab.url && tab.url.includes('https://analytics.google.com/')) {
              chrome.tabs.reload(tab.id);
            }
          });
        };
        reloadGoogleAnalyticsTabs();
      });
    });
  };

  return (
    <Header className="nav-height d-flex justify-between align-center">
      <div className="d-flex align-center">
        <svg
          width="25"
          zoomAndPan="magnify"
          viewBox="0 0 60 60"
          height="25"
          preserveAspectRatio="xMidYMid meet"
          version="1.0"
          className="mr-10"
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
        <div className="ga4-notes-title">GA4 Notes</div>
      </div>
      <div className="d-flex">
        <div
          className="pointer nav-item"
          onClick={() => window.open('https://help.ga4notes.com/')}
        >
          Help Docs
        </div>
        {token && (
          <div onClick={handleLogout} className="pointer nav-item ml-24">
            Logout
          </div>
        )}
      </div>
    </Header>
  );
};

export default NavBar;
