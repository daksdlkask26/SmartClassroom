#pragma once

#include <array>
#include <cstddef>

namespace mq135 {

// AO lấy trực tiếp từ nút giữa RS và RL. R1 nối AO với ADC, R2 nối ADC với GND.
struct Circuit {
    double supplyVolts;
    double loadOhms;
    double dividerTopOhms;
    double dividerBottomOhms;
    double adcMinVolts;
    double adcMaxVolts;
};

struct Curve {
    double aPpm;
    double b;
};

enum class Status { Ok, Warming, Error };

struct Estimate {
    Status status;
    int ppm; // Chỉ dùng khi Ok. Warming và Error tương ứng co2: null trong telemetry.
};

// Mẫu là điện áp đã hiệu chuẩn tại chân ADC (V). Trả false khi một mẫu nằm ngoài
// khoảng mở (adcMinVolts, adcMaxVolts) hoặc mạch, lô mẫu không hợp lệ.
bool resistanceFromAdcSamples(const Circuit& circuit, const double* adcVolts,
                              std::size_t sampleCount, double& rsOhms);

class Estimator {
public:
    // r0Ohms = 0 biểu thị chưa có hiệu chuẩn. Khởi tạo lại khi đổi R0 hoặc cấu hình mạch.
    Estimator(Circuit circuit, Curve curve, double r0Ohms);

    // Mỗi lần gọi là một lô mẫu. Lọc trượt 3 lô liên tiếp, chỉ làm tròn ở đầu ra.
    Estimate update(const double* adcVolts, std::size_t sampleCount, bool heaterReady);

private:
    Estimate unavailable(Status status);

    Circuit circuit_;
    Curve curve_;
    double r0Ohms_;
    std::array<double, 3> recentPpm_{};
    std::size_t count_ = 0;
    std::size_t next_ = 0;
};

} // namespace mq135
