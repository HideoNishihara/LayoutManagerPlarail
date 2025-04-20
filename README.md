# Layout Manager Plarail

An extension for controlling and monitoring Plarail trains and sensors using micro:bit and infrared communication.

📄 English version here (README.md)

## Main Features

- Send infrared commands to Plarail trains
- Receive train signals from sensor units
- Specify train ID (0–1) individually
- Set train direction and speed (stop + 7 levels)
- Monitor battery voltage (warning via red LED)
- Blocks available in both English and Japanese

## Available Blocks

### 🟦 Train Control

- Send command to the train  
  Controls the direction and speed of a specified train.

- Reverse direction  
  Reverses the direction of the specified train.

- Stop all trains  
  Immediately stops all trains.

### 🟪 Sensor Events

- Receive sensor info by specifying sensor ID  
  Executes an action when a sensor detects the arrival or departure of a train.

## Hardware Configuration

- IR Transmission: P1 → IR LED  
- IR Reception: P16 ← IR receiver module (e.g., SPS-440)  
- Battery Voltage Monitoring: P2 (analog input via 1/2 voltage divider)  
- LED Connection:  
  - Red LED (P14): lights up during transmission or low battery warning  
  - Blue LED (P15): lights up when IR signal is received

## More Information

The project page and detailed documentation are available here:  
https://github.com/yourname/layout-manager-plarail
