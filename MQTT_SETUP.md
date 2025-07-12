# MQTT Broker Setup Guide

## 🔧 Cấu hình MQTT Broker với Authentication

### 1. **Cập nhật cấu hình broker**

Mở file `src/config/mqtt-config.ts` và thay đổi các thông tin sau:

```typescript
export const mqttConfig: MqttBrokerConfig = {
  host: "YOUR_BROKER_IP", // ← Thay đổi thành IP broker của bạn
  port: 1883, // ← Port MQTT (1883) hoặc SSL (8883)
  path: "/mqtt",
  useSSL: false, // ← true nếu dùng SSL/TLS
  username: "YOUR_USERNAME", // ← Username để authenticate
  password: "YOUR_PASSWORD", // ← Password để authenticate
  clientId: "react-mqtt-client-" + Math.random().toString(16).substring(2, 10)
};
```

### 2. **Ví dụ cấu hình cho các broker phổ biến**

#### **Eclipse Mosquitto (Local)**

```typescript
export const mqttConfig: MqttBrokerConfig = {
  host: "192.168.1.100", // IP của máy chủ Mosquitto
  port: 1883,
  path: "/mqtt",
  useSSL: false,
  username: "admin",
  password: "password123"
};
```

#### **HiveMQ Cloud**

```typescript
export const mqttConfig: MqttBrokerConfig = {
  host: "your-cluster.hivemq.cloud",
  port: 8883,
  path: "/mqtt",
  useSSL: true,
  username: "your-hivemq-username",
  password: "your-hivemq-password"
};
```

#### **AWS IoT Core**

```typescript
export const mqttConfig: MqttBrokerConfig = {
  host: "your-iot-endpoint.amazonaws.com",
  port: 8883,
  path: "/mqtt",
  useSSL: true,
  username: "your-aws-username",
  password: "your-aws-password"
};
```

### 3. **Cấu hình Mosquitto với Authentication**

#### **Bước 1: Cài đặt Mosquitto**

```bash
# Ubuntu/Debian
sudo apt-get install mosquitto mosquitto-clients

# macOS
brew install mosquitto

# Windows
# Tải từ https://mosquitto.org/download/
```

#### **Bước 2: Tạo file cấu hình**

Tạo file `/etc/mosquitto/mosquitto.conf`:

```conf
# Cấu hình cơ bản
listener 1883
allow_anonymous false

# File chứa username/password
password_file /etc/mosquitto/passwd

# Log
log_type all
log_dest file /var/log/mosquitto/mosquitto.log
```

#### **Bước 3: Tạo user và password**

```bash
# Tạo file password
sudo mosquitto_passwd -c /etc/mosquitto/passwd admin

# Thêm user khác (nếu cần)
sudo mosquitto_passwd /etc/mosquitto/passwd user2
```

#### **Bước 4: Khởi động Mosquitto**

```bash
# Ubuntu/Debian
sudo systemctl start mosquitto
sudo systemctl enable mosquitto

# macOS
brew services start mosquitto

# Windows
# Chạy mosquitto.exe
```

### 4. **Test kết nối**

#### **Sử dụng mosquitto_pub/sub để test**

```bash
# Subscribe
mosquitto_sub -h YOUR_BROKER_IP -p 1883 -u YOUR_USERNAME -P YOUR_PASSWORD -t "test/topic"

# Publish
mosquitto_pub -h YOUR_BROKER_IP -p 1883 -u YOUR_USERNAME -P YOUR_PASSWORD -t "test/topic" -m "Hello MQTT"
```

### 5. **Cấu hình SSL/TLS (Tùy chọn)**

#### **Tạo certificate**

```bash
# Tạo CA certificate
openssl req -new -x509 -days 365 -extensions v3_ca -keyout ca.key -out ca.crt

# Tạo server certificate
openssl req -new -out server.csr -keyout server.key
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 365
```

#### **Cấu hình Mosquitto với SSL**

```conf
# /etc/mosquitto/mosquitto.conf
listener 8883
certfile /path/to/server.crt
keyfile /path/to/server.key
cafile /path/to/ca.crt
allow_anonymous false
password_file /etc/mosquitto/passwd
```

### 6. **Troubleshooting**

#### **Lỗi kết nối**

1. **Kiểm tra firewall**: Mở port 1883 (MQTT) hoặc 8883 (MQTT over SSL)
2. **Kiểm tra network**: Ping đến broker IP
3. **Kiểm tra authentication**: Verify username/password
4. **Kiểm tra SSL**: Nếu dùng SSL, verify certificates

#### **Lỗi thường gặp**

```bash
# Connection refused
# → Kiểm tra broker có đang chạy không

# Connection timeout
# → Kiểm tra firewall và network

# Authentication failed
# → Kiểm tra username/password

# SSL certificate error
# → Kiểm tra certificate và CA
```

### 7. **Security Best Practices**

#### **Network Security**

- Sử dụng VPN cho kết nối remote
- Restrict access bằng firewall rules
- Sử dụng non-standard ports (nếu có thể)

#### **Authentication**

- Sử dụng strong passwords
- Rotate passwords regularly
- Sử dụng certificate-based authentication (cho production)

#### **SSL/TLS**

- Sử dụng SSL/TLS cho production
- Verify certificate validity
- Sử dụng proper cipher suites

### 8. **Monitoring và Logging**

#### **Mosquitto Logs**

```bash
# Xem logs
sudo tail -f /var/log/mosquitto/mosquitto.log

# Log levels
log_type error    # Chỉ log errors
log_type warning  # Log warnings và errors
log_type notice   # Log notices, warnings, errors
log_type info     # Log info, notices, warnings, errors
log_type debug    # Log tất cả
```

#### **Client Logs**

- Kiểm tra browser console cho connection errors
- Sử dụng network tab để debug WebSocket connections

### 9. **Performance Tuning**

#### **Mosquitto Settings**

```conf
# /etc/mosquitto/mosquitto.conf
max_connections 1000
max_inflight_messages 20
max_queued_messages 100
persistence true
persistence_location /var/lib/mosquitto/
```

#### **Client Settings**

```typescript
// Trong mqtt-config.ts
export const mqttConfig: MqttBrokerConfig = {
  // ... other config
  keepAliveInterval: 60, // Keep-alive interval (seconds)
  cleanSession: true, // Clean session on disconnect
  timeout: 30 // Connection timeout (seconds)
};
```

---

**Lưu ý**: Đảm bảo thay đổi tất cả placeholder values (`YOUR_BROKER_IP`, `YOUR_USERNAME`, `YOUR_PASSWORD`) thành giá trị thực tế của bạn trước khi chạy ứng dụng! 🔐
