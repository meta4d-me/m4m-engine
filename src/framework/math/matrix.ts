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
﻿
"use strict";
namespace m4m.math {
    /**
     * 获取矩阵的位移变换
     * @param src 矩阵
     * @param out 移变换向量
     */
    export function matrixGetTranslation(src: matrix, out: vector3) {
        out.x = src.rawData[12];
        out.y = src.rawData[13];
        out.z = src.rawData[14];

        // out.rawData[0] = src.rawData[12];
        // out.rawData[1] = src.rawData[13];
        // out.rawData[2] = src.rawData[14];
        //out.rawData.set(src.rawData.subarray(12, 15));
    }

    /**
    * @language zh_CN
    * 当前矩阵转置
    * @version m4m 1.0
    * @platform Web,Native
    */
    export function matrixTranspose(src: matrix, out: matrix) {
        let s1 = src.rawData[1];
        let s2 = src.rawData[2];
        let s3 = src.rawData[3];
        let s4 = src.rawData[4];
        let s6 = src.rawData[6];
        let s7 = src.rawData[7];
        let s8 = src.rawData[8];
        let s9 = src.rawData[9];
        let s11 = src.rawData[11];
        let s12 = src.rawData[12];
        let s13 = src.rawData[13];
        let s14 = src.rawData[14];

        out.rawData[1] = s4;
        out.rawData[2] = s8;
        out.rawData[3] = s12;
        out.rawData[4] = s1;
        out.rawData[6] = s9;
        out.rawData[7] = s13;
        out.rawData[8] = s2;
        out.rawData[9] = s6;
        out.rawData[11] = s14;
        out.rawData[12] = s3;
        out.rawData[13] = s7;
        out.rawData[14] = s11;
    }

    /**
     * 矩阵分解 到 缩放、旋转、位移
     * @param src 矩阵
     * @param scale 缩放
     * @param rotation 旋转
     * @param translation 位移
     * @returns 缩放不为0？
     */
    export function matrixDecompose(src: matrix, scale: vector3, rotation: quaternion, translation: vector3): boolean {
        translation.x = src.rawData[12];
        translation.y = src.rawData[13];
        translation.z = src.rawData[14];
        // translation.rawData.set(src.rawData.subarray(12, 15));

        let xs = sign(src.rawData[0] * src.rawData[1] * src.rawData[2] * src.rawData[3]) < 0 ? -1 : 1;
        let ys = sign(src.rawData[4] * src.rawData[5] * src.rawData[6] * src.rawData[7]) < 0 ? -1 : 1;
        let zs = sign(src.rawData[8] * src.rawData[9] * src.rawData[10] * src.rawData[11]) < 0 ? -1 : 1;

        scale.x = xs * Math.sqrt(src.rawData[0] * src.rawData[0] + src.rawData[1] * src.rawData[1] + src.rawData[2] * src.rawData[2]);
        scale.y = ys * Math.sqrt(src.rawData[4] * src.rawData[4] + src.rawData[5] * src.rawData[5] + src.rawData[6] * src.rawData[6]);
        scale.z = zs * Math.sqrt(src.rawData[8] * src.rawData[8] + src.rawData[9] * src.rawData[9] + src.rawData[10] * src.rawData[10]);

        if (scale.x === 0 || scale.y === 0 || scale.z === 0) {
            rotation.x = 0;
            rotation.y = 0;
            rotation.z = 0;
            rotation.w = 1;
            return false;
        }

        let mat = pool.new_matrix();
        mat.rawData[0] = src.rawData[0] / scale.x;
        mat.rawData[1] = src.rawData[1] / scale.x;
        mat.rawData[2] = src.rawData[2] / scale.x;
        mat.rawData[3] = 0;

        mat.rawData[4] = src.rawData[4] / scale.y;
        mat.rawData[5] = src.rawData[5] / scale.y;
        mat.rawData[6] = src.rawData[6] / scale.y;
        mat.rawData[7] = 0;

        mat.rawData[8] = src.rawData[8] / scale.z;
        mat.rawData[9] = src.rawData[9] / scale.z;
        mat.rawData[10] = src.rawData[10] / scale.z;
        mat.rawData[11] = 0;

        matrix2Quaternion(mat, rotation);

        pool.delete_matrix(mat);
        return true;
    }
    export class angelref {
        v: number;
    }
    /**
     * 矩阵3x2 解 到 缩放、旋转、位移
     * @param src 矩阵3x2
     * @param scale 缩放
     * @param rotation 旋转
     * @param translation 位移
     * @returns 缩放不为0？
     */
    export function matrix3x2Decompose(src: matrix3x2, scale: vector2, rotation: angelref, translation: vector2): boolean {
        //trans
        translation.x = src.rawData[4];
        translation.y = src.rawData[5];

        // var xs = sign(src.rawData[0] * src.rawData[1]) < 0 ? -1 : 1;
        // var ys = sign(src.rawData[2] * src.rawData[3]) < 0 ? -1 : 1;

        // scale.x = xs * Math.sqrt(src.rawData[0] * src.rawData[0] + src.rawData[1] * src.rawData[1]);
        // scale.y = ys * Math.sqrt(src.rawData[2] * src.rawData[2] + src.rawData[3] * src.rawData[3]);

        // if (scale.x === 0 || scale.y === 0)
        // {
        //     rotation.v = 0;
        //     return false;
        // }

        // var sx = src.rawData[0] / scale.x;
        // var csx = src.rawData[1] / scale.x;
        // var r1 = Math.asin(sx);
        // var r2 = Math.acos(csx);
        // rotation.v = r1;
        // return true;

        scale.x = Math.sqrt(src.rawData[0] * src.rawData[0] + src.rawData[1] * src.rawData[1]);
        scale.y = Math.sqrt(src.rawData[2] * src.rawData[2] + src.rawData[3] * src.rawData[3]);

        if (scale.x === 0 || scale.y === 0) {
            rotation.v = 0;
            return false;
        }

        var sx = src.rawData[0] / scale.x;
        var r1 = Math.acos(sx);
        var sxs = src.rawData[1] / scale.x;
        var r2 = Math.asin(sxs);
        if (sxs < 0) {
            r1 = 2 * Math.PI - r1;
            //r1=r1+Math.PI;
        }
        rotation.v = r1;
        return true;
    }

    /**
     * 矩阵 中获取 Euler旋转
     * @param src 矩阵
     * @param order 旋转方向
     * @param rotation Euler旋转（vector3）
     */
    export function matrixGetEuler(src: matrix, order: RotationOrder, rotation: vector3): void {
        var clamp = math.floatClamp;
        //
        var rawData = src.rawData;
        var m11 = rawData[0], m12 = rawData[4], m13 = rawData[8];
        var m21 = rawData[1], m22 = rawData[5], m23 = rawData[9];
        var m31 = rawData[2], m32 = rawData[6], m33 = rawData[10];
        //
        var scaleX = Math.sqrt(m11 * m11 + m21 * m21 + m31 * m31);
        m11 /= scaleX;
        m21 /= scaleX;
        m31 /= scaleX;
        var scaleY = Math.sqrt(m12 * m12 + m22 * m22 + m32 * m32);
        m12 /= scaleY;
        m22 /= scaleY;
        m32 /= scaleY;
        var scaleZ = Math.sqrt(m13 * m13 + m23 * m23 + m33 * m33);
        m13 /= scaleZ;
        m23 /= scaleZ;
        m33 /= scaleZ;
        //
        if (order === RotationOrder.XYZ) {
            rotation.y = Math.asin(clamp(m13, - 1, 1));
            if (Math.abs(m13) < 0.9999999) {
                rotation.x = Math.atan2(- m23, m33);
                rotation.z = Math.atan2(- m12, m11);
            } else {
                rotation.x = Math.atan2(m32, m22);
                rotation.z = 0;
            }
        } else if (order === RotationOrder.YXZ) {
            rotation.x = Math.asin(- clamp(m23, - 1, 1));
            if (Math.abs(m23) < 0.9999999) {
                rotation.y = Math.atan2(m13, m33);
                rotation.z = Math.atan2(m21, m22);
            } else {
                rotation.y = Math.atan2(- m31, m11);
                rotation.z = 0;
            }
        } else if (order === RotationOrder.ZXY) {
            rotation.x = Math.asin(clamp(m32, - 1, 1));
            if (Math.abs(m32) < 0.9999999) {
                rotation.y = Math.atan2(- m31, m33);
                rotation.z = Math.atan2(- m12, m22);
            } else {
                rotation.y = 0;
                rotation.z = Math.atan2(m21, m11);
            }
        } else if (order === RotationOrder.ZYX) {
            rotation.y = Math.asin(- clamp(m31, - 1, 1));
            if (Math.abs(m31) < 0.9999999) {
                rotation.x = Math.atan2(m32, m33);
                rotation.z = Math.atan2(m21, m11);
            } else {
                rotation.x = 0;
                rotation.z = Math.atan2(- m12, m22);
            }
        } else if (order === RotationOrder.YZX) {
            rotation.z = Math.asin(clamp(m21, - 1, 1));
            if (Math.abs(m21) < 0.9999999) {
                rotation.x = Math.atan2(- m23, m22);
                rotation.y = Math.atan2(- m31, m11);
            } else {
                rotation.x = 0;
                rotation.y = Math.atan2(m13, m33);
            }
        } else if (order === RotationOrder.XZY) {
            rotation.z = Math.asin(- clamp(m12, - 1, 1));
            if (Math.abs(m12) < 0.9999999) {
                rotation.x = Math.atan2(m32, m22);
                rotation.y = Math.atan2(m13, m11);
            } else {
                rotation.x = Math.atan2(- m23, m33);
                rotation.y = 0;
            }
        } else {
            console.error(`初始化矩阵时错误旋转顺序 ${order}`);
        }
    }

    /**
     * 矩阵 中获取 旋转
     * @param src 矩阵
     * @param result 旋转
     */
    export function matrixGetRotation(src: matrix, result: quaternion): void {
        let xs = sign(src.rawData[0] * src.rawData[1] * src.rawData[2] * src.rawData[3]) < 0 ? -1 : 1;
        let ys = sign(src.rawData[4] * src.rawData[5] * src.rawData[6] * src.rawData[7]) < 0 ? -1 : 1;
        let zs = sign(src.rawData[8] * src.rawData[9] * src.rawData[10] * src.rawData[11]) < 0 ? -1 : 1;

        let scale_x = xs * Math.sqrt(src.rawData[0] * src.rawData[0] + src.rawData[1] * src.rawData[1] + src.rawData[2] * src.rawData[2]);
        let scale_y = ys * Math.sqrt(src.rawData[4] * src.rawData[4] + src.rawData[5] * src.rawData[5] + src.rawData[6] * src.rawData[6]);
        let scale_z = zs * Math.sqrt(src.rawData[8] * src.rawData[8] + src.rawData[9] * src.rawData[9] + src.rawData[10] * src.rawData[10]);

        let mat = pool.new_matrix();
        mat.rawData[0] = src.rawData[0] / scale_x;
        mat.rawData[1] = src.rawData[1] / scale_x;
        mat.rawData[2] = src.rawData[2] / scale_x;
        mat.rawData[3] = 0;

        mat.rawData[4] = src.rawData[4] / scale_y;
        mat.rawData[5] = src.rawData[5] / scale_y;
        mat.rawData[6] = src.rawData[6] / scale_y;
        mat.rawData[7] = 0;

        mat.rawData[8] = src.rawData[8] / scale_z;
        mat.rawData[9] = src.rawData[9] / scale_z;
        mat.rawData[10] = src.rawData[10] / scale_z;
        mat.rawData[11] = 0;

        matrix2Quaternion(mat, result);
        pool.delete_matrix(mat);
    }

    /**
     * 矩阵 中获取 旋转
     * @param matrix 矩阵
     * @param result 旋转
     */
    export function matrix2Quaternion(matrix: matrix, result: quaternion): void {
        var data = matrix.rawData;
        var m11 = data[0], m12 = data[4], m13 = data[8];
        var m21 = data[1], m22 = data[5], m23 = data[9];
        var m31 = data[2], m32 = data[6], m33 = data[10];
        var trace = m11 + m22 + m33;
        var s;

        if (trace > 0) {

            s = 0.5 / Math.sqrt(trace + 1.0);

            result.w = 0.25 / s;
            result.x = (m32 - m23) * s;
            result.y = (m13 - m31) * s;
            result.z = (m21 - m12) * s;
        } else if (m11 > m22 && m11 > m33) {

            s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

            result.w = (m32 - m23) / s;
            result.x = 0.25 * s;
            result.y = (m12 + m21) / s;
            result.z = (m13 + m31) / s;
        } else if (m22 > m33) {

            s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

            result.w = (m13 - m31) / s;
            result.x = (m12 + m21) / s;
            result.y = 0.25 * s;
            result.z = (m23 + m32) / s;
        } else {

            s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

            result.w = (m21 - m12) / s;
            result.x = (m13 + m31) / s;
            result.y = (m23 + m32) / s;
            result.z = 0.25 * s;
        }
    }

    /**
     * 通过xyz轴 获取 旋转
     * @param xAxis x轴
     * @param yAxis y轴
     * @param zAxis z轴
     * @param out 旋转
     */
    export function unitxyzToRotation(xAxis: vector3, yAxis: vector3, zAxis: vector3, out: quaternion) {
        var m11 = xAxis.x, m12 = yAxis.x, m13 = zAxis.x;
        var m21 = xAxis.y, m22 = yAxis.y, m23 = zAxis.y;
        var m31 = xAxis.z, m32 = yAxis.z, m33 = zAxis.z;
        var trace = m11 + m22 + m33;
        var s;
        if (trace > 0) {

            s = 0.5 / Math.sqrt(trace + 1.0);

            out.w = 0.25 / s;
            out.x = (m32 - m23) * s;
            out.y = (m13 - m31) * s;
            out.z = (m21 - m12) * s;
        } else if (m11 > m22 && m11 > m33) {

            s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

            out.w = (m32 - m23) / s;
            out.x = 0.25 * s;
            out.y = (m12 + m21) / s;
            out.z = (m13 + m31) / s;
        } else if (m22 > m33) {

            s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

            out.w = (m13 - m31) / s;
            out.x = (m12 + m21) / s;
            out.y = 0.25 * s;
            out.z = (m23 + m32) / s;
        } else {

            s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

            out.w = (m21 - m12) / s;
            out.x = (m13 + m31) / s;
            out.y = (m23 + m32) / s;
            out.z = 0.25 * s;
        }
    }

    /**
     * 克隆一个矩阵
     * @param src 源矩阵
     * @param out 克隆输出矩阵
     */
    export function matrixClone(src: matrix, out: matrix) {
        for (var i = 0; i < 16; i++) {
            out.rawData[i] = src.rawData[i];
        }
        // out.rawData.set(src.rawData);
    }
    /**
     * 克隆一个矩阵3x2
     * @param src 源矩阵3x2
     * @param out 克隆输出矩阵
     */
    export function matrix3x2Clone(src: matrix3x2, out: matrix3x2) {
        for (var i = 0; i < 6; i++) {
            out.rawData[i] = src.rawData[i];
        }
        // out.rawData.set(src.rawData);
    }
    /**
     * 矩阵单位化
     * @param out 被单位化的矩阵
     */
    export function matrixMakeIdentity(out: matrix) {
        out.rawData[0] = 1;
        out.rawData[1] = 0;
        out.rawData[2] = 0;
        out.rawData[3] = 0;

        out.rawData[4] = 0;
        out.rawData[5] = 1;
        out.rawData[6] = 0;
        out.rawData[7] = 0;

        out.rawData[8] = 0;
        out.rawData[9] = 0;
        out.rawData[10] = 1;
        out.rawData[11] = 0;

        out.rawData[12] = 0;
        out.rawData[13] = 0;
        out.rawData[14] = 0;
        out.rawData[15] = 1;
    }
    /**
     * 矩阵3x2单位化
     * @param out 被单位化的矩阵3x2
     */
    export function matrix3x2MakeIdentity(out: matrix3x2) {
        out.rawData[0] = 1;
        out.rawData[1] = 0;

        out.rawData[2] = 0;
        out.rawData[3] = 1;

        out.rawData[4] = 0;
        out.rawData[5] = 0;
    }
    /**
     * 转为逆矩阵
     * @param src 源矩阵
     * @param out 输出的逆矩阵
     */
    export function matrixInverse(src: matrix, out: matrix) {

        var l1 = src.rawData[0];
        var l2 = src.rawData[1];
        var l3 = src.rawData[2];
        var l4 = src.rawData[3];
        var l5 = src.rawData[4];
        var l6 = src.rawData[5];
        var l7 = src.rawData[6];
        var l8 = src.rawData[7];
        var l9 = src.rawData[8];
        var l10 = src.rawData[9];
        var l11 = src.rawData[10];
        var l12 = src.rawData[11];
        var l13 = src.rawData[12];
        var l14 = src.rawData[13];
        var l15 = src.rawData[14];
        var l16 = src.rawData[15];
        var l17 = (l11 * l16) - (l12 * l15);
        var l18 = (l10 * l16) - (l12 * l14);
        var l19 = (l10 * l15) - (l11 * l14);
        var l20 = (l9 * l16) - (l12 * l13);
        var l21 = (l9 * l15) - (l11 * l13);
        var l22 = (l9 * l14) - (l10 * l13);
        var l23 = ((l6 * l17) - (l7 * l18)) + (l8 * l19);
        var l24 = -(((l5 * l17) - (l7 * l20)) + (l8 * l21));
        var l25 = ((l5 * l18) - (l6 * l20)) + (l8 * l22);
        var l26 = -(((l5 * l19) - (l6 * l21)) + (l7 * l22));
        var l27 = 1.0 / ((((l1 * l23) + (l2 * l24)) + (l3 * l25)) + (l4 * l26));
        var l28 = (l7 * l16) - (l8 * l15);
        var l29 = (l6 * l16) - (l8 * l14);
        var l30 = (l6 * l15) - (l7 * l14);
        var l31 = (l5 * l16) - (l8 * l13);
        var l32 = (l5 * l15) - (l7 * l13);
        var l33 = (l5 * l14) - (l6 * l13);
        var l34 = (l7 * l12) - (l8 * l11);
        var l35 = (l6 * l12) - (l8 * l10);
        var l36 = (l6 * l11) - (l7 * l10);
        var l37 = (l5 * l12) - (l8 * l9);
        var l38 = (l5 * l11) - (l7 * l9);
        var l39 = (l5 * l10) - (l6 * l9);

        out.rawData[0] = l23 * l27;
        out.rawData[4] = l24 * l27;
        out.rawData[8] = l25 * l27;
        out.rawData[12] = l26 * l27;
        out.rawData[1] = -(((l2 * l17) - (l3 * l18)) + (l4 * l19)) * l27;
        out.rawData[5] = (((l1 * l17) - (l3 * l20)) + (l4 * l21)) * l27;
        out.rawData[9] = -(((l1 * l18) - (l2 * l20)) + (l4 * l22)) * l27;
        out.rawData[13] = (((l1 * l19) - (l2 * l21)) + (l3 * l22)) * l27;
        out.rawData[2] = (((l2 * l28) - (l3 * l29)) + (l4 * l30)) * l27;
        out.rawData[6] = -(((l1 * l28) - (l3 * l31)) + (l4 * l32)) * l27;
        out.rawData[10] = (((l1 * l29) - (l2 * l31)) + (l4 * l33)) * l27;
        out.rawData[14] = -(((l1 * l30) - (l2 * l32)) + (l3 * l33)) * l27;
        out.rawData[3] = -(((l2 * l34) - (l3 * l35)) + (l4 * l36)) * l27;
        out.rawData[7] = (((l1 * l34) - (l3 * l37)) + (l4 * l38)) * l27;
        out.rawData[11] = -(((l1 * l35) - (l2 * l37)) + (l4 * l39)) * l27;
        out.rawData[15] = (((l1 * l36) - (l2 * l38)) + (l3 * l39)) * l27;



    }

    /**
     * 转为逆矩阵3x2
     * @param src 源矩阵3x2
     * @param out 输出的逆矩阵3x2
     */
    export function matrix3x2Inverse(src: matrix3x2, out: matrix3x2) {
        var l1 = src.rawData[0];
        var l2 = src.rawData[1];
        var l5 = src.rawData[2];
        var l6 = src.rawData[3];
        var l13 = src.rawData[4];
        var l14 = src.rawData[5];

        var l26 = -(((l5 * -l14) - (l6 * -l13)));
        var l27 = 1.0 / ((((l1 * l6) + (l2 * -l5))));


        out.rawData[0] = l6 * l27;
        out.rawData[2] = -l5 * l27;
        out.rawData[4] = l26 * l27;
        out.rawData[1] = -(((l2))) * l27;
        out.rawData[3] = (((l1))) * l27;
        out.rawData[5] = (((l1 * -l14) - (l2 * -l13))) * l27;

        // var m0=src.rawData[0];
        // var m1=src.rawData[1];
        // var m2=0;
        // var m3=src.rawData[2];
        // var m4=src.rawData[3];
        // var m5=0;
        // var m6=src.rawData[4];
        // var m7=src.rawData[5];
        // var m8=1;
        // var Determinant=m0 * (m4 * m8 - m5 * m7)- m1 * (m3 * m8 - m5 * m6)+m2 * (m3 * m7 - m4 * m6);
        // out[0]=(m4 * m8 - m5 * m7)/Determinant;
        // out[1]=-(m1 * m8 -m2 * m7)/Determinant;
        // out[2]=-(m3 * m8 - m5 * m6)/Determinant;
        // out[3]=(m0 * m8 -m2 * m6)/Determinant;
        // out[4]=(m3 * m7 - m4 * m6)/Determinant;
        // out[5]=-(m0 * m7 - m1 * m6)/Determinant;

    }

    /**
     * 通过 缩放、旋转、位移 来构建矩阵
     * @param pos 位移
     * @param scale 缩放
     * @param rot 旋转
     * @param out 构建输出的矩阵
     */
    export function matrixMakeTransformRTS(pos: vector3, scale: vector3, rot: quaternion, out: matrix) {
        var matS = m4m.math.pool.new_matrix();
        matrixMakeScale(scale.x, scale.y, scale.z, matS);
        var matR = m4m.math.pool.new_matrix();
        quatToMatrix(rot, matR);
        matrixMultiply(matR, matS, out);

        out.rawData[12] = pos.x;
        out.rawData[13] = pos.y;
        out.rawData[14] = pos.z;
        out.rawData[15] = 1;

        m4m.math.pool.delete_matrix(matS);
        m4m.math.pool.delete_matrix(matR);
    }

    /**
     * 通过 缩放、旋转、位移 来构建矩阵3x2
     * @param pos 位移
     * @param scale 缩放
     * @param rot 旋转
     * @param out 构建输出的矩阵3x2
     */
    export function matrix3x2MakeTransformRTS(pos: vector2, scale: vector2, rot: number, out: matrix3x2) {
        var matS = m4m.math.pool.new_matrix3x2();
        matrix3x2MakeScale(scale.x, scale.y, matS);
        var matR = m4m.math.pool.new_matrix3x2();
        matrix3x2MakeRotate(rot, matR);
        matrix3x2Multiply(matR, matS, out);

        out.rawData[4] = pos.x;
        out.rawData[5] = pos.y;

        m4m.math.pool.delete_matrix3x2(matS);
        m4m.math.pool.delete_matrix3x2(matR);
    }
    /**
     * 通过 位移 来构建矩阵
     * @param x 位移x
     * @param y 位移y
     * @param z 位移z
     * @param out 构建输出的矩阵
     */
    export function matrixMakeTranslate(x: number, y: number, z: number, out: matrix): void {
        out.rawData[0] = 1.0; out.rawData[1] = 0.0; out.rawData[2] = 0.0; out.rawData[3] = 0;
        out.rawData[4] = 0.0; out.rawData[5] = 1.0; out.rawData[6] = 0.0; out.rawData[7] = 0.0;
        out.rawData[8] = 0.0; out.rawData[9] = 0.0; out.rawData[10] = 1.0; out.rawData[11] = 0.0;
        out.rawData[12] = x; out.rawData[13] = y; out.rawData[14] = z; out.rawData[15] = 1.0;
    }
    /**
     * 通过 位移 来构建矩阵3x2
     * @param x 位移x
     * @param y 位移y
     * @param out 构建输出的矩阵3x2
     */
    export function matrix3x2MakeTranslate(x: number, y: number, out: matrix3x2): void {
        out.rawData[0] = 1.0; out.rawData[1] = 0.0;
        out.rawData[2] = 0.0; out.rawData[3] = 1.0;
        out.rawData[4] = x; out.rawData[5] = y;
    }
    /**
     * 从矩阵中获取缩放
     * @param src 矩阵
     * @param scale 缩放
     */
    export function matrixGetScale(src: matrix, scale: vector3): void {
        let xs = sign(src.rawData[0] * src.rawData[1] * src.rawData[2] * src.rawData[3]) < 0 ? -1 : 1;
        let ys = sign(src.rawData[4] * src.rawData[5] * src.rawData[6] * src.rawData[7]) < 0 ? -1 : 1;
        let zs = sign(src.rawData[8] * src.rawData[9] * src.rawData[10] * src.rawData[11]) < 0 ? -1 : 1;

        scale.x = xs * Math.sqrt(src.rawData[0] * src.rawData[0] + src.rawData[1] * src.rawData[1] + src.rawData[2] * src.rawData[2]);
        scale.y = ys * Math.sqrt(src.rawData[4] * src.rawData[4] + src.rawData[5] * src.rawData[5] + src.rawData[6] * src.rawData[6]);
        scale.z = zs * Math.sqrt(src.rawData[8] * src.rawData[8] + src.rawData[9] * src.rawData[9] + src.rawData[10] * src.rawData[10]);

        // scale.rawData[0] = xs * Math.sqrt(src.rawData[0] * src.rawData[0] + src.rawData[1] * src.rawData[1] + src.rawData[2] * src.rawData[2]);
        // scale.rawData[1] = ys * Math.sqrt(src.rawData[4] * src.rawData[4] + src.rawData[5] * src.rawData[5] + src.rawData[6] * src.rawData[6]);
        // scale.rawData[2] = zs * Math.sqrt(src.rawData[8] * src.rawData[8] + src.rawData[9] * src.rawData[9] + src.rawData[10] * src.rawData[10]);

    }
    /**
     * 通过 缩放 来构建矩阵
     * @param xScale 缩放x
     * @param yScale 缩放y
     * @param zScale 缩放z
     * @param out 构建输出的矩阵
     */
    export function matrixMakeScale(xScale: number, yScale: number, zScale: number, out: matrix): void {

        out.rawData[0] = xScale; out.rawData[1] = 0.0; out.rawData[2] = 0.0; out.rawData[3] = 0.0;
        out.rawData[4] = 0.0; out.rawData[5] = yScale; out.rawData[6] = 0.0; out.rawData[7] = 0.0;
        out.rawData[8] = 0.0; out.rawData[9] = 0.0; out.rawData[10] = zScale; out.rawData[11] = 0.0;
        out.rawData[12] = 0.0; out.rawData[13] = 0.0; out.rawData[14] = 0.0; out.rawData[15] = 1.0;
    }
    /**
     * 矩阵3x2 变换 输入向量
     * @param mat 矩阵3x2
     * @param inp 输入向量
     * @param out 输出向量
     */
    export function matrix3x2TransformVector2(mat: matrix, inp: vector2, out: vector2): void {
        let x = inp.x * mat.rawData[0] + inp.y * mat.rawData[2] + mat.rawData[4];
        let y = inp.x * mat.rawData[1] + inp.y * mat.rawData[3] + mat.rawData[5];
        out.x = x; out.y = y;
    }

    /**
     * 矩阵3x2 变换 输入法向量
     * @param mat 矩阵3x2
     * @param inp 输入法向量
     * @param out 输出法向量
     */
    export function matrix3x2TransformNormal(mat: matrix, inp: vector2, out: vector2): void {
        let x = inp.x * mat.rawData[0] + inp.y * mat.rawData[2];
        let y = inp.x * mat.rawData[1] + inp.y * mat.rawData[3];
        out.x = x; out.y = y;
    }

    /**
     * 通过 缩放 来构建矩阵3x2
     * @param xScale 缩放x
     * @param yScale 缩放y
     * @param out 构建输出的矩阵3x2
     */
    export function matrix3x2MakeScale(xScale: number, yScale: number, out: matrix3x2): void {
        out.rawData[0] = xScale; out.rawData[1] = 0.0;
        out.rawData[2] = 0.0; out.rawData[3] = yScale;
        out.rawData[4] = 0.0; out.rawData[5] = 0.0;
    }

    /**
     * 从欧拉旋转初始化矩阵
     * @param rotation 旋转弧度值
     * @param order 旋转顺序
     * @param out 输出矩阵
     */
    export function matrixMakeEuler(rotation: vector3, order: RotationOrder, out: matrix) {
        var te = out.rawData;
        //
        var rx = rotation.x;
        var ry = rotation.y;
        var rz = rotation.z;
        //
        var cosX = Math.cos(rx), sinX = Math.sin(rx);
        var cosY = Math.cos(ry), sinY = Math.sin(ry);
        var cosZ = Math.cos(rz), sinZ = Math.sin(rz);

        if (order === RotationOrder.XYZ) {
            var ae = cosX * cosZ, af = cosX * sinZ, be = sinX * cosZ, bf = sinX * sinZ;

            te[0] = cosY * cosZ;
            te[4] = - cosY * sinZ;
            te[8] = sinY;

            te[1] = af + be * sinY;
            te[5] = ae - bf * sinY;
            te[9] = - sinX * cosY;

            te[2] = bf - ae * sinY;
            te[6] = be + af * sinY;
            te[10] = cosX * cosY;

        } else if (order === RotationOrder.YXZ) {
            var ce = cosY * cosZ, cf = cosY * sinZ, de = sinY * cosZ, df = sinY * sinZ;

            te[0] = ce + df * sinX;
            te[4] = de * sinX - cf;
            te[8] = cosX * sinY;

            te[1] = cosX * sinZ;
            te[5] = cosX * cosZ;
            te[9] = - sinX;

            te[2] = cf * sinX - de;
            te[6] = df + ce * sinX;
            te[10] = cosX * cosY;

        } else if (order === RotationOrder.ZXY) {
            var ce = cosY * cosZ, cf = cosY * sinZ, de = sinY * cosZ, df = sinY * sinZ;

            te[0] = ce - df * sinX;
            te[4] = - cosX * sinZ;
            te[8] = de + cf * sinX;

            te[1] = cf + de * sinX;
            te[5] = cosX * cosZ;
            te[9] = df - ce * sinX;

            te[2] = - cosX * sinY;
            te[6] = sinX;
            te[10] = cosX * cosY;

        } else if (order === RotationOrder.ZYX) {
            var ae = cosX * cosZ, af = cosX * sinZ, be = sinX * cosZ, bf = sinX * sinZ;

            te[0] = cosY * cosZ;
            te[4] = be * sinY - af;
            te[8] = ae * sinY + bf;

            te[1] = cosY * sinZ;
            te[5] = bf * sinY + ae;
            te[9] = af * sinY - be;

            te[2] = - sinY;
            te[6] = sinX * cosY;
            te[10] = cosX * cosY;

        } else if (order === RotationOrder.YZX) {
            var ac = cosX * cosY, ad = cosX * sinY, bc = sinX * cosY, bd = sinX * sinY;

            te[0] = cosY * cosZ;
            te[4] = bd - ac * sinZ;
            te[8] = bc * sinZ + ad;

            te[1] = sinZ;
            te[5] = cosX * cosZ;
            te[9] = - sinX * cosZ;

            te[2] = - sinY * cosZ;
            te[6] = ad * sinZ + bc;
            te[10] = ac - bd * sinZ;

        } else if (order === RotationOrder.XZY) {
            var ac = cosX * cosY, ad = cosX * sinY, bc = sinX * cosY, bd = sinX * sinY;

            te[0] = cosY * cosZ;
            te[4] = - sinZ;
            te[8] = sinY * cosZ;

            te[1] = ac * sinZ + bd;
            te[5] = cosX * cosZ;
            te[9] = ad * sinZ - bc;

            te[2] = bc * sinZ - ad;
            te[6] = sinX * cosZ;
            te[10] = bd * sinZ + ac;

        } else {
            console.error(`初始化矩阵时错误旋转顺序 ${order}`);
        }
    }

    /**
     * 通过 一个轴 和围绕的旋转度 来构建矩阵
     * @param axis 旋转围绕轴
     * @param angle 旋转度
     * @param out 输出矩阵
     */
    export function matrixMakeRotateAxisAngle(axis: vector3, angle: number, out: matrix) {
        var x = axis.x,
            y = axis.y,
            z = axis.z;

        var length = Math.sqrt(x * x + y * y + z * z);

        if (!length)
            return;

        if (length !== 1) {
            length = 1 / length;
            x *= length;
            y *= length;
            z *= length;
        }

        var s = Math.sin(angle);
        var c = Math.cos(angle);

        var t = 1.0 - c;


        var b00 = x * x * t + c, b01 = y * x * t + z * s, b02 = z * x * t - y * s,
            b10 = x * y * t - z * s, b11 = y * y * t + c, b12 = z * y * t + x * s,
            b20 = x * z * t + y * s, b21 = y * z * t - x * s, b22 = z * z * t + c;
        out.rawData[0] = b00;
        out.rawData[1] = b01;
        out.rawData[2] = b02;
        out.rawData[3] = 0;

        out.rawData[4] = b10;
        out.rawData[5] = b11;
        out.rawData[6] = b12;
        out.rawData[7] = 0;

        out.rawData[8] = b20;
        out.rawData[9] = b21;
        out.rawData[10] = b22;
        out.rawData[11] = 0;

        out.rawData[12] = 0;
        out.rawData[13] = 0;
        out.rawData[14] = 0;
        out.rawData[15] = 1;

    }

    /**
     * 通过 旋转度 来构建矩阵3x2
     * @param angle 旋转度
     * @param out 构建输出的矩阵3x2
     */
    export function matrix3x2MakeRotate(angle: number, out: matrix3x2) {
        var x = 0,
            y = 0,
            z = 1;

        var s = Math.sin(angle);
        var c = Math.cos(angle);


        out.rawData[0] = c;
        out.rawData[1] = s;

        out.rawData[2] = -s;
        out.rawData[3] = c;

        out.rawData[4] = 0;
        out.rawData[5] = 0;
    }

    /**
     * 计算 两个矩阵 相乘
     * @param lhs 左矩阵
     * @param rhs 右矩阵
     * @param out 输出结果的矩阵
     */
    export function matrixMultiply(lhs: matrix, rhs: matrix, out: matrix): void {
        var a00 = lhs.rawData[0], a01 = lhs.rawData[1], a02 = lhs.rawData[2], a03 = lhs.rawData[3];
        var a10 = lhs.rawData[4], a11 = lhs.rawData[5], a12 = lhs.rawData[6], a13 = lhs.rawData[7];
        var a20 = lhs.rawData[8], a21 = lhs.rawData[9], a22 = lhs.rawData[10], a23 = lhs.rawData[11];
        var a30 = lhs.rawData[12], a31 = lhs.rawData[13], a32 = lhs.rawData[14], a33 = lhs.rawData[15];

        var b0 = rhs.rawData[0],
            b1 = rhs.rawData[1],
            b2 = rhs.rawData[2],
            b3 = rhs.rawData[3];

        out.rawData[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out.rawData[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out.rawData[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out.rawData[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = rhs.rawData[4];
        b1 = rhs.rawData[5];
        b2 = rhs.rawData[6];
        b3 = rhs.rawData[7];

        out.rawData[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out.rawData[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out.rawData[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out.rawData[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = rhs.rawData[8];
        b1 = rhs.rawData[9];
        b2 = rhs.rawData[10];
        b3 = rhs.rawData[11];

        out.rawData[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out.rawData[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out.rawData[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out.rawData[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = rhs.rawData[12];
        b1 = rhs.rawData[13];
        b2 = rhs.rawData[14];
        b3 = rhs.rawData[15];

        out.rawData[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out.rawData[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out.rawData[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out.rawData[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;


        //var m111: number = rhs.rawData[0], m121: number = rhs.rawData[4], m131: number = rhs.rawData[8], m141: number = rhs.rawData[12];
        //var m112: number = rhs.rawData[1], m122: number = rhs.rawData[5], m132: number = rhs.rawData[9], m142: number = rhs.rawData[13];
        //var m113: number = rhs.rawData[2], m123: number = rhs.rawData[6], m133: number = rhs.rawData[10], m143: number = rhs.rawData[14];
        //var m114: number = rhs.rawData[3], m124: number = rhs.rawData[7], m134: number = rhs.rawData[11], m144: number = rhs.rawData[15];
        //var m211: number = lhs.rawData[0], m221: number = lhs.rawData[4], m231: number = lhs.rawData[8], m241: number = lhs.rawData[12];
        //var m212: number = lhs.rawData[1], m222: number = lhs.rawData[5], m232: number = lhs.rawData[9], m242: number = lhs.rawData[13];
        //var m213: number = lhs.rawData[2], m223: number = lhs.rawData[6], m233: number = lhs.rawData[10], m243: number = lhs.rawData[14];
        //var m214: number = lhs.rawData[3], m224: number = lhs.rawData[7], m234: number = lhs.rawData[11], m244: number = lhs.rawData[15];

        //out.rawData[0] = m111 * m211 + m112 * m221 + m113 * m231 + m114 * m241;
        //out.rawData[1] = m111 * m212 + m112 * m222 + m113 * m232 + m114 * m242;
        //out.rawData[2] = m111 * m213 + m112 * m223 + m113 * m233 + m114 * m243;
        //out.rawData[3] = m111 * m214 + m112 * m224 + m113 * m234 + m114 * m244;

        //out.rawData[4] = m121 * m211 + m122 * m221 + m123 * m231 + m124 * m241;
        //out.rawData[5] = m121 * m212 + m122 * m222 + m123 * m232 + m124 * m242;
        //out.rawData[6] = m121 * m213 + m122 * m223 + m123 * m233 + m124 * m243;
        //out.rawData[7] = m121 * m214 + m122 * m224 + m123 * m234 + m124 * m244;

        //out.rawData[8] = m131 * m211 + m132 * m221 + m133 * m231 + m134 * m241;
        //out.rawData[9] = m131 * m212 + m132 * m222 + m133 * m232 + m134 * m242;
        //out.rawData[10] = m131 * m213 + m132 * m223 + m133 * m233 + m134 * m243;
        //out.rawData[11] = m131 * m214 + m132 * m224 + m133 * m234 + m134 * m244;

        //out.rawData[12] = m141 * m211 + m142 * m221 + m143 * m231 + m144 * m241;
        //out.rawData[13] = m141 * m212 + m142 * m222 + m143 * m232 + m144 * m242;
        //out.rawData[14] = m141 * m213 + m142 * m223 + m143 * m233 + m144 * m243;
        //out.rawData[15] = m141 * m214 + m142 * m224 + m143 * m234 + m144 * m244;
    }

    /**
     * 计算 两个矩阵3x2 相乘
     * @param lhs 左矩阵3x2
     * @param rhs 右矩阵3x2
     * @param out 输出结果的矩阵3x2
     */
    export function matrix3x2Multiply(lhs: matrix3x2, rhs: matrix3x2, out: matrix3x2): void {
        var a00 = lhs.rawData[0], a01 = lhs.rawData[1], a02 = 0;
        var a10 = lhs.rawData[2], a11 = lhs.rawData[3], a12 = 0;
        var a30 = lhs.rawData[4], a31 = lhs.rawData[5], a32 = 1;

        var b0 = rhs.rawData[0],
            b1 = rhs.rawData[1],
            b3 = 0;


        let temp_0 = b0 * a00 + b1 * a10 + b3 * a30;
        let temp_1 = b0 * a01 + b1 * a11 + b3 * a31;

        b0 = rhs.rawData[2];
        b1 = rhs.rawData[3];

        b3 = 0;

        let temp_2 = b0 * a00 + b1 * a10 + b3 * a30;
        let temp_3 = b0 * a01 + b1 * a11 + b3 * a31;

        b0 = rhs.rawData[4];
        b1 = rhs.rawData[5];
        b3 = 1;

        let temp_4 = b0 * a00 + b1 * a10 + b3 * a30;
        let temp_5 = b0 * a01 + b1 * a11 + b3 * a31;

        out.rawData[0] = temp_0;
        out.rawData[1] = temp_1;
        out.rawData[2] = temp_2;
        out.rawData[3] = temp_3;
        out.rawData[4] = temp_4;
        out.rawData[5] = temp_5;
    }

    /**
     * 判断两个 矩阵3x2 是否相等
     * @param mtx1 矩阵a
     * @param mtx2 矩阵b
     * @param threshold 误差范围
     * @returns 是相等？
     */
    export function matrix3x2Equal(mtx1: matrix3x2, mtx2: matrix3x2, threshold = 0.00001): boolean {
        for (let i = 0; i < 6; i++) {
            if (Math.abs(mtx1.rawData[i] - mtx2.rawData[i]) > threshold) {
                return false;
            }
        }
        return true;
    }

    /**
     * 通过 左手坐标系的透视相机参数 来构建矩阵
     * @param fov 视场度
     * @param aspect 视窗宽高比
     * @param znear 近平面值
     * @param zfar 远平面值
     * @param out 输出构建的矩阵
     */
    export function matrixProject_PerspectiveLH(fov: number, aspect: number, znear: number, zfar: number, out: matrix) {
        var tan = 1.0 / (Math.tan(fov * 0.5));
        out.rawData[0] = tan / aspect;
        out.rawData[1] = out.rawData[2] = out.rawData[3] = 0.0;

        out.rawData[4] = out.rawData[6] = out.rawData[7] = 0.0;
        out.rawData[5] = tan;

        out.rawData[8] = out.rawData[9] = 0.0;
        out.rawData[10] = -zfar / (znear - zfar);
        //out.rawData[10] = (zfar+znear) / (zfar - znear);//-1~1
        //out.rawData[10] = 1/(zfar-znear);//0~1
        out.rawData[11] = 1.0;

        out.rawData[12] = out.rawData[13] = out.rawData[15] = 0.0;
        out.rawData[14] = (znear * zfar) / (znear - zfar);
        //out.rawData[14] = 2*zfar*znear/(znear-zfar);
        //out.rawData[14] =znear/(znear-zfar);
    }

    /**
     * 通过 左手坐标系的正交相机参数 来构建矩阵
     * @param width 视窗宽
     * @param height 视窗高
     * @param znear 近平面值
     * @param zfar 远平面值
     * @param out 输出构建的矩阵
     */
    export function matrixProject_OrthoLH(width: number, height: number, znear: number, zfar: number, out: matrix) {
        var hw = 2.0 / width;
        var hh = 2.0 / height;
        var id = 2.0 / (zfar - znear);//-2.0 / (zfar - znear); 为毛是反的 ヽ(●-`Д´-)ノ
        var nid = (zfar + znear) / (znear - zfar);


        out.rawData[0] = hw;
        out.rawData[1] = 0;
        out.rawData[2] = 0;
        out.rawData[3] = 0;

        out.rawData[4] = 0;
        out.rawData[5] = hh;
        out.rawData[6] = 0;
        out.rawData[7] = 0;

        out.rawData[8] = 0;
        out.rawData[9] = 0;
        out.rawData[10] = id;
        out.rawData[11] = 0;

        out.rawData[12] = 0;
        out.rawData[13] = 0;
        out.rawData[14] = nid;
        out.rawData[15] = 1;
    }

    /**
     * 看向目标位置
     * @param position  所在位置
     * @param target    目标位置
     * @param upAxis    向上朝向
     */
    export function matrixLookat(position: vector3, target: vector3, upAxis: vector3, out: matrix) {
        //
        var xAxis = new vector3();
        var yAxis = new vector3();
        var zAxis = new vector3();

        upAxis = upAxis || new vector3(0, 1, 0);

        zAxis.x = target.x - position.x;
        zAxis.y = target.y - position.y;
        zAxis.z = target.z - position.z;
        math.vec3Normalize(zAxis, zAxis);

        xAxis.x = upAxis.y * zAxis.z - upAxis.z * zAxis.y;
        xAxis.y = upAxis.z * zAxis.x - upAxis.x * zAxis.z;
        xAxis.z = upAxis.x * zAxis.y - upAxis.y * zAxis.x;
        math.vec3Normalize(xAxis, xAxis);

        if (math.vec3SqrLength(xAxis) < .005) {
            xAxis.x = upAxis.y;
            xAxis.y = upAxis.x;
            xAxis.z = 0;
            math.vec3Normalize(xAxis, xAxis);
        }

        yAxis.x = zAxis.y * xAxis.z - zAxis.z * xAxis.y;
        yAxis.y = zAxis.z * xAxis.x - zAxis.x * xAxis.z;
        yAxis.z = zAxis.x * xAxis.y - zAxis.y * xAxis.x;

        out.rawData[0] = xAxis.x;
        out.rawData[1] = xAxis.y;
        out.rawData[2] = xAxis.z;
        out.rawData[3] = 0;

        out.rawData[4] = yAxis.x;
        out.rawData[5] = yAxis.y;
        out.rawData[6] = yAxis.z;
        out.rawData[7] = 0;

        out.rawData[8] = zAxis.x;
        out.rawData[9] = zAxis.y;
        out.rawData[10] = zAxis.z;
        out.rawData[11] = 0;

        out.rawData[12] = position.x;
        out.rawData[13] = position.y;
        out.rawData[14] = position.z;
        out.rawData[15] = 1;
    }

    //lights fix
    /**
     * 构建 矩阵 看向 一个位置
     * @param forward 前方向
     * @param up 上方向
     * @param out 输出构建的矩阵
     */
    export function matrixLookatLH(forward: vector3, up: vector3, out: matrix) {
        // Z axis
        let z = pool.new_vector3(-forward.x, -forward.y, -forward.z);
        vec3Normalize(z, z);

        let y = pool.new_vector3();
        vec3Clone(up, y);
        vec3Normalize(y, y);


        // X axis
        let x = pool.new_vector3();
        vec3Cross(y, z, x);
        vec3SqrLength(x)
        if (vec3SqrLength(x) == 0) {
            x.x = 1;
        }
        else {
            vec3Normalize(x, x);
        }
        // Y axis
        vec3Clone(pool.vector3_zero, y);

        vec3Cross(z, x, y);
        vec3Normalize(y, y);
        out.rawData[0] = x.x;
        out.rawData[1] = y.x;
        out.rawData[2] = z.x;
        out.rawData[3] = 0;

        out.rawData[4] = x.y;
        out.rawData[5] = y.y;
        out.rawData[6] = z.y;
        out.rawData[7] = 0;

        out.rawData[8] = x.z;
        out.rawData[9] = y.z;
        out.rawData[10] = z.z;
        out.rawData[11] = 0;

        out.rawData[12] = 0;
        out.rawData[13] = 0;
        out.rawData[14] = 0;
        out.rawData[15] = 1;

        pool.delete_vector3(x);
        pool.delete_vector3(y);
        pool.delete_vector3(z);
    }

    /**
     * 构建 矩阵 视窗看向 一个位置
     * @param eye 视窗位置
     * @param forward 前方向
     * @param up 上方向
     * @param out 输出构建的矩阵
     */
    export function matrixViewLookatLH(eye: vector3, forward: vector3, up: vector3, out: matrix) {
        // Z axis
        let z = pool.new_vector3(forward.x, forward.y, forward.z);
        vec3Normalize(z, z);

        let y = pool.new_vector3();
        vec3Clone(up, y);
        vec3Normalize(y, y);
        // X axis
        let x = pool.new_vector3();
        vec3Cross(y, z, x);
        vec3SqrLength(x)
        if (vec3SqrLength(x) == 0) {
            x.x = 1;
        }
        else {
            vec3Normalize(x, x);
        }
        // Y axis
        vec3Clone(pool.vector3_zero, y);

        vec3Cross(z, x, y);
        vec3Normalize(y, y);
        // Eye angles
        var ex = -math.vec3Dot(x, eye);
        var ey = -math.vec3Dot(y, eye);
        var ez = -math.vec3Dot(z, eye);
        out.rawData[0] = x.x;
        out.rawData[1] = y.x;
        out.rawData[2] = z.x;
        out.rawData[3] = 0;

        out.rawData[4] = x.y;
        out.rawData[5] = y.y;
        out.rawData[6] = z.y;
        out.rawData[7] = 0;

        out.rawData[8] = x.z;
        out.rawData[9] = y.z;
        out.rawData[10] = z.z;
        out.rawData[11] = 0;

        out.rawData[12] = ex;
        out.rawData[13] = ey;
        out.rawData[14] = ez;
        out.rawData[15] = 1;

        pool.delete_vector3(x);
        pool.delete_vector3(y);
        pool.delete_vector3(z);
    }

    /**
     * 差值两个矩阵
     * @param left 左矩阵
     * @param right 右矩阵
     * @param v 差值
     * @param out 输出差值过的矩阵
     */
    export function matrixLerp(left: matrix, right: matrix, v: number, out: matrix) {
        for (var i = 0; i < 16; i++) {
            out.rawData[i] = left.rawData[i] * (1 - v) + right.rawData[i] * v;
        }
    }

    /**
     * 矩阵 变换 向量
     * @param vector 向量
     * @param transformation 矩阵
     * @param result 输出变换过的向量
     */
    export function matrixTransformVector3(vector: vector3, transformation: matrix, result: vector3): void {
        let x = (vector.x * transformation.rawData[0]) + (vector.y * transformation.rawData[4]) + (vector.z * transformation.rawData[8]) + transformation.rawData[12];
        let y = (vector.x * transformation.rawData[1]) + (vector.y * transformation.rawData[5]) + (vector.z * transformation.rawData[9]) + transformation.rawData[13];
        let z = (vector.x * transformation.rawData[2]) + (vector.y * transformation.rawData[6]) + (vector.z * transformation.rawData[10]) + transformation.rawData[14];
        let w = (vector.x * transformation.rawData[3]) + (vector.y * transformation.rawData[7]) + (vector.z * transformation.rawData[11]) + transformation.rawData[15];

        result.x = x / w;
        result.y = y / w;
        result.z = z / w;

        // result.rawData[0] = x / w;
        // result.rawData[1] = y / w;
        // result.rawData[2] = z / w;
    }

    /**
     * 矩阵 变换 向量
     * @param src 向量
     * @param mtx 矩阵
     * @param out 输出变换过的向量
     */
    export function matrixTransformVector4(src: m4m.math.vector4, mtx: m4m.math.matrix, out: m4m.math.vector4) {
        out.x = (src.x * mtx.rawData[0]) + (src.y * mtx.rawData[4]) + (src.z * mtx.rawData[8]) + (src.w * mtx.rawData[12]);
        out.y = (src.x * mtx.rawData[1]) + (src.y * mtx.rawData[5]) + (src.z * mtx.rawData[9]) + (src.w * mtx.rawData[13]);
        out.z = (src.x * mtx.rawData[2]) + (src.y * mtx.rawData[6]) + (src.z * mtx.rawData[10]) + (src.w * mtx.rawData[14]);
        out.w = (src.x * mtx.rawData[3]) + (src.y * mtx.rawData[7]) + (src.z * mtx.rawData[11]) + (src.w * mtx.rawData[15]);


        // let x = (src.rawData[0] * mtx.rawData[0]) + (src.rawData[1] * mtx.rawData[4]) + (src.rawData[2] * mtx.rawData[8]) +  (src.rawData[3] * mtx.rawData[12]);
        // let y = (src.rawData[0] * mtx.rawData[1]) + (src.rawData[1] * mtx.rawData[5]) + (src.rawData[2] * mtx.rawData[9]) +  (src.rawData[3] * mtx.rawData[13]);
        // let z = (src.rawData[0] * mtx.rawData[2]) + (src.rawData[1] * mtx.rawData[6]) + (src.rawData[2] * mtx.rawData[10]) + (src.rawData[3] * mtx.rawData[14]);
        // let w = (src.rawData[0] * mtx.rawData[3]) + (src.rawData[1] * mtx.rawData[7]) + (src.rawData[2] * mtx.rawData[11]) + (src.rawData[3] * mtx.rawData[15]);
        // out.rawData[0] = x; out.rawData[1] = y; out.rawData[2] = z; out.rawData[3] = w;
    }

    //变换向量
    /**
     * 矩阵 变换 法向量
     * @param vector 法向量
     * @param transformation 矩阵
     * @param result 输出变换过的向量
     */
    export function matrixTransformNormal(vector: vector3, transformation: matrix, result: vector3): void {
        let x = (vector.x * transformation.rawData[0]) + (vector.y * transformation.rawData[4]) + (vector.z * transformation.rawData[8]);
        let y = (vector.x * transformation.rawData[1]) + (vector.y * transformation.rawData[5]) + (vector.z * transformation.rawData[9]);
        let z = (vector.x * transformation.rawData[2]) + (vector.y * transformation.rawData[6]) + (vector.z * transformation.rawData[10]);

        result.x = x;
        result.y = y;
        result.z = z;

        // result.rawData[0] = x;
        // result.rawData[1] = y;
        // result.rawData[2] = z;
    }

    /**
     * 读取矩阵的值到v3向量 通过 索引偏移
     * @param src 矩阵
     * @param offset 索引
     * @param result v3向量
     */
    export function matrixGetVector3ByOffset(src: matrix, offset: number, result: vector3): void {
        result.x = src.rawData[offset];
        result.y = src.rawData[offset + 1];
        result.z = src.rawData[offset + 2];

        // result.rawData[0] = src.rawData[offset];
        // result.rawData[1] = src.rawData[offset + 1];
        // result.rawData[2] = src.rawData[offset + 2]
    }
    /**
     * 单位化矩阵
     * @param mat 矩阵
     */
    export function matrixReset(mat: matrix) {
        mat.rawData[0] = 1;
        mat.rawData[1] = 0;
        mat.rawData[2] = 0;
        mat.rawData[3] = 0;

        mat.rawData[4] = 0;
        mat.rawData[5] = 1;
        mat.rawData[6] = 0;
        mat.rawData[7] = 0;

        mat.rawData[8] = 0;
        mat.rawData[9] = 0;
        mat.rawData[10] = 1;
        mat.rawData[11] = 0;

        mat.rawData[12] = 0;
        mat.rawData[13] = 0;
        mat.rawData[14] = 0;
        mat.rawData[15] = 1;
    }

    /**
     * 归零化矩阵
     * @param mat 矩阵
     */
    export function matrixZero(mat: matrix) {
        mat.rawData[0] = 0;
        mat.rawData[1] = 0;
        mat.rawData[2] = 0;
        mat.rawData[3] = 0;

        mat.rawData[4] = 0;
        mat.rawData[5] = 0;
        mat.rawData[6] = 0;
        mat.rawData[7] = 0;

        mat.rawData[8] = 0;
        mat.rawData[9] = 0;
        mat.rawData[10] = 0;
        mat.rawData[11] = 0;

        mat.rawData[12] = 0;
        mat.rawData[13] = 0;
        mat.rawData[14] = 0;
        mat.rawData[15] = 1;
    }

    /**
     * 缩放矩阵
     * @param value 缩放值
     * @param mat 矩阵
     */
    export function matrixScaleByNum(value: number, mat: matrix) {
        mat.rawData[0] *= value;
        mat.rawData[1] *= value;
        mat.rawData[2] *= value;
        mat.rawData[3] *= value;

        mat.rawData[4] *= value;
        mat.rawData[5] *= value;
        mat.rawData[6] *= value;
        mat.rawData[7] *= value;

        mat.rawData[8] *= value;
        mat.rawData[9] *= value;
        mat.rawData[10] *= value;
        mat.rawData[11] *= value;

        mat.rawData[12] *= value;
        mat.rawData[13] *= value;
        mat.rawData[14] *= value;
        mat.rawData[15] *= value;
    }

    /**
     * 两个矩阵相加
     * @param left 左矩阵
     * @param right 右矩阵
     * @param out 输出相加的矩阵
     */
    export function matrixAdd(left: matrix, right: matrix, out: matrix) {
        out.rawData[0] = left.rawData[0] + right.rawData[0];
        out.rawData[1] = left.rawData[1] + right.rawData[1];
        out.rawData[2] = left.rawData[2] + right.rawData[2];
        out.rawData[3] = left.rawData[3] + right.rawData[3];

        out.rawData[4] = left.rawData[4] + right.rawData[4];
        out.rawData[5] = left.rawData[5] + right.rawData[5];
        out.rawData[6] = left.rawData[6] + right.rawData[6];
        out.rawData[7] = left.rawData[7] + right.rawData[7];

        out.rawData[8] = left.rawData[8] + right.rawData[8];
        out.rawData[9] = left.rawData[9] + right.rawData[9];
        out.rawData[10] = left.rawData[10] + right.rawData[10];
        out.rawData[11] = left.rawData[11] + right.rawData[11];

        out.rawData[12] = left.rawData[12] + right.rawData[12];
        out.rawData[13] = left.rawData[13] + right.rawData[13];
        out.rawData[14] = left.rawData[14] + right.rawData[14];
        out.rawData[15] = left.rawData[15] + right.rawData[15];
    }

    /**
     * 判断矩阵是否相等
     * @param mtx1 左矩阵
     * @param mtx2 右矩阵
     * @param threshold 误差范围
     * @returns 是相等？
     */
    export function matrixEqual(mtx1: matrix, mtx2: matrix, threshold = 0.00001): boolean {
        for (let i = 0; i < 16; i++) {
            if (Math.abs(mtx1.rawData[i] - mtx2.rawData[i]) > threshold) {
                return false;
            }
        }
        return true;
    }

    /**
     * 判断 是否为单位矩阵
     * @param mtx 矩阵
     * @returns 是矩阵？
     */
    export function matrixIsIdentity(mtx: matrix) {
        let m = mtx.rawData;
        let _isIdentity = (
            m[0] === 1.0 && m[1] === 0.0 && m[2] === 0.0 && m[3] === 0.0 &&
            m[4] === 0.0 && m[5] === 1.0 && m[6] === 0.0 && m[7] === 0.0 &&
            m[8] === 0.0 && m[9] === 0.0 && m[10] === 1.0 && m[11] === 0.0 &&
            m[12] === 0.0 && m[13] === 0.0 && m[14] === 0.0 && m[15] === 1.0
        )

        return _isIdentity;
    }
}