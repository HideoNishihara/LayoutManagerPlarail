//% block="Layout Manager Plarail"
//% color=#ff8000 icon=""
//% groups=["IR通信", "電圧監視"]

namespace plarail {
    //% block="送信: 車両ID $id にコマンド $cmd を送信"
    //% id.min=0 id.max=15
    //% cmd.min=0 cmd.max=127
    export function sendIR(id: number, cmd: number) {
        sendIRNative((id & 0x0F) << 4 | (cmd & 0x7F));
        pins.digitalWritePin(DigitalPin.P14, 1)
        basic.pause(50)
        pins.digitalWritePin(DigitalPin.P14, 0)
    }

    //% block="IR受信を監視する"
    export function onReceive(callback: (id: number, cmd: number) => void) {
        control.inBackground(() => {
            while (true) {
                let raw = receiveIRNative();
                if (raw >= 0) {
                    const id = (raw >> 4) & 0x0F;
                    const cmd = raw & 0x0F;
                    callback(id, cmd);
                    pins.digitalWritePin(DigitalPin.P15, 1)
                    basic.pause(50)
                    pins.digitalWritePin(DigitalPin.P15, 0)
                }
                basic.pause(10);
            }
        });
    }

    //% block="バッテリ電圧監視: しきい値 $threshold (V)"
    export function monitorBattery(threshold: number) {
        control.inBackground(() => {
            while (true) {
                let v = pins.analogReadPin(AnalogPin.P2) * 3.3 / 1023 * 2;
                if (v < threshold) {
                    pins.digitalWritePin(DigitalPin.P14, 1)
                    basic.pause(50)
                    pins.digitalWritePin(DigitalPin.P14, 0)
                }
                basic.pause(2000);
            }
        });
    }

    // ネイティブ関数定義
    //% shim=plarail::sendIRNative
    declare function sendIRNative(data: number): void;

    //% shim=plarail::receiveIRNative
    declare function receiveIRNative(): number;
}
