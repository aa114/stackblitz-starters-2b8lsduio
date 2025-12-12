# React Integration Example

This document provides complete examples for integrating SCADA parameter-mapped SVGs into your React application.

## Installation

First, install the required dependencies:

```bash
npm install mqtt
# or
npm install axios  # for REST API polling
```

## Complete React Component Example

### ScadaDiagramViewer.jsx

```jsx
import React, { useEffect, useRef, useState } from 'react';
import './ScadaDiagramViewer.css';

const ScadaDiagramViewer = ({ svgContent, modbusConfig }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [parameters, setParameters] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (containerRef.current && svgContent) {
      containerRef.current.innerHTML = svgContent;
      svgRef.current = containerRef.current.querySelector('svg');

      if (svgRef.current) {
        initializeSvgUpdater();
      }
    }
  }, [svgContent]);

  useEffect(() => {
    if (modbusConfig && modbusConfig.enabled) {
      connectToDataSource();
    }

    return () => {
      disconnectFromDataSource();
    };
  }, [modbusConfig]);

  useEffect(() => {
    if (svgRef.current) {
      updateSvgWithParameters();
    }
  }, [parameters]);

  const initializeSvgUpdater = () => {
    if (typeof window.SvgParameterUpdater !== 'undefined') {
      window.svgUpdater = new window.SvgParameterUpdater(svgRef.current);
    }
  };

  const connectToDataSource = () => {
    if (modbusConfig.type === 'mqtt') {
      connectMQTT();
    } else if (modbusConfig.type === 'rest') {
      startPolling();
    }
  };

  const connectMQTT = () => {
    const mqtt = require('mqtt');
    const client = mqtt.connect(modbusConfig.brokerUrl, {
      clientId: `scada_viewer_${Math.random().toString(16).substr(2, 8)}`,
      username: modbusConfig.username,
      password: modbusConfig.password
    });

    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      setIsConnected(true);

      client.subscribe(`${modbusConfig.topicPrefix}/#`, (err) => {
        if (err) {
          console.error('Subscription error:', err);
        }
      });
    });

    client.on('message', (topic, message) => {
      try {
        const paramName = topic.split('/').pop();
        const value = parseFloat(message.toString());

        setParameters(prev => ({
          ...prev,
          [paramName]: value
        }));
      } catch (error) {
        console.error('Error processing MQTT message:', error);
      }
    });

    client.on('error', (error) => {
      console.error('MQTT connection error:', error);
      setIsConnected(false);
    });

    window.mqttClient = client;
  };

  const startPolling = () => {
    const pollInterval = modbusConfig.pollInterval || 1000;

    const poll = async () => {
      try {
        const response = await fetch(modbusConfig.apiEndpoint, {
          headers: modbusConfig.headers || {}
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setParameters(data);
        setIsConnected(true);
      } catch (error) {
        console.error('Polling error:', error);
        setIsConnected(false);
      }
    };

    poll();
    window.pollingInterval = setInterval(poll, pollInterval);
  };

  const disconnectFromDataSource = () => {
    if (window.mqttClient) {
      window.mqttClient.end();
      window.mqttClient = null;
    }

    if (window.pollingInterval) {
      clearInterval(window.pollingInterval);
      window.pollingInterval = null;
    }

    setIsConnected(false);
  };

  const updateSvgWithParameters = () => {
    if (!svgRef.current) return;

    updateGradientLevels();
    updateTextElements();
    updateColors();
  };

  const updateGradientLevels = () => {
    const gradientElements = svgRef.current.querySelectorAll('[data-scada-type="gradient-level"]');

    gradientElements.forEach(element => {
      const paramName = element.getAttribute('data-scada-param');
      const value = parameters[paramName];

      if (value === undefined) return;

      const min = parseFloat(element.getAttribute('data-scada-min') || 0);
      const max = parseFloat(element.getAttribute('data-scada-max') || 100);
      const percentage = ((value - min) / (max - min)) * 100;

      const clampedPercentage = Math.max(0, Math.min(100, percentage));

      updateGradientStops(element, clampedPercentage);
    });
  };

  const updateGradientStops = (element, percentage) => {
    const fillAttr = element.getAttribute('fill');
    if (!fillAttr || !fillAttr.startsWith('url(#')) return;

    const gradientId = fillAttr.substring(5, fillAttr.length - 1);
    const gradient = svgRef.current.querySelector(`#${gradientId}`);

    if (!gradient) return;

    const transitionStop = gradient.querySelector('[data-scada-stop="transition"]');
    const emptyStops = gradient.querySelectorAll('[data-scada-stop="empty"]');

    if (transitionStop && emptyStops.length > 0) {
      transitionStop.setAttribute('offset', `${percentage}%`);
      emptyStops[0].setAttribute('offset', `${percentage}%`);
    }
  };

  const updateTextElements = () => {
    const textElements = svgRef.current.querySelectorAll('[data-scada-type="text"]');

    textElements.forEach(element => {
      const paramName = element.getAttribute('data-scada-param');
      const value = parameters[paramName];

      if (value !== undefined) {
        element.textContent = value;
      }
    });
  };

  const updateColors = () => {
    const fillElements = svgRef.current.querySelectorAll('[data-scada-type="fill-color"]');
    const strokeElements = svgRef.current.querySelectorAll('[data-scada-type="stroke-color"]');

    fillElements.forEach(element => {
      const paramName = element.getAttribute('data-scada-param');
      const value = parameters[paramName];

      if (value !== undefined) {
        element.setAttribute('fill', value);
      }
    });

    strokeElements.forEach(element => {
      const paramName = element.getAttribute('data-scada-param');
      const value = parameters[paramName];

      if (value !== undefined) {
        element.setAttribute('stroke', value);
      }
    });
  };

  return (
    <div className="scada-diagram-container">
      <div className="scada-status-bar">
        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '● Connected' : '○ Disconnected'}
        </span>
        <span className="parameter-count">
          Parameters: {Object.keys(parameters).length}
        </span>
      </div>
      <div ref={containerRef} className="scada-svg-container" />
    </div>
  );
};

export default ScadaDiagramViewer;
```

### ScadaDiagramViewer.css

```css
.scada-diagram-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.scada-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.status-indicator.connected {
  color: #28a745;
}

.status-indicator.disconnected {
  color: #dc3545;
}

.parameter-count {
  color: #666;
}

.scada-svg-container {
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scada-svg-container svg {
  max-width: 100%;
  height: auto;
}
```

## Usage Example

### App.jsx

```jsx
import React, { useState, useEffect } from 'react';
import ScadaDiagramViewer from './components/ScadaDiagramViewer';

function App() {
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    loadSvgDiagram();
  }, []);

  const loadSvgDiagram = async () => {
    try {
      const response = await fetch('/diagrams/plant-layout.svg');
      const svg = await response.text();
      setSvgContent(svg);
    } catch (error) {
      console.error('Error loading SVG:', error);
    }
  };

  const modbusConfig = {
    enabled: true,
    type: 'mqtt',  // or 'rest'
    brokerUrl: 'mqtt://your-mqtt-broker.com:1883',
    topicPrefix: 'plant/sensors',
    username: 'your-username',
    password: 'your-password'
  };

  // For REST API polling:
  // const modbusConfig = {
  //   enabled: true,
  //   type: 'rest',
  //   apiEndpoint: 'https://your-api.com/modbus/values',
  //   pollInterval: 2000,
  //   headers: {
  //     'Authorization': 'Bearer your-token'
  //   }
  // };

  return (
    <div className="App">
      <h1>SCADA Plant Monitoring</h1>
      {svgContent ? (
        <ScadaDiagramViewer
          svgContent={svgContent}
          modbusConfig={modbusConfig}
        />
      ) : (
        <div>Loading diagram...</div>
      )}
    </div>
  );
}

export default App;
```

## MQTT Topic Structure Example

For MQTT integration, structure your topics like this:

```
plant/sensors/TANK_01_LEVEL → 75.5
plant/sensors/TANK_02_LEVEL → 42.3
plant/sensors/TEMP_SENSOR_01 → 23.8
plant/sensors/PRESSURE_01 → 145.2
plant/sensors/VALVE_01_STATUS → "OPEN"
```

## REST API Response Example

For REST API polling, your endpoint should return:

```json
{
  "TANK_01_LEVEL": 75.5,
  "TANK_02_LEVEL": 42.3,
  "TEMP_SENSOR_01": 23.8,
  "PRESSURE_01": 145.2,
  "VALVE_01_STATUS": "OPEN",
  "PUMP_01_RPM": 1450,
  "FLOW_RATE_01": 125.7
}
```

## Advanced: Real-Time Updates with WebSocket

```jsx
const connectWebSocket = () => {
  const ws = new WebSocket('ws://your-server.com/scada-stream');

  ws.onopen = () => {
    console.log('WebSocket connected');
    setIsConnected(true);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.parameter && data.value !== undefined) {
        setParameters(prev => ({
          ...prev,
          [data.parameter]: data.value
        }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    setIsConnected(false);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    setIsConnected(false);

    setTimeout(connectWebSocket, 5000);
  };

  window.wsConnection = ws;
};
```

## Testing with Mock Data

```jsx
const useMockData = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      setParameters({
        TANK_01_LEVEL: Math.random() * 100,
        TANK_02_LEVEL: Math.random() * 100,
        TEMP_SENSOR_01: 20 + Math.random() * 10,
        PRESSURE_01: 100 + Math.random() * 50,
        PUMP_01_RPM: 1400 + Math.random() * 200,
        FLOW_RATE_01: 100 + Math.random() * 50
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);
};
```

## Performance Optimization

For diagrams with many parameters, use throttling:

```jsx
import { throttle } from 'lodash';

const throttledUpdate = useRef(
  throttle((params) => {
    updateSvgWithParameters(params);
  }, 100)  // Update max once per 100ms
);

useEffect(() => {
  throttledUpdate.current(parameters);
}, [parameters]);
```

## Error Handling

```jsx
const [errors, setErrors] = useState([]);

const handleError = (error) => {
  setErrors(prev => [...prev, {
    timestamp: new Date(),
    message: error.message
  }]);

  setTimeout(() => {
    setErrors(prev => prev.slice(1));
  }, 5000);
};
```

This complete example provides everything you need to integrate the SCADA parameter mapping feature into your React application!
