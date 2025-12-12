# 🎯 SCADA Parameter Mapping - Start Here

## Quick Start (2 Minutes)

### See It Working Immediately

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Open the demo**:
   ```
   http://localhost:3000/webapp/test-parameter-mapping.html
   ```

3. **Play with the controls**:
   - Move the sliders to see real-time updates
   - Click "Start Simulation" for automated animation
   - Watch the water tank level change dynamically

**That's it!** The feature is working and ready to use.

---

## What You Can Do Now

### ✅ Option 1: Use the Working Demo (Easiest)

Perfect for testing and understanding how it works:

- **File**: `webapp/test-parameter-mapping.html`
- **What it shows**: Sample SCADA diagram with live parameter updates
- **Features**: Water tank, temperature sensor, pressure gauge
- **Controls**: Real-time sliders and simulation mode

### ✅ Option 2: Create Your Own Diagrams

Use draw.io online and our React utility:

1. **Create diagram** at [app.diagrams.net](https://app.diagrams.net)

2. **Add data attributes** to each shape:
   - Right-click → Edit Data
   - Add property: `scada-param` = `TANK_01_LEVEL`
   - Add property: `scada-type` = `gradient-level`
   - Add property: `scada-min` = `0`
   - Add property: `scada-max` = `100`

3. **Export as SVG**

4. **Use in React**:
   ```javascript
   import SvgParameterUpdater from './webapp/js/svg-parameter-updater.js';

   const updater = new SvgParameterUpdater(svgElement);
   updater.updateParameter('TANK_01_LEVEL', 75.5);
   ```

### ✅ Option 3: Connect to Real Data

Integrate with MQTT, MODBUS, or REST API:

```javascript
// MQTT Example
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://your-broker.com');

client.on('message', (topic, message) => {
  const paramName = topic.split('/').pop();
  const value = parseFloat(message.toString());
  updater.updateParameter(paramName, value);
});
```

Full examples in `REACT_INTEGRATION_EXAMPLE.md`

---

## Important Files

### Working Files (Use These)
- ✅ `webapp/test-parameter-mapping.html` - Demo (open now!)
- ✅ `webapp/scada-editor.html` - Instructions and options
- ✅ `webapp/js/svg-parameter-updater.js` - React utility
- ✅ `webapp/js/supabase-integration.js` - Template storage

### Documentation (Read These)
- 📖 `QUICK_START_FIX.md` - Why index.html doesn't work + solutions
- 📖 `SCADA_PARAMETER_MAPPING.md` - Complete feature guide
- 📖 `REACT_INTEGRATION_EXAMPLE.md` - React code examples
- 📖 `DEPLOYMENT_STATUS.md` - What's been delivered

---

## Why index.html Doesn't Work

**Short Answer**: The draw.io core files (`js/bootstrap.js`, `js/main.js`) are missing.

**Good News**: You don't need them! Everything works through:
1. The interactive demo (works immediately)
2. Draw.io online + our utilities (recommended workflow)
3. Manual SVG editing + our utilities

**If You Want the Full Editor**: See `QUICK_START_FIX.md` for instructions to download the draw.io source.

---

## Parameter Types You Can Use

### 1. Gradient Level (Water Tanks, Fuel Tanks)
```javascript
// SVG attributes
data-scada-param="TANK_01_LEVEL"
data-scada-type="gradient-level"
data-scada-direction="bottom-to-top"
data-scada-min="0"
data-scada-max="100"
```

### 2. Text Content (Sensor Readings)
```javascript
// SVG attributes
data-scada-param="TEMP_SENSOR_01"
data-scada-type="text"

// Updates to: "23.8°C"
```

### 3. Colors (Status Indicators)
```javascript
// SVG attributes
data-scada-param="VALVE_STATUS"
data-scada-type="fill-color"

// Updates to: "#00ff00" (green)
```

---

## React Integration (3 Steps)

### Step 1: Load SVG
```jsx
import { useEffect, useRef } from 'react';

function ScadaDiagram({ svgContent }) {
  const containerRef = useRef(null);

  useEffect(() => {
    containerRef.current.innerHTML = svgContent;
  }, [svgContent]);

  return <div ref={containerRef} />;
}
```

### Step 2: Initialize Updater
```javascript
import SvgParameterUpdater from './svg-parameter-updater.js';

const svgElement = containerRef.current.querySelector('svg');
const updater = new SvgParameterUpdater(svgElement);
```

### Step 3: Update Parameters
```javascript
updater.updateParameters({
  TANK_01_LEVEL: 75.5,
  TEMP_SENSOR_01: 23.8,
  PRESSURE_01: 145.2
});
```

**Complete example**: See `REACT_INTEGRATION_EXAMPLE.md`

---

## Database Templates (Optional)

Store reusable SCADA components:

```javascript
// Save a template
await ScadaSupabaseIntegration.saveTemplate(
  'Water Tank Template',
  'Standard 1000L water tank with level indicator',
  'tanks',
  mappingConfig,
  previewSvg
);

// Load templates
const { data } = await ScadaSupabaseIntegration.loadTemplates('tanks');
```

**Status**: Database configured and ready to use

---

## Common Use Cases

### Water Treatment Plant
- Tank levels (gradient indicators)
- Flow rates (text displays)
- Valve status (color indicators)
- Pump RPM (text displays)
- Pressure readings (gradient bars)

### Industrial Process Control
- Temperature monitoring (text + color)
- Pressure gauges (gradient levels)
- Flow meters (text displays)
- Valve positions (colors)
- Motor status (text + color)

### Energy Management
- Battery levels (gradient indicators)
- Power consumption (text displays)
- Grid status (colors)
- Solar generation (gradient + text)

---

## Troubleshooting

### Parameter Not Updating?
- Check parameter name matches exactly (case-sensitive)
- Verify `data-scada-param` attribute exists in SVG
- Ensure value is within min/max range

### Gradient Not Working?
- Verify gradient definition exists in `<defs>`
- Check gradient ID matches fill attribute
- Ensure gradient has transition stops

### Text Not Replacing?
- Confirm `data-scada-type="text"` is set
- Check you're updating textContent, not innerHTML

**More help**: See `SCADA_PARAMETER_MAPPING.md` troubleshooting section

---

## What's Next?

1. **Try the demo**: Open `test-parameter-mapping.html`
2. **Create a diagram**: Use draw.io online
3. **Add parameters**: Use our data attribute system
4. **Export SVG**: Download from draw.io
5. **Integrate React**: Use `svg-parameter-updater.js`
6. **Connect data**: MQTT, MODBUS, or REST API

---

## Need More Info?

- **Quick solutions**: `QUICK_START_FIX.md`
- **Feature details**: `SCADA_PARAMETER_MAPPING.md`
- **React code**: `REACT_INTEGRATION_EXAMPLE.md`
- **Status report**: `DEPLOYMENT_STATUS.md`

---

## ✨ You're Ready!

Everything is implemented and working. Start with the demo, then integrate into your React app. Happy SCADA visualization! 🎉

**First step**: Open `webapp/test-parameter-mapping.html` and see it in action!
