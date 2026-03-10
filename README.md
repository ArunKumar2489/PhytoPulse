HEAD
# 🌱 PhytoPulse

**The Ultimate Plant Intelligence Platform**

PhytoPulse is an advanced electrophysiology analysis and real-time IoT monitoring platform that uses AI-driven cross-reference diagnostics to detect silent crop stress *before* visible symptoms appear.

---

## 🚀 Features

*   **Real-Time IoT Telemetry**: Instantly monitors Plant Bio-potential (Voltage), Soil Moisture, and Air Temperature.
*   **High-Frequency Waveforms**: Live rendering of AD8232 bio-potential signals for micro-voltage electrophysiology analysis.
*   **Cross-Reference Diagnostics**: Simultaneous multi-field analysis to detect complex stress conditions like Anoxic Stress, Severe Dehydration, and Resource Depletion.
*   **AI Plant Doctor**: Embedded diagnostic engine that triggers automated Treatment Protocols tailored specifically to the live crop data.

---

## 🏗️ System Architecture

PhytoPulse is designed with a robust architecture that cleanly separates the user-facing visualization (Frontend) from the IoT data ingestion and processing layer (Backend). 

### 🖥️ Frontend (Client Interface)
The frontend is a highly responsive, modern web application built with HTML5, vanilla JavaScript, and TailwindCSS for a premium glassmorphism aesthetic.

*   **`index.html`**: The main landing portal introducing the platform's capabilities.
*   **`dashboard.html`**: The primary operational dashboard rendering live charts (via Chart.js) and real-time stress alerts.
*   **`encyclopedia.html`**: A comprehensive reference database of plant stress conditions and standardized treatment protocols.
*   **State Management (`js/store.js`)**: A centralized data store that holds current telemetry values and plant health status, ensuring UI components update reactively.
*   **Visualization Engine (`js/chart-engine.js`)**: Handles the high-performance rendering of bio-voltage waveforms.

### ⚙️ Backend (IoT Data & Analytics Engine)
The backend infrastructure is responsible for gathering raw analog signals from the physical world, digitizing them, and making them accessible.

*   **Hardware Layer**: Physical sensors attached to the crops (e.g., AD8232 for micro-voltage, capacitive moisture sensors, DHT thermistors) transmitting data to a microcontroller (like ESP32).
*   **Data Aggregation**: The microcontroller pushes telemetry to an IoT cloud platform (such as ThingSpeak) acting as the primary backend data lake.
*   **Data Processing Layer (`js/api.js`)**: Acts as the intelligent bridge. It fetches live data streams from the IoT backend API. It also includes an advanced simulation engine to generate realistic sensor data for demonstration and testing when physical hardware is offline.
*   **Diagnostic Engine**: Evaluates the incoming data stream in real-time, calculating voltage fluctuations and resource trends over time to deduce the biological state of the plant.

### 🔄 How Frontend and Backend Communicate
1.  **Continuous Polling**: The frontend's `api.js` engine operates on a recurring loop, sending HTTP requests to the backend IoT REST API (e.g., Thingspeak feeds).
2.  **Data Parsing**: Raw data (Field 1: Voltage, Field 2: Temp, Field 3: Moisture) is ingested, parsed, and validated.
3.  **State Dispatch**: The parsed data is fed into the Diagnostic Engine to determine if the plant is `NOMINAL`, `WARNING`, or `CRITICAL`.
4.  **UI Reactivity**: The updated state is pushed to the central `store.js`, which then broadcasts events to update the dashboard charts, AI Doctor overlays, and status indicators instantly.

---

## 🛠️ Installation & Setup

### Prerequisites
*   A modern web browser.
*   (Optional but recommended) A local web server like VS Code Live Server to prevent CORS issues when fetching data.

### Running Locally
1.  Clone this repository or download the source code.
2.  Navigate to the project root directory.
3.  Serve the directory using a local web server (e.g., via `npx serve` or Python's `python -m http.server`).
4.  Open `index.html` in your browser.

### Connecting Hardware (Backend Integration)
To connect real hardware instead of using the built-in simulator:
1.  Open `js/api.js`.
2.  Locate the `IoTAPI` class constructor.
3.  Replace `INSERT_ID` and `INSERT_KEY` with your actual ThingSpeak Channel ID and Read API Key.
4.  Uncomment the live fetch block inside the `fetchData()` method and remove/comment out the `this.simulateDataPull()` line.

---

## 📄 License
© 2026 PhytoPulse Platforms. All rights reserved.

# PhytoPulse
PhytoPulse: An end-to-end IoT platform for real-time plant electrophysiology monitoring and automated disease diagnosis using ThingSpeak data.
d91783056d9abf4fadc1c5048e5107e2acdd5d6f
