# SCADA Parameter Mapping - Installation & Usage Guide

## Quick Start

The SCADA Parameter Mapping feature has been successfully installed in your draw.io editor. This guide will help you get started quickly.

## What's Been Installed

### Files Added

1. **JavaScript Files**:
   - `/webapp/js/parameter-mapping.js` - Main parameter mapping functionality
   - `/webapp/js/supabase-integration.js` - Database integration for templates
   - `/webapp/js/svg-parameter-updater.js` - Utility for updating SVG parameters in React

2. **CSS Files**:
   - `/webapp/styles/parameter-mapping.css` - Styling for the parameter mapping dialog

3. **Test & Documentation**:
   - `/webapp/test-parameter-mapping.html` - Interactive test page
   - `/SCADA_PARAMETER_MAPPING.md` - Complete feature documentation
   - `/REACT_INTEGRATION_EXAMPLE.md` - React integration examples
   - `/INSTALLATION_GUIDE.md` - This file

### Database Schema

A Supabase table has been created for storing reusable SCADA templates:
- Table: `scada_templates`
- Features: User authentication, Row Level Security, template sharing

## Testing the Installation

### Option 1: Use the Test Page

1. Open your browser and navigate to:
   ```
   http://localhost:3000/webapp/test-parameter-mapping.html
   ```

2. You'll see:
   - A sample SCADA diagram with a water tank
   - Parameter controls (sliders)
   - Real-time updates as you move the sliders

3. Try the simulation:
   - Click "Start Simulation" to see automated parameter changes
   - Watch the tank level change dynamically
   - Observe text values updating in real-time

### Option 2: Use the Draw.io Editor

1. Open the draw.io editor:
   ```
   http://localhost:3000/webapp/index.html
   ```

2. Draw a shape (rectangle, circle, etc.)

3. Set parameter mapping:
   - **Method A**: Hold `Ctrl` and click on the shape
   - **Method B**: Right-click → "Set Parameter Mapping..."

4. The parameter mapping dialog will open

## Creating Your First SCADA Diagram

### Example: Water Tank Level Indicator

#### Step 1: Draw the Tank
1. Open draw.io editor
2. Select the rectangle tool
3. Draw a vertical rectangle (this will be your tank)
4. Set fill color to light gray

#### Step 2: Add Parameter Mapping
1. Right-click on the rectangle
2. Select "Set Parameter Mapping..."
3. In the dialog:
   ```
   Parameter Name: TANK_01_LEVEL
   Parameter Type: Gradient Level Indicator
   Fill Direction: Bottom to Top
   Minimum Value: 0
   Maximum Value: 100
   Fill Color: #0066cc (blue)
   Empty Color: #e0e0e0 (light gray)
   ```
4. Click "Save Mapping"

#### Step 3: Add a Label
1. Add a text element below the tank
2. Type: "Water Tank 01"
3. Right-click on the text
4. Select "Set Parameter Mapping..."
5. In the dialog:
   ```
   Parameter Name: TANK_01_LEVEL
   Parameter Type: Text Content
   ```
6. Click "Save Mapping"

#### Step 4: Export the Diagram
1. Go to File → Export as → SVG
2. Save the SVG file to your project
3. The SVG will contain special `data-scada-*` attributes

#### Step 5: Use in Your React App
```jsx
import ScadaDiagramViewer from './components/ScadaDiagramViewer';

function App() {
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    // Load your exported SVG
    fetch('/diagrams/tank-diagram.svg')
      .then(res => res.text())
      .then(svg => setSvgContent(svg));
  }, []);

  const parameters = {
    TANK_01_LEVEL: 75.5  // This will update the tank fill level to 75.5%
  };

  return (
    <ScadaDiagramViewer
      svgContent={svgContent}
      parameters={parameters}
    />
  );
}
```

## Common Use Cases

### 1. Multiple Tanks with Different Levels

```
Tank 1: TANK_01_LEVEL → 0-100%
Tank 2: TANK_02_LEVEL → 0-100%
Tank 3: TANK_03_LEVEL → 0-100%
```

### 2. Temperature Monitoring

```
Parameter: TEMP_SENSOR_01
Type: Text Content
Display: "23.5°C"
```

### 3. Pressure Gauge

```
Parameter: PRESSURE_01
Type: Gradient Level Indicator (horizontal)
Direction: Left to Right
Min: 0, Max: 200 PSI
```

### 4. Valve Status

```
Parameter: VALVE_01_STATUS
Type: Fill Color
Values: "#00ff00" (open), "#ff0000" (closed)
```

### 5. Pump Speed Indicator

```
Parameter: PUMP_01_RPM
Type: Text Content + Gradient
Multiple mappings on same pump icon
```

## Integration with Data Sources

### MQTT Integration

```javascript
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.example.com');

client.subscribe('plant/sensors/#');

client.on('message', (topic, message) => {
  const paramName = topic.split('/').pop();
  const value = parseFloat(message.toString());

  updateParameter(paramName, value);
});
```

### MODBUS Integration

```javascript
const ModbusRTU = require('modbus-serial');
const client = new ModbusRTU();

await client.connectTCP('192.168.1.100', { port: 502 });
client.setID(1);

setInterval(async () => {
  const data = await client.readHoldingRegisters(40001, 10);

  updateParameters({
    TANK_01_LEVEL: data.data[0],
    TEMP_SENSOR_01: data.data[1],
    PRESSURE_01: data.data[2]
  });
}, 1000);
```

### REST API Integration

```javascript
setInterval(async () => {
  const response = await fetch('https://api.example.com/scada/values');
  const data = await response.json();

  updateParameters(data);
}, 2000);
```

## Keyboard Shortcuts

- `Ctrl + Click` - Open parameter mapping dialog
- Right-click → "Set Parameter Mapping..." - Alternative way to open dialog
- Right-click → "Remove Parameter Mapping" - Remove mapping from element

## Features Overview

### Supported Parameter Types

1. **Gradient Level Indicator**
   - Perfect for tanks, gauges, progress bars
   - Supports 4 directions
   - Configurable colors and ranges

2. **Text Content**
   - Replace text with real-time values
   - Template syntax: `{{PARAM_NAME}}`

3. **Fill Color**
   - Dynamic color changes
   - Useful for status indicators

4. **Stroke Color**
   - Dynamic border colors
   - Useful for alerts and warnings

### Data Attributes in Exported SVG

```xml
<!-- Gradient Level Indicator -->
data-scada-param="TANK_01_LEVEL"
data-scada-type="gradient-level"
data-scada-direction="bottom-to-top"
data-scada-min="0"
data-scada-max="100"
data-scada-fill-color="#0066cc"
data-scada-empty-color="#e0e0e0"

<!-- Text Content -->
data-scada-param="TEMP_SENSOR_01"
data-scada-type="text"

<!-- Colors -->
data-scada-param="STATUS_COLOR"
data-scada-type="fill-color"
```

## Troubleshooting

### Issue: Parameter mapping dialog not appearing

**Solution:**
1. Make sure JavaScript is enabled in your browser
2. Check browser console for errors (F12)
3. Verify that `parameter-mapping.js` is loaded
4. Try refreshing the page

### Issue: Exported SVG doesn't contain data attributes

**Solution:**
1. Make sure you saved the parameter mappings before exporting
2. Check that you're exporting as SVG (not PNG or other formats)
3. Verify the mappings are saved in the diagram (check with right-click menu)

### Issue: Parameters not updating in React app

**Solution:**
1. Verify the parameter names match exactly (case-sensitive)
2. Check that data-scada-param attributes exist in the SVG
3. Ensure you're calling the update function correctly
4. Check browser console for errors

### Issue: Gradient not filling correctly

**Solution:**
1. Verify min/max values are set correctly
2. Check that the parameter value is within the min/max range
3. Ensure gradient direction matches your tank orientation
4. Verify gradient ID references are correct

## Performance Tips

1. **Throttle Updates**: For diagrams with many parameters, throttle updates to 100ms
2. **Batch Updates**: Update multiple parameters at once instead of one by one
3. **Use WebSocket**: For real-time data, WebSocket is more efficient than polling
4. **Optimize SVG**: Keep SVG file size reasonable, remove unnecessary elements

## Security Considerations

1. **Validate Input**: Always validate parameter values before updating
2. **Sanitize Data**: Sanitize any user-provided parameter names
3. **Authentication**: Use Supabase RLS for template access control
4. **HTTPS**: Always use HTTPS in production for MQTT/API connections

## Next Steps

1. ✅ Create your first SCADA diagram
2. ✅ Export as SVG with parameter mappings
3. ✅ Integrate into your React application
4. ✅ Connect to your MODBUS/MQTT data source
5. ✅ Monitor your plant in real-time!

## Support & Resources

- **Documentation**: See `SCADA_PARAMETER_MAPPING.md`
- **React Examples**: See `REACT_INTEGRATION_EXAMPLE.md`
- **Test Page**: Open `webapp/test-parameter-mapping.html`
- **GitHub Issues**: Report bugs or request features

## Version Information

- **Version**: 1.0.0
- **Compatible with**: draw.io web editor
- **Database**: Supabase
- **Browser Support**: Chrome, Firefox, Safari, Edge (latest versions)

---

**Congratulations!** You're now ready to create real-time SCADA diagrams with the parameter mapping feature. Start by testing with the sample page, then create your own plant diagrams!
