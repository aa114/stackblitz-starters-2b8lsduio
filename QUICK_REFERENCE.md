# SCADA Parameter Mapping - Quick Reference Card

## Quick Access

### Open Parameter Mapping Dialog
- **Method 1**: `Ctrl + Click` on any shape
- **Method 2**: Right-click → "Set Parameter Mapping..."

### Remove Mapping
- Right-click → "Remove Parameter Mapping"

---

## Parameter Types

| Type | Use Case | Example |
|------|----------|---------|
| **Gradient Level** | Tanks, gauges, progress bars | Water tank filling 0-100% |
| **Text Content** | Sensor readings, status | Temperature: "23.5°C" |
| **Fill Color** | Status indicators | Green=ON, Red=OFF |
| **Stroke Color** | Border alerts | Red border for warnings |

---

## Gradient Directions

```
Bottom-to-Top  ↑   Vertical tanks
Top-to-Bottom  ↓   Inverted gauges
Left-to-Right  →   Horizontal pipes
Right-to-Left  ←   Reverse flow
```

---

## Parameter Naming

### Good Names ✅
```
TANK_01_LEVEL
MB_40001
TEMP_SENSOR_01
PRESSURE_PSI_01
VALVE_STATUS_A1
```

### Avoid ❌
```
tank (too generic)
sensor1 (unclear purpose)
x (not descriptive)
test (temporary names)
```

---

## SVG Export Attributes

### Gradient Level
```xml
<rect
  data-scada-param="TANK_01_LEVEL"
  data-scada-type="gradient-level"
  data-scada-direction="bottom-to-top"
  data-scada-min="0"
  data-scada-max="100"
  data-scada-fill-color="#0066cc"
  data-scada-empty-color="#e0e0e0"
/>
```

### Text Content
```xml
<text
  data-scada-param="TEMP_01"
  data-scada-type="text"
>
  {{TEMP_01}}
</text>
```

---

## React Update Code

### Basic Update
```javascript
// Update single parameter
updateParameter('TANK_01_LEVEL', 75.5);

// Update multiple parameters
updateParameters({
  TANK_01_LEVEL: 75.5,
  TEMP_SENSOR_01: 23.8,
  PRESSURE_01: 145.2
});
```

### Update Gradient
```javascript
const percentage = (value - min) / (max - min) * 100;
transitionStop.setAttribute('offset', `${percentage}%`);
```

### Update Text
```javascript
textElement.textContent = value;
```

---

## Common Patterns

### Water Tank
```
Parameter: TANK_01_LEVEL
Type: Gradient Level
Direction: Bottom to Top
Min: 0, Max: 100
Fill: Blue (#0066cc)
Empty: Gray (#e0e0e0)
```

### Temperature Sensor
```
Parameter: TEMP_SENSOR_01
Type: Text Content
Format: "${value}°C"
```

### Status Indicator
```
Parameter: PUMP_STATUS
Type: Fill Color
Values:
  - "#00ff00" (Running)
  - "#ff0000" (Stopped)
  - "#ffaa00" (Warning)
```

### Pressure Gauge
```
Parameter: PRESSURE_01
Type: Gradient Level
Direction: Left to Right
Min: 0, Max: 200
Unit: PSI
```

---

## Data Source Integration

### MQTT
```javascript
client.subscribe('plant/sensors/#');
client.on('message', (topic, msg) => {
  const param = topic.split('/').pop();
  updateParameter(param, parseFloat(msg));
});
```

### REST API
```javascript
setInterval(async () => {
  const data = await fetch('/api/values').then(r => r.json());
  updateParameters(data);
}, 2000);
```

### WebSocket
```javascript
ws.onmessage = (event) => {
  const { parameter, value } = JSON.parse(event.data);
  updateParameter(parameter, value);
};
```

---

## Workflow

1. **Design** → Draw diagram in draw.io
2. **Map** → Ctrl+Click to add parameter mappings
3. **Export** → File → Export as → SVG
4. **Import** → Load SVG in React app
5. **Connect** → Connect to MQTT/MODBUS/API
6. **Update** → Real-time parameter updates
7. **Monitor** → Watch your plant live!

---

## File Locations

```
webapp/
├── js/
│   ├── parameter-mapping.js        (Main logic)
│   ├── supabase-integration.js     (Database)
│   └── svg-parameter-updater.js    (React utility)
├── styles/
│   └── parameter-mapping.css       (Dialog styles)
├── test-parameter-mapping.html     (Test page)
└── index.html                      (Updated)

Documentation/
├── SCADA_PARAMETER_MAPPING.md      (Full docs)
├── REACT_INTEGRATION_EXAMPLE.md    (React guide)
├── INSTALLATION_GUIDE.md           (Setup)
└── QUICK_REFERENCE.md              (This file)
```

---

## Testing Checklist

- [ ] Draw shape in editor
- [ ] Open parameter dialog (Ctrl+Click)
- [ ] Set parameter name
- [ ] Select parameter type
- [ ] Configure gradient settings (if applicable)
- [ ] Save mapping
- [ ] Export as SVG
- [ ] Verify data-scada-* attributes exist
- [ ] Load SVG in React app
- [ ] Update parameter values
- [ ] Verify visual updates

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Dialog won't open | Check JavaScript console, refresh page |
| No data attributes | Re-save mapping before export |
| Gradient not updating | Check parameter name matches exactly |
| Text not replacing | Verify data-scada-type="text" exists |
| Wrong direction | Check gradient direction setting |
| Value out of range | Ensure value is between min and max |

---

## Performance Tips

1. ⚡ **Throttle** updates to 100ms for many parameters
2. 📦 **Batch** updates together
3. 🔌 Use **WebSocket** for real-time data
4. 🎨 Keep **SVG simple** - remove unused elements
5. 💾 **Cache** parameter values to avoid redundant updates

---

## Best Practices

✅ **DO**
- Use descriptive parameter names
- Match physical tank orientation
- Set appropriate min/max values
- Use intuitive colors
- Test with sample data first
- Document your parameter mappings

❌ **DON'T**
- Use special characters in names
- Leave min/max at defaults
- Use similar colors for different states
- Update parameters every millisecond
- Forget to validate input values
- Mix up parameter names

---

## Support

📖 **Full Documentation**: `SCADA_PARAMETER_MAPPING.md`
💻 **React Examples**: `REACT_INTEGRATION_EXAMPLE.md`
🧪 **Test Page**: `webapp/test-parameter-mapping.html`
📦 **Database Schema**: See Supabase `scada_templates` table

---

**Version 1.0.0** | Compatible with draw.io web editor | Powered by Supabase
