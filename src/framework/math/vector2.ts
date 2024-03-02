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
﻿"use strict";
namespace m4m.math {
    /**
     * 二维向量相减
     * @param a 左向量
     * @param b 右向量
     * @param out 输出的二维向量
     */
    export function vec2Subtract(a: vector2, b: vector2, out: vector2) {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
    }
    /**
     * 二维向量相加
     * @param a 左向量
     * @param b 右向量
     * @param out 输出的二维向量
     */
    export function vec2Add(a: vector2, b: vector2, out: vector2) {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
    }
    /**
     * 克隆二维向量
     * @param from 源二维向量
     * @param to 输出的二维向量
     */
    export function vec2Clone(from: vector2, to: vector2) {
        to.x = from.x;
        to.y = from.y;
        //to.rawData.set(from.rawData);
        // to.rawData[0]=from.rawData[0];
        // to.rawData[1]=from.rawData[1];
    }

    /**
     * 计算两向量的坐标距离
     * @param a 向量a
     * @param b 向量b
     * @returns 距离
     */
    export function vec2Distance(a: vector2, b: vector2): number {
        var out = pool.new_vector2();
        vec2Subtract(a, b, out);
        var result = Math.sqrt(out.x * out.x + out.y * out.y);
        pool.delete_vector2(out);
        return result;
    }
    /**
     * 通过一个标量 缩放 二维向量
     * @param from 源二维向量
     * @param scale 缩放 标量 
     * @param out 输出的二维向量
     */
    export function vec2ScaleByNum(from: vector2, scale: number, out: vector2) {
        out.x = from.x * scale;
        out.y = from.y * scale;
    }

    /**
     * 通过一个二维向量 缩放 二维向量
     * @param from 源二维向量
     * @param scale 缩放 二维向量
     * @param out 输出的二维向量
     */
    export function vec2ScaleByVec2(from: vector2, scale: vector2, out: vector2) {
        out.x = from.x * scale.x;
        out.y = from.y * scale.y;
    }

    /**
     * 计算一个 二维向量的长度值
     * @param a 源二维向量
     * @returns 长度值
     */
    export function vec2Length(a: vector2): number {
        return Math.sqrt(a.x * a.x + a.y * a.y);
    }

    /**
     * 计算两个二维向量的线性差值
     * @param vector 开始向量
     * @param vector2 结束向量
     * @param v 差值度（0-1）
     * @param out 输出的二维向量
     */
    export function vec2SLerp(vector: vector2, vector2: vector2, v: number, out: vector2) {
        out.x = vector.x * (1 - v) + vector2.x * v;
        out.y = vector.y * (1 - v) + vector2.y * v;
    }

    /**
     * 计算一个二维向量的归一化
     * @param from 源二维向量
     * @param out 输出的二维向量
     */
    export function vec2Normalize(from: vector2, out: vector2) {
        var num: number = vec2Length(from);
        if (num > Number.MIN_VALUE) {
            out.x = from.x / num;
            out.y = from.y / num;
        } else {
            out.x = 0;
            out.y = 0;
        }
    }

    /**
     * 计算两个二维向量的点乘
     * @param a 向量a
     * @param b 向量b
     * @returns 输出标量值
     */
    export function vec2Multiply(a: vector2, b: vector2): number {
        return a.x * b.x + a.y * b.y;
    }

    /**
     * 计算两个二维向量的点乘
     * @param lhs 向量a
     * @param rhs 向量b
     * @returns 输出标量值
     */
    export function vec2Dot(lhs: vector2, rhs: vector2): number {
        return lhs.x * rhs.x + lhs.y * rhs.y;
    }

    /**
     * 判断两个二维向量是否相等
     * @param vector 向量a
     * @param vector2 向量b
     * @param threshold 误差范围
     * @returns 是相等？
     */
    export function vec2Equal(vector: vector2, vector2: vector2, threshold = 0.00001): boolean {
        if (vector == vector2) return true;
        if (Math.abs(vector.x - vector2.x) > threshold)
            return false;

        if (Math.abs(vector.y - vector2.y) > threshold)
            return false;

        return true;
    }

    /**
     * 二维向量的所有维度值（xy） 都 设置为一个标量 
     * @param vector 向量
     * @param value 标量
     */
    export function vec2SetAll(vector: vector2, value: number) {
        vector.x = value;
        vector.y = value;

        // vector.rawData[0] = value;
        // vector.rawData[1] = value;
    }

    /**
     * 设置 二维向量的各个维度值（xy） 
     * @param vector 向量
     * @param x x值
     * @param y y值
     */
    export function vec2Set(vector: vector2, x: number, y: number) {
        vector.x = x;
        vector.y = y;

        // vector.rawData[0] = x;
        // vector.rawData[1] = y;
    }
}
