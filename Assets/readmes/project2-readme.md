# Height Measurement Device

An Arduino-based ultrasonic measurement system designed for accurate height detection, featuring custom 3D-printed housing and real-time display capabilities.

---

## Overview

This project combines hardware prototyping with software development to create a functional height measurement device. Using ultrasonic sensor technology and Arduino microcontroller programming, the system provides precise distance measurements displayed on an integrated screen.

---

## Components

- Arduino Uno microcontroller
- HC-SR04 ultrasonic distance sensor
- LCD/OLED display module
- Custom 3D-printed enclosure
- Jumper wires and breadboard
- USB power supply

---

## Features

- **Real-time measurement**: Continuous distance tracking with sub-centimeter accuracy
- **Digital display**: Clear output showing measurements in metric units
- **Portable design**: Compact form factor with integrated battery option
- **Custom housing**: 3D-printed case designed specifically for component layout

---

## Technical Implementation

The device operates by emitting ultrasonic sound waves and calculating distance based on the time delay of the echo return. The Arduino processes this data and converts it to readable measurements displayed on the screen.

### Key specifications:
- Measurement range: 2cm - 400cm
- Accuracy: ±0.3cm
- Update rate: ~10Hz
- Operating voltage: 5V DC

---

## Development Process

1. **Circuit design**  
   - Prototyped on breadboard to test component compatibility
   - Created schematic diagram using Fritzing software
   - Validated sensor accuracy through multiple test iterations

2. **Programming**  
   - Developed Arduino sketch for sensor control and data processing
   - Implemented display driver for LCD/OLED output
   - Added calibration routines for improved accuracy

3. **Enclosure design**  
   - Modeled custom case in CAD software
   - Integrated mounting points for all electronic components
   - Designed sensor window for optimal ultrasonic transmission
   - 3D printed final prototype

4. **Assembly and testing**  
   - Soldered permanent connections
   - Mounted components in printed housing
   - Conducted field tests across various distances and surfaces

---

## Applications

- Personal height tracking
- DIY robotics obstacle detection
- Educational demonstrations of ultrasonic technology
- Home automation distance sensing

---

## Files Included

- Arduino source code (`.ino`)
- Circuit schematic (Fritzing `.fzz`)
- 3D model files (`.stl`)

---

## Future Improvements

- Bluetooth connectivity for wireless data logging
- Multiple sensor array for wider coverage
- Battery percentage indicator
- Temperature compensation for improved accuracy

---

## Notes

This project demonstrates integration of hardware and software development skills, from PCB design to embedded programming and mechanical prototyping.
