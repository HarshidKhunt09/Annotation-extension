import React, { createContext, useReducer } from 'react';
// import { REFRESH_TOKEN } from './common/constants';
import { SCREENS } from '../../../../utils/constant';

const initialState = {
  currentScreen: SCREENS?.LOGIN,
};

const reducer = (state, action) => {
  switch (action?.type) {
    case 'SET_CURRENT_SCREEN':
      return { ...state, currentScreen: action?.data };
    default:
      return { ...state };
  }
};

const AppContext = createContext({
  state: initialState,
  dispatch: () => {},
});

function AppContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN);

  const value = {
    state,
    dispatch,
    // getRefreshToken,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const AppContextConsumer = AppContext.Consumer;

export { AppContext, AppContextProvider, AppContextConsumer };
