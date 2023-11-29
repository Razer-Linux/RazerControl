"use client";

import React, { useContext, useEffect } from "react";
import { HIDConnectionContext } from "../../context/HIDConnectionContext";
import { HIDDevice } from "../../services/HIDDevice";
import { GetKeybLightingModePacket } from "@/services/RazerPacket";

// TODO: make this external so additions don't require changing code
const acceptableDevices = [
  { vendorId: 0x1532, productId: 0x0224 },
  { vendorId: 0x1532, productId: 0x0233 },
  { vendorId: 0x1532, productId: 0x023b },
  { vendorId: 0x1532, productId: 0x0240 },
  { vendorId: 0x1532, productId: 0x0246 },
  { vendorId: 0x1532, productId: 0x023a },
  { vendorId: 0x1532, productId: 0x0245 },
  { vendorId: 0x1532, productId: 0x0255 },
  { vendorId: 0x1532, productId: 0x0253 },
  { vendorId: 0x1532, productId: 0x022d },
  { vendorId: 0x1532, productId: 0x0232 },
  { vendorId: 0x1532, productId: 0x0239 },
  { vendorId: 0x1532, productId: 0x024a },
  { vendorId: 0x1532, productId: 0x0252 },
  { vendorId: 0x1532, productId: 0x0256 },
  { vendorId: 0x1532, productId: 0x0234 },
  { vendorId: 0x1532, productId: 0x022f },
  { vendorId: 0x1532, productId: 0x0225 },
  { vendorId: 0x1532, productId: 0x0210 },
  { vendorId: 0x1532, productId: 0x020f },
  { vendorId: 0x1532, productId: 0x026a },
  { vendorId: 0x1532, productId: 0x026f },
  { vendorId: 0x1532, productId: 0x0270 },
  { vendorId: 0x1532, productId: 0x0276 },
  { vendorId: 0x1532, productId: 0x026d },
  { vendorId: 0x1532, productId: 0x027a },
  { vendorId: 0x1532, productId: 0x028a },
  { vendorId: 0x1532, productId: 0x028b },
  { vendorId: 0x1532, productId: 0x028c },
  { vendorId: 0x1532, productId: 0x0259 },
  { vendorId: 0x1532, productId: 0x029f },
  { vendorId: 0x1532, productId: 0x029d },
];

const HIDConnector = () => {
  const { device, connected, setDevice, setConnected } =
    useContext(HIDConnectionContext);

  useEffect(() => {
    return () => {
      if (device) {
        device.close();
      }
    };
  });

  const connectHID = async () => {
    try {
      const devices = await navigator.hid.requestDevice({
        filters: acceptableDevices,
      });
      if (devices.length === 0) {
        return;
      }

      console.log(devices);
      for (const i in devices) {
        const selectedDevice = devices[i];
        try {
          await selectedDevice.open();
          let testPacket = new GetKeybLightingModePacket();
      
          try {
            await selectedDevice.sendFeatureReport(testPacket.bytes[0], testPacket.bytes.slice(1));
          } catch (packetError) {
            console.log("failed to send packet to device: ", i);
            // Continue to the next device since an error occurred
            continue;
          }

          console.log("successfully sent packet to device: ", i, " ... connecting");
          const device = new HIDDevice(selectedDevice);
          setDevice(device);
          setConnected(true);
          break;
        } catch (openError) {
          console.error("Error opening device:", openError);
          continue;
        }

      }
    } catch (error) {
      console.error("An error occurred: ", error);
    }
  };

  return (
    <div>
      {!connected && (
        <div className="flex h-screen justify-center items-center">
          <button
            className="hover:bg-green-400 ring ring-black font-bold py-2 px-4"
            onClick={connectHID}
          >
            <h1 className="text-xl">Connect +</h1>
          </button>
        </div>
      )}
    </div>
  );
};

export default HIDConnector;
