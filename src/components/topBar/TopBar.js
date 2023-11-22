"use client";

import React, { useContext } from "react";
import { HIDConnectionContext } from "../../context/HIDConnectionContext";

const TopBar = () => {
  const { device, connected, setDevice, setConnected } =
    useContext(HIDConnectionContext);

  const disconnectHID = () => {
    if (device) {
      device.close();
      setDevice(null);
    }
    setConnected(false);
  };

  return (
    <div className="border-b-2 border-black w-full px-4 py-2 flex justify-between items-center">
      <h1 className="text-2xl font-mono">rzrControl</h1>

      <button
        // hacky way to hide button?
        className={`font-bold ring py-2 px-4 ${
          connected
            ? "ring-black hover:bg-green-400"
            : "ring-white text-white"
        }`}
        disabled={!connected}
        onClick={connected ? disconnectHID : () => {}}
      >
        Disconnect
      </button>
    </div>
  );
};

export default TopBar;
