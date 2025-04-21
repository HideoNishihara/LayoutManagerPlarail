#pragma once

namespace plarail {
    void sendIR(int id, int dir, int speed);
    int receiveIRSensorNative();
}
