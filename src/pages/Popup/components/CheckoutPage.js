import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';

const CheckoutPage = () => {
  const {
    state: { currentScreen },
  } = useContext(AppContext);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const getEmail = async () => {
      const items = await chrome.storage.local.get();
      console.log('CHECKOUT FE', items);
      setEmail(items?.email);
    };
    getEmail();
  }, [currentScreen]);

  console.log('FE', email);

  return (
    <>
      <div
        onClick={() => {
          chrome.runtime.sendMessage(
            {
              action: 'checkout',
              userEmail: email,
            },
            (response) => {
              console.log('RES LOGIN', response);
            }
          );
        }}
      >
        Buy
      </div>
    </>
  );
};

export default CheckoutPage;
