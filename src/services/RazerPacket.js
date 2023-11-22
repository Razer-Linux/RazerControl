const COMMAND_CLASS_BATTERY = 0x07;
const COMMAND_CLASS_PERFORMANCE = 0x0d;
const COMMAND_CLASS_LIGHTING = 0x03;

const COMMAND_ID_SET_BATTERY_CHARGE_LIMIT = 0x12;
const COMMAND_ID_GET_BATTERY_CHARGE_LIMIT = 0x92;
const COMMAND_ID_SET_PERFORMANCE_MODE = 0x02;
const COMMAND_ID_GET_CUSTOM_PERFORMANCE = 0x87;
const COMMAND_ID_SET_CUSTOM_PERFORMANCE = 0x07;
const COMMAND_ID_GET_FAN_STATUS = 0x82;
const COMMAND_ID_GET_FAN_SPEED = 0x81;
const COMMAND_ID_SET_FAN_SPEED = 0x01;
const COMMAND_ID_GET_LOGO_LIGHTING_STATUS = 0x80;
const COMMAND_ID_SET_LOGO_LIGHTING_STATUS = 0x00;
const COMMAND_ID_GET_LOGO_LIGHTING_MODE = 0x82;
const COMMAND_ID_SET_LOGO_LIGHTING_MODE = 0x02;
const COMMAND_ID_GET_KEYB_LIGHTING_MODE = 0x8a;
const COMMAND_ID_SET_KEYB_LIGHTING_MODE = 0x0a;

const DATA_SIZE_1 = 0x01;
const DATA_SIZE_3 = 0x03;
const DATA_SIZE_4 = 0x04;
const DATA_SIZE_80 = 0x50;

const PERFORMANCE_ARG_CPU = 0x01;
const PERFORMANCE_ARG_GPU = 0x02;
const PERFORMANCE_MODE_CUSTOM = 0x04;

export const DEVICE_GPU = "GPU";
export const DEVICE_CPU = "CPU";

export class RazerPacket {
  constructor(commandClass, commandId, dataSize) {
    this.bytes = new Uint8Array(91);
    this.bytes[0] = 0x00;
    this.bytes[1] = 0x00;
    this.bytes[2] = 0x1f;
    this.bytes[6] = dataSize;
    this.bytes[7] = commandClass;
    this.bytes[8] = commandId;
  }

  get dataSize() {
    return this.bytes[6];
  }

  set dataSize(b) {
    this.bytes[6] = b;
  }

  get commandClass() {
    return this.bytes[7];
  }

  set commandClass(b) {
    this.bytes[7] = b;
  }

  get commandId() {
    return this.bytes[8];
  }

  set commandId(b) {
    this.bytes[8] = b;
  }

  setArg(argIndex, b) {
    this.bytes[9 + argIndex] = b;
  }

  // TODO: actually calculate and add crc to packet
  async sendToDevice(device) {
    const reportId = this.bytes[0];
    const report = this.bytes.slice(1);

    try {
      await device.sendFeatureReport(reportId, report);
      const recdReport = await device.receiveFeatureReport(0);
      const recdBuffer = new Uint8Array(recdReport.buffer);
      return recdBuffer;
    } catch (error) {
      console.error("Error during HID feature report communication:", error);
      return null;
    }
  }
}

export class GetBatteryPacket extends RazerPacket {
  constructor() {
    super(
      COMMAND_CLASS_BATTERY,
      COMMAND_ID_GET_BATTERY_CHARGE_LIMIT,
      DATA_SIZE_1
    );
  }
}

export class SetBatteryPacket extends RazerPacket {
  constructor(bhoByte) {
    super(
      COMMAND_CLASS_BATTERY,
      COMMAND_ID_SET_BATTERY_CHARGE_LIMIT,
      DATA_SIZE_1
    );

    this.setArg(0, bhoByte);
  }
}

export class SetPerformancePacket extends RazerPacket {
  constructor() {
    super(
      COMMAND_CLASS_PERFORMANCE,
      COMMAND_ID_SET_PERFORMANCE_MODE,
      DATA_SIZE_4
    );

    this.setArg(1, PERFORMANCE_ARG_CPU);
    this.setArg(2, PERFORMANCE_MODE_CUSTOM);
  }
}

export class GetCustomPerformancePacket extends RazerPacket {
  constructor(device) {
    super(
      COMMAND_CLASS_PERFORMANCE,
      COMMAND_ID_GET_CUSTOM_PERFORMANCE,
      DATA_SIZE_3
    );

    this.setArg(
      1,
      device === DEVICE_GPU ? PERFORMANCE_ARG_GPU : PERFORMANCE_ARG_CPU
    );
  }
}

export class SetCustomPerformancePacket extends RazerPacket {
  perfToArg = {
    Low: 0x00,
    Medium: 0x01,
    High: 0x02,
    Boost: 0x03,
  };

  constructor(device, perfMode) {
    super(
      COMMAND_CLASS_PERFORMANCE,
      COMMAND_ID_SET_CUSTOM_PERFORMANCE,
      DATA_SIZE_3
    );

    this.setArg(
      1,
      device === DEVICE_GPU ? PERFORMANCE_ARG_GPU : PERFORMANCE_ARG_CPU
    );
    this.setArg(2, this.perfToArg[perfMode]);
  }
}

export class GetLogoLightingStatusPacket extends RazerPacket {
  constructor() {
    super(
      COMMAND_CLASS_LIGHTING,
      COMMAND_ID_GET_LOGO_LIGHTING_STATUS,
      DATA_SIZE_3
    );

    this.setArg(0, 0x01);
    this.setArg(1, 0x04);
  }
}

export class SetLogoLightingStatusPacket extends RazerPacket {
  constructor(logoOn) {
    super(
      COMMAND_CLASS_LIGHTING,
      COMMAND_ID_SET_LOGO_LIGHTING_STATUS,
      DATA_SIZE_3
    );

    this.setArg(0, 0x01);
    this.setArg(1, 0x04);

    if (logoOn) {
      this.setArg(2, 0x01);
    }
  }
}

export class GetLogoLightingModePacket extends RazerPacket {
  constructor() {
    super(
      COMMAND_CLASS_LIGHTING,
      COMMAND_ID_GET_LOGO_LIGHTING_MODE,
      DATA_SIZE_3
    );

    this.setArg(0, 0x01);
    this.setArg(1, 0x04);
  }
}

export class SetLogoLightingModePacket extends RazerPacket {
  settingToArg = {
    "Static": 0x00,
    "Breathing": 0x02
  }

  constructor(setting) {
    super(
      COMMAND_CLASS_LIGHTING,
      COMMAND_ID_SET_LOGO_LIGHTING_MODE,
      DATA_SIZE_3
    );

    this.setArg(0, 0x01);
    this.setArg(1, 0x04);
    this.setArg(2, this.settingToArg[setting])
  }
}

export class GetFanStatusPacket extends RazerPacket {
  constructor() {
    super(
      COMMAND_CLASS_PERFORMANCE,
      COMMAND_ID_GET_FAN_STATUS,
      DATA_SIZE_4
    );
    this.setArg(1, PERFORMANCE_ARG_CPU);
  }
}

export class GetFanSpeedPacket extends RazerPacket {
  constructor() {
    super(
      COMMAND_CLASS_PERFORMANCE,
      COMMAND_ID_GET_FAN_SPEED,
      DATA_SIZE_3
    );
    this.setArg(1, PERFORMANCE_ARG_CPU);
  }
}

export class SetFanSpeedPacket extends RazerPacket {
  constructor(device, rpm) {
    super(
      COMMAND_CLASS_PERFORMANCE,
      COMMAND_ID_SET_FAN_SPEED,
      DATA_SIZE_3
    );
    this.setArg(1, device === DEVICE_GPU ? PERFORMANCE_ARG_GPU : PERFORMANCE_ARG_CPU);
    this.setArg(2, rpm);
  }
}

export class GetKeybLightingModePacket extends RazerPacket {
  constructor() {
    super(
      COMMAND_CLASS_LIGHTING,
      COMMAND_ID_GET_KEYB_LIGHTING_MODE,
      DATA_SIZE_80
    );
  }
}

export class SetKeybLightingModePacket extends RazerPacket {
  constructor(modeArg) {
    super(
      COMMAND_CLASS_LIGHTING,
      COMMAND_ID_SET_KEYB_LIGHTING_MODE,
      DATA_SIZE_80
    );

    this.setArg(0, modeArg)
  }
}