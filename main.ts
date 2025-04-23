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

    //% blockId=ir_sender_send
    //% block="赤外線送信 ID %id 方向 %dir 速度 %speed"
    //% id.min=0 id.max=15
    //% dir.min=0 dir.max=3
    //% speed.min=0 speed.max=15
    export function sendIR(id: number, dir: number, speed: number): void {
        //const cmd = ((id & 0x0F) << 4) | ((dir & 0x03) << 2) | (speed & 0x03);
        //const cmdInv = ~cmd & 0xFF;

		let cmd = 0x96;		//0b10010110;


        // プレアンブル
        mark(9000);
        space(4500);

        // データ本体
        sendByte(cmd);
        //sendByte(cmdInv);

        // 終了ビット
        mark(562);
        space(0);
    }

	function softCarrier38kHz(durationMicros: number): void {
	    const period = 26;         // 38.46kHz（1周期 ≒ 26μs）
	    const half = period / 2;   // 13μs HIGH + 13μs LOW
	    const count = durationMicros / period;

	    for (let i = 0; i < count; i++) {
	        pins.digitalWritePin(DigitalPin.P1, 1);
	        control.waitMicros(half);
	        pins.digitalWritePin(DigitalPin.P1, 0);
	        control.waitMicros(half);
	    }
	}

	function mark(duration: number) {
	    if (control.hardwareVersion() == "2") {
	        // v2ならハードPWMで高速かつ安定
	        pins.analogSetPeriod(26);
	        pins.analogWritePin(AnalogPin.P1, 512);
	        control.waitMicros(duration);
	        pins.analogWritePin(AnalogPin.P1, 0);
	    } else {
	        // v1はソフトPWM
	        softCarrier38kHz(duration);
	    }
	}

    function space(duration: number): void {
        pins.analogWritePin(AnalogPin.P1, 0);
        if (duration > 0) control.waitMicros(duration);
    }

    function sendBit(bit: number): void {
        mark(562);
        if (bit)
            space(1687);
        else
            space(562);
    }

    function sendByte(byteVal: number): void {
        for (let i = 0; i < 8; i++) {
            sendBit(byteVal & 0x80);
            byteVal <<= 1;
        }
    }





    // イベント種別の定義
    export enum SensorEvent {
        Magnetic = 0,
        BrightnessDetected = 1,
        Departure = 2
    }

    type SensorHandler = () => void

    // センサーイベントごとのハンドラ管理 [event][id]
    const handlers: SensorHandler[][] = [
        [], [], [] // Magnetic, Brightness, Departure
    ];

    /**
     * 内部処理：受信されたセンサーIDとイベントに応じてコールバック呼び出し
     */
    function dispatchSensorEvent(id: number, event: SensorEvent) {
        if (handlers[event] && handlers[event][id]) {
            handlers[event][id]()
        }
    }

    /**
     * 赤外線受信ループ開始（C++から値をポーリング）
     */
    function startSensorReceiver() {
        control.inBackground(function () {
            while (true) {
                const raw = receiveIRSensorNative()
                const id = (raw >> 4) & 0x0F
                const event = raw & 0x0F

                dispatchSensorEvent(id, event)
                basic.pause(50)
            }
        });
    }

    let receiverStarted = false
    function ensureReceiver() {
        if (!receiverStarted) {
            startSensorReceiver()
            receiverStarted = true
        }
    }


    // センサーID（0〜15）をプルダウンで指定するための列挙型
    export enum SensorID {
        //% block="センサー0"
        ID0 = 0,
        //% block="センサー1"
        ID1 = 1,
        //% block="センサー2"
        ID2 = 2,
        //% block="センサー3"
        ID3 = 3,
        //% block="センサー4"
        ID4 = 4,
        //% block="センサー5"
        ID5 = 5,
        //% block="センサー6"
        ID6 = 6,
        //% block="センサー7"
        ID7 = 7,
        //% block="センサー8"
        ID8 = 8,
        //% block="センサー9"
        ID9 = 9,
        //% block="センサー10"
        ID10 = 10,
        //% block="センサー11"
        ID11 = 11,
        //% block="センサー12"
        ID12 = 12,
        //% block="センサー13"
        ID13 = 13,
        //% block="センサー14"
        ID14 = 14,
        //% block="センサー15"
        ID15 = 15
    }

    //% blockId=plarail_on_magnetic
    //% block="%id で磁気検出時"
    export function onMagnetic(id: SensorID, handler: () => void) {
        ensureReceiver()
        handlers[SensorEvent.Magnetic][id] = handler
    }

    //% blockId=plarail_on_brightness
    //% block="%id で明度検出時"
    export function onBrightness(id: SensorID, handler: () => void) {
        ensureReceiver()
        handlers[SensorEvent.BrightnessDetected][id] = handler
    }

    //% blockId=plarail_on_departure
    //% block="%id で列車離脱時"
    export function onDeparture(id: SensorID, handler: () => void) {
        ensureReceiver()
        handlers[SensorEvent.Departure][id] = handler
    }

    // C++ で実装される受信関数（8bit：上位4bit=ID、下位4bit=event）
    //% shim=plarail::receiveIRSensorNative
    declare function receiveIRSensorNative(): number;
}
