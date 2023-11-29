"use client";

import React, { useContext, useEffect, useState, useRef } from "react";
import { useDeviceQueue } from "../../hooks/deviceQueue";
import { HIDConnectionContext } from "../../context/HIDConnectionContext";
import { SetBatteryPacket, GetBatteryPacket } from "../../services/RazerPacket";
import ToggleButton from "../common/ToggleButton";
import Slider from "../common/Slider";

const updateModuleState = (res, setBatteryLevel, setBhoOn) => {
  setBatteryLevel(res[8] & 127);
  setBhoOn(res[8] & (1 << 7));
};

const bhoToByte = (on, level) => {
  // set top bit when on
  if (on) {
    return level | 0b1000_0000;
  }
  return level;
};

const BatteryChargeLimitModule = () => {
  const { connected } = useContext(HIDConnectionContext);
  const { sendAndReceive } = useDeviceQueue();
  const [bhoOn, setBhoOn] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(50);

  // use ref for func to avoid triggering effect
  const sendAndReceiveRef = useRef(sendAndReceive);
  sendAndReceiveRef.current = sendAndReceive;

  useEffect(() => {
    if (connected) {
      let packet = new GetBatteryPacket();

      sendAndReceiveRef.current(packet).then((res) => {
        updateModuleState(res, setBatteryLevel, setBhoOn);
      });
    }
  }, [connected]);

  const toggleBatteryChargeLimit = () => {
    let packet = new SetBatteryPacket(bhoToByte(!bhoOn, batteryLevel));
    sendAndReceive(packet).then((res) => {
      updateModuleState(res, setBatteryLevel, setBhoOn);
    });
  };

  const updateBatteryChargeLimit = (event) => {
    const newLevel = event.target.value;
    let packet = new SetBatteryPacket(bhoToByte(bhoOn, newLevel));
    sendAndReceive(packet).then((res) => {
      updateModuleState(res, setBatteryLevel, setBhoOn);
    });
  };

  return (
    <div className="pb-7">
      {connected && (
        <div className="p-4 border-2 border-black">
          <div className="flex items-center justify-between">
            <ToggleButton
              isChecked={bhoOn}
              onToggle={toggleBatteryChargeLimit}
              label="Battery Charge Limit"
            />
          </div>
          <Slider
            min="50"
            max="80"
            step="5"
            value={batteryLevel}
            onMouseUp={updateBatteryChargeLimit}
            disabled={!bhoOn}
            label="Charge Limit"
            setVal={setBatteryLevel}
          />
        </div>
      )}
    </div>
  );
};

export default BatteryChargeLimitModule;
