# 4DK SCADA Diagram Editor

A powerful draw.io-based web editor with SCADA parameter mapping capabilities for real-time industrial plant visualization.

## Features

✨ **Parameter Mapping** - Map MODBUS/MQTT parameters to visual elements
🎨 **Gradient Level Indicators** - Perfect for tanks, gauges, and progress bars
📝 **Dynamic Text Replacement** - Real-time sensor readings and status updates
🎯 **Multiple Parameter Types** - Gradients, text, fill colors, stroke colors
💾 **Template Library** - Save and reuse common SCADA components via Supabase
📤 **SVG Export** - Export with embedded parameter placeholders
⚡ **Real-time Updates** - Integrate with MQTT, MODBUS, or REST APIs

## Quick Start

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Open the editor**:
   ```
   http://localhost:3000/webapp/index.html
   ```

3. **Test the feature**:
   ```
   http://localhost:3000/webapp/test-parameter-mapping.html
   ```

## Documentation

- 📖 **[Complete Documentation](SCADA_PARAMETER_MAPPING.md)** - Full feature guide
- 🚀 **[Installation Guide](INSTALLATION_GUIDE.md)** - Setup instructions
- ⚛️ **[React Integration](REACT_INTEGRATION_EXAMPLE.md)** - React component examples
- 📋 **[Quick Reference](QUICK_REFERENCE.md)** - Cheat sheet

## How It Works

### 1. Draw Your SCADA Diagram
Create your plant layout using the draw.io editor with tanks, sensors, valves, pumps, etc.

### 2. Add Parameter Mappings
- Hold `Ctrl` and click on any element
- Or right-click → "Set Parameter Mapping..."
- Configure parameter name, type, and settings

### 3. Export as SVG
The exported SVG contains special data attributes:
```xml
<rect
  data-scada-param="TANK_01_LEVEL"
  data-scada-type="gradient-level"
  data-scada-direction="bottom-to-top"
  data-scada-min="0"
  data-scada-max="100"
/>
```

### 4. Use in Your React App
```jsx
import ScadaDiagramViewer from './components/ScadaDiagramViewer';

function App() {
  const parameters = {
    TANK_01_LEVEL: 75.5,
    TEMP_SENSOR_01: 23.8,
    PRESSURE_01: 145.2
  };

  return <ScadaDiagramViewer parameters={parameters} />;
}
```

## Common Use Cases

- 💧 **Water Tank Level Monitoring** - Visual tank fill indicators
- 🌡️ **Temperature Monitoring** - Real-time temperature displays
- 📊 **Pressure Gauges** - Horizontal/vertical pressure indicators
- 🔄 **Pump Status** - RPM displays and status colors
- ⚙️ **Valve Control** - Open/closed status visualization
- 🏭 **Complete Plant Layouts** - Full SCADA system visualization

## Architecture

```
webapp/
├── js/
│   ├── parameter-mapping.js         # Core parameter mapping logic
│   ├── supabase-integration.js      # Database integration
│   └── svg-parameter-updater.js     # React utility
├── styles/
│   └── parameter-mapping.css        # UI styling
├── test-parameter-mapping.html      # Interactive test page
└── index.html                       # Main editor
```

## Database

Uses Supabase for:
- 💾 Storing reusable SCADA templates
- 👥 Team collaboration and sharing
- 🔐 Row Level Security for access control
- 📦 Template categories and metadata

## Tech Stack

- **Editor**: draw.io (mxGraph)
- **Database**: Supabase PostgreSQL
- **Frontend**: Vanilla JavaScript + React integration
- **Styling**: Modern CSS with animations
- **Export Format**: SVG with custom data attributes

## Example: Water Tank

```javascript
// 1. Draw rectangle in editor
// 2. Ctrl+Click to open dialog
// 3. Configure:
{
  paramName: "TANK_01_LEVEL",
  type: "gradient-level",
  direction: "bottom-to-top",
  minValue: 0,
  maxValue: 100,
  fillColor: "#0066cc",
  emptyColor: "#e0e0e0"
}
// 4. Export SVG
// 5. Update in React:
updateParameter('TANK_01_LEVEL', 75.5); // Tank fills to 75.5%
```

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Contributing

This is a specialized SCADA visualization tool. For issues or feature requests, please refer to the documentation or contact the development team.

## License

See LICENSE file for details.

---

**Version 1.0.0** | Built with ❤️ for SCADA visualization | Powered by draw.io & Supabase