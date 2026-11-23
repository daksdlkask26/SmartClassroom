#include "mq135.h"

#include <algorithm>
#include <cmath>

namespace mq135 {
namespace {

// contract/system.json, metrics.co2.valid
constexpr double maxTelemetryPpm = 10000.0;

bool positiveFinite(double value) {
    return value > 0.0 && std::isfinite(value);
}

} // namespace

bool resistanceFromAdcSamples(const Circuit& circuit, const double* adcVolts,
                              std::size_t sampleCount, double& rsOhms) {
    if (adcVolts == nullptr || sampleCount == 0 || !positiveFinite(circuit.supplyVolts)
        || !positiveFinite(circuit.loadOhms) || !positiveFinite(circuit.dividerTopOhms)
        || !positiveFinite(circuit.dividerBottomOhms) || !std::isfinite(circuit.adcMinVolts)
        || circuit.adcMinVolts < 0.0 || !positiveFinite(circuit.adcMaxVolts)
        || circuit.adcMinVolts >= circuit.adcMaxVolts) {
        return false;
    }

    const double dividerOhms = circuit.dividerTopOhms + circuit.dividerBottomOhms;
    const double dividerRatio = circuit.dividerBottomOhms / dividerOhms;
    const double maxAdcVolts = std::min(circuit.adcMaxVolts, circuit.supplyVolts * dividerRatio);
    double sumVolts = 0.0;
    for (std::size_t i = 0; i < sampleCount; ++i) {
        const double volts = adcVolts[i];
        if (!(volts > circuit.adcMinVolts && volts < maxAdcVolts)) return false;
        sumVolts += volts;
    }

    const double vOut = (sumVolts / static_cast<double>(sampleCount)) / dividerRatio;
    // Tại AO, cầu R1 + R2 và RL là hai nhánh song song về GND.
    const double smaller = std::min(circuit.loadOhms, dividerOhms);
    const double larger = std::max(circuit.loadOhms, dividerOhms);
    const double effectiveLoad = smaller / (1.0 + smaller / larger);
    const double resistance = effectiveLoad * ((circuit.supplyVolts - vOut) / vOut);
    if (!positiveFinite(resistance)) return false;

    rsOhms = resistance;
    return true;
}

Estimator::Estimator(Circuit circuit, Curve curve, double r0Ohms)
    : circuit_(circuit), curve_(curve), r0Ohms_(r0Ohms) {}

Estimate Estimator::update(const double* adcVolts, std::size_t sampleCount, bool heaterReady) {
    if (!heaterReady || r0Ohms_ == 0.0) return unavailable(Status::Warming);

    double rsOhms = 0.0;
    if (!positiveFinite(r0Ohms_) || !positiveFinite(curve_.aPpm) || !positiveFinite(curve_.b)
        || !resistanceFromAdcSamples(circuit_, adcVolts, sampleCount, rsOhms)) {
        return unavailable(Status::Error);
    }

    const double ppm = curve_.aPpm * std::pow(rsOhms / r0Ohms_, -curve_.b);
    if (!positiveFinite(ppm) || ppm > maxTelemetryPpm) return unavailable(Status::Error);

    recentPpm_[next_] = ppm;
    next_ = (next_ + 1) % recentPpm_.size();
    count_ = std::min(count_ + 1, recentPpm_.size());
    double sumPpm = 0.0;
    for (std::size_t i = 0; i < count_; ++i) sumPpm += recentPpm_[i];
    return {Status::Ok, static_cast<int>(std::round(sumPpm / static_cast<double>(count_)))};
}

Estimate Estimator::unavailable(Status status) {
    count_ = 0;
    next_ = 0;
    return {status, -1};
}

} // namespace mq135
