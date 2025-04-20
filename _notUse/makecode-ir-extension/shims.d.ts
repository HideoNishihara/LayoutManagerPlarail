// シム関数（C++の関数に対応付け）
declare namespace IR {
    function send(address: number, command: number): void;
    function startReceive(): void;
}
