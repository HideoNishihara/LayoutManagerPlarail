//% weight=100 color=#0fbc11 icon="\uf239" block="Layout Manager Plarail"
namespace plarail {
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

/*
        // プレアンブル
        mark(9000);
        space(4500);

        // データ本体
		let cmd = 0b10010110;
        sendByte(cmd);
        //sendByte(cmdInv);


        // 終了ビット
        space(80000);
        //space(0);
*/

		handle_cha_CUp();


    }





	//=================================================
	//	IRコマンド
	//=================================================
	const cha_s_up = 0x96;
	const cha_c_up = 0xD2;
	const cha_s_dn = 0xA5;
	const cha_c_dn = 0xE1;
	const cha_keep = 0x8E;

	const chb_s_up = 0x1E;
	const chb_c_up = 0x5A;
	const chb_s_dn = 0x2D;
	const chb_c_dn = 0x69;
	const chb_keep = 0x0F;
	
	
    let speedA = 0
    let speedB = 0

	let is_cha_back = false;
	let is_chb_back = false;

	//=================================================
	//	列車Ａ　前進加速（１段階）
	//=================================================
	function handle_cha_Up() {
		if (speedA < 6) {
			speedA++;
		}
		for (let i = 0; i < 3; i++) {
			control.waitMicros(80000);
			sendByte(cha_s_up);
		}
		for (let i = 0; i < 10; i++) {
			control.waitMicros(80000);
			sendByte(cha_keep);
		}
	}

	//=================================================
	//	列車Ｂ　前進加速（１段階）
	//=================================================
	function handle_chb_Up() {
		if (speedB < 6) {
			speedB++;
		}
		for (let i = 0; i < 3; i++) {
			control.waitMicros(80000);
			sendByte(chb_s_up);
		}
		for (let i = 0; i < 10; i++) {
			control.waitMicros(80000);
			sendByte(chb_keep);
		}
	}

	//=================================================
	//	列車Ａ　前進加速（最高速まで連続）
	//=================================================
	function handle_cha_CUp() {
		speedA = 6;
		for (let i = 0; i < 3; i++) {
			sendByte(cha_s_up);
			control.waitMicros(80000);
		}
		for (let i = 0; i < 40; i++) {
			sendByte(cha_c_up);
			control.waitMicros(80000);
		}
		for (let i = 0; i < 5; i++) {
			sendByte(cha_keep);
			control.waitMicros(80000);
		}
	}

	//=================================================
	//	列車Ｂ　前進加速（最高速まで連続）
	//=================================================
	function handle_chb_CUp() {
		speedB = 6;
		for (let i = 0; i < 3; i++) {
			sendByte(chb_s_up);
			control.waitMicros(80000);
		}
		for (let i = 0; i < 40; i++) {
			sendByte(chb_c_up);
			control.waitMicros(80000);
		}
		for (let i = 0; i < 5; i++) {
			sendByte(chb_keep);
			control.waitMicros(80000);
		}
	}

	//=================================================
	//	列車Ａ　前進減速（１段階）
	//=================================================
	function handle_cha_Down() {
		if (speedA > 0) {
			speedA--;
		}
		for (let i = 0; i < 3; i++) {
			control.waitMicros(80000);
			sendByte(cha_s_dn);
		}
		for (let i = 0; i < 10; i++) {
			control.waitMicros(80000);
			sendByte(cha_keep);
		}
	}

	//=================================================
	//	列車Ｂ　前進減速（１段階）
	//=================================================
	function handle_chb_Down() {
		if (speedB > 0) {
			speedB--;
		}
		for (let i = 0; i < 3; i++) {
			control.waitMicros(80000);
			sendByte(chb_s_dn);
		}
		for (let i = 0; i < 10; i++) {
			control.waitMicros(80000);
			sendByte(chb_keep);
		}
	}

	//=================================================
	//	列車Ａ　前進減速（停止まで連続）
	//=================================================
	function handle_cha_CDown() {
		speedB = 6;
		for (let i = 0; i < 3; i++) {
			sendByte(cha_s_dn);
			control.waitMicros(80000);
		}
		for (let i = 0; i < 25; i++) {
			sendByte(cha_c_dn);
			control.waitMicros(80000);
		}
		for (let i = 0; i < 10; i++) {
			sendByte(cha_keep);
			control.waitMicros(80000);
		}
	}

	//=================================================
	//	列車Ｂ　前進減速（停止まで連続）
	//=================================================
	function handle_chb_CDown() {
		speedB = 6;
		for (let i = 0; i < 3; i++) {
			sendByte(chb_s_dn);
			control.waitMicros(80000);
		}
		for (let i = 0; i < 25; i++) {
			sendByte(chb_c_dn);
			control.waitMicros(80000);
		}
		for (let i = 0; i < 10; i++) {
			sendByte(chb_keep);
			control.waitMicros(80000);
		}
	}

	//=================================================
	//	列車Ａ　後進開始
	//=================================================
	function handle_cha_Back_Start() {
		for (let i = 0; i < 3; i++) {
			sendByte(cha_s_dn);
			control.waitMicros(80000);
		}
		is_cha_back = true;
	}

	//=================================================
	//	列車Ａ　後進停止
	//=================================================
	function handle_cha_Back_End() {
		for (let i = 0; i < 5; i++) {
			sendByte(cha_keep);
			control.waitMicros(80000);
		}
		is_cha_back = false;
	}

	//=================================================
	//	列車Ｂ　後進開始
	//=================================================
	function handle_chb_Back_Start() {
		for (let i = 0; i < 3; i++) {
			sendByte(chb_s_dn);
			control.waitMicros(80000);
		}
		is_chb_back = true;
	}

	//=================================================
	//	列車Ｂ　後進停止
	//=================================================
	function handle_chb_Back_End() {
		for (let i = 0; i < 5; i++) {
			sendByte(chb_keep);
			control.waitMicros(80000);
		}
		is_chb_back = false;
	}

	//=================================================
	//	IR-LEDデータ送出
	//=================================================
	//-------------------------------------------------
	//	１バイト送出
	//-------------------------------------------------
    function sendByte(byteVal: number): void {
        // プレアンブル
        mark(9000);
        space(4500);

        for (let i = 0; i < 8; i++) {
            sendBit(byteVal & 0x01);
            byteVal >>= 1;
        }
        mark(400);
    }

	//-------------------------------------------------
	//	１ビット送出
	//-------------------------------------------------
    function sendBit(bit: number): void {
        mark(400);
        if (bit == 0x80)
            space(1300);
        else
            space(480);
    }

	//-------------------------------------------------
	//	mark送出（IR-LEF点灯）
	//-------------------------------------------------
	function mark(duration: number) {
        pins.analogSetPeriod(AnalogPin.P1, 26);
        pins.analogWritePin(AnalogPin.P1, 512);
        control.waitMicros(duration);
        pins.analogWritePin(AnalogPin.P1, 0);
	}

	//-------------------------------------------------
	//	space送出（IR-LEF消灯）
	//-------------------------------------------------
    function space(duration: number): void {
        pins.analogSetPeriod(AnalogPin.P1, 26);
        pins.analogWritePin(AnalogPin.P1, 0);
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
