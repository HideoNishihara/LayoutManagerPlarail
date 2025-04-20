#ifndef IR_H
#define IR_H

#include <stdint.h>

namespace IR {
    void send(uint8_t address, uint8_t command);
    void startReceive();
}

#endif
