import { ConfigProvider, Layout } from 'antd';
import React from 'react';
import themeJson from './theme.json';
import './Popup.css';
import { AppContextProvider } from './context/AppContext';
import AllContent from './AllContent';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
const { Content } = Layout;

const Popup = () => {
  return (
    <AppContextProvider>
      <ConfigProvider theme={themeJson}>
        <NavBar />
        <Content>
          <AllContent />
        </Content>
        <Footer />
      </ConfigProvider>
    </AppContextProvider>
  );
};

export default Popup;
