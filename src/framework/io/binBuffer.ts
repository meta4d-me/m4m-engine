/**
@license
Copyright (c) 2022 meta4d.me Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
namespace m4m.io {
    export class converter {
        /**
         * 获得应用方法
         * @param value 值
         * @returns 
         */
        static getApplyFun(value: any): any {
            return Array.prototype.concat.apply([], value);
        }
        private static dataBuffer: Uint8Array = new Uint8Array(8);
        private static dataView: DataView = new DataView(converter.dataBuffer.buffer);//八字节临时空间
        /**
         * ULong 类型值 转 Uint8Array
         * @param value ULong 类型值
         * @returns Uint8Array
         */
        static ULongToArray(value: number, target: Uint8Array = null, offset: number = 0): Uint8Array | number[] {
            //这里注意不能直接用dataView.setFloat64，因为float64是float类型
            var uint1: number = value % 0x100000000;
            var uint2: number = (value / 0x100000000) | 0;
            converter.dataView.setUint32(0, uint1, true);
            converter.dataView.setUint32(4, uint2, true);
            return new Uint8Array(converter.dataBuffer.subarray(0, 8));
        }
        /**
         * Long 类型值 转 Uint8Array
         * @param value Long 类型值
         * @returns Uint8Array
         */
        static LongToArray(value: number, t: Uint8Array | number[] = null, offset: number = 0): Uint8Array | number[] {
            let target: any = t;
            //这里注意不能直接用dataView.setFloat64，因为float64是float类型
            var uint1: number = value % 0x100000000;
            var uint2: number = (value / 0x100000000) | 0;
            converter.dataView.setInt32(0, uint1, true);
            converter.dataView.setInt32(4, uint2, true);
            return new Uint8Array(converter.dataBuffer.subarray(0, 8));
        }

        /**
         * Float64 类型值 转 Uint8Array
         * @param value 值
         * @returns Uint8Array
         */
        static Float64ToArray(value: number, target: Uint8Array | number[] = null, offset: number = 0): Uint8Array | number[] {
            converter.dataView.setFloat64(0, value, false);
            return new Uint8Array(converter.dataBuffer.subarray(0, 8));
        }
        /**
         * Float32 类型值 转 Uint8Array
         * @param value 值
         * @returns Uint8Array
         */
        static Float32ToArray(value: number, target: Uint8Array | number[] = null, offset: number = 0): Uint8Array | number[] {
            converter.dataView.setFloat32(0, value, true);
            return new Uint8Array(converter.dataBuffer.subarray(0, 4));
        }
        /**
         * Int32 类型值 转 Uint8Array
         * @param value 值
         * @returns Uint8Array
         */
        static Int32ToArray(value: number, target: Uint8Array | number[] = null, offset: number = 0): Uint8Array | number[] {
            converter.dataView.setInt32(0, value, true);
            return new Uint8Array(converter.dataBuffer.subarray(0, 4));
        }
        /**
         * Int16 类型值 转 Uint8Array
         * @param value 值
         * @returns Uint8Array
         */
        static Int16ToArray(value: number, target: Uint8Array | number[] = null, offset: number = 0): Uint8Array | number[] {
            converter.dataView.setInt16(0, value, true);
            return new Uint8Array(converter.dataBuffer.subarray(0, 2));
        }
        /**
         * Uint32 类型值 转 Uint8Array
         * @param value 值
         * @returns Uint8Array
         */
        static Uint32toArray(value: number, target: Uint8Array | number[] = null, offset: number = 0): Uint8Array | number[] {
            converter.dataView.setInt32(0, value, true);

            return new Uint8Array(converter.dataBuffer.subarray(0, 4));
        }
        /**
         * Uint16 类型值 转 Uint8Array
         * @param value 值
         * @returns Uint8Array
         */
        static Uint16ToArray(value: number, target: Uint8Array | number[] = null, offset: number = 0): Uint8Array | number[] {
            converter.dataView.setUint16(0, value, true);
            return new Uint8Array(converter.dataBuffer.subarray(0, 2));
        }

        /**
         * 字符串 转 Uint8Array
         * @param str 字符串值
         * @returns Uint8Array
         */
        static StringToUtf8Array(str: string): Uint8Array {
            var bstr: number[] = [];
            for (var i = 0, len = str.length; i < len; ++i) {
                var c = str.charAt(i);
                var cc = c.charCodeAt(0);
                if (cc > 0xFFFF) {
                    throw new Error("InvalidCharacterError");
                }
                if (cc > 0x80) {
                    if (cc < 0x07FF) {
                        var c1 = (cc >>> 6) | 0xC0;
                        var c2 = (cc & 0x3F) | 0x80;
                        bstr.push(c1, c2);
                    }
                    else {
                        var c1 = (cc >>> 12) | 0xE0;
                        var c2 = ((cc >>> 6) & 0x3F) | 0x80;
                        var c3 = (cc & 0x3F) | 0x80;
                        bstr.push(c1, c2, c3);
                    }
                }
                else {
                    bstr.push(cc);
                }
            }
            return new Uint8Array(bstr);
        }

        /**
         * Uint8Array 转 Long类型值
         * @param buf Uint8Array
         * @param offset buffer偏移
         * @returns Long类型值
         */
        static ArrayToLong(buf: Uint8Array, offset: number = 0): number {
            converter.dataBuffer.set(buf.subarray(offset, offset + 4));
            var n1 = converter.dataView.getInt32(0, true);

            converter.dataBuffer.set(buf.subarray(offset + 4, offset + 8));
            var n2 = converter.dataView.getInt32(4, true);
            n1 += n2 * 0x100000000;
            return n1;
        }

        /**
         * Uint8Array 转 ULong类型值
         * @param buf Uint8Array
         * @param offset buffer偏移
         * @returns ULong类型值
         */
        static ArrayToULong(buf: Uint8Array, offset: number = 0): number {
            converter.dataBuffer.set(buf.subarray(offset, offset + 4));
            var n1 = converter.dataView.getUint32(0, true);

            converter.dataBuffer.set(buf.subarray(offset + 4, offset + 8));
            var n2 = converter.dataView.getUint32(4, true);
            n1 += n2 * 0x100000000;
            return n1;
        }
        /**
         * Uint8Array 转 Float64类型值
         * @param buf Uint8Array
         * @param offset buffer偏移
         * @returns Float64类型值
         */
        static ArrayToFloat64(buf: Uint8Array, offset: number = 0): number {
            converter.dataBuffer.set(buf.subarray(offset, offset + 8))
            return converter.dataView.getFloat64(0, true);
        }
        /**
         * Uint8Array 转 Float32类型值
         * @param buf Uint8Array
         * @param offset buffer偏移
         * @returns Float32类型值
         */
        static ArrayToFloat32(buf: Uint8Array, offset: number = 0): number {
            converter.dataBuffer.set(buf.subarray(offset, offset + 4))
            return converter.dataView.getFloat32(0, true);
        }
        /**
         * Uint8Array 转 Int32类型值
         * @param buf Uint8Array
         * @param offset buffer偏移
         * @returns Int32类型值
         */
        static ArrayToInt32(buf: Uint8Array, offset: number = 0): number {
            converter.dataBuffer.set(buf.subarray(offset, offset + 4))
            return converter.dataView.getInt32(0, true);
        }
        /**
         * Uint8Array 转 Uint32类型值
         * @param buf Uint8Array
         * @param offset buffer偏移
         * @returns Uint32类型值
         */
        static ArrayToUint32(buf: Uint8Array, offset: number = 0): number {
            converter.dataBuffer.set(buf.subarray(offset, offset + 4));
            return converter.dataView.getUint32(0, true);
        }
        /**
         * Uint8Array 转 Int16类型值
         * @param buf Uint8Array
         * @param offset buffer偏移
         * @returns Int16类型值
         */
        static ArrayToInt16(buf: Uint8Array, offset: number = 0): number {
            converter.dataBuffer.set(buf.subarray(offset, offset + 2))
            return converter.dataView.getInt16(0, true);
        }
        /**
         * Uint8Array 转 Uint16类型值
         * @param buf Uint8Array
         * @param offset buffer偏移
         * @returns Uint16类型值
         */
        static ArrayToUint16(buf: Uint8Array, offset: number = 0): number {
            converter.dataBuffer.set(buf.subarray(offset, offset + 2));
            return converter.dataView.getUint16(0, true);
        }
        /**
         * Uint8Array 转 Int8类型值
         * @param buf Uint8Array
         * @param offset buffer偏移
         * @returns Int8类型值
         */
        static ArrayToInt8(buf: Uint8Array, offset: number = 0): number {
            return buf[offset];
        }

        /**
         * Uint8Array 转 字符串值
         * @param buf Uint8Array
         * @param offset buffer偏移
         * @returns 字符串值
         */
        static ArrayToString(buf: Uint8Array, offset: number = 0): string {
            var ret: string[] = [];
            for (var i = 0; i < buf.length; i++) {
                var cc = buf[i];
                if (cc == 0)
                    break;
                var ct = 0;
                if (cc > 0xE0) {
                    ct = (cc & 0x0F) << 12;
                    cc = buf[++i];
                    ct |= (cc & 0x3F) << 6;
                    cc = buf[++i];
                    ct |= cc & 0x3F;
                    ret.push(String.fromCharCode(ct));
                }
                else if (cc > 0xC0) {
                    ct = (cc & 0x1F) << 6;
                    cc = buf[++i];
                    ct |= (cc & 0x3F) << 6;
                    ret.push(String.fromCharCode(ct));
                }
                else if (cc > 0x80) {
                    console.warn("InvalidCharacterError");
                    return "";
                }
                else {
                    ret.push(String.fromCharCode(buf[i]));
                }
            }
            return ret.join('');
        }
    }

    export class binTool {
        // private buffer: Array<number>;
        private buffer: Uint8Array;
        public r_offset: number = 0;
        public w_offset: number = 0;
        /**
         * 二进制工具
         * @param size 
         */
        constructor(size: number = undefined) {
            //this.buffer = new Array(size);
            // if (size)
            //     this.buffer = new Array(size);
            // else

            this.buffer = memoryPool.Insance.newUint8Array();//new Uint8Array(1024);
        }

        /** 检查长度 */
        private ckl() {
            if (this.r_offset > this.w_offset)
                throw Error("[binTool] 内存读取失败 请检查当前输入的内存");
        }
        /**
         * 读取 Single值
         * @returns Single值
         */
        readSingle(): number {
            this.ckl();
            let ret = converter.ArrayToFloat32(this.buffer, this.r_offset);
            this.r_offset += 4;
            return ret;
        }
        /**
         * 读取 Long值
         * @returns Long值
         */
        readLong(): number {
            this.ckl();
            let ret = converter.ArrayToLong(this.buffer, this.r_offset);
            this.r_offset += 8;
            return ret;
        }
        /**
         * 读取 ULong值
         * @returns ULong值
         */
        readULong(): number {
            this.ckl();
            let ret = converter.ArrayToULong(this.buffer, this.r_offset);
            this.r_offset += 8;
            return ret;
        }
        /**
         * 读取 Double值
         * @returns Double值
         */
        readDouble(): number {
            this.ckl();
            let ret = converter.ArrayToFloat64(this.buffer, this.r_offset);
            this.r_offset += 8;
            return ret;
        }
        /**
         * 读取 Int8值
         * @returns Int8值
         */
        readInt8(): number {
            this.ckl();
            let ret = this.buffer[this.r_offset];
            this.r_offset += 1;
            return ret;
        }
        /**
         * 读取 UInt8值
         * @returns UInt8值
         */
        readUInt8(): number {
            this.ckl();
            let ret = this.buffer[this.r_offset];
            this.r_offset += 1;
            return ret;
        }
        /**
         * 读取 Int16值
         * @returns Int16值
         */
        readInt16(): number {
            this.ckl();
            let ret = converter.ArrayToInt16(this.buffer, this.r_offset);
            this.r_offset += 2;
            return ret;
        }
        /**
         * 读取 UInt16值
         * @returns UInt16值
         */
        readUInt16(): number {
            this.ckl();
            let ret = converter.ArrayToUint16(this.buffer, this.r_offset);
            this.r_offset += 2;
            return ret;
        }
        /**
         * 读取 Int32值
         * @returns Int32值
         */
        readInt32(): number {
            this.ckl();
            let ret = converter.ArrayToInt32(this.buffer, this.r_offset);
            this.r_offset += 4;
            return ret;
        }
        /**
         * 读取 UInt32值
         * @returns UInt32值
         */
        readUInt32(): number {
            this.ckl();
            let ret = converter.ArrayToUint32(this.buffer, this.r_offset);
            this.r_offset += 4;
            return ret;
        }
        /**
         * 读取 Boolean值
         * @returns Boolean值
         */
        readBoolean(): boolean {
            this.ckl();
            let ret = this.buffer[this.r_offset] != 0;
            this.r_offset += 1;
            return ret;
        }
        /**
         * 读取 Byte值
         * @returns Byte值
         */
        readByte(): number {
            return this.readUInt8();
        }
        /**
         * 读取 UnsignedShort值
         * @returns UnsignedShort值
         */
        readUnsignedShort(): number {
            return this.readUInt16();
        }
        /**
         * 读取UnsignedInt值
         * @returns UnsignedInt值
         */
        readUnsignedInt(): number {
            this.ckl();
            let ret = converter.ArrayToUint32(this.buffer, this.r_offset);
            this.r_offset += 4;
            return ret;
        }
        /**
         * 读取 Float值
         * @returns Float值
         */
        readFloat(): number {
            return this.readSingle();
        }
        /**
         * 读取 有符号 Byte
         * @returns F有符号 Byte
         */
        readSymbolByte(): number {
            return this.readInt8();
        }
        /**
         * 读取 Short值
         * @returns Short值
         */
        readShort(): number {
            return this.readInt16();
        }
        /**
         * 读取 Int值
         * @returns Int值
         */
        readInt(): number {
            return this.readInt32();
        }
        /**
         * 读取 Bytes值
         * @param length 长度
         * @returns Bytes值
         */
        readBytes(length: number): Uint8Array {
            this.ckl();
            let array = this.buffer.subarray(this.r_offset, this.r_offset + length);
            this.r_offset += length;
            return array;
        }
        /**
         * 读取 StringUtf8值
         * @returns StringUtf8值
         */
        readStringUtf8(): string {
            this.ckl();
            let length = this.readInt8();
            let array = this.buffer.subarray(this.r_offset, this.r_offset + length);
            this.r_offset += length;
            return converter.ArrayToString(array);
        }
        /**
         * 读取 UTFBytes值
         * @returns UTFBytes值
         */
        readUTFBytes(/*length: number*/): string {
            this.ckl();
            let length = this.readUInt16();
            return this.readUTFByLen(length);
            // this.r_offset += length;
            // return converter.ArrayToString(array);
        }
        /**
         * 读取 UTFByLen值
         * @param length 长度
         * @returns UTFByLen值
         */
        readUTFByLen(length: number): string {
            this.ckl();
            let array = this.buffer.subarray(this.r_offset, this.r_offset + length);
            this.r_offset += length;
            return converter.ArrayToString(array);
        }
        /**
         * 读取 StringUtf8Fix长度
         * @param length 长度
         * @returns StringUtf8Fix长度
         */
        readStringUtf8FixLength(length: number): string {
            this.ckl();
            let array = this.buffer.subarray(this.r_offset, this.r_offset + length);
            this.r_offset += length;
            return converter.ArrayToString(array);
        }

        /**
         * 读取 StringAnsi
         * @returns StringAnsi
         */
        readStringAnsi(): string {
            this.ckl();
            let slen = this.readUInt8();
            var bs: string = "";
            for (var i = 0; i < slen; i++) {
                bs += String.fromCharCode(this.readByte());
            }
            return bs;
        }
        /**
         * 获取 长度
         * @returns 长度
         */
        getLength(): number {
            return this.w_offset;
        }
        /**
         * 获取 Bytes是否有效
         * @returns Bytes是否有效
         */
        getBytesAvailable(): number {
            return this.w_offset - this.r_offset;
        }
        get length(): number {
            return this.w_offset;
        }
        /**
         * 写入 Int8值
         * @param num Int8值
         */
        writeInt8(num: number): void {
            //this.write(converter.Int8ToArray(num));
            this.write(num);
        }
        /**
         * 写入 UInt8值
         * @param num UInt8值
         */
        writeUInt8(num: number): void {
            // this.write(converter.Uint8ToArray(num));
            this.write(num);
        }
        /**
         * 写入 Int16值
         * @param num Int16值
         */
        writeInt16(num: number): void {
            this.write(converter.Int16ToArray(num));
        }
        /**
         * 写入 UInt16值
         * @param num UInt16值
         */
        writeUInt16(num: number): void {
            this.write(converter.Uint16ToArray(num));
        }
        /**
         * 写入 Int32值
         * @param num Int32值
         */
        writeInt32(num: number): void {
            this.write(converter.Int32ToArray(num));
        }
        /**
         * 写入 UInt32值
         * @param num UInt32值
         */
        writeUInt32(num: number): void {
            this.write(converter.Uint32toArray(num));
        }
        /**
         * 写入 Single值
         * @param num Single值
         */
        writeSingle(num: number): void {
            this.write(converter.Float32ToArray(num));
        }
        /**
         * 写入 Long值
         * @param num Long值
         */
        writeLong(num: number): void {
            this.write(converter.LongToArray(num));
        }
        /**
         * 写入 ULong值
         * @param num ULong值
         */
        writeULong(num: number): void {
            this.write(converter.ULongToArray(num));
        }
        /**
         * 写入 Double值
         * @param num Double值
         */
        writeDouble(num: number): void {
            this.write(converter.Float64ToArray(num));
        }
        /**
         * 写入 字符串Ansi值
         * @param str 字符串Ansi值
         */
        writeStringAnsi(str: string): void {
            var slen = str.length;
            this.writeUInt8(slen);
            for (var i = 0; i < slen; i++)
                this.writeUInt8(str.charCodeAt(i));
        }
        /**
         * 写入 字符串Utf8值
         * @param str 字符串Utf8值
         */
        writeStringUtf8(str: string) {
            var bstr = converter.StringToUtf8Array(str);
            this.writeUInt8(bstr.length);
            this.write(bstr);
        }
        /**
         * 写入 字符串Utf8DataOnly值
         * @param str 字符串Utf8DataOnly值
         */
        writeStringUtf8DataOnly(str: string) {
            var bstr = converter.StringToUtf8Array(str);
            this.write(bstr);
        }
        /**
         * 写入 Byte值
         * @param num Byte值
         */
        writeByte(num: number): void {
            this.write(num);
        }
        /**
         * 写入 Byte值
         * @param array Byte值
         * @param offset buffer中的偏移
         */
        writeBytes(array: Uint8Array | number[] | number, offset: number = 0, length: number = -1) {
            this.write(array, offset, length);
        }
        /**
         * 写入 Uint8Array值
         * @param array Uint8Array值
         * @param offset buffer中的偏移
         * @param length 长度
         */
        writeUint8Array(array: Uint8Array | number[] | number, offset: number = 0, length: number = -1) {
            this.write(array, offset, length);
        }
        /**
         * 写入 UnsignedShort值
         * @param num UnsignedShort值
         */
        writeUnsignedShort(num: number): void {
            this.write(converter.Uint16ToArray(num));
        }
        /**
         * 写入 UnsignedInt值
         * @param num UnsignedInt值
         */
        writeUnsignedInt(num: number): void {
            this.write(converter.Uint32toArray(num));
        }
        /**
         * 写入 Float值
         * @param num Float值
         */
        writeFloat(num: number): void {
            this.write(converter.Float32ToArray(num));
        }
        /**
         * 写入 UTFBytes值
         * @param str UTFBytes值
         */
        writeUTFBytes(str: string): void {
            this.write(converter.StringToUtf8Array(str));
        }
        /**
         * 写入 SymbolByte值
         * @param num SymbolByte值
         */
        writeSymbolByte(num: number): void {
            this.write(num);
        }
        /**
         * 写入 Short值
         * @param num Short值
         */
        writeShort(num: number): void {
            this.write(converter.Int16ToArray(num));
        }
        /**
         * 写入 Int值
         * @param num Int值
         */
        writeInt(num: number): void {
            this.write(converter.Int32ToArray(num));
        }

        /**
         * 写入 Uint8Array
         * @param array Uint8Array数据
         */
        write(array: Uint8Array | number[] | number | any, offset: number = 0, length: number = -1) {

            let arrLenName = "";
            if (array["byteLength"] != undefined) {
                arrLenName = "byteLength";
            } else if (array["length"] != undefined) {
                arrLenName = "length";
            }

            //数组
            if (arrLenName != "") {
                let needSize = array[arrLenName] + this.w_offset;
                if (this.buffer.byteLength > needSize)
                    this.buffer.set(array, this.w_offset);
                else {
                    let tnum = this.buffer.byteLength;
                    while (tnum < needSize) {
                        tnum *= 2;
                    }

                    var buf = new Uint8Array(tnum);
                    buf.set(this.buffer);
                    buf.set(array, this.w_offset);
                    this.buffer = buf;
                }
                this.w_offset += array.byteLength;
            } else {
                this.buffer[this.w_offset] = array;
                this.w_offset += 1;
            }
        }

        /**
         * 销毁
         */
        dispose() {
            if (this.buffer.byteLength == 1024)
                memoryPool.Insance.deleteUint8Array(this.buffer);
            this.buffer = null;
        }
        /**
         * 获取缓冲区
         * @returns Uint8Array数据
         */
        public getBuffer(): Uint8Array {
            // let retBuff = new Uint8Array(this.w_offset);
            // memoryCopy(this.buffer, retBuff, 0);
            // return retBuff;
            return new Uint8Array(this.buffer.subarray(0, this.w_offset));
        }
        /**
         * 获取Uint8Array数据
         * @returns Uint8Array数据
         */
        public getUint8Array(): Uint8Array {
            return new Uint8Array(this.buffer.subarray(0, this.w_offset));
        }
    }


    class memoryPool {
        private static instnace: memoryPool
        public static get Insance() {
            if (!this.instnace)
                this.instnace = new memoryPool();
            return memoryPool.instnace;
        };
        private pool: Array<Uint8Array> = new Array();
        /**
         * 内存池
         */
        constructor() {
            // for (let i = 0; i < 30; ++i)
            //     this.pool.push(new Uint8Array(1024));
        }
        /**
         * 新建创一个Uint8Array
         * @returns Uint8Array 缓冲区
         */
        public newUint8Array() {
            if (this.pool.length > 0)
                return this.pool.shift();
            return new Uint8Array(1024);
        }
        /**
         * 删除一个Uint8Array
         * @param array Uint8Array 缓冲区
         */
        public deleteUint8Array(array: Uint8Array) {
            this.pool.push(array);
        }
    }


}