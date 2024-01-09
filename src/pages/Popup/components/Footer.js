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
        <div
          className="pointer"
          onClick={() =>
            window.open(
              'https://www.loom.com/share/a43c5ab228164733aab1f0d14b126518?sid=02976834-515c-423a-889e-6d73fbd767d4'
            )
          }
        >
          2-min Video Guide
        </div>
      </div>
    )
  );
};

export default Footer;
