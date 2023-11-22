"use client";

import React, { useContext, useEffect, useState } from "react";
import { useDeviceQueue } from "../../hooks/deviceQueue";
import { HIDConnectionContext } from "../../context/HIDConnectionContext";
import {
  GetLogoLightingStatusPacket,
  SetLogoLightingStatusPacket,
  GetLogoLightingModePacket,
  SetLogoLightingModePacket,
} from "../../services/RazerPacket";
import ToggleButton from "../common/ToggleButton";

const logoSettings = ["Static", "Breathing"];

const LogoLEDModule = () => {
  const { connected } = useContext(HIDConnectionContext);
  const { sendAndReceive } = useDeviceQueue();
  const [logoSetting, setLogoSetting] = useState("None");
  const [logoToggled, setLogoToggled] = useState(false);

  useEffect(() => {
    if (connected) {
      let lightingStatusPacket = new GetLogoLightingStatusPacket();
      sendAndReceive(lightingStatusPacket).then((res) => {
        let on = res[10];
        if (on === 1) {
          setLogoToggled(true);
          let lightingModePacket = GetLogoLightingModePacket();
          sendAndReceive(lightingModePacket).then((res) => {
            setLogoSetting(logoSettings[Math.max(0, res[10] - 1)]);
          });
        }
      });
    }
  });

  const toggleLogo = () => {
    const logoOn = !logoToggled;

    let packet = new SetLogoLightingStatusPacket(logoOn);
    sendAndReceive(packet).then((res) => {
      setLogoToggled(res[10] === 1);
      if (res[10] === 0) {
        setLogoSetting("None");
      } else {
        setLogoSetting(logoSettings[Math.max(0, res[10] - 1)]);
      }
    });
  };

  const handleLEDSettingChange = (setting) => {
    let packet = new SetLogoLightingModePacket(setting);
    sendAndReceive(packet).then((res) => {
      setLogoSetting(logoSettings[Math.max(0, res[10] - 1)]);
    });
  };

  return (
    <>
      {connected && (
        <div className="break-inside pb-7">
          <div className="p-4 border-2 border-black">
            <ToggleButton
              isChecked={logoToggled}
              onToggle={toggleLogo}
              label="Logo LED"
            />
            <div className="flex justify-start mt-4">
              {logoSettings.map((setting) => (
                <button
                  key={setting}
                  disabled={!logoToggled}
                  onClick={() => handleLEDSettingChange(setting)}
                  className={`mr-2 p-2 ${
                    logoSetting === setting ? "bg-green-400" : "bg-gray-200"
                  } ${!logoToggled ? "text-gray-500" : "text-black"}`}
                >
                  {setting}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoLEDModule;
