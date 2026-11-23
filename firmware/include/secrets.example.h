#pragma once

// Sao chép thành secrets.h và điền thông tin của thiết bị khi ghép WiFi/MQTT.
namespace secrets {

constexpr char wifiSsid[] = "";
constexpr char wifiPassword[] = "";

// HiveMQ Cloud: hostname ở mục Overview, ví dụ your-broker-host, chỉ gồm tên máy chủ.
constexpr char mqttHost[] = "";
constexpr unsigned int mqttPort = 8883;
constexpr char mqttUsername[] = "";
constexpr char mqttPassword[] = "";

} // namespace secrets
