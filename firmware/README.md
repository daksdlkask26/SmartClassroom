# Firmware ESP32

Thư mục này dành cho mã chạy trên ESP32 DevKitC (PlatformIO, Arduino framework). Mô-đun MQ-135 thực hiện phần tính toán và kiểm thử giả lập của ID 2 trong [thuyết minh](../Docs/thuyet_minh.tex).

## Ước lượng CO₂ từ MQ-135 (ID 2)

[`mq135.h`](include/mq135.h) và [`mq135.cpp`](src/mq135.cpp) dùng C++11. Mô-đun nhận một lô điện áp đã hiệu chuẩn tại chân ADC theo đơn vị V. Khi nối với Arduino-ESP32, đổi giá trị mV từ `analogReadMilliVolts()` bằng phép chia `1000.0`. Cấu hình `Circuit` lấy điện áp nguồn $V_C$, điện trở tải của module, hai điện trở chia áp và khoảng đo tuyến tính của ADC trên mạch thực tế. [Tài liệu ADC của Espressif](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html)

1. Lấy trung bình các mẫu đầu vào rồi khôi phục $V_{out} = \overline{V_{ADC}}(R_1 + R_2)/R_2$. Khi AO lấy tại nút giữa $R_S$ và $R_L$, cầu chia áp mắc song song với tải. Dùng $R_{L,eff} = R_L \parallel (R_1 + R_2)$ và $R_S = R_{L,eff}(V_C - V_{out})/V_{out}$. [Sơ đồ nguyên lý trong Phụ lục A](../Docs/Phu_luc_A_MQ135.pdf)
2. Tính $C = a(R_S/R_0)^{-b}$. Truyền $a, b > 0$ và $R_0$ theo Ω của thiết bị khi tạo `Estimator`. Bộ kiểm thử dùng một đường tổng hợp có kết quả tính tay và đường tham khảo của GeorgK. Khi lắp mạch, cần chọn hệ số cho module thực tế. Ví dụ, tài liệu Winsen MQ-135 nêu đặc tuyến cho hydro, amoniac và toluen. [Hệ số GeorgK](https://github.com/GeorgK/MQ135/blob/master/MQ135.h) · [Tài liệu Winsen](https://www.winsen-sensor.com/manual/mq135.html)
3. Giữ tối đa 3 giá trị ppm liên tiếp để lấy trung bình trượt, sau đó làm tròn. Khi một lô có mẫu bão hòa, giá trị không hữu hạn hoặc ppm nằm ngoài khoảng hợp lệ của hợp đồng, `update()` trả `Error` và bắt đầu lại bộ lọc từ lô hợp lệ tiếp theo.

Khi làm nóng hoặc chưa có $R_0$ (truyền `0`), `update()` trả `Warming`. Khi tạo telemetry, ánh xạ `Ok` thành `sensors.mq135: "ok"` và `co2` bằng `Estimate::ppm`. Với `Warming` hoặc `Error`, gửi `"warming"` hoặc `"error"` và `co2: null`. Khi nạp $R_0$ mới, khởi tạo lại đối tượng. MQ-135 nhạy với nhiều loại khí nên ppm biểu thị xu hướng tham khảo.

### Chạy kiểm thử trên máy tính

Từ thư mục `firmware/` với `g++` hỗ trợ C++11. Các ca kiểm thử bao gồm điện trở tải song song, ADC có nhiễu, lượng tử hóa 1 mV, trung bình trượt, làm tròn và dữ liệu lỗi.

```bash
mkdir -p build
g++ -std=c++11 -Wall -Wextra -Werror -pedantic -Iinclude src/mq135.cpp test/mq135_test.cpp -o build/mq135-test
./build/mq135-test
```

Trên Windows PowerShell, dùng các lệnh sau.

```powershell
New-Item -ItemType Directory -Path build -Force | Out-Null
g++ -std=c++11 -Wall -Wextra -Werror -pedantic -Iinclude src/mq135.cpp test/mq135_test.cpp -o build/mq135-test.exe
.\build\mq135-test.exe
```

## Quy ước bắt buộc

Firmware phải theo [`contract/README.md`](../contract/README.md), nhất là mục 7.

- Topic, trường JSON và hằng số lấy từ [`contract/system.json`](../contract/system.json).
- `client.setBufferSize(512)` trước khi `connect()`.
- Khai báo LWT trên `status` (QoS 1, retained) và publish `status` online (retained) sau mỗi lần kết nối.
- Client ID riêng, ví dụ `sc-01-esp32`.
- Gửi `bootId` (chuỗi ngẫu nhiên tạo mỗi lần khởi động, ví dụ từ `esp_random()`) trong mọi `telemetry`.

## Bí mật và HiveMQ Cloud

Khi ghép WiFi và MQTT, sao chép [`include/secrets.example.h`](include/secrets.example.h) thành `include/secrets.h` và điền thông tin thật. `secrets.h` đã được Git bỏ qua. Lấy hostname của broker trong **Overview** và tài khoản MQTT của thiết bị trong **Access Management**. Dùng hostname với cổng `8883` và xác thực CA qua `WiFiClientSecure`. Backend dùng cùng broker và mã thiết bị, cấu hình theo [hướng dẫn server](../server/README.md#hivemq-cloud).

## Cấu trúc

```text
firmware/
├── include/
│   ├── mq135.h
│   └── secrets.example.h
├── src/mq135.cpp
└── test/mq135_test.cpp
```
