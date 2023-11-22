"use client";

import React, { useContext, useEffect, useState } from "react";
import { useDeviceQueue } from "../../hooks/deviceQueue";
import { HIDConnectionContext } from "../../context/HIDConnectionContext";
import {
  DEVICE_CPU,
  DEVICE_GPU,
  GetCustomPerformancePacket,
  SetCustomPerformancePacket,
  SetPerformancePacket,
} from "../../services/RazerPacket";

const argToPerf = {
  0x00: "Low",
  0x01: "Medium",
  0x02: "High",
  0x03: "Boost",
};

const PerformanceModeModule = () => {
  const { connected } = useContext(HIDConnectionContext);
  const { sendAndReceive } = useDeviceQueue();
  const [cpuSetting, setCpuSetting] = useState("Medium"); // low, medium, high, boost
  const [gpuSetting, setGpuSetting] = useState("Medium"); // low, medium, high

  const powerModes = {
    cpu: ["Low", "Medium", "High", "Boost"],
    gpu: ["Low", "Medium", "High"],
  };

  // TODO: actually implement ability to switch to silent/balanced modes instead of forcing this
  const forceCustomPwr = () => {
    let perfModePacket = new SetPerformancePacket();
    sendAndReceive(perfModePacket);
  };

  useEffect(() => {
    if (connected) {
      let cpuPacket = new GetCustomPerformancePacket(DEVICE_CPU);
      sendAndReceive(cpuPacket).then((res) => {
        setCpuSetting(argToPerf[res[10]]);
      });

      let gpuPacket = new GetCustomPerformancePacket(DEVICE_GPU);
      sendAndReceive(gpuPacket).then((res) => {
        setGpuSetting(argToPerf[res[10]]);
      });
    }
  });

  const handleCpuSettingChange = (setting) => {
    forceCustomPwr();
    let packet = new SetCustomPerformancePacket(DEVICE_CPU, setting);

    sendAndReceive(packet).then((res) => {
      setCpuSetting(argToPerf[res[10]]);
    });
  };

  const handleGpuSettingChange = (setting) => {
    forceCustomPwr();
    let packet = new SetCustomPerformancePacket(DEVICE_GPU, setting);

    sendAndReceive(packet).then((res) => {
      setGpuSetting(argToPerf[res[10]]);
    });
  };

  return (
    <>
      {connected && (
        <div className="break-inside pb-7">
          <div className="p-4 border-2 border-black">
            <p className="pb-4">Performance Modes</p>
            <div className="flex justify-start mb-2">
              <div className="p-2">CPU:</div>
              {powerModes.cpu.map((level) => (
                <button
                  key={level}
                  onClick={() => handleCpuSettingChange(level)}
                  className={`mr-2 p-2 ${
                    cpuSetting === level ? "bg-green-400" : "bg-gray-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-start">
              <div className="p-2">GPU:</div>
              {powerModes.gpu.map((level) => (
                <button
                  key={level}
                  onClick={() => handleGpuSettingChange(level)}
                  className={`mr-2 p-2 ${
                    gpuSetting === level ? "bg-green-400" : "bg-gray-200"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceModeModule;
