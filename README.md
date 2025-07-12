# React MQTT Client

A modern React MQTT client built with TypeScript, Vite, and Paho MQTT library.

## 🚀 Features

- **Real-time MQTT Communication**: Connect to MQTT brokers and exchange messages
- **TypeScript Support**: Full type safety and IntelliSense
- **Modern Build Tool**: Built with Vite for fast development and optimized builds
- **Custom Hook**: `useMqtt` hook for easy MQTT integration
- **Bootstrap UI**: Clean and responsive user interface
- **Comprehensive Testing**: Unit tests, integration tests, and coverage reports
- **Connection Management**: Automatic reconnection and connection state management

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- MQTT broker (e.g., HiveMQ, Mosquitto, AWS IoT)

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/hadtt-hust/mqtt-client.git
cd mqtt-client
```

2. **Install dependencies**

```bash
npm install
```

3. **Start development server**

```bash
npm run dev
```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── Header.tsx       # Application header
│   └── MqttTest.tsx     # MQTT test interface
├── hooks/               # Custom React hooks
│   └── useMqtt.ts       # MQTT connection hook
├── types/               # TypeScript type definitions
│   └── mqtt.ts          # MQTT related types
├── __tests__/           # Test files
│   ├── integration.test.tsx
│   ├── useMqtt.test.ts
│   └── components.test.tsx
├── __mocks__/           # Mock files for testing
│   └── styleMock.js
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── setupTests.ts        # Test setup configuration
```

## 🔧 Configuration

### MQTT Broker Settings

The application is configured to connect to HiveMQ's public broker by default:

```typescript
const mqttConfig = {
  host: "broker.hivemq.com",
  port: 8000,
  path: "/mqtt",
  useSSL: false
};
```

### Custom Broker Configuration

To use your own MQTT broker, modify the configuration in `src/App.tsx`:

```typescript
const { client, isConnected, messages, subscribe, publish } = useMqtt({
  host: "your-broker-host.com",
  port: 1883, // or 8883 for SSL
  path: "/mqtt",
  useSSL: true // set to true for SSL/TLS
});
```

## 📖 Usage

### Basic MQTT Operations

1. **Connect to Broker**

   - The application automatically connects to the configured MQTT broker
   - Connection status is displayed in the UI

2. **Subscribe to Topics**

   - The app subscribes to `psu/drone` topic by default
   - Messages are automatically received and displayed

3. **Publish Messages**
   - Type a message in the input field
   - Click "Send Message" or press Enter
   - Messages are published to `psu/drone` topic

### Using the useMqtt Hook

```typescript
import useMqtt from "./hooks/useMqtt";

function MyComponent() {
  const { client, isConnected, messages, subscribe, publish } = useMqtt({
    host: "broker.hivemq.com",
    port: 8000,
    path: "/mqtt",
    useSSL: false
  });

  // Subscribe to a topic
  useEffect(() => {
    if (isConnected) {
      subscribe("my/topic");
    }
  }, [isConnected]);

  // Publish a message
  const handleSend = () => {
    publish("my/topic", "Hello MQTT!");
  };

  return (
    <div>
      <p>Connected: {isConnected ? "Yes" : "No"}</p>
      <p>Messages: {messages.length}</p>
    </div>
  );
}
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Coverage

The project includes comprehensive test coverage:

- **Unit Tests**: Individual components and hooks
- **Integration Tests**: Complete application workflows
- **Type Tests**: TypeScript type validation
- **Coverage Reports**: HTML and text coverage reports

## 🚀 Build and Deploy

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📦 Available Scripts

| Script                  | Description                  |
| ----------------------- | ---------------------------- |
| `npm run dev`           | Start development server     |
| `npm run build`         | Build for production         |
| `npm run preview`       | Preview production build     |
| `npm test`              | Run all tests                |
| `npm run test:watch`    | Run tests in watch mode      |
| `npm run test:coverage` | Run tests with coverage      |
| `npm run test:ci`       | Run tests for CI environment |
| `npm run lint`          | Run ESLint                   |

## 🔧 Technologies Used

- **React 18**: Modern React with hooks
- **TypeScript**: Type safety and better development experience
- **Vite**: Fast build tool and development server
- **Paho MQTT**: MQTT client library
- **React Bootstrap**: UI components
- **Jest**: Testing framework
- **React Testing Library**: Component testing utilities

## 📚 Dependencies

### Production Dependencies

- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `paho-mqtt`: ^1.1.0
- `react-bootstrap`: ^2.9.0
- `bootstrap`: ^5.3.7

### Development Dependencies

- `typescript`: ^5.8.3
- `vite`: ^5.0.8
- `@vitejs/plugin-react`: ^4.2.1
- `jest`: ^29.7.0
- `@testing-library/react`: ^14.2.1
- `@testing-library/jest-dom`: ^6.4.2

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Connection Failed**

   - Check if the MQTT broker is running
   - Verify broker host, port, and path settings
   - Ensure firewall allows MQTT connections

2. **Messages Not Received**

   - Verify topic subscription
   - Check message format and encoding
   - Ensure QoS settings are compatible

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript configuration
   - Verify all dependencies are installed

### Getting Help

- Check the [Issues](https://github.com/hadtt-hust/mqtt-client/issues) page
- Create a new issue with detailed description
- Include error messages and steps to reproduce

## 📈 Roadmap

- [ ] Add support for multiple MQTT brokers
- [ ] Implement message persistence
- [ ] Add message encryption
- [ ] Create mobile-responsive design
- [ ] Add real-time message filtering
- [ ] Implement message history
- [ ] Add user authentication
- [ ] Create admin dashboard

---

**Happy MQTT-ing! 🚀**

