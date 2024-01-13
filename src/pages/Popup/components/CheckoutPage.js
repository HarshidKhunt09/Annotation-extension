import React, { useEffect, useState } from 'react';

const CheckoutPage = () => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const getEmail = async () => {
      const items = await chrome.storage.local.get();
      setEmail(items?.email);
    };
    getEmail();
  }, []);

  console.log('FE', email);

  return (
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
  );
};

export default CheckoutPage;
