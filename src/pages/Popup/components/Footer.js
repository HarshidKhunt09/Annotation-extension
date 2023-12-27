import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';

const Footer = () => {
  const {
    state: { currentScreen },
  } = useContext(AppContext);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const getMail = async () => {
      const items = await chrome.storage.local.get();

      // console.log(items, 'items');
      setEmail(items?.email);
    };
    getMail();
  }, [currentScreen]);

  return (
    email && (
      <div className="footer d-flex justify-between">
        <div className="email-id">{email}</div>
        <div>2-min Video Guide</div>
      </div>
    )
  );
};

export default Footer;
