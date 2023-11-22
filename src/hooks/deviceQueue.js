import { useContext } from "react";
import { HIDConnectionContext } from "../context/HIDConnectionContext";
import { useErrorHandler } from "./errorHandler";

export const useDeviceQueue = () => {
  const { device } = useContext(HIDConnectionContext);
  const { reportError } = useErrorHandler();  // Assuming this is a custom hook to handle global errors

  const sendAndReceive = async (packet) => {
    
    // Returning a Promise to handle the asynchronous operation
    return new Promise((resolve, reject) => {
      const operation = async (device) => {
        try {
          const response = await packet.sendToDevice(device);
          resolve(response);
        } catch (error) {
          reportError(error);  // Report the error to a global handler
          reject(error);
        }
      };

      // Enque the operation in the device's queue for execution
      device.enqueue(operation);
    });
  };

  return { sendAndReceive };
};
