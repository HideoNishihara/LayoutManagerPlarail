//% weight=100 color=#0fbc11 icon="\uf239" block="Layout Manager Plarail"
namespace plarail {
    let speedA = 0
    let speedB = 0
    const RED_LED = DigitalPin.P14
    const BLUE_LED = DigitalPin.P15
    const VOLTAGE_PIN = AnalogPin.P2
    const VOLTAGE_THRESHOLD = 2.4

    //% blockId=plarail_init_monitor
    //% block="初期化（電圧監視とLED表示）"
    export function initialize(): void {
        control.inBackground(function () {
            while (true) {
                const adc = pins.analogReadPin(VOLTAGE_PIN)
                const voltage = adc * 3.3 / 1023 * 2
                if (voltage < VOLTAGE_THRESHOLD) {
                    pins.digitalWritePin(RED_LED, 1)
                    pins.digitalWritePin(BLUE_LED, 0)
                } else {
                    pins.digitalWritePin(RED_LED, 0)
                    pins.digitalWritePin(BLUE_LED, 1)
                }
                basic.pause(1000)
            }
        });
    }

    //% blockId=plarail_forward_up_a
    //% block="列車A 前進加速"
    export function forwardUpA(): void {
        if (speedA < 6) speedA++
        sendIR(0, 1, speedA)
    }

    //% blockId=plarail_forward_up_b
    //% block="列車B 前進加速"
    export function forwardUpB(): void {
        if (speedB < 6) speedB++
        sendIR(1, 1, speedB)
    }

    //% blockId=plarail_forward_down_a
    //% block="列車A 前進減速"
    export function forwardDownA(): void {
        if (speedA > 0) speedA--
        sendIR(0, 1, speedA)
    }

    //% blockId=plarail_forward_down_b
    //% block="列車B 前進減速"
    export function forwardDownB(): void {
        if (speedB > 0) speedB--
        sendIR(1, 1, speedB)
    }

    //% blockId=plarail_stop_a
    //% block="列車A 停止"
    export function stopA(): void {
        speedA = 0
        sendIR(0, 1, 0)
    }

    //% blockId=plarail_stop_b
    //% block="列車B 停止"
    export function stopB(): void {
        speedB = 0
        sendIR(1, 1, 0)
    }

    //% blockId=plarail_reverse_a
    //% block="列車A 後進"
    export function reverseA(): void {
        sendIR(0, 2, 0) // 方向: 2=後進, 速度: 0（定速扱い）
    }

    //% blockId=plarail_reverse_b
    //% block="列車B 後進"
    export function reverseB(): void {
        sendIR(1, 2, 0)
    }

    /**
     * IR送信処理（C++実装側に委ねる）
     * @param id 車両ID（0=A, 1=B）
     * @param dir 方向（1=前進, 2=後進）
     * @param speed 速度（0=停止, 1〜6）
     */
    //% shim=plarail::sendIR
    declare function sendIR(id: number, dir: number, speed: number): void;
}
