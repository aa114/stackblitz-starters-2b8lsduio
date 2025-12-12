# SCADA Parameter Mapping Feature

## Overview

This feature extends the draw.io web editor to support parameter mapping for real-time SCADA (Supervisory Control and Data Acquisition) diagrams. Users can create visual representations of industrial processes (water tanks, valves, pumps, sensors) and map dynamic parameters (MODBUS/MQTT values) to visual elements like gradient fills and text fields.

## Features

### 1. Parameter Mapping for Gradients
- Map MODBUS/MQTT parameters to gradient fills for level indicators
- Support for water tanks, fuel tanks, progress bars, thermometers
- Configure gradient direction (bottom-to-top, top-to-bottom, left-to-right, right-to-left)
- Set min/max values for proper scaling
- Define fill and empty colors

### 2. Parameter Mapping for Text
- Replace text content with placeholder values
- Perfect for displaying sensor readings, status messages, timestamps
- Supports template syntax: `{{PARAMETER_NAME}}`

### 3. Parameter Mapping for Colors
- Map parameters to fill colors
- Map parameters to stroke colors
- Dynamic color changes based on real-time values

### 4. Template Library
- Save commonly used SCADA components as templates
- Load templates from Supabase database
- Share templates with team members
- Categories: tanks, valves, pumps, sensors, custom

## How to Use

### Setting Up Parameter Mapping

#### Method 1: Ctrl+Click
1. Draw your SCADA diagram element (e.g., a rectangle for a water tank)
2. Hold `Ctrl` and click on the element
3. The parameter mapping dialog will open

#### Method 2: Right-Click Context Menu
1. Right-click on any element in your diagram
2. Select "Set Parameter Mapping..." from the context menu
3. The parameter mapping dialog will open

### Configuring a Gradient Level Indicator

Example: Water Tank with Level Indicator

1. Draw a rectangle to represent the tank
2. Right-click and select "Set Parameter Mapping..."
3. Fill in the dialog:
   - **Parameter Name**: `TANK_01_LEVEL` (or your MODBUS register address like `MB_40001`)
   - **Parameter Type**: Select "Gradient Level Indicator"
   - **Fill Direction**: Select "Bottom to Top"
   - **Minimum Value**: `0`
   - **Maximum Value**: `100`
   - **Fill Color**: Choose blue (`#0066cc`)
   - **Empty Color**: Choose light gray (`#e0e0e0`)
4. Click "Save Mapping"

### Configuring Text Parameter Mapping

Example: Temperature Sensor Display

1. Add a text element to your diagram
2. Right-click and select "Set Parameter Mapping..."
3. Fill in the dialog:
   - **Parameter Name**: `TEMP_SENSOR_01`
   - **Parameter Type**: Select "Text Content"
4. Click "Save Mapping"

### Exporting with Parameter Mappings

When you export your diagram as SVG:

1. Go to File → Export as → SVG
2. The exported SVG will contain special data attributes with your parameter mappings

#### Example SVG Output for Gradient:

```xml
<rect
  data-scada-param="TANK_01_LEVEL"
  data-scada-type="gradient-level"
  data-scada-direction="bottom-to-top"
  data-scada-min="0"
  data-scada-max="100"
  data-scada-fill-color="#0066cc"
  data-scada-empty-color="#e0e0e0"
  fill="url(#scada-gradient-123)"
/>

<defs>
  <linearGradient id="scada-gradient-123" x1="0%" y1="100%" x2="0%" y2="0%">
    <stop offset="0%" stop-color="#0066cc" data-scada-stop="fill"/>
    <stop offset="50%" stop-color="#0066cc" data-scada-stop="transition" data-scada-param-offset="{{TANK_01_LEVEL}}"/>
    <stop offset="50%" stop-color="#e0e0e0" data-scada-stop="empty"/>
    <stop offset="100%" stop-color="#e0e0e0" data-scada-stop="empty"/>
  </linearGradient>
</defs>
```

#### Example SVG Output for Text:

```xml
<text data-scada-param="TEMP_SENSOR_01" data-scada-type="text">
  {{TEMP_SENSOR_01}}
</text>
```

## Using in Your React Application

### Step 1: Load the SVG

```javascript
import React, { useEffect, useRef } from 'react';

function ScadaDiagram({ parameters }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current) {
      updateSvgParameters(svgRef.current, parameters);
    }
  }, [parameters]);

  return (
    <div ref={svgRef} dangerouslySetInnerHTML={{ __html: svgContent }} />
  );
}
```

### Step 2: Update Parameters in Real-Time

```javascript
function updateSvgParameters(svgElement, parameters) {
  // Update gradient level indicators
  const gradientElements = svgElement.querySelectorAll('[data-scada-type="gradient-level"]');

  gradientElements.forEach(element => {
    const paramName = element.getAttribute('data-scada-param');
    const value = parameters[paramName];

    if (value !== undefined) {
      const min = parseFloat(element.getAttribute('data-scada-min'));
      const max = parseFloat(element.getAttribute('data-scada-max'));
      const percentage = ((value - min) / (max - min)) * 100;

      // Update gradient stops
      const fillAttr = element.getAttribute('fill');
      if (fillAttr && fillAttr.startsWith('url(#')) {
        const gradientId = fillAttr.substring(5, fillAttr.length - 1);
        const gradient = svgElement.querySelector(`#${gradientId}`);

        if (gradient) {
          const transitionStop = gradient.querySelector('[data-scada-stop="transition"]');
          const emptyStopFirst = gradient.querySelectorAll('[data-scada-stop="empty"]')[0];

          if (transitionStop && emptyStopFirst) {
            transitionStop.setAttribute('offset', `${percentage}%`);
            emptyStopFirst.setAttribute('offset', `${percentage}%`);
          }
        }
      }
    }
  });

  // Update text elements
  const textElements = svgElement.querySelectorAll('[data-scada-type="text"]');

  textElements.forEach(element => {
    const paramName = element.getAttribute('data-scada-param');
    const value = parameters[paramName];

    if (value !== undefined) {
      element.textContent = value;
    }
  });

  // Update fill colors
  const fillColorElements = svgElement.querySelectorAll('[data-scada-type="fill-color"]');

  fillColorElements.forEach(element => {
    const paramName = element.getAttribute('data-scada-param');
    const value = parameters[paramName];

    if (value !== undefined) {
      element.setAttribute('fill', value);
    }
  });

  // Update stroke colors
  const strokeColorElements = svgElement.querySelectorAll('[data-scada-type="stroke-color"]');

  strokeColorElements.forEach(element => {
    const paramName = element.getAttribute('data-scada-param');
    const value = parameters[paramName];

    if (value !== undefined) {
      element.setAttribute('stroke', value);
    }
  });
}
```

### Step 3: Connect to MODBUS/MQTT

```javascript
import { useEffect, useState } from 'react';

function useScadaParameters() {
  const [parameters, setParameters] = useState({});

  useEffect(() => {
    // Connect to your MODBUS/MQTT broker
    const mqtt = require('mqtt');
    const client = mqtt.connect('mqtt://your-broker.com');

    client.on('connect', () => {
      client.subscribe('plant/sensors/#');
    });

    client.on('message', (topic, message) => {
      const paramName = topic.split('/').pop();
      const value = parseFloat(message.toString());

      setParameters(prev => ({
        ...prev,
        [paramName]: value
      }));
    });

    return () => {
      client.end();
    };
  }, []);

  return parameters;
}

// Usage
function App() {
  const parameters = useScadaParameters();

  return <ScadaDiagram parameters={parameters} />;
}
```

## Database Schema

The feature uses Supabase to store reusable templates:

```sql
CREATE TABLE scada_templates (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  category text,
  mapping_config jsonb NOT NULL,
  preview_svg text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  is_public boolean
);
```

## Common SCADA Use Cases

### Water Tank Level Indicator
- Parameter: Tank level (0-100%)
- Type: Gradient Level Indicator
- Direction: Bottom to Top
- Colors: Blue fill, gray empty

### Temperature Gauge
- Parameter: Temperature value
- Type: Text Content
- Display: Numeric value with unit

### Valve Status
- Parameter: Valve position (open/closed)
- Type: Fill Color
- Colors: Green (open), Red (closed)

### Pump Status
- Parameter: Pump RPM
- Type: Text + Gradient combination
- Multiple mappings on same element

### Pressure Indicator
- Parameter: Pressure reading (PSI/Bar)
- Type: Gradient Level Indicator
- Direction: Left to Right or Bottom to Top

## Tips and Best Practices

1. **Naming Convention**: Use clear parameter names like `TANK_01_LEVEL` or `MB_40001` that match your MODBUS/MQTT addressing

2. **Gradient Direction**:
   - Use Bottom-to-Top for vertical tanks
   - Use Left-to-Right for horizontal pipes/tanks
   - Match the physical orientation

3. **Min/Max Values**: Always set appropriate min/max values for accurate scaling

4. **Color Selection**:
   - Use intuitive colors (blue for water, orange for oil, etc.)
   - Ensure sufficient contrast between fill and empty colors

5. **Testing**: Test your exported SVG with sample data before deploying to production

6. **Performance**: For large diagrams with many parameters, throttle updates to avoid excessive rerendering

## Troubleshooting

### Parameter Not Updating
- Check that the parameter name matches exactly (case-sensitive)
- Verify the data-scada-param attribute exists in the exported SVG
- Ensure your parameter value is within the min/max range

### Gradient Not Displaying
- Verify the gradient definition exists in the SVG `<defs>` section
- Check that the gradient ID matches the fill attribute
- Ensure gradient stops have correct offsets

### Text Not Replacing
- Confirm the placeholder format is `{{PARAMETER_NAME}}`
- Check that you're updating the textContent property, not innerHTML
- Verify the data-scada-type attribute is set to "text"

## Support

For issues or questions, please refer to the project documentation or contact the development team.
