"use client";

import React, { useContext, useEffect, useState, useRef } from "react";
import { useDeviceQueue } from "../../hooks/deviceQueue";
import { HIDConnectionContext } from "../../context/HIDConnectionContext";
import {
  GetKeybLightingModePacket,
  RazerPacket,
  SetKeybLightingModePacket,
} from "../../services/RazerPacket";
import ToggleButton from "../common/ToggleButton";
import Slider from "../common/Slider";

// TODO: fix breathing (0x03)
const modeArgs = {
  Off: 0x00,
  Wave: 0x01,
  Reactive: 0x02,
  Spectrum: 0x04,
  Static: 0x06,
  Starlight: 0x19,
  0x00: "Off",
  0x01: "Wave",
  0x02: "Reactive",
  0x04: "Spectrum",
  0x06: "Static",
  0x07: "Starlight",
  0x19: "Starlight",
};

// TODO: support dual color and random mode for starlight
const modeFeatures = {
  Off: {
    Direction: false,
    Speed: false,
    RGB: false,
  },
  Wave: {
    Direction: true,
    Speed: false,
    RGB: false,
  },
  Reactive: {
    Direction: false,
    Speed: true,
    RGB: true,
  },
  Spectrum: {
    Direction: false,
    Speed: false,
    RGB: false,
  },
  Static: {
    Direction: false,
    Speed: false,
    RGB: true,
  },
  Starlight: {
    Direction: false,
    Speed: true,
    RGB: true,
  },
};

const modes = ["Wave", "Reactive", "Spectrum", "Static", "Starlight"];

const hexToRgbArray = (hex) => {
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return [r, g, b];
};

const rgbArrayToHex = (rgbArray) => {
  const hex = rgbArray
    .map((num) => {
      return num.toString(16).padStart(2, "0");
    })
    .join("");

  return `#${hex}`;
};

const KeybLightingModule = () => {
  const { connected } = useContext(HIDConnectionContext);
  const { sendAndReceive } = useDeviceQueue();

  const [keybLightingToggled, toggleKeybLighting] = useState(false);
  const [mode, setMode] = useState("off");
  const [direction, setDirection] = useState("Left");
  const [speed, setSpeed] = useState(1);
  const [rgb, setRgb] = useState("#ffffff");

  const sendAndReceiveRef = useRef(sendAndReceive);
  sendAndReceiveRef.current = sendAndReceive;

  useEffect(() => {
    if (connected) {
      let packet = new GetKeybLightingModePacket();
      sendAndReceiveRef.current(packet).then((res) => {
        const currMode = res[8];
        setMode(modeArgs[currMode]);
        if (currMode) {
          toggleKeybLighting(true);
        }

        switch (modeArgs[currMode]) {
          case "Starlight":
            setSpeed(res[10]);
            let rgbArrStarlight = [res[11], res[12], res[13]];
            setRgb(rgbArrayToHex(rgbArrStarlight));
            break;
          case "Reactive":
            setSpeed(res[9]);
            let rgbArrReactive = [res[10], res[11], res[12]];
            setRgb(rgbArrayToHex(rgbArrReactive));
            break;
          case "Static":
            let rgbArrStatic = [res[9], res[10], res[11]];
            setRgb(rgbArrayToHex(rgbArrStatic));
            break;
          default:
            break;
        }
      });
    }
  }, [connected]);

  const updateKeybLightingStatus = () => {
    if (keybLightingToggled) {
      sendKeybUpdate("Off");
    } else {
      sendKeybUpdate("Spectrum");
    }
  };

  const updateSpeed = (speed) => {
    modeFeatures[mode].Speed = speed;
    setSpeed(speed);
  };

  const updateDirection = (d) => {
    setDirection(d);
    sendKeybUpdate(mode);
  };

  const updateRgb = (event) => {
    setRgb(event.target.value);
    sendKeybUpdate(mode);
  };

  const sendKeybUpdate = (mode) => {
    let rgbArr = hexToRgbArray(rgb);

    let packet = new SetKeybLightingModePacket(modeArgs[mode]);
    switch (mode) {
      case "Wave":
        packet.setArg(1, direction === "Left" ? 0x01 : 0x02);
        break;
      case "Reactive":
        packet.setArg(1, speed);
        packet.setArg(2, rgbArr[0]);
        packet.setArg(3, rgbArr[1]);
        packet.setArg(4, rgbArr[2]);
        break;
      case "Static":
        packet.setArg(1, rgbArr[0]);
        packet.setArg(2, rgbArr[1]);
        packet.setArg(3, rgbArr[2]);
        break;
      case "Starlight":
        packet.setArg(1, 0x01);
        packet.setArg(2, speed);
        packet.setArg(3, rgbArr[0]);
        packet.setArg(4, rgbArr[1]);
        packet.setArg(5, rgbArr[2]);
        break;
      default:
        break;
    }

    sendAndReceive(packet).then((res) => {
      const currMode = res[8];
      setMode(modeArgs[currMode]);
      if (currMode) {
        toggleKeybLighting(true);
      } else {
        toggleKeybLighting(false);
      }
    });
  };

  return (
    <>
      {connected && (
        <div className="break-inside pb-7">
          <div className="p-4 border-2 border-black">
            <ToggleButton
              isChecked={keybLightingToggled}
              onToggle={updateKeybLightingStatus}
              label="Keyboard Lighting"
            />
            <div className="flex justify-start mt-4 mb-2">
              {modes.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    sendKeybUpdate(m);
                  }}
                  className={`mr-2 p-2 ${
                    m === mode ? "bg-green-400" : "bg-gray-200"
                  } ${!keybLightingToggled ? "text-gray-500" : "text-black"}
              }`}
                >
                  {m}
                </button>
              ))}
            </div>
            {mode !== "off" && connected && (
              <div>
                <div className="flex justify-start mt-4 mb-2">
                  <Slider
                    min="1"
                    max="15"
                    step="1"
                    value={speed}
                    onMouseUp={() => {
                      sendKeybUpdate(mode);
                    }}
                    disabled={!modeFeatures[mode].Speed}
                    label="Speed (s)"
                    setVal={updateSpeed}
                  />
                </div>
                <div className="flex justify-start mt-4 mb-2">
                  <p
                    className={`p-0.5 ${
                      !modeFeatures[mode].RGB ? "text-gray-500" : "text-black"
                    }`}
                  >
                    RGB:
                  </p>
                  <input
                    className="rounded-md"
                    type="color"
                    value={rgb}
                    onChange={updateRgb}
                    disabled={!modeFeatures[mode].RGB}
                  />
                </div>
                <div className="flex justify-start mt-4 mb-2">
                  <p
                    className={`p-2 ${
                      !modeFeatures[mode].Direction
                        ? "text-gray-500"
                        : "text-black"
                    }`}
                  >
                    Direction:
                  </p>
                  {["Left", "Right"].map((d) => (
                    <button
                      key={d}
                      onClick={() => updateDirection(d)}
                      className={`mr-2 p-2 ${
                        modeFeatures[mode].Direction && d === direction
                          ? "bg-green-400"
                          : "bg-gray-200"
                      } ${
                        !modeFeatures[mode].Direction
                          ? "text-gray-500"
                          : "text-black"
                      }
                }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default KeybLightingModule;
