import "./App.css";
import HIDConnector from "./components/connector/HIDConnector";
import Grid from "./components/grid/Grid";
import PerformanceModeModule from "./components/performanceMode/PerformanceMode";
import BatteryChargeLimitModule from "./components/batteryChargeLimit/BatteryChargeLimit";
import LogoLEDModule from "./components/logoLED/LogoLED";
import TopBar from "./components/topBar/TopBar";
import { HIDConnectionProvider } from "./context/HIDConnectionContext";
import FanModeModule from "./components/fanMode/FanMode";
import KeybLightingModule from "./components/keybLighting/KeybLighting";

function App() {
  return (
    <div className="font-mono">
      <HIDConnectionProvider>
        <TopBar />
        <HIDConnector />
        <Grid>
          <BatteryChargeLimitModule />
          <PerformanceModeModule />
          <LogoLEDModule />
          <FanModeModule />
          <KeybLightingModule />
        </Grid>
      </HIDConnectionProvider>
    </div>
  );
}

export default App;
