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
﻿//0.04
//处理utf8 string 还是不能用encode decode，有些特殊情况没覆盖
namespace m4m.io {
    /**
     * @private
     */
    export class binReader {
        private _data: DataView;
        /**
         * 二进制阅读器
         * @param buf 二进制数据
         * @param seek 偏移
         */
        constructor(buf: ArrayBuffer, seek: number = 0) {
            this._seek = seek;
            if (!(buf instanceof ArrayBuffer))
                throw new Error(`[binReader]Error buf is not Arraybuffer instance`);

            this._data = new DataView(buf, seek);
        }
        public _seek: number;

        /**
         * seek值
         * @param seek seek值
         */
        seek(seek: number) {
            this._seek = seek;
        }
        /** 当前值（seek） */
        peek(): number {
            return this._seek;
        }
        /** 数据长度 */
        length(): number {
            return this._data.byteLength;
        }
        /** 可读？ */
        canread(): number {
            //LogManager.Warn(this._buf.byteLength + "  &&&&&&&&&&&   " + this._seek + "    " + this._buf.buffer.byteLength);
            return this._data.byteLength - this._seek;
        }
        /** 读取字符串Ansi*/
        readStringAnsi(): string {
            var slen = this._data.getUint8(this._seek);
            this._seek++;
            var bs: string = "";
            for (var i = 0; i < slen; i++) {
                bs += String.fromCharCode(this._data.getUint8(this._seek));
                this._seek++;
            }
            return bs;
        }
        /**
         * utf8Array 转 字符串数据
         * @param array utf8Array数据
         * @returns 字符串数据
         */
        static utf8ArrayToString(array: Uint8Array | number[]): string {
            var ret: string[] = [];
            for (var i = 0; i < array.length; i++) {
                var cc = array[i];
                if (cc == 0)
                    break;
                var ct = 0;
                if (cc > 0xE0) {
                    ct = (cc & 0x0F) << 12;
                    cc = array[++i];
                    ct |= (cc & 0x3F) << 6;
                    cc = array[++i];
                    ct |= cc & 0x3F;
                    ret.push(String.fromCharCode(ct));
                }
                else if (cc > 0xC0) {
                    ct = (cc & 0x1F) << 6;
                    cc = array[++i];
                    ct |= (cc & 0x3F) << 6;
                    ret.push(String.fromCharCode(ct));
                }
                else if (cc > 0x80) {
                    throw new Error("InvalidCharacterError");
                }
                else {
                    ret.push(String.fromCharCode(array[i]));
                }
            }
            return ret.join('');

            //                var b = array[i];
            //    if (b > 0 && b < 16)
            //    {
            //        uri += '%0' + b.toString(16);
            //    }
            //    else if (b > 16)
            //    {
            //        uri += '%' + b.toString(16);
            //    }
            //}
            //return decodeURIComponent(uri);
        }
        /**
         * 读取utf8 字符串
         * @returns utf8 字符串
         */
        readStringUtf8(): string {
            var length = this._data.getInt8(this._seek);
            this._seek++;
            var arr = new Uint8Array(length);
            this.readUint8Array(arr);
            return binReader.utf8ArrayToString(arr);
        }
        /**
         * 读取 固定长度的 utf8 字符串
         * @param length 长度
         * @returns 固定长度的 utf8 字符串
         */
        readStringUtf8FixLength(length: number): string {
            var arr = new Uint8Array(length);
            this.readUint8Array(arr);
            return binReader.utf8ArrayToString(arr);
        }
        /**
         * 读取 Single值
         * @returns Single值
         */
        readSingle(): number {
            var num = this._data.getFloat32(this._seek, true);
            this._seek += 4;
            return num;
        }
        /**
         * 读取 Double值
         * @returns Double值
         */
        readDouble(): number {
            var num = this._data.getFloat64(this._seek, true);
            this._seek += 8;
            return num;
        }
        /**
         * 读取 Int8值
         * @returns Int8值
         */
        readInt8(): number {
            var num = this._data.getInt8(this._seek);
            this._seek += 1;
            return num;
        }
        /**
         * 读取 UInt8值
         * @returns UInt8值
         */
        readUInt8(): number {
            //LogManager.Warn(this._data.byteLength + "  @@@@@@@@@@@@@@@@@  " + this._seek);
            var num = this._data.getUint8(this._seek);
            this._seek += 1;
            return num;
        }
        /**
         * 读取 Int16值
         * @returns Int16值
         */
        readInt16(): number {
            //LogManager.Log(this._seek + "   " + this.length());
            var num = this._data.getInt16(this._seek, true);
            this._seek += 2;
            return num;
        }
        /**
         * 读取 UInt16值
         * @returns UInt16值
         */
        readUInt16(): number {
            var num = this._data.getUint16(this._seek, true);
            this._seek += 2;
            //LogManager.Warn("readUInt16 " + this._seek);
            return num;
        }
        /**
         * 读取 Int32值
         * @returns Int32值
         */
        readInt32(): number {
            var num = this._data.getInt32(this._seek, true);
            this._seek += 4;
            return num;
        }
        /**
         * 读取 UInt32值
         * @returns UInt32值
         */
        readUInt32(): number {
            var num = this._data.getUint32(this._seek, true);
            this._seek += 4;
            return num;
        }
        /**
         * 从 Uint8Array 读取 部分Uint8Array
         * @param target  Uint8Array
         * @param length  数据长度
         * @returns Uint8Array
         */
        readUint8Array(target: Uint8Array = null, offset: number = 0, length: number = -1): Uint8Array {
            if (length < 0) length = target.length;
            for (var i = 0; i < length; i++) {
                target[i] = this._data.getUint8(this._seek);
                this._seek++;
            }
            return target;
        }

        /**
         * 从 Uint8Array 读取 部分Uint8Array
         * @param target  Uint8Array
         * @param offset  偏移位置
         * @param length  数据长度
         * @returns Uint8Array
         */
        readUint8ArrayByOffset(target: Uint8Array, offset: number, length: number = 0): Uint8Array {
            if (length < 0) length = target.length;
            for (var i = 0; i < length; i++) {
                target[i] = this._data.getUint8(offset);
                offset++;
            }
            return target;
        }

        public set position(value: number) {
            this.seek(value);
        }
        public get position(): number {
            return this.peek();
        }
        /**
         * 读取 Boolean值
         * @returns Boolean值
         */
        readBoolean(): boolean {
            return this.readUInt8() > 0;
        }
        /**
         * 读取 Byte值
         * @returns Byte值
         */
        readByte(): number {
            return this.readUInt8();
        }
        /**
         * 读取 Byte数组
         * @param target  Uint8Array
         * @param offset  偏移位置
         * @param length  偏移长度
         * @returns Byte数组
         */
        readBytes(target: Uint8Array = null, offset: number = 0, length: number = -1): Uint8Array {
            return this.readUint8Array(target, offset, length);
        }
        /**
         * 读取 Uint8Array 引用
         * @param length  长度
         * @returns Uint8Array
         */
        readBytesRef(length: number = 0): Uint8Array {
            let bytes = new Uint8Array(this._data.buffer.slice(this._seek, this._seek + length));
            this._seek += length;
            return bytes;
        }

        /**
         * 读取 UnsignedShort值
         * @returns UnsignedShort值
         */
        readUnsignedShort(): number {
            return this.readUInt16();
        }

        /**
         * 读取 UnsignedInt值
         * @returns UnsignedInt值
         */
        readUnsignedInt(): number {
            return this.readUInt32();
        }

        /**
         * 读取 Float值
         * @returns Float值
         */
        readFloat(): number {
            return this.readSingle();
        }

        /**
         * 读取 UTFBytes值
         * @param length 长度
         * @returns 字符串
         */
        readUTFBytes(length: number): string {
            var arry = new Uint8Array(length);
            return binReader.utf8ArrayToString(this.readUint8Array(arry));
        }

        /**
         * 读取 有符号 Byte
         * @returns Byte值
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
    }
    export class binWriter {
        _buf: Uint8Array;
        private _data: DataView;
        private _length: number;
        private _seek: number;
        /**
         * 二进制写
         */
        constructor() {
            //if (buf == null)
            {
                var buf = new ArrayBuffer(1024);
                this._length = 0;
            }
            this._buf = new Uint8Array(buf);
            this._data = new DataView(this._buf.buffer);
            this._seek = 0;
        }
        /**
         * 确定数据
         * @param addlen 数据长度
         */
        private sureData(addlen: number): void {
            var nextlen = this._buf.byteLength;
            while (nextlen < (this._length + addlen)) {
                nextlen += 1024;
            }
            if (nextlen != this._buf.byteLength) {
                var newbuf = new Uint8Array(nextlen);
                for (var i = 0; i < this._length; i++) {
                    newbuf[i] = this._buf[i];
                }
                this._buf = newbuf;
                this._data = new DataView(this._buf.buffer);
            }
            this._length += addlen;
        }

        /** 获取长度 */
        getLength(): number {
            return length;
        }
        /** 获取Buffer */
        getBuffer(): ArrayBuffer {
            return this._buf.buffer.slice(0, this._length);
        }
        /**
         * seek值
         * @param seek seek值
         */
        seek(seek: number) {
            this._seek = seek;
        }
        /** 查看  seek值*/
        peek(): number {
            return this._seek;
        }
        /**
         * 写入 Int8值
         * @param num Int8值
         */
        writeInt8(num: number): void {
            this.sureData(1);
            this._data.setInt8(this._seek, num);
            this._seek++;

        }
        /**
         * 写入 UInt8值
         * @param num UInt8值
         */
        writeUInt8(num: number): void {
            this.sureData(1);
            this._data.setUint8(this._seek, num);
            this._seek++;
        }
        /**
         * 写入 Int16值
         * @param num Int16值
         */
        writeInt16(num: number): void {
            this.sureData(2);
            this._data.setInt16(this._seek, num, true);
            this._seek += 2;
        }
        /**
         * 写入 UInt16值
         * @param num UInt16值
         */
        writeUInt16(num: number): void {
            this.sureData(2);
            this._data.setUint16(this._seek, num, true);
            this._seek += 2;
        }
        /**
         * 写入 Int32值
         * @param num Int32值
         */
        writeInt32(num: number): void {
            this.sureData(4);
            this._data.setInt32(this._seek, num, true);
            this._seek += 4;
        }
        /**
         * 写入 UInt32值
         * @param num UInt32值
         */
        writeUInt32(num: number): void {
            this.sureData(4);
            this._data.setUint32(this._seek, num, true);
            this._seek += 4;
        }
        /**
         * 写入 Single值
         * @param num Single值
         */
        writeSingle(num: number): void {
            this.sureData(4);
            this._data.setFloat32(this._seek, num, true);
            this._seek += 4;
        }
        /**
         * 写入 Double值
         * @param num Double值
         */
        writeDouble(num: number): void {
            this.sureData(8);
            this._data.setFloat64(this._seek, num, true);
            this._seek += 8;
        }
        /**
         * 写入 Ansi字符串
         * @param str Ansi字符串
         */
        writeStringAnsi(str: string): void {
            var slen = str.length;
            this.sureData(slen + 1);
            this._data.setUint8(this._seek, slen);
            this._seek++;
            for (var i = 0; i < slen; i++) {
                this._data.setUint8(this._seek, str.charCodeAt(i));
                this._seek++;
            }
        }
        /**
         * 写入 utf8字符串
         * @param str utf8字符串
         */
        writeStringUtf8(str: string) {
            var bstr = binWriter.stringToUtf8Array(str);
            this.writeUInt8(bstr.length);
            this.writeUint8Array(bstr);
        }
        static stringToUtf8Array(str: string): number[] {
            var bstr: number[] = [];
            for (var i = 0; i < str.length; i++) {
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
            return bstr;
        }
        /**
         * 写入 字符串仅utf8数据
         * @param str utf8字符串
         */
        writeStringUtf8DataOnly(str: string) {
            var bstr = binWriter.stringToUtf8Array(str);
            this.writeUint8Array(bstr);
        }
        /**
         * 写入 Uint8Array数据
         * @param array Uint8Array数据
         * @param offset 偏移位置
         * @param length 数据长度
         */
        writeUint8Array(array: Uint8Array | number[], offset: number = 0, length: number = -1) {
            if (length < 0) length = array.length;
            this.sureData(length);
            for (var i = offset; i < offset + length; i++) {
                this._data.setUint8(this._seek, array[i]);
                this._seek++;
            }
        }

        public get length(): number {
            return this._seek;
        }

        /**
         * 写入 byte值
         * @param num byte值
         */
        writeByte(num: number): void {
            this.writeUInt8(num);
        }

        /**
         * 写入 Byte数组
         * @param array Byte数组
         * @param offset 数据偏移
         * @param length 数据长度
         */
        writeBytes(array: Uint8Array | number[], offset: number = 0, length: number = 0) {
            this.writeUint8Array(array, offset, length);
        }
        /**
        * 写入 UnsignedShort值
        * @param num UnsignedShort值
        */
        writeUnsignedShort(num: number): void {
            this.writeUInt16(num);
        }
        /**
        * 写入 UnsignedInt值
        * @param num UnsignedInt值
        */
        writeUnsignedInt(num: number): void {
            this.writeUInt32(num);
        }
        /**
         * 写入 Float值
         * @param num Float值
         */
        writeFloat(num: number): void {
            this.writeSingle(num);
        }
        /**
         * 写入 UTF字符串数据
         * @param str UTF字符串数据
         */
        writeUTFBytes(str: string): void {
            var strArray = binWriter.stringToUtf8Array(str);
            this.writeUint8Array(strArray);
        }

        /**
        * 写入 有符号 Byte
        * @param num 有符号 Byte
        */
        writeSymbolByte(num: number): void {
            this.writeInt8(num);
        }
        /**
         * 写入 Short值
         * @param num Short值
         */
        writeShort(num: number): void {
            this.writeInt16(num);
        }
        /**
         * 写入 Int值
         * @param num Int值
         */
        writeInt(num: number): void {
            this.writeInt32(num);
        }
    }
}