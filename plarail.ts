//% block="Layout Manager Plarail"
//% weight=100 color=#0fbc11 icon=""
namespace plarail {

    //% blockId=plarail_send_ir
    //% block="send IR command | system id %id | direction %dir | speed %speed"
    //% id.min=0 id.max=15 dir.min=0 dir.max=3 speed.min=0 speed.max=15
    export function sendIR(id: number, dir: number, speed: number): void {
        const cmd = ((id & 0x0F) << 4) | ((dir & 0x03) << 2) | (speed & 0x03);
        sendIRNative(cmd);
    }

    //% blockId=plarail_on_ir_receive
    //% block="on IR received with system id %id do %handler"
    //% draggableParameters
    export function onIRReceive(id: number, handler: (cmd: number) => void): void {
        control.inBackground(function () {
            while (true) {
                const received = receiveIRNative();
                const receivedId = (received >> 4) & 0x0F;
                const payload = received & 0x0F;
                if (receivedId == id) {
                    handler(payload);
                }
                basic.pause(100);
            }
        });
    }

    //% shim=plarail::sendIRNative
    declare function sendIRNative(cmd: number): void;

    //% shim=plarail::receiveIRNative
    declare function receiveIRNative(): number;
}