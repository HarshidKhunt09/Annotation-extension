import React, { useContext, useEffect } from 'react';
import { AppContext } from './context/AppContext';
import { SCREENS } from '../../../utils/constant';
import Login from './components/Login';
import SheetForm from './components/SheetForm';
import AddAnnotationForm from './components/AddAnnotationForm';
import CheckoutPage from './components/CheckoutPage';

const AllContent = () => {
  const {
    dispatch,
    state: { currentScreen },
  } = useContext(AppContext);

  useEffect(() => {
    const getItems = async () => {
      const items = await chrome.storage.local.get();
      try {
        chrome.identity.getAuthToken(
          { interactive: false },
          function (current_token) {
            if (chrome.runtime.lastError) {
              // console.log(chrome.runtime.lastError.message);
            }

            dispatch({
              type: 'SET_CURRENT_SCREEN',
              data:
                !items?.sheetId && !current_token
                  ? SCREENS?.LOGIN
                  : !items?.sheetId
                  ? SCREENS?.SHEET
                  : SCREENS?.ADD_ANNOTATION,
            });
          }
        );
      } catch (error) {
        // console.log(error.message);
      }
    };
    getItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* <CheckoutPage /> */}
      {currentScreen === SCREENS?.LOGIN && <Login />}
      {currentScreen === SCREENS?.SHEET && <SheetForm />}
      {currentScreen === SCREENS?.ADD_ANNOTATION && <AddAnnotationForm />}
    </>
  );
};

export default AllContent;
