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
﻿/// <reference path="../io/reflect.ts" />

namespace m4m.math {
    export interface Ivec2 { x: number, y: number };
    export interface Ivec3 { x: number, y: number, z: number };
    export interface Iquat { x: number, y: number, z: number, w: number };

    export type byte = number;
    export type ubyte = number;
    export type short = number;
    export type int = number;
    export type ushort = number;
    export type uint = number;
    export type float = number;
    export type double = number;

    var _ubyte: Uint8Array = new Uint8Array(1);
    var _byte: Int8Array = new Int8Array(1);
    var _int16: Int16Array = new Int16Array(1);
    var _int32: Int32Array = new Int32Array(1);
    var _uint16: Uint16Array = new Uint16Array(1);
    var _uint32: Uint32Array = new Uint32Array(1);
    var _float32: Float32Array = new Float32Array(1);
    var _float64: Float64Array = new Float64Array(1);

    /**
     * 格式化数据为 UByte
     * @param v 输入数据
     * @returns UByte
     */
    export function UByte(v: number | string = 0): ubyte {
        if (typeof (v) == "string")
            v = Number(v);
        _ubyte[0] = v;
        return _ubyte[0];
    }
    /**
     * 格式化数据为 Byte
     * @param v 输入数据
     * @returns Byte
     */
    export function Byte(v: number | string = 0): byte {
        if (typeof (v) == "string")
            v = Number(v);
        _byte[0] = v;
        return _byte[0];
    }
    /**
     * 格式化数据为 Int16
     * @param v 输入数据
     * @returns Int16
     */
    export function Int16(v: number | string = 0): short {
        if (typeof (v) == "string")
            v = Number(v);
        _int16[0] = v;
        return _int16[0];
    }

    /**
     * 格式化数据为 Int32
     * @param v 输入数据
     * @returns Int32
     */
    export function Int32(v: number | string = 0): int {
        if (typeof (v) == "string")
            v = Number(v);
        _int32[0] = v;
        return _int32[0];
    }

    /**
     * 格式化数据为 UInt16
     * @param v 输入数据
     * @returns UInt16
     */
    export function UInt16(v: number | string = 0): ushort {
        if (typeof (v) == "string")
            v = Number(v);
        _uint16[0] = v;
        return _uint16[0];
    }

    /**
     * 格式化数据为 UInt32
     * @param v 输入数据
     * @returns UInt32
     */
    export function UInt32(v: number | string = 0): uint {
        if (typeof (v) == "string")
            v = Number(v);
        _uint32[0] = v;
        return _uint32[0];
    }

    /**
     * 格式化数据为 Float
     * @param v 输入数据
     * @returns Float
     */
    export function Float(v: number | string = 0): float {
        if (typeof (v) == "string")
            v = Number(v);
        _float32[0] = v;
        return _float32[0];
    }

    /**
     * 格式化数据为 Double
     * @param v 输入数据
     * @returns Double
     */
    export function Double(v: number | string = 0): double {
        if (typeof (v) == "string")
            v = Number(v);
        _float64[0] = v;
        return _float64[0];
    }


    /**
     * @private
     */
    @m4m.reflect.SerializeType
    export class vector2 implements Ivec2 {
        static readonly ClassName: string = "vector2";
        /**
         * 二维向量
         * @param x x值
         * @param y y值
         */
        constructor(x: number = 0, y: number = 0) {
            this.x = x;
            this.y = y;
        }
        @m4m.reflect.Field("number")
        x: number;
        @m4m.reflect.Field("number")
        y: number;
        /*
                public rawData = new Float32Array(2);
                constructor(x: float = 0, y: float = 0)
                {
                    this.rawData[0] = x;
                    this.rawData[1] = y;
                }
                @m4m.reflect.Field("number")
                get x(): float
                {
                    return this.rawData[0];
                };
                set x(x: float)
                {
                    this.rawData[0] = x;
                }
                @m4m.reflect.Field("number")
                get y(): float
                {
                    return this.rawData[1];
                };
                set y(y: float)
                {
                    this.rawData[1] = y;
                }
                toString(): string
                {
                    return `${this.x},${this.y}`;
                }
                */
    }

    /**
     * @private
     */
    @m4m.reflect.SerializeType
    export class rect {
        static readonly ClassName: string = "rect";

        // public rawData = new Float32Array(4);
        /**
         * 矩形
         * @param x x值
         * @param y y值
         * @param w 宽
         * @param h 高
         */
        constructor(x: float = 0, y: float = 0, w: float = 0, h: float = 0) {
            // this.rawData[0] = x;
            // this.rawData[1] = y;
            // this.rawData[2] = w;
            // this.rawData[3] = h;
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }
        @m4m.reflect.Field("number")
        x: number;
        // get x(): float
        // {
        //     return this.rawData[0];
        // };
        // set x(x: float)
        // {
        //     this.rawData[0] = x;
        // }
        @m4m.reflect.Field("number")
        y: number;
        // get y(): float
        // {
        //     return this.rawData[1];
        // };
        // set y(y: float)
        // {
        //     this.rawData[1] = y;
        // }
        @m4m.reflect.Field("number")
        w: number;
        // get w(): float
        // {
        //     return this.rawData[2];
        // };
        // set w(w: float)
        // {
        //     this.rawData[2] = w;
        // }

        @m4m.reflect.Field("number")
        h: number;
        // get h(): float
        // {
        //     return this.rawData[3];
        // };
        // set h(h: float)
        // {
        //     this.rawData[3] = h;
        // }

        toString(): string {
            return `${this.x},${this.y},${this.w},${this.h}`;
        }
    }

    /**
     * @private
     */
    @m4m.reflect.SerializeType
    export class border {
        static readonly ClassName: string = "border";

        // public rawData = new Float32Array(4);
        /**
         * 矩形边界
         * @param l 左值
         * @param t 上值
         * @param r 右值
         * @param b 下值
         */
        constructor(l: float = 0, t: float = 0, r: float = 0, b: float = 0) {
            // this.rawData[0] = l;
            // this.rawData[1] = t;
            // this.rawData[2] = r;
            // this.rawData[3] = b;
            this.l = l;
            this.t = t;
            this.r = r;
            this.b = b;
        }
        @m4m.reflect.Field("number")
        l: number;
        // get l(): float
        // {
        //     return this.rawData[0];
        // };
        // set l(l: float)
        // {
        //     this.rawData[0] = l;
        // }
        @m4m.reflect.Field("number")
        t: number;
        // get t(): float
        // {
        //     return this.rawData[1];
        // };
        // set t(t: float)
        // {
        //     this.rawData[1] = t;
        // }
        @m4m.reflect.Field("number")
        r: number;
        // get r(): float
        // {
        //     return this.rawData[2];
        // };
        // set r(r: float)
        // {
        //     this.rawData[2] = r;
        // }
        @m4m.reflect.Field("number")
        b: number;
        // get b(): float
        // {
        //     return this.rawData[3];
        // };
        // set b(b: float)
        // {
        //     this.rawData[3] = b;
        // }

        toString(): string {
            return `${this.r},${this.t},${this.r},${this.b}`;
        }
    }

    /**
     * @private
     */
    @m4m.reflect.SerializeType
    export class color {
        static readonly ClassName: string = "color";

        // public rawData = new Float32Array(4);
        /**
         * rgba颜色
         * @param r r值
         * @param g g值
         * @param b b值
         * @param a a值
         */
        constructor(r: float = 1, g: float = 1, b: float = 1, a: float = 1) {
            // this.rawData[0] = r;
            // this.rawData[1] = g;
            // this.rawData[2] = b;
            // this.rawData[3] = a;
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        @m4m.reflect.Field("number")
        r: number;
        // get r(): float
        // {
        //     return this.rawData[0];
        // };
        // set r(r: float)
        // {
        //     this.rawData[0] = r;
        // }
        @m4m.reflect.Field("number")
        g: number;
        // get g(): float
        // {
        //     return this.rawData[1];
        // };
        // set g(g: float)
        // {
        //     this.rawData[1] = g;
        // }
        @m4m.reflect.Field("number")
        b: number;
        // get b(): float
        // {
        //     return this.rawData[2];
        // };
        // set b(b: float)
        // {
        //     this.rawData[2] = b;
        // }
        @m4m.reflect.Field("number")
        a: number;
        // get a(): float
        // {
        //     return this.rawData[3];
        // };
        // set a(a: float)
        // {
        //     this.rawData[3] = a;
        // }
        toString(): string {
            return `${this.r},${this.g},${this.b},${this.a}`;
        }
    }

    /**
     * @private
     */
    @m4m.reflect.SerializeType
    export class vector3 implements Ivec3 {
        static readonly ClassName: string = "vector3";
        /**
         * 三维向量
         * @param x x值 
         * @param y y值
         * @param z z值
         */
        constructor(x: float = 0, y: float = 0, z: float = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        // public rawData = new Float32Array(3);
        // constructor(x: float = 0, y: float = 0, z: float = 0)
        // {
        // this.rawData[0] = x;
        // this.rawData[1] = y;
        // this.rawData[2] = z;
        // }
        @m4m.reflect.Field("number")
        x: number;
        // get x(): float
        // {
        //     return this.rawData[0];
        // };
        // set x(x: float)
        // {
        //     this.rawData[0] = x;
        // }
        @m4m.reflect.Field("number")
        y: number;
        // get y(): float
        // {
        //     return this.rawData[1];
        // };
        // set y(y: float)
        // {
        //     this.rawData[1] = y;
        // }
        @m4m.reflect.Field("number")
        z: number;
        // get z(): float
        // {
        //     return this.rawData[2];
        // };
        // set z(z: float)
        // {
        //     this.rawData[2] = z;
        // }

        toString(): string {
            // return `${this.rawData[0]},${this.rawData[1]},${this.rawData[2]}`;
            return `${this.x},${this.y},${this.z}`;
        }
    }

    /**
     * @private
     */
    @m4m.reflect.SerializeType
    export class vector4 {
        static readonly ClassName: string = "vector4";

        // public rawData = new Float32Array(4);
        /**
         * 四维向量
         * @param x x值
         * @param y y值
         * @param z z值
         * @param w w值
         */
        constructor(x: float = 0, y: float = 0, z: float = 0, w: float = 0) {
            // this.rawData[0] = x;
            // this.rawData[1] = y;
            // this.rawData[2] = z;
            // this.rawData[3] = w;
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        @m4m.reflect.Field("number")
        x: number;
        // get x(): float
        // {
        //     return this.rawData[0];
        // };
        // set x(x: float)
        // {
        //     this.rawData[0] = x;
        // }
        @m4m.reflect.Field("number")
        y: number;
        // get y(): float
        // {
        //     return this.rawData[1];
        // };
        // set y(y: float)
        // {
        //     this.rawData[1] = y;
        // }
        @m4m.reflect.Field("number")
        z: number;
        // get z(): float
        // {
        //     return this.rawData[2];
        // };
        // set z(z: float)
        // {
        //     this.rawData[2] = z;
        // }
        @m4m.reflect.Field("number")
        w: number;
        // get w(): float
        // {
        //     return this.rawData[3];
        // };
        // set w(w: float)
        // {
        //     this.rawData[3] = w;
        // }
        toString(): string {
            return `${this.x},${this.y},${this.z},${this.w}`;
        }
    }

    /**
     * @private
     */
    @m4m.reflect.SerializeType
    export class quaternion implements Iquat {
        static readonly ClassName: string = "quaternion";

        // public rawData = new Float32Array(4);
        /**
         * 四元数
         * @param x x值
         * @param y y值
         * @param z z值
         * @param w w值
         */
        constructor(x: float = 0, y: float = 0, z: float = 0, w: float = 1) {
            // this.rawData[0] = x;
            // this.rawData[1] = y;
            // this.rawData[2] = z;
            // this.rawData[3] = w;
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        @m4m.reflect.Field("number")
        x: number;
        // get x(): float
        // {
        //     return this.rawData[0];
        // };
        // set x(x: float)
        // {
        //     this.rawData[0] = x;
        // }
        @m4m.reflect.Field("number")
        y: number;
        // get y(): float
        // {
        //     return this.rawData[1];
        // };
        // set y(y: float)
        // {
        //     this.rawData[1] = y;
        // }
        @m4m.reflect.Field("number")
        z: number;
        // get z(): float
        // {
        //     return this.rawData[2];
        // };
        // set z(z: float)
        // {
        //     this.rawData[2] = z;
        // }
        @m4m.reflect.Field("number")
        w: number;
        // get w(): float
        // {
        //     return this.rawData[3];
        // };
        // set w(w: float)
        // {
        //     this.rawData[3] = w;
        // }
        toString(): string {
            // return `${this.rawData[0]},${this.rawData[1]},${this.rawData[2]},${this.rawData[3]}`;
            return `${this.x},${this.y},${this.z},${this.w}`;
        }
    }

    /**
     * @private
     */
    export class matrix {
        static readonly ClassName: string = "matrix";

        public rawData: Array<number>;
        // public rawData: Float32Array;
        /**
         * 4x4 矩阵
         * @param datas raw 数据
         */
        constructor(datas: Array<number> = null)//: Float32Array = null)
        {
            // if (datas)
            // {
            //     this.rawData = datas;
            // }
            // else
            //     this.rawData = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
            if (datas) {
                this.rawData = datas;
            }
            else
                this.rawData = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        }
        toString(): string {
            return "[" + this.rawData[0] + "," + this.rawData[1] + "," + this.rawData[2] + "," + this.rawData[3] + "],"
                + "[" + this.rawData[4] + "," + this.rawData[5] + "," + this.rawData[6] + "," + this.rawData[7] + "],"
                + "[" + this.rawData[8] + "," + this.rawData[9] + "," + this.rawData[10] + "," + this.rawData[11] + "],"
                + "[" + this.rawData[12] + "," + this.rawData[13] + "," + this.rawData[14] + "," + this.rawData[15] + "]";
        }
    }
    /**
     * @private
     */
    export class matrix3x2 {
        // public rawData: Float32Array;
        public rawData: Array<number>;
        /**
         * 3x2 矩阵
         * @param datas raw数据
         */
        constructor(datas: Array<number> = null)//datas: Float32Array = null)
        {
            // if (datas)
            // {
            //     this.rawData = datas;
            // }
            // else
            //     this.rawData = new Float32Array([1, 0, 0, 1, 0, 0]);
            if (datas) {
                this.rawData = datas;
            }
            else
                this.rawData = [1, 0, 0, 1, 0, 0];
        }
        toString(): string {
            return "[" + this.rawData[0] + "," + this.rawData[1] + "," + this.rawData[2] + "],"
                + "[" + this.rawData[3] + "," + this.rawData[4] + "," + this.rawData[5] + "]";
        }
    }

    /**
     * 动态延长 Array 
     */
    export class ExtenArray<T extends Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array>{
        private _buffer: T;
        private _buoy: number = -1;
        private _length: number;

        /** 定长数组 */
        get buffer() { return this._buffer; };
        /** 已经使用到数量 */
        get count() { return this._buoy + 1; };
        set count(val: number) {
            if (val < 0) val = 0;
            if (val > this._length) {
                let needSize = Math.ceil(val / this._length) * this._length;
                this.exlength(needSize);
            }
            this._buoy = val - 1;
        };

        /**
         * 动态延长 Array 
         * @param bufferType buffer类型
         * @param initSize 初始array 长度
         */
        constructor(private bufferType: new (size: number) => T, initSize: number = 32) {
            this._length = initSize;
            // this._buffer = new T(initSize);
            this._buffer = new bufferType(initSize);
        }

        /** push添加到array */
        push(num: number) {
            this._buoy++;
            if (this._buoy >= this._length) {
                this.exlength();
            }
            this._buffer[this._buoy] = num;
        }

        /** 延长 长度 */
        private exlength(mult: number = 2) {
            let _nlength = this._length * mult;
            let _buffer = this._buffer;
            // let _nbuffer = new T(_nlength);
            let _nbuffer = new this.bufferType(_nlength);
            for (let i = 0, len = this._length; i < len; i++) {
                _nbuffer[i] = _buffer[i];
            }
            this._buffer = _nbuffer;
            this._length = _nlength;
        }

        /** 对象清理 */
        dispose() {
            this._buffer = null;
        }

    }

    /**
     * 复用数组 ，用于频繁重复创建数组容器的场景(减少GC消耗)
     */
    export class ReuseArray<T>{
        private arr: Array<T> = [];
        private buoy = -1;

        /** 获取 Array 对象 */
        getArray() {
            return this.arr;
        }

        /** 获取当前长度 */
        get length() { return this.buoy + 1; };
        set length(val) { this.buoy = val - 1; };

        /**
         * 添加到数组
         * @param val 添加的数据
         */
        push(val: T) {
            this.buoy++;
            this.arr[this.buoy] = val;
        }

        /**
         * 获取指定索引的值
         * @param index 指定索引
         * @returns 输出的值
         */
        get(index: number) {
            if (index > this.buoy) return null;
            return this.arr[index];
        }

        /** 数组所有值置为null  */
        clear() {
            var len = this.arr.length;
            for (var i = 0; i < len; i++) {
                if (this.arr[i] == null && i >= this.buoy) break;
                this.arr[i] = null;
            }
            this.buoy = -1;
        }
    }


    // //表示一个变换
    // export class transform
    // {
    //     rot: quaternion = new quaternion();
    //     tran: vector3 = new vector3();
    //     scale: vector3 = new vector3(1, 1, 1);
    // }
    // //表示一个不含缩放的变换
    // export class TransformWithoutScale
    // {
    //     rot: quaternion = new quaternion();
    //     tran: vector3 = new vector3();
    // }

    /**
     * json 数据转 四维向量
     * @param json json 数据
     * @param vec4 四维向量
     */
    export function vec4FormJson(json: string, vec4: vector4) {
        json = json.replace("(", "");
        json = json.replace(")", "");
        let arr = json.split(",");
        vec4.x = Number(arr[0]);
        vec4.y = Number(arr[1]);
        vec4.z = Number(arr[2]);
        vec4.w = Number(arr[3]);
    }
    /**
     * json 数据转 三维向量
     * @param json json 数据
     * @param vec4 三维向量
     */
    export function vec3FormJson(json: string, vec3: vector3) {
        json = json.replace("(", "");
        json = json.replace(")", "");

        let arr = json.split(",");
        vec3.x = Number(arr[0]);
        vec3.y = Number(arr[1]);
        vec3.z = Number(arr[2]);
    }
    /**
    * json 数据转 二维向量
    * @param json json 数据
    * @param vec4 二维向量
    */
    export function vec2FormJson(json: string, vec2: vector2) {
        json = json.replace("(", "");
        json = json.replace(")", "");
        let arr = json.split(",");
        vec2.x = Number(arr[0]);
        vec2.y = Number(arr[1]);
    }
    /**
    * json 数据转 颜色
    * @param json json 数据
    * @param vec4 颜色
    */
    export function colorFormJson(json: string, _color: color) {
        json = json.replace("RGBA(", "");
        json = json.replace(")", "");
        let arr = json.split(",");
        _color.r = Number(arr[0]);
        _color.g = Number(arr[1]);
        _color.b = Number(arr[2]);
        _color.a = Number(arr[3]);
    }
}