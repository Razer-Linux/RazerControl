"use client";

import React, { createContext, useState } from 'react';

export const HIDConnectionContext = createContext(null);

export const HIDConnectionProvider = ({ children }) => {
  const [device, setDevice] = useState(null);
  const [connected, setConnected] = useState(false);

  const conn = {
    device,
    setDevice,
    connected,
    setConnected,
  };

  return (
    <HIDConnectionContext.Provider value={conn}>
      {children}
    </HIDConnectionContext.Provider>
  );
};