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
﻿namespace m4m.math {
    /**
     * 设置尺寸1 的矩形
     * @param out 输出的矩形
     */
    export function rectSet_One(out: rect) {
        out.x = 0;
        out.y = 0;
        out.w = 1;
        out.h = 1;
    }
    /**
     * 设置尺寸0 的矩形
     * @param out 输出的矩形
     */
    export function rectSet_Zero(out: rect) {
        out.x = 0;
        out.y = 0;
        out.w = 0;
        out.h = 0;
    }

    /**
     * 判断 两个矩形是否相等
     * @param src1 矩形a
     * @param src2 矩形b
     * @returns 是相等？
     */
    export function rectEqul(src1: rect, src2: rect): boolean {
        return !((src1.x != src2.x) ||
            (src1.y != src2.y) ||
            (src1.w != src2.w) ||
            (src1.h != src2.h));
    }

    /**
     * 判断点是否在矩形中
     * @param x 点坐标x
     * @param y 点坐标y
     * @param src 矩形
     */
    export function rectInner(x: number, y: number, src: rect): boolean {
        if (x < src.x || x > src.x + src.w ||
            y < src.y || y > src.y + src.h) {
            return false;
        }
        return true;
    }

    /**
     * 判断两矩形是否重叠
     * @param r1 矩形1
     * @param r2 矩形2
     */
    export function rectOverlap(r1: rect, r2: rect): boolean {
       //两矩形中心点距离 小于 半尺寸则重叠了
       //X轴
       if((r1.x + r1.w) < r2.x || r1.x > (r1.x + r1.w)) return false;
       //y轴
       if((r1.y + r1.h) < r2.y || r1.y > (r1.y + r1.h)) return false;
        return true;
    }

    /**
     * 设置一个矩形的参数
     * @param out 矩形
     * @param x 位置x
     * @param y 位置y
     * @param w 宽
     * @param h 高
     */
    export function rectSet(out: rect, x: number, y: number, w: number, h: number) {
        out.x = x;
        out.y = y;
        out.w = w;
        out.h = h;
    }

    /**
     * 检测两个矩形是否相碰
     * @param r1 矩形1
     * @param r2 矩形2
     */
    export function rectCollided(r1: rect, r2: rect): boolean {
        return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x && r1.y < r2.y + r2.h && r1.h + r1.y > r2.y;
    }

    /**
     * 克隆矩形
     * @param src 源矩形
     * @param out 输出的被克隆的矩形
     */
    export function rectClone(src: rect, out: rect) {
        out.x = src.x;
        out.y = src.y;
        out.h = src.h;
        out.w = src.w;

        // out.rawData[0] = src.rawData[0];
        // out.rawData[1] = src.rawData[1];
        // out.rawData[2] = src.rawData[2];
        // out.rawData[3] = src.rawData[3];
    }
}