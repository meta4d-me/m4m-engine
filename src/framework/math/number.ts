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
﻿/// <reference path="../../render/struct.ts" />

namespace m4m.math
{

    //临时写在这里
    /**
     * float 值裁减
     * @param v 值
     * @param min 最大值
     * @param max 最小值
     * @returns 输出值
     */
    export function floatClamp(v: number, min: number = 0, max: number = 1): number
    {
        if (v < min)
            return min;
        else if (v > max)
            return max;
        else
            return v;
    }
    /**
     * 符号化
     * @param value 值
     * @returns 符号值（1 或 -1）
     */
    export function sign(value: number): number
    {
        value = +value; // convert to a number

        if (value === 0 || isNaN(value))
            return value;

        return value > 0 ? 1 : -1;
    }

    /**
     * 获取键盘code 的Ascii
     * @param ev 按键事件
     * @returns Ascii
     */
    export function getKeyCodeByAscii(ev: KeyboardEvent)
    {
        if (ev.shiftKey)
        {
            return ev.keyCode - 32;
        } else
        {
            return ev.keyCode;
        }
    }

    export var DEG2RAD = Math.PI / 180;
    export var RAD2DEG = 180 / Math.PI;

    /**
     * 角度转换为弧度
     * 
     * @param degrees 角度
     */
    export function degToRad(degrees: number)
    {
        return degrees * DEG2RAD;
    }

    /**
     * 弧度转换为角度
     * 
     * @param radians 弧度
     */
    export function radToDeg(radians: number)
    {
        return radians * RAD2DEG;
    }

    /**
     * 使 x 值从区间 <a1, a2> 线性映射到区间 <b1, b2>
     * 
     * @param x 第一个区间中值
     * @param a1 第一个区间起始值
     * @param a2 第一个区间终止值
     * @param b1 第二个区间起始值
     * @param b2 第二个区间起始值
     */
    export function mapLinear(x: number, a1: number, a2: number, b1: number, b2: number)
    {
        return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
    }

    /**
     * 差值计算
     * @param fromV 开始值
     * @param toV 结束值
     * @param v 差值度
     * @returns 结果值
     */
    export function numberLerp(fromV: number, toV: number, v: number)
    {
        return fromV * (1 - v) + toV * v;
    }

    /**
     * @deprecated [已弃用]
     * 标准x轴
     * @returns 
     */
    export function x_AXIS()
    {
        return commonStatic.x_axis;
    }
    /**
     * @deprecated [已弃用]
     * 标准y轴
     * @returns 
     */
    export function y_AXIS()
    {
        return commonStatic.y_axis;
    }
    /**
     * @deprecated [已弃用]
     * 标准z轴
     * @returns 
     */
    export function z_AXIS()
    {
        return commonStatic.z_axis;
    }

    export class commonStatic
    {
        public static x_axis: m4m.math.vector3 = new m4m.math.vector3(1, 0, 0);
        public static y_axis: m4m.math.vector3 = new m4m.math.vector3(0, 1, 0);
        public static z_axis: m4m.math.vector3 = new m4m.math.vector3(0, 0, 1);

    }
}