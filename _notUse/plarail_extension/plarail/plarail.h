#pragma once
namespace plarail {
    void sendIRNative(int id, int direction, int speed);
    void setLowVoltageThresholdNative(float voltage);
    int getLastSystemAddressNative();
    int getLastCommandNative();
}