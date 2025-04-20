//% weight=100 color=#0fbc11 icon="🚂"
namespace plarail {
    //% block
    export function sendIR(id: number, direction: number, speed: number): void {
        sendIRNative(id, direction, speed)
    }

    //% block
    export function setLowBatteryWarningThreshold(voltage: number): void {
        setLowVoltageThresholdNative(voltage)
    }

    //% block
    export function onReceiveIR(handler: (systemAddress: number, command: number) => void): void {
        control.onEvent(3141, 1, function () {
            const addr = getLastSystemAddressNative()
            const cmd = getLastCommandNative()
            handler(addr, cmd)
        })
    }

    //% shim=plarail::sendIRNative
    declare function sendIRNative(id: number, direction: number, speed: number): void;

    //% shim=plarail::setLowVoltageThresholdNative
    declare function setLowVoltageThresholdNative(voltage: number): void;

    //% shim=plarail::getLastSystemAddressNative
    declare function getLastSystemAddressNative(): number;

    //% shim=plarail::getLastCommandNative
    declare function getLastCommandNative(): number;
}
