declare namespace assets {
    const soundDepartureMelody: music.Playable;
    const soundDepartureBell: music.Playable;
    const soundAnnounce: music.Playable;
}

//% weight=100 color=#003366 icon="\uf239" block="Layout Manager Plarail"
namespace plarail {
	// #################################################
	//	定数・変数定義
	// #################################################
	const RED_LED = DigitalPin.P14;				// 赤色LEDのポート
	const BLUE_LED = DigitalPin.P15;			// 青色LEDのポート
	const IR_LED = AnalogPin.P1;				// IR-LEDのポート
	const VOLTAGE_PIN = AnalogPin.P2;			// 電圧測定用のポート
	const RUN_SWITCH = DigitalPin.P8;			// Start/Stop ボタンポート（button A と共通）
	const VOLTAGE_THRESHOLD = 2.4;				// 電圧警告スレッショルド（V）

	let doVoltageCheck = 0;						// 0=電圧監視未実施、1=電圧監視実施中
	
    let speedA = 0;								// 列車Ａの速度（-1～6、-1=バック、0=停止、1～6=前進）
    let speedB = 0;								// 列車Ｂの速度（-1～6、-1=バック、0=停止、1～6=前進）

	//=================================================
	//	IRコマンド
	//=================================================
	const cha_s_up = 0x96;			// 列車Ａ	レバー前倒し（１ショット）		１段階加速
	const cha_c_up = 0xD2;			// 列車Ａ	レバー前倒し（連続）			最高速まで連続加速
	const cha_s_dn = 0xA5;			// 列車Ａ	レバー手前倒し（１ショット）	１段階減速
	const cha_c_dn = 0xE1;			// 列車Ａ	レバー手前倒し（連続）			停止まで連続減速
	const cha_keep = 0x87;			// 列車Ａ	レバー中立

	const chb_s_up = 0x1E;			// 列車Ｂ	レバー前倒し（１ショット）		１段階加速
	const chb_c_up = 0x5A;			// 列車Ｂ	レバー前倒し（連続）			最高速まで連続加速
	const chb_s_dn = 0x2D;			// 列車Ｂ	レバー手前倒し（１ショット）	１段階減速
	const chb_c_dn = 0x69;			// 列車Ｂ	レバー手前倒し（連続）			停止まで連続減速
	const chb_keep = 0x0F;			// 列車Ｂ	レバー中立


	// #################################################
	//	ブロック定義
	// #################################################

	//===============================================
	//	初期化（電圧監視とLED表示）
	//===============================================
    //% blockId=plarail_init_monitor
    //% block="初期化（電圧監視とLED表示）"
    //% weight=900
    export function initialize(): void {
		initVoltageCheck();
    }

	//===============================================
	//	Start/Stopボタンの押下時の処理（runMode==RunMode.Runの場合のみ）
    // 		タクトスイッチ(P5)が押され runMode が切り替わったとき
    //		@param handler running が true なら走行開始 / false なら停止
	//===============================================
    enum RunMode { Stop = 0, Run = 1 }			// 初期値 0
    let runMode: RunMode = RunMode.Stop
    
    const EVT_TOGGLE = 3000  					// P5 押下で runMode が切り替わったとき
    
    //% block="Start/Stopボタンが押されたとき"
    //% blockId=plarail_onToggle
    //% weight=800
	export function onToggle(handler: () => void): void {
		control.onEvent(
		    EVT_TOGGLE,
		    EventBusValue.MICROBIT_EVT_ANY,
		    function () { handler() }
		);
    }


	//===============================================
	//	センサー %sensor で先頭車両を検出したとき（磁気センサー：コマンド=2）
	//===============================================
    // センサーID（0〜15）をプルダウンで指定するための列挙型
    export enum SensorID {
        //% block="センサー１"
        ID0 = 0,
        //% block="センサー２"
        ID1 = 1,
        //% block="センサー３"
        ID2 = 2,
        //% block="センサー４"
        ID3 = 3,
        //% block="センサー５"
        ID4 = 4,
        //% block="センサー６"
        ID5 = 5,
        //% block="センサー７"
        ID6 = 6,
        //% block="センサー８"
        ID7 = 7,
        //% block="センサー９"
        ID8 = 8,
        //% block="センサー10"
        ID9 = 9,
        //% block="センサー11"
        ID10 = 10,
        //% block="センサー12"
        ID11 = 11,
        //% block="センサー13"
        ID12 = 12,
        //% block="センサー14"
        ID13 = 13,
        //% block="センサー15"
        ID14 = 14,
        //% block="センサー16"
        ID15 = 15
    }
    
    // 検出種別
    export enum DetectKind { Leave = 0, Detect = 1, Head = 2 }

    // 独自イベント番号
    const EVT_IR = 4000      // channel
    /** value = (sensorID<<4) | kind  とする (上位4bit:ID / 下位4bit:種別) */

    //% block="%sensor で 先頭車両 を検出したとき"
    //% blockId=plarail_onHead
    //% weight=790
    export function onHead(sensor: SensorID, handler: () => void) {
        control.onEvent(EVT_IR, (sensor << 4) | DetectKind.Head, handler)
    }

	//===============================================
    //	センサー %sensor で 列車 を検出したとき（照度センサー：コマンド=1）
	//===============================================
    //% block="%sensor で 列車 を検出したとき"
    //% blockId=plarail_onDetect
    //% weight=780
    export function onDetect(sensor: SensorID, handler: () => void) {
        control.onEvent(EVT_IR, (sensor << 4) | DetectKind.Detect, handler)
    }

	//===============================================
    //	センサー %sensor で 列車離脱 を検出したとき（照度センサー：コマンド=0）
	//===============================================
    //% block="%sensor で 列車離脱 を検出したとき"
    //% blockId=plarail_onLeave
    //% weight=770
    export function onLeave(sensor: SensorID, handler: () => void) {
        control.onEvent(EVT_IR, (sensor << 4) | DetectKind.Leave, handler)
    }

	//===============================================
	//	列車（Ａ or Ｂ）を、速度（１～６）で前進
	//===============================================
	export enum TrainID {
	    //% block="列車Ａ"
	    A = 1,
	    //% block="列車Ｂ"
	    B = 2
	}
	
	export enum Speed {
		//% block="速度１（とても遅い）"
		S1 = 1,
		//% block="速度２（遅い）"
		S2 = 2,
		//% block="速度３（やや遅い）"
		S3 = 3,
		//% block="速度４（中くらい）"
		S4 = 4,
		//% block="速度５（速い）"
		S5 = 5,
		//% block="速度６（とても速い）"
		S6 = 6
	}
    
	//% block="%id を %speed で前進"
	//% inlineInputMode=inline
    //% weight=690
	export function driveForward(id: TrainID, speed: Speed): void {
		// 列車Ａ
		if (id == TrainID.A) {
			if (speedA == speed || speedA == -1) return;
			//加速
			if (speed > speedA) {
				for (let i = 0; i < speed - speedA; i++) {
					handle_cha_Up();
				}
			//減速
			} else {
				for (let i = 0; i < speedA - speed; i++) {
					handle_cha_Down();
				}
			}
			speedA = speed;
		// 列車Ｂ
		} else {
			if (speedB == speed || speedB == -1) return;
			//加速
			if (speed < speedB) {
				for (let i = 0; i < speed - speedB; i++) {
					handle_chb_Up();
				}
			//減速
			} else {
				for (let i = 0; i < speedB - speed; i++) {
					handle_chb_Down();
				}
			}
			speedB = speed;
		}
	}

	//===============================================
	//	列車（Ａ or Ｂ）を、後進
	//===============================================
	export enum SpeedBack {
		//% block="速度３（やや遅い）"
		B3 = 3
	}

	//% block="%id を %speedBack で後進"
	//% inlineInputMode=inline
    //% weight=680
	export function driveBack(id: TrainID, speedBack: SpeedBack): void {
		// 列車Ａ
		if (id == TrainID.A) {
			if (speedA != 0) return;
			//後進
			handle_cha_Back_Start();
			speedA = -1;
		// 列車Ｂ
		} else {
			if (speedB != 0) return;
			//後進
			handle_chb_Back_Start();
			speedB = -1;
		}
	}

	//===============================================
	//	列車（Ａ or Ｂ）を、停止
	//===============================================
	//% block="%id を 停止"
	//% inlineInputMode=inline
    //% weight=670
	export function driveStop(id: TrainID): void {
		// 列車Ａ
		if (id == TrainID.A) {
			if (speedA == 0) return;
			//前進中
			if (speedA > 0) {
				//handle_cha_CDown();
				for (let i = 0; i < speedA; i++) {
					handle_cha_Down();
				}
			//後進中
			} else {
				handle_cha_Back_End();
			}
			speedA = 0;
		// 列車Ｂ
		} else {
			if (speedB == 0) return;
			//前進中
			if (speedB > 0) {
				//handle_chb_CDown();
				for (let i = 0; i < speedB; i++) {
					handle_chb_Down();
				}
			//後進中
			} else {
				handle_chb_Back_End();
			}
			speedB = 0;
		}
	}

	//===============================================
	//	列車（Ａ or Ｂ）を、前進加速
	//===============================================
	//% block="%id を 前進加速（１段階）"
	//% inlineInputMode=inline
    //% weight=660
	export function driveForwardUp(id: TrainID): void {
		// 列車Ａ
		if (id == TrainID.A) {
			if (speedA == 6) return;
			handle_cha_Up();
			speedA++;
		// 列車Ｂ
		} else {
			if (speedB == 6) return;
			handle_chb_Up();
			speedB++;
		}
	}

	//===============================================
	//	列車（Ａ or Ｂ）を、前進減速
	//===============================================
	//% block="%id を 前進減速（１段階）"
	//% inlineInputMode=inline
    //% weight=650
	export function driveForwardDown(id: TrainID): void {
		// 列車Ａ
		if (id == TrainID.A) {
			if (speedA <= 0) return;
			handle_cha_Down();
			speedA--;
		// 列車Ｂ
		} else {
			if (speedB <= 0) return;
			handle_chb_Down();
			speedB--;
		}
	}

	//===============================================
	//	列車（Ａ or Ｂ）を、最高速度（６）まで加速
	//===============================================
	//% block="%id を 前進加速（最高速度まで）"
	//% inlineInputMode=inline
    //% weight=640
	export function driveForwardUpToMax(id: TrainID): void {
		// 列車Ａ
		if (id == TrainID.A) {
			if (speedA == 6) return;
			handle_cha_CUp();
			speedA++;
		// 列車Ｂ
		} else {
			if (speedB == 6) return;
			handle_chb_CUp();
			speedB++;
		}
	}

	//===============================================
	//	発車メロディ・ベルの再生
	//===============================================
	export enum DepartureMelody {
	    //% block="鉄道唱歌（品川駅）"
	    TetudouSyouka,
	    //% block="チャイム風（JR東日本系）"
	    JR,
	    //% block="ピポパ風（京急）"
	    Keikyu,
	    //% block="和風アルペジオ（阪急）"
	    Hankyu,
	    //% block="しっとりメロディ（小田急）"
	    Odakyu
	}

	//% block="発車メロディを再生 | %melody"
	//% inlineInputMode=inline
	//% weight=500
	export function playDepartureMelodySelect(melody: DepartureMelody): void {
		music.setVolume(255);
	    switch (melody) {
	        case DepartureMelody.TetudouSyouka:
			    // 鉄道唱歌（汽笛一声 新橋を〜）
				music.setTempo(200);
				music.playMelody(
					"G4:3 R:1 G4:1 R:1 G4:3 R:1 A4:1 R:1 B4:3 R:1 B4:1 R:1 B4:3 R:1 A4:1 R:1 G4:3 R:1 G4:1 R:1 G4:3 R:1 E4:1 R:1 D4:6 R:3 " +
					"E4:3 R:1 E4:1 R:1 D4:3 R:1 E4:1 R:1 G4:3 R:1 G4:1 R:1 B4:3 R:1 B4:1 R:1 A4:3 R:1 A4:1 R:1 G4:3 R:1 A4:1 R:1 B4:6 R:3 " +
					"D5:3 R:1 D5:1 R:1 D5:3 R:1 D5:1 R:1 D5:3 R:1 D5:1 R:1 E5:3 R:1 D5:1 R:1 B4:3 R:1 G4:1 R:1 A4:3 R:1 B4:1 R:1 A4:6 R:3 " +
					"G4:3 R:1 A4:1 R:1 B4:3 R:1 B4:1 R:1 A4:3 R:1 A4:1 R:1 D5:3 R:1 D5:1 R:1 B4:3 R:1 B4:1 R:1 A4:3 R:1 A4:1 R:1 G4:6",
					200
				);
				let volumeSteps = [255, 200, 150, 120, 90, 70, 50, 35, 20, 10, 5, 0]
				for (let vol of volumeSteps) {
				    music.setVolume(vol)
				    music.playTone(Note.G4, music.beat(BeatFraction.Sixteenth))
				}
				music.stopAllSounds()
	            break;
	        case DepartureMelody.JR:
				music.setTempo(500)
				music.playMelody(
				    "C5 E5 G5 R4 E5 G5 C6 R4 G5 B5 E6 R4 " +
				    "C5 E5 G5 R4 E5 G5 C6 R4 G5 B5 E6 R4 " +
				    "E5 G5 C6 R4 G5 B5 E6 R4 C6 D6", 500
				)

				// 最後のE6をフェードアウトで伸ばす
				music.setVolume(255)
				for (let vol = 255; vol >= 0; vol -= 20) {
				    music.setVolume(vol)
				    music.playTone(1319, music.beat(BeatFraction.Sixteenth))
				}
				music.stopAllSounds()
				break;
	        case DepartureMelody.Keikyu:
				music.setTempo(400)
				music.playMelody(
				    "C6 R2 E6 R2 G6 R2 C7 R4 G6 E6 R2 " +
				    "C6 R2 E6 R2 G6 R2 C7 R4 G6 E6 R2 " +
				    "C7 R2 D7", 400
				)

				// 最後のD7をフェードアウト
				music.setVolume(255)
				for (let vol = 255; vol >= 0; vol -= 20) {
				    music.setVolume(vol)
				    music.playTone(2349, music.beat(BeatFraction.Sixteenth))
				}
				music.stopAllSounds()
	            break;
	        case DepartureMelody.Hankyu:
				music.setTempo(300)
				music.playMelody(
				    "C5 R2 D5 R2 G5 R2 C6 R2 G5 D5 C5 R2 " +
				    "C5 R2 D5 R2 G5 R2 C6 R2 G5 D5 C5 R2 " +
				    "D5 R2 G5 R2 A5", 300
				)

				// 最後のA5をフェードアウト
				music.setVolume(255)
				for (let vol = 255; vol >= 0; vol -= 20) {
				    music.setVolume(vol)
				    music.playTone(Note.A5, music.beat(BeatFraction.Sixteenth))
				}
				music.stopAllSounds()
	            break;
	        case DepartureMelody.Odakyu:
				music.setTempo(250)
				music.playMelody(
				    "E5 G5 B5 R4 D5 G5 B5 R4 G5 B5 E6 R4 " +
				    "E5 G5 B5 R4 D5 G5 B5 R4 G5 B5 E6 R4 " +
				    "E5 G5 B5 R4 C5", 250
				)

				// 最後のC5をフェードアウト
				music.setVolume(255)
				for (let vol = 255; vol >= 0; vol -= 20) {
				    music.setVolume(vol)
				    music.playTone(Note.C5, music.beat(BeatFraction.Sixteenth))
				}
				music.stopAllSounds()
	            break;
	    }
   	}









































	// #################################################
	//	関数
	// #################################################

	//===============================================
	//	電源電圧の監視
	//===============================================
	pins.digitalWritePin(BLUE_LED, 1)  // 常時 ON
	function initVoltageCheck() {
		if (doVoltageCheck == 1) return;
		doVoltageCheck = 1;
		
		control.inBackground(function () {
			while (true) {
				const adc = pins.analogReadPin(VOLTAGE_PIN)
				const voltage = adc * 3.3 / 1023 * 2
				if (voltage < VOLTAGE_THRESHOLD) {
					pins.digitalWritePin(RED_LED, 1)
					pins.digitalWritePin(BLUE_LED, 0)
				} else {
					pins.digitalWritePin(RED_LED, 0)
					
		            if (runMode == RunMode.Stop) {
		                pins.digitalWritePin(BLUE_LED, 1)  // 常時 ON
		                basic.pause(50)
		            } else {
		                pins.digitalWritePin(BLUE_LED, 1)  // 0.1 s ON
		                basic.pause(200)
		                pins.digitalWritePin(BLUE_LED, 0)  // 0.9 s OFF
		                basic.pause(800)
					}
				}
			}
		});
	}

	//=================================================
    //	Start/Stopボタン（or buttonA）で runMode をトグル（start/stop押下の一次受け）
    //		runMode==RunMode.Runの場合は、onToggleブロック処理へ
    //		runMode==RunMode.Runの場合は、全列車停止
	//=================================================
    pins.setPull(RUN_SWITCH, PinPullMode.PullUp)            // 内蔵プルアップ
	pins.onPulsed(RUN_SWITCH, PulseValue.Low, () => {
		initVoltageCheck();

	    // 簡易デバウンス
	    control.waitMicros(20000)
	    if (pins.digitalReadPin(RUN_SWITCH) == 0) {       // まだ Low か確認
	        // runMode をトグル
	        runMode = runMode == RunMode.Stop ? RunMode.Run : RunMode.Stop

	        // ブロックへ通知 ── 走行開始時だけ
	        if (runMode == RunMode.Run) {
	            control.raiseEvent(EVT_TOGGLE, EventBusValue.MICROBIT_EVT_ANY)
            // 停止時はブロックを呼ばず、直接 全列車停止
	        } else {
	            stopAllTrains()
	        }
	    }
	})


































	//=================================================
	//	列車Ａ　前進加速（１段階）
	//=================================================
	function handle_cha_Up() {
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
	}

	//=================================================
	//	列車Ａ　後進停止
	//=================================================
	function handle_cha_Back_End() {
		for (let i = 0; i < 5; i++) {
			sendByte(cha_keep);
			control.waitMicros(80000);
		}
	}

	//=================================================
	//	列車Ｂ　後進開始
	//=================================================
	function handle_chb_Back_Start() {
		for (let i = 0; i < 3; i++) {
			sendByte(chb_s_dn);
			control.waitMicros(80000);
		}
	}

	//=================================================
	//	列車Ｂ　後進停止
	//=================================================
	function handle_chb_Back_End() {
		for (let i = 0; i < 5; i++) {
			sendByte(chb_keep);
			control.waitMicros(80000);
		}
	}
	
	//=================================================
	//	全列車の停止
	//=================================================
	function stopAllTrains() {
		//列車Ａ
		if (speedA == -1) {
			handle_cha_Back_End();
		} else if (speedA > 0) {
			handle_cha_CDown();
		}
		speedA = 0;
		
		//列車Ｂ
		if (speedB == -1) {
			handle_chb_Back_End();
		} else if (speedB > 0) {
			handle_chb_CDown();
		}
		speedB = 0;
	}
	
	

	//=================================================
    //	IR 受信デコード (バックグラウンド)
	//=================================================
	//	受信用ハード定数
    const PIN_IR = DigitalPin.P16
    const LEADER_MARK = 9000     // µs 9 ms
    const LEADER_SPACE = 4500    // 4.5 ms
    const MARK_1 = 1690          // 1 の mark
    const MARK_0 = 560           // 0 の mark
    const TOL = 400              // ±誤差許容

/*
    control.inBackground(function () {
        pins.setPull(PIN_IR, PinPullMode.PullUp)

        while (true) {
            // 4-1. Leader の Hi (mark) を待つ
            let t = pins.pulseIn(PIN_IR, PulseValue.Low, 20000)   // Low 時間 9 ms
            if (!within(t, LEADER_MARK)) continue

            // 4-2. Leader の Low (space)
            t = pins.pulseIn(PIN_IR, PulseValue.High, 10000)      // Hi 時間 4.5 ms
            if (!within(t, LEADER_SPACE)) continue

            // 4-3. 12bit 受信 : Hi (space) – Low (mark)
            let bits = 0
            for (let i = 0; i < 12; i++) {
                let space = pins.pulseIn(PIN_IR, PulseValue.Low, 3000)   // 560 µs
                let mark  = pins.pulseIn(PIN_IR, PulseValue.High, 3000)  // 560 or 1690
                if (!within(space, 560)) { bits = -1; break }

                if (within(mark, MARK_1)) bits |= 1 << i      // 1
                else if (!within(mark, MARK_0)) { bits = -1; break } // 不正
            }
            if (bits < 0) continue          // 受信失敗

            // 4-4. 上位6bit と 下位6bit(反転) の整合性確認
            let data = bits & 0x3F          // 0-5bit
            let inv  = (bits >> 6) & 0x3F   // 6-11bit
            if ((data ^ 0x3F) != inv) continue  // 反転一致しない

            // 4-5. データを分解 → センサー ID / 種別
            let sensorID = (data >> 2) & 0x0F       // bit0-3
            let kind     =  data & 0x03             // bit4-5

            if (sensorID == 0 || sensorID > 16) continue   // 1-16 範囲外は無視
            if (kind > 2) continue                         // 00/01/02 以外無視

            // 4-6. イベント送出
            let value = (sensorID << 4) | kind      // 0xXY (X=ID, Y=kind)
            control.raiseEvent(EVT_IR, value)
        }
    })
*/

	//-------------------------------------------------
    //	ユーティリティ
    //		受信タイミングの揺れを吸収 し、理論値ピッタリでなくてもデコードできるようにしている
	//-------------------------------------------------
    function within(x: number, target: number): boolean {
        return x > target - TOL && x < target + TOL
    }






	//===============================================
	// IR受信デコード（バックグラウンド＋シリアル出力付き版）
	//===============================================
	control.inBackground(function () {
   		serial.writeLine("IR receive...");

	    pins.setPull(DigitalPin.P16, PinPullMode.PullUp);

	    while (true) {

	        // 赤外線センサからの LOWパルス（Leader Mark）を待つ（最大20ms待機）
	        let t = pins.pulseIn(DigitalPin.P16, PulseValue.Low, 20000);
	        
    		serial.writeLine("IR receive Leader Mark(Low) : " + t);
	        
	        
	        // 受信したLowパルスの長さが9ms(LEADER_MARK)付近か確認（なければ次のループへ）
	        if (!within(t, LEADER_MARK)) continue
			
			// 続いて Highパルス（Leader Space）を受信（最大10ms待機）
	        t = pins.pulseIn(DigitalPin.P16, PulseValue.High, 10000)
	        
    		serial.writeLine("IR receive Leader Space(High) : " + t);
	        
	        // 受信したHighパルスが4.5ms(LEADER_SPACE)付近か確認（なければ次のループへ）
	        if (!within(t, LEADER_SPACE)) continue

    		serial.writeLine("IR receive Leader done");


    		// ここまでで、リーダー部分（9ms + 4.5ms）が正しく受信できた！
    		serial.writeLine("IR LEADER received!");

	        // データビット受信開始：8ビット分
	        let bits = 0;
	        for (let i = 0; i < 8; i++) {
				// 各ビット：まずLowパルス（bit間の区切り）を受信
	            let space = pins.pulseIn(DigitalPin.P16, PulseValue.Low, 3000);
	            // 次にHighパルス（bit情報そのもの）を受信
	            let mark  = pins.pulseIn(DigitalPin.P16, PulseValue.High, 3000);
	            
	            // Lowパルスの長さが正しいかチェック（約560μs）
	            if (!within(space, 560)) { bits = -1; break; }
	            
	            // Highパルスが長い（1690μs）なら「1」、短い（560μs）なら「0」
	            if (within(mark, MARK_1))
	            	bits |= 1 << i;
	            else if (!within(mark, MARK_0)) {
					bits = -1;
					break;
				}
	        }
	        // データ受信失敗なら最初からやり直し
	        if (bits < 0) continue

	        // ★受信結果をシリアル出力（デバッグ用）
	        serial.writeLine("IR received! Raw bits=" + bits)

	        // 受信した8ビットデータを解析
	        let systemAddr = (bits >> 4) & 0x0F    // 上位4bit（システムアドレス）
	        let cmdParity  = bits & 0x0F            // 下位4bit（コマンド+パリティ）

	        let cmd = (cmdParity >> 1) & 0x07       // コマンド（1〜3bit）
	        let parity = cmdParity & 0x01           // パリティビット（最下位1bit）

	        // パリティチェック
	        let calcParity = 0
	        for (let i = 1; i < 8; i++) {
	            if ((bits >> i) & 0x01) calcParity ^= 1
	        }
	        if (parity != calcParity) {
	            serial.writeLine("Parity error!")
	            continue
	        }

	        // コマンドから種別を判断
	        let kind = cmd   // 0 = 離脱, 1 = 検出, 2 = 先頭車両

	        // システムアドレスからセンサーIDに変換（1〜16）
	        let sensorID = systemAddr + 1

	        // ★最終的な受信結果をシリアル出力
	        serial.writeLine("SensorID=" + sensorID + " Kind=" + kind)

	        // センサーIDと種別でイベント発火
	        //let value = (sensorID << 4) | kind
	        //control.raiseEvent(4000, value)    // EVT_IR = 4000
   	    }
	})















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
            sendBit(byteVal & 0x80);
            byteVal <<= 1;
        }
        mark(400);
    }

	//-------------------------------------------------
	//	１ビット送出
	//-------------------------------------------------
    function sendBit(bit: number): void {
        mark(800);
        if (bit == 0x80)
            space(1300);
        else
            space(500);
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
        control.waitMicros(duration);
    }












}
