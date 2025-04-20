#include "pxt.h"
using namespace pxt;

#define IR_PIN        P1_0
#define VOLTAGE_PIN   P2
#define RED_LED_PIN   P14
#define BLUE_LED_PIN  P15

static int lastIRCmd = -1;

namespace plarail {

void pulseIR() {
    digitalWrite(RED_LED_PIN, 1);
    target_wait_us(50000);
    digitalWrite(RED_LED_PIN, 0);
}

void pulseBLUE() {
    digitalWrite(BLUE_LED_PIN, 1);
    target_wait_us(50000);
    digitalWrite(BLUE_LED_PIN, 0);
}

void sendIRNative(int cmd) {
    pulseIR();
    // TODO: 実際のIRフォーマットに従って送信
}

int receiveIRNative() {
    int value1 = 0, value2 = 0;
    // TODO: 実際のIRフォーマットに従ってデコード
    value1 = 0xA2;
    value2 = 0xA2;

    if (value1 == value2) {
        pulseBLUE();
        return value1;
    } else {
        return -1;
    }
}
}