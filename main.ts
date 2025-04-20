//% weight=100 color=#0fbc11 icon="\uf239" block="Layout Manager Plarail"
namespace plarail {
    /**
     * LEDを交互に点滅させる（テスト用）
     */
    //% blockId=plarail_test_blink
    //% block="LEDを交互に点滅する6"
    //% weight=90
    export function testBlink(): void {
        control.inBackground(function () {
            while (true) {
                pins.digitalWritePin(DigitalPin.P14, 1); // 赤
                pins.digitalWritePin(DigitalPin.P15, 0); // 青
                basic.pause(500);
                pins.digitalWritePin(DigitalPin.P14, 0);
                pins.digitalWritePin(DigitalPin.P15, 1);
                basic.pause(500);
            }
        });
    }
}
