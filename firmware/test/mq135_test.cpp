#include "mq135.h"

#include <cmath>
#include <cstdlib>
#include <iostream>
#include <limits>

namespace {

using mq135::Circuit;
using mq135::Estimate;
using mq135::Estimator;
using mq135::Status;

// Mạch giả lập: cầu 1:2, RL hiệu dụng 10 kΩ, R0 giả lập 10 kΩ.
constexpr Circuit circuit{5.0, 20000.0, 10000.0, 10000.0, 0.15, 2.4};
constexpr mq135::Curve simpleCurve{1000.0, 1.0};
constexpr double r0Ohms = 10000.0;
constexpr double nominalAdc = 1.25;

void expect(bool condition, const char* message) {
    if (condition) return;
    std::cerr << "FAIL: " << message << '\n';
    std::exit(EXIT_FAILURE);
}

void expectEstimate(Estimate value, Status status, int ppm, const char* message) {
    if (value.status == status && value.ppm == ppm) return;
    std::cerr << "Expected status " << static_cast<int>(status) << ", ppm " << ppm
              << "; got " << static_cast<int>(value.status) << ", ppm " << value.ppm << '\n';
    expect(false, message);
}

void measuresResistanceWithDividerLoading() {
    // ADC trung bình 0,5 V, AO 2 V, RL hiệu dụng 20 kΩ -> RS 30 kΩ.
    const Circuit asymmetric{5.0, 40000.0, 30000.0, 10000.0, 0.15, 2.4};
    const double adc[] = {0.45, 0.55, 0.48, 0.52};
    double rsOhms = 0.0;
    expect(mq135::resistanceFromAdcSamples(asymmetric, adc, 4, rsOhms), "valid ADC batch");
    expect(std::abs(rsOhms - 30000.0) < 1e-8, "reconstruct AO and account for parallel load");
}

void estimatesReferenceCurveFromQuantizedVoltages() {
    constexpr mq135::Curve reference{116.6020682, 2.769034857};
    // Điện áp tính ngược tại 420, 850, 1000, 1500, 2000 ppm và lượng tử hóa đến 1 mV.
    // Ppm kỳ vọng tính độc lập bằng số thập phân độ chính xác cao từ các điện áp đã lượng tử hóa.
    const double adc[] = {1.534, 1.680, 1.712, 1.789, 1.841};
    const int expected[] = {420, 850, 1000, 1501, 2005};
    for (std::size_t i = 0; i < 5; ++i) {
        Estimator estimate(circuit, reference, r0Ohms);
        expectEstimate(estimate.update(&adc[i], 1, true), Status::Ok, expected[i], "power curve at 1 mV resolution");
    }
}

void averagesAdcBeforeTheNonlinearConversion() {
    Estimator estimate(circuit, simpleCurve, r0Ohms);
    const double adc[] = {1.20, 1.30, 1.13, 1.37};
    expectEstimate(estimate.update(adc, 4, true), Status::Ok, 1000, "average voltages before converting to ppm");
}

void smoothsShortPpmSpikesAndDropsOldValues() {
    Estimator estimate(circuit, simpleCurve, r0Ohms);
    // Ppm thô lần lượt 1000, 4000, 1000, 1000, 1000.
    const double adc[] = {1.25, 2.0, 1.25, 1.25, 1.25};
    const int expected[] = {1000, 2500, 2000, 2000, 1000};
    for (std::size_t i = 0; i < 5; ++i) {
        expectEstimate(estimate.update(&adc[i], 1, true), Status::Ok, expected[i], "moving mean over up to 3 batches");
    }
}

void roundsOnlyAfterSmoothing() {
    Estimator estimate(circuit, mq135::Curve{1000.4, 1.0}, r0Ohms);
    expectEstimate(estimate.update(&nominalAdc, 1, true), Status::Ok, 1000, "1000.4 rounds down");
    estimate.update(&nominalAdc, 1, true);
    const double slightlyHigherAdc = 1.25025;
    expectEstimate(estimate.update(&slightlyHigherAdc, 1, true), Status::Ok, 1001, "mean of 1000.4, 1000.4 and about 1000.8");
}

void rejectsInvalidInputsAndResetsAfterGaps() {
    Estimator estimate(circuit, simpleCurve, r0Ohms);
    const double highAdc = 2.0;
    const double nan = std::numeric_limits<double>::quiet_NaN();
    const double infinity = std::numeric_limits<double>::infinity();
    const double invalidVolts[] = {0.0, -0.5, nan, infinity, circuit.adcMinVolts, circuit.adcMaxVolts, 2.6};
    for (double invalid : invalidVolts) {
        estimate.update(&highAdc, 1, true);
        const double badBatch[] = {nominalAdc, invalid, nominalAdc};
        expectEstimate(estimate.update(badBatch, 3, true), Status::Error, -1, "reject entire invalid ADC batch");
        expectEstimate(estimate.update(&nominalAdc, 1, true), Status::Ok, 1000, "restart filter after invalid batch");
    }
    expectEstimate(estimate.update(nullptr, 1, true), Status::Error, -1, "missing samples");
    expectEstimate(estimate.update(&nominalAdc, 0, true), Status::Error, -1, "empty batch");

    estimate.update(&highAdc, 1, true);
    expectEstimate(estimate.update(nullptr, 0, false), Status::Warming, -1, "heater not ready");
    expectEstimate(estimate.update(&nominalAdc, 1, true), Status::Ok, 1000, "restart filter after warming");
    Estimator uncalibrated(circuit, simpleCurve, 0.0);
    expectEstimate(uncalibrated.update(&nominalAdc, 1, true), Status::Warming, -1, "missing R0");

    const double invalidR0[] = {-1.0, nan, infinity};
    for (double r0 : invalidR0) {
        Estimator badCalibration(circuit, simpleCurve, r0);
        expectEstimate(badCalibration.update(&nominalAdc, 1, true), Status::Error, -1, "invalid R0");
    }
    Estimator invalidCurve(circuit, mq135::Curve{1000.0, 0.0}, r0Ohms);
    expectEstimate(invalidCurve.update(&nominalAdc, 1, true), Status::Error, -1, "invalid exponent");
    Estimator invalidScale(circuit, mq135::Curve{nan, 1.0}, r0Ohms);
    expectEstimate(invalidScale.update(&nominalAdc, 1, true), Status::Error, -1, "invalid coefficient");

    Circuit invalidLoad = circuit;
    invalidLoad.loadOhms = 0.0;
    double rsOhms = 123.0;
    expect(!mq135::resistanceFromAdcSamples(invalidLoad, &nominalAdc, 1, rsOhms), "invalid load");
    expect(rsOhms == 123.0, "leave output untouched on failure");
    Circuit higherLimit = circuit;
    higherLimit.adcMaxVolts = 3.0;
    const double physicalLimit = 2.5;
    expect(!mq135::resistanceFromAdcSamples(higherLimit, &physicalLimit, 1, rsOhms), "reject AO at supply rail");
}

void respectsTelemetryPpmRange() {
    Estimator atLimit(circuit, mq135::Curve{10000.0, 1.0}, r0Ohms);
    expectEstimate(atLimit.update(&nominalAdc, 1, true), Status::Ok, 10000, "accept upper contract bound");
    const double aboveLimitAdc = 1.25001;
    expectEstimate(atLimit.update(&aboveLimitAdc, 1, true), Status::Error, -1, "reject out-of-range before smoothing and rounding");
}

} // namespace

int main() {
    measuresResistanceWithDividerLoading();
    estimatesReferenceCurveFromQuantizedVoltages();
    averagesAdcBeforeTheNonlinearConversion();
    smoothsShortPpmSpikesAndDropsOldValues();
    roundsOnlyAfterSmoothing();
    rejectsInvalidInputsAndResetsAfterGaps();
    respectsTelemetryPpmRange();
    std::cout << "PASS: 7 MQ-135 simulation tests\n";
}
