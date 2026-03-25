# 🌱 PhytoPulse

**The Ultimate Plant Intelligence Platform**

PhytoPulse is an advanced electrophysiology analysis and real-time IoT monitoring platform that uses AI-driven cross-reference diagnostics to detect silent crop stress *before* visible symptoms appear.

---

## 🚀 Features

*   **Real-Time IoT Telemetry**: Instantly monitors Plant Bio-potential (Voltage), Soil Moisture, and Air Temperature, complete with real-time sensor status indicators.
*   **High-Frequency Waveforms**: Live rendering of AD8232 bio-potential signals for micro-voltage electrophysiology analysis.
*   **Cross-Reference Diagnostics**: Simultaneous multi-field analysis to detect complex stress conditions like Anoxic Stress, Severe Dehydration, and Resource Depletion.
*   **Advanced Disease Diagnostics**: Embedded diagnostic engine calculating plant status, disease type, and confidence levels, displayed via dynamic diagnostic cards and progress bars.
*   **Environmental Impact Analysis**: Correlation analysis module (scatter plots) to assess relationships between environmental factors and plant electrical signals using Pearson correlation coefficients.
*   **Event Marker System**: Log specific events with timestamps and visualize them directly on the live waveform graph using dynamic annotations.
*   **Disease Knowledge Library**: A fully searchable and responsive database of plant stress conditions, diseases, and standardized treatment protocols.
*   **Data Export**: One-click CSV export feature to download sensor history for offline data analysis and record-keeping.
*   **Mobile-Responsive Design**: A premium glassmorphism aesthetic that is fully responsive, ensuring a seamless and touch-friendly user experience across all screen sizes.

---

## 🏗️ System Architecture

PhytoPulse is designed with a robust architecture that cleanly separates the user-facing visualization (Frontend) from the IoT data ingestion and processing layer (Backend). 

### 🖥️ Frontend (Client Interface)
The frontend is a highly responsive, modern web application built with HTML5, vanilla JavaScript, and Tailwind CSS.

*   **`index.html`**: The main landing portal introducing the platform's capabilities.
*   **`dashboard.html`**: The primary operational dashboard rendering live charts, event markers, correlation analysis, and real-time stress alerts.
*   **`encyclopedia.html` & `library.html`**: Comprehensive reference databases with real-time search filtering.
*   **State Management (`js/store.js`)**: A centralized data store that holds current telemetry values and plant health status, ensuring UI components update reactively.
*   **Visualization Engine (`js/chart-engine.js`, `js/responsive.js`)**: Handles the high-performance rendering of bio-voltage waveforms and platform responsiveness.

### ⚙️ Backend (IoT Data & Analytics Engine)
The backend infrastructure gathers raw analog signals from the physical world, digitizes them, and makes them accessible.

*   **Hardware Layer**: Physical sensors attached to the crops (e.g., AD8232 for micro-voltage, capacitive moisture sensors, DHT thermistors) transmitting data to a microcontroller (like ESP32).
*   **Data Aggregation**: The microcontroller pushes telemetry to an IoT cloud platform (such as ThingSpeak) acting as the primary backend data lake.
*   **Data Processing Layer (`js/api.js`)**: Acts as the intelligent bridge. It fetches live data streams from the IoT backend API. It also includes an advanced simulation engine to generate realistic sensor data for demonstration and testing.

### 🔄 How Frontend and Backend Communicate
1.  **Continuous Polling**: The frontend's API engine operates on a recurring loop, sending HTTP requests to the backend IoT REST API.
2.  **Data Parsing**: Raw data (Voltage, Temp, Moisture) is ingested, parsed, and validated.
3.  **State Dispatch**: The parsed data is fed into the Diagnostic Engine to determine if the plant is nominal, stressed, or infected.
4.  **UI Reactivity**: The updated state is pushed to the central store, broadcasting events to update the dashboard charts, diagnostic overlays, and status indicators instantly.

---

## 🛠️ Installation & Setup

### Prerequisites
*   A modern web browser (Google Chrome, Firefox, Safari, Edge).
*   (Optional but recommended) A local web server like VS Code Live Server to prevent locally-served CORS issues.

### Running Locally
1.  Clone this repository or download the source code.
2.  Navigate to the project root directory.
3.  Serve the directory using a local web server (e.g., `npx serve` or `python -m http.server`).
4.  Open `index.html` in your browser.

### Connecting Hardware (Backend Integration)
To connect real hardware instead of using the built-in simulator:
1.  Open `js/api.js`.
2.  Locate the appropriate API configuration block.
3.  Replace the placeholder credentials with your actual ThingSpeak Channel ID and Read API Key.
4.  Ensure live fetching is uncommented in `fetchData()` and remove/comment out the `simulateDataPull()` function.

---

## 📄 License
© 2026 PhytoPulse Platforms. All rights reserved.
