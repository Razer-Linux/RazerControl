"use client";

import React, { useContext, useEffect, useState, useRef } from "react";
import { useDeviceQueue } from "../../hooks/deviceQueue";
import { HIDConnectionContext } from "../../context/HIDConnectionContext";
import {
  GetFanStatusPacket,
  GetFanSpeedPacket,
  SetPerformancePacket,
  SetFanSpeedPacket,
  DEVICE_CPU,
  DEVICE_GPU,
} from "../../services/RazerPacket";
import ToggleButton from "../common/ToggleButton";
import Slider from "../common/Slider";

const FanModule = () => {
  const { connected } = useContext(HIDConnectionContext);
  const { sendAndReceive } = useDeviceQueue();
  const [customRpmToggled, setCustomRpmToggle] = useState(false); // low, medium, high, boost
  const [customRpm, setCustomRpm] = useState(0); // low, medium, high

  const sendAndReceiveRef = useRef(sendAndReceive);
  sendAndReceiveRef.current = sendAndReceive;

  useEffect(() => {
    if (connected) {
      // check if custom rpm is enabled on cpu fan
      let fanStatusPacket = new GetFanStatusPacket();
      sendAndReceiveRef.current(fanStatusPacket).then((res) => {
        setCustomRpmToggle(res[11] === 1);
      });

      let fanSpeedPacket = new GetFanSpeedPacket();
      sendAndReceiveRef.current(fanSpeedPacket).then((res) => {
        setCustomRpm(res[10] * 100);
      });
    }
  }, [connected]);

  const toggleCustomRpm = () => {
    let pwrPacket = new SetPerformancePacket();

    // we're turning it on if it was off
    if (!customRpmToggled) {
      pwrPacket.setArg(3, 0x01);
    }

    sendAndReceive(pwrPacket).then((res) => {
      setCustomRpmToggle(res[11] === 1);
    });
  };

  const updateCustomRpm = (event) => {
    const newRpm = event.target.value;

    let cpuRpmPacket = new SetFanSpeedPacket(DEVICE_CPU, newRpm / 100);
    sendAndReceive(cpuRpmPacket);

    let gpuRpmPacket = new SetFanSpeedPacket(DEVICE_GPU, newRpm / 100);
    sendAndReceive(gpuRpmPacket).then((res) => {
      setCustomRpm(res[10] * 100);
    });
  };

  return (
    <>
      {connected && (
        <div className="break-inside pb-7">
          <div className="p-4 border-2 border-black">
            <ToggleButton
              isChecked={customRpmToggled}
              onToggle={toggleCustomRpm}
              label="Custom Fan RPM"
            />
            <Slider
              min="100"
              max="5400"
              step="100"
              value={customRpm}
              onMouseUp={updateCustomRpm}
              disabled={!customRpmToggled}
              label="RPM"
              setVal={setCustomRpm}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FanModule;
