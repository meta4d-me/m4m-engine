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
    //重构原则2，一个函数，一种用法，不给默认值
    //重构原则3，内部不new，所有计算函数需要外部提供out 参数，最后一个参数为out 参数
    // export function vec2Subtract(a: vector2, b: vector2, out: vector2)
    // {
    //     out.x = a.x - b.x;
    //     out.y = a.y - b.y;
    // }
    // export function vec2Add(a: vector2, b: vector2, out: vector2) {
    //     out.x = a.x + b.x;
    //     out.y = a.y + b.y;
    // }

    /**
     * 克隆三维向量
     * @param from 源三维向量
     * @param to 输出的三维向量
     */
    export function vec3Clone(from: vector3, to: vector3) {
        to.x = from.x;
        to.y = from.y;
        to.z = from.z;
        //to.rawData.set(from.rawData);
        // to.rawData[0]=from.rawData[0];
        // to.rawData[1]=from.rawData[1];
        // to.rawData[2]=from.rawData[2]; 
    }
    // export function vec3ToString(result: string)
    // {
    //     result = this.x + "," + this.y + "," + this.z;
    // }

    /**
     * 两三维向量相加
     * @param a 向量a
     * @param b 向量b
     * @param out 输出的三维向量
     */
    export function vec3Add(a: vector3, b: vector3, out: vector3) {
        out.x = a.x + b.x;
        out.y = a.y + b.y;
        out.z = a.z + b.z;

        // out.rawData[0] = a.x + b.x;
        // out.rawData[1] = a.y + b.y;
        // out.rawData[2] = a.z + b.z;
    }

    /**
     * 两三维向量相减
     * @param a 向量a
     * @param b 向量b
     * @param out 输出的三维向量
     */
    export function vec3Subtract(a: vector3, b: vector3, out: vector3) {
        out.x = a.x - b.x;
        out.y = a.y - b.y;
        out.z = a.z - b.z;

        // out.rawData[0] = a.x - b.x;
        // out.rawData[1] = a.y - b.y;
        // out.rawData[2] = a.z - b.z;
    }

    /**
     * 三维向量取反 (等于 * -1)
     * @param a 向量
     * @param out 输出的三维向量
     */
    export function vec3Minus(a: vector3, out: vector3) {
        out.x = -a.x;
        out.y = -a.y;
        out.z = -a.z;

        // out.rawData[0] = -a.x;
        // out.rawData[1] = -a.y;
        // out.rawData[2] = -a.z;
    }

    /**
     * 获取三维向量长度标量
     * @param a 向量
     * @returns 长度标量
     */
    export function vec3Length(a: vector3): number {
        return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    }

    /**
     * 获取三维向量长度平方标量
     * @param value 向量
     * @returns 长度平方标量
     */
    export function vec3SqrLength(value: vector3): number {
        return value.x * value.x + value.y * value.y + value.z * value.z;
    }

    /**
     * 三维向量 设为 1
     * @param out 三维向量
     */
    export function vec3Set_One(out: vector3) {
        // out.rawData[0] = out.rawData[1] = out.rawData[2] = 1;
        out.x = out.y = out.z = 1;
    }

    /**
     * 三维向量 设为标准前方向量
     * @param out 标准前方向量
     */
    export function vec3Set_Forward(out: vector3) {
        out.x = out.y = 0;
        out.z = 1;

        // out.rawData[0] = out.rawData[1] = 0;
        // out.rawData[2] = 1;
    }

    /**
     * 三维向量 设为标准后方向量
     * @param out 标准后方向量
     */
    export function vec3Set_Back(out: vector3) {
        out.x = out.y = 0;
        out.z = -1;

        // out.rawData[0] = out.rawData[1] = 0;
        // out.rawData[2] = -1;
    }

    /**
     * 三维向量 设为标准上方向量
     * @param out 标准上方向量
     */
    export function vec3Set_Up(out: vector3) {
        out.x = out.z = 0;
        out.y = 1;

        // out.rawData[0] = out.rawData[2] = 0;
        // out.rawData[1] = 1;
    }

    /**
     * 三维向量 设为标准下方向量
     * @param out 标准下方向量
     */
    export function vec3Set_Down(out: vector3) {
        out.x = out.z = 0;
        out.y = -1;

        // out.rawData[0] = out.rawData[2] = 0;
        // out.rawData[1] = -1;
    }

    /**
     * 三维向量 设为标准左方向量
     * @param out 标准左方向量
     */
    export function vec3Set_Left(out: vector3) {
        out.x = -1;
        out.y = out.z = 0;

        // out.rawData[0] = -1;
        // out.rawData[1] = out.rawData[2] = 0;
    }

    /**
     * 三维向量 设为标准右方向量
     * @param out 标准右方向量
     */
    export function vec3Set_Right(out: vector3) {
        out.x = 1;
        out.y = out.z = 0;

        // out.rawData[0] = 1;
        // out.rawData[1] = out.rawData[2] = 0;
    }

    /**
     * 三维向量 归一化
     * @param value 三维向量
     * @param out 输出的三维向量
     */
    export function vec3Normalize(value: vector3, out: vector3) {
        var num: number = vec3Length(value);
        if (num > Number.MIN_VALUE) {
            out.x = value.x / num;
            out.y = value.y / num;
            out.z = value.z / num;

            // out.rawData[0] = value.x / num;
            // out.rawData[1] = value.y / num;
            // out.rawData[2] = value.z / num;
        } else {
            out.x = 0;
            out.y = 0;
            out.z = 0;

            // out.rawData[0] = 0;
            // out.rawData[1] = 0;
            // out.rawData[2] = 0;
        }
    }

    /**
     * 三维向量 通过 一个三维向量计算缩放
     * @param from 源三维向量
     * @param scale 缩放三维向量
     * @param out 输出的三维向量
     */
    export function vec3ScaleByVec3(from: vector3, scale: vector3, out: vector3) {
        out.x = from.x * scale.x;
        out.y = from.y * scale.y;
        out.z = from.z * scale.z;

        // out.rawData[0] = from.x * scale.x;
        // out.rawData[1] = from.y * scale.y;
        // out.rawData[2] = from.z * scale.z;
    }

    /**
     * 三维向量 通过 一个标量计算缩放
     * @param from 源三维向量
     * @param scale 缩放标量
     * @param out 输出的三维向量
     */
    export function vec3ScaleByNum(from: vector3, scale: number, out: vector3) {
        out.x = from.x * scale;
        out.y = from.y * scale;
        out.z = from.z * scale;

        // out.rawData[0] = from.x * scale;
        // out.rawData[1] = from.y * scale;
        // out.rawData[2] = from.z * scale;
    }

    /**
     * 三维向量 通过 一个另三维向量进行每个维度的积计算
     * @param a 三维向量a
     * @param b 三维向量b
     * @param out 输出的三维向量
     */
    export function vec3Product(a: vector3, b: vector3, out: vector3) {
        out.x = a.x * b.x;
        out.y = a.y * b.y;
        out.z = a.z * b.z;

        // out.rawData[0] = a.x * b.x;
        // out.rawData[1] = a.y * b.y;
        // out.rawData[2] = a.z * b.z;
    }

    /**
     * 两个三维向量 进行 叉乘
     * @param lhs 三维向量左
     * @param rhs 三维向量右
     * @param out 输出的三维向量
     */
    export function vec3Cross(lhs: vector3, rhs: vector3, out: vector3) {
        let x = lhs.y * rhs.z - lhs.z * rhs.y;
        let y = lhs.z * rhs.x - lhs.x * rhs.z;
        let z = lhs.x * rhs.y - lhs.y * rhs.x;
        // out.rawData[0] = x;
        // out.rawData[1] = y;
        // out.rawData[2] = z;
        out.x = x;
        out.y = y;
        out.z = z;
    }

    /**
     * 判断指定两个向量是否平行
     * @param lhs 向量左
     * @param rhs 向量右
     * @param precision 误差范围
     */
    export function vec3IsParallel(lhs: vector3, rhs: vector3, precision = 1e-6) {
        var out1 = pool.new_vector3(lhs.x, lhs.y, lhs.z);
        var out2 = pool.new_vector3(rhs.x, rhs.y, rhs.z);
        math.vec3Normalize(out1, out1);
        math.vec3Normalize(out2, out2);

        var dot = math.vec3Dot(out1, out2);
        dot = Math.abs(dot);

        if (Math.abs(dot - 1) < precision) return true;

        return false;
    }

    /**
     * 通过指定 法线向量 计算一个方向向量 的 反射方向向量
     * @param inDirection 方向向量
     * @param inNormal 法线向量
     * @param out 反射方向向量
     */
    export function vec3Reflect(inDirection: vector3, inNormal: vector3, out: vector3) {
        //return -2 * vector3.Dot(inNormal, inDirection) * inNormal + inDirection;
        var v1: number = 0;
        v1 = vec3Dot(inNormal, inDirection);
        vec3ScaleByNum(out, v1 * -2, out);
        vec3Add(out, inDirection, out);
    }

    /**
     * 两个三维向量 进行 点乘 输出标量结果
     * @param lhs 向量a
     * @param rhs 向量b
     * @returns 标量结果 
     */
    export function vec3Dot(lhs: vector3, rhs: vector3): number {
        return lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z;
    }

    /**
     * @deprecated [已弃用]
     * 三维向量 Project
     * @param vector 
     * @param onNormal 
     * @param out 
     */
    export function vec3Project(vector: vector3, onNormal: vector3, out: vector3) {
        var num: number = 0;
        num = vec3Dot(onNormal, onNormal);
        if (num < Number.MIN_VALUE) {
            // out.rawData[0] = out.rawData[1] = out.rawData[2] = 0;
            out.x = out.y = out.z = 0;
        } else {
            //return onNormal * vector3.Dot(vector, onNormal) / num;
            let num2: number = 0;
            num2 = vec3Dot(vector, onNormal);
            vec3ScaleByNum(onNormal, num2 / num, out);
        }
    }
    /**
     * @deprecated [已弃用]
     * 三维向量 ProjectOnPlane
     * @param vector 
     * @param planeNormal 
     * @param out 
     */
    export function vec3ProjectOnPlane(vector: vector3, planeNormal: vector3, out: vector3) {
        //return vector - vector3.Project(vector, planeNormal);
        vec3Project(vector, planeNormal, out);
        vec3Subtract(vector, out, out);
    }

    /**
     * @deprecated [已弃用]
     * 三维向量 Exclude
     * @param excludeThis 
     * @param fromThat 
     * @param out 
     */
    export function vec3Exclude(excludeThis: vector3, fromThat: vector3, out: vector3) {
        vec3Project(fromThat, excludeThis, out);
        vec3Subtract(fromThat, out, out);
        //return fromThat - vector3.Project(fromThat, excludeThis);
    }

    /**
     * 计算 一个三维向量的方向 转到  另一个三维向量的方向 的旋转度
     * @param from 开始向量
     * @param to 结束向量
     * @returns 旋转度
     */
    export function vec3Angle(from: vector3, to: vector3): number {
        var out1 = pool.new_vector3();
        var out2 = pool.new_vector3();
        vec3Normalize(from, out1);
        vec3Normalize(to, out2);
        var result = vec3Dot(out1, out2);
        result = floatClamp(result, -1, 1);
        result = Math.acos(result) * 57.29578;
        pool.delete_vector3(out1);
        pool.delete_vector3(out1);
        return result;
    }

    /**
     * 两个三维向量 的距离标量
     * @param a 向量a
     * @param b 向量b
     * @returns 距离标量
     */
    export function vec3Distance(a: vector3, b: vector3): number {
        var out = pool.new_vector3();
        vec3Subtract(a, b, out);
        var result = Math.sqrt(out.x * out.x + out.y * out.y + out.z * out.z);
        pool.delete_vector3(out);
        return result;
    }

    /**
     * 计算三维向量 限制最大长度后的三维向量
     * @param vector 源三维向量
     * @param maxLength 最大长度
     * @param out 输出的三维向量
     */
    export function vec3ClampLength(vector: vector3, maxLength: number, out: vector3) {
        let val: number = 0;
        val = vec3SqrLength(vector);
        if (val > maxLength * maxLength) {
            vec3Normalize(vector, out);
            vec3ScaleByNum(out, maxLength, out);
        }
        // out.rawData.set(vector.rawData);
        out.x = vector.x;
        out.y = vector.y;
        out.z = vector.z;

    }
    /**
     * 比较两个三维向量 取最小的
     * @param v0 向量a
     * @param v1 向量b
     * @param out 最小的向量
     */
    export function vec3Min(v0: vector3, v1: vector3, out: vector3) {
        out.x = Math.min(v0.x, v1.x);
        out.y = Math.min(v0.y, v1.y);
        out.z = Math.min(v0.z, v1.z);
    }

    /**
     * 比较两个三维向量 取最大的
     * @param v0 向量a
     * @param v1 向量b
     * @param out 最大的向量
     */
    export function vec3Max(v0: vector3, v1: vector3, out: vector3) {
        out.x = Math.max(v0.x, v1.x);
        out.y = Math.max(v0.y, v1.y);
        out.z = Math.max(v0.z, v1.z);
    }

    /**
     * 计算 一个三维向量的方向 转到  另一个三维向量的方向 的旋转度
     * @param from 开始向量
     * @param to 结束向量
     * @returns 旋转度
     */
    export function vec3AngleBetween(from: vector3, to: vector3): number {
        vec3Normalize(from, from);
        vec3Normalize(to, to);
        var result = vec3Dot(from, to);
        result = floatClamp(result, -1, 1);
        result = Math.acos(result);
        return result;
    }

    /**
     * 三维向量 设为 0 
     * @param out 输出的三维向量
     */
    export function vec3Reset(out: vector3) {
        out.x = 0;
        out.y = 0;
        out.z = 0;
    }

    /**
     * 两个三维向量 线性差值计算
     * @param vector 开始三维向量
     * @param vector2 结束三维向量
     * @param v 差值度（0-1）
     * @param out 输出的三维向量
     */
    export function vec3SLerp(vector: vector3, vector2: vector3, v: number, out: vector3) {
        out.x = vector.x * (1 - v) + vector2.x * v;
        out.y = vector.y * (1 - v) + vector2.y * v;
        out.z = vector.z * (1 - v) + vector2.z * v;
    }

    /**
     * 通过 各维度值设置 三维向量
     * @param x x值
     * @param y y值
     * @param z z值
     * @param out 三维向量
     */
    export function vec3SetByFloat(x: number, y: number, z: number, out: vector3) {
        out.x = x;
        out.y = y;
        out.z = z;
    }

    /**
     * @deprecated [已弃用]
     * 格式化 三维向量 的各维度值
     * @param vector 向量
     * @param maxDot 
     * @param out 输出的三维向量
     */
    export function vec3Format(vector: vector3, maxDot: number, out: vector3) {
        out.x = floatFormat(vector.x, maxDot);
        out.y = floatFormat(vector.y, maxDot);
        out.z = floatFormat(vector.z, maxDot);
    }

    /**
     * @deprecated [已弃用]
     * @param vector 
     * @param maxDot 
     * @param out 
     */
    export function quaternionFormat(vector: quaternion, maxDot: number, out: quaternion) {
        out.x = floatFormat(vector.x, maxDot);
        out.y = floatFormat(vector.y, maxDot);
        out.z = floatFormat(vector.z, maxDot);
        out.w = floatFormat(vector.w, maxDot);
    }
    /**
     * @deprecated [已弃用]
     * @param num 
     * @param maxDot 
     * @returns 
     */
    export function floatFormat(num: number, maxDot: number) {
        var vv = Math.pow(10, maxDot);
        return Math.round(num * vv) / vv;
    }
    //toQuat(dest: Cengine.quaternion = null): Cengine.quaternion {
    //    if (!dest) dest = new Cengine.quaternion();

    //    var c = new vector3();
    //    var s = new vector3();

    //    c.x = Math.cos(this.x * 0.5);
    //    s.x = Math.sin(this.x * 0.5);

    //    c.y = Math.cos(this.y * 0.5);
    //    s.y = Math.sin(this.y * 0.5);

    //    c.z = Math.cos(this.z * 0.5);
    //    s.z = Math.sin(this.z * 0.5);

    //    dest.x = s.x * c.y * c.z - c.x * s.y * s.z;
    //    dest.y = c.x * s.y * c.z + s.x * c.y * s.z;
    //    dest.z = c.x * c.y * s.z - s.x * s.y * c.z;
    //    dest.w = c.x * c.y * c.z + s.x * s.y * s.z;

    //    return dest;
    //}

    //multiplyByMat3(matrix: Matrix3x3): void {
    //    matrix.multiplyVec3(this, this);
    //}

    //multiplyByQuat(quat: Cengine.quaternion): void {
    //    quat.multiplyVec3(this, this);
    //}

    ////又有参数又有返回值的必须是static
    /**
     * 判断两个三维向量是否相等
     * @param vector 向量a
     * @param vector2 向量b
     * @param threshold 误差范围
     * @returns 是相等？
     */
    export function vec3Equal(vector: vector3, vector2: vector3, threshold = 0.00001): boolean {
        if (vector == vector2) return true;
        if (Math.abs(vector.x - vector2.x) > threshold)
            return false;

        if (Math.abs(vector.y - vector2.y) > threshold)
            return false;

        if (Math.abs(vector.z - vector2.z) > threshold)
            return false;

        return true;
    }

    /**
     * 将一个三维向量所有维度设置为指定标量
     * @param vector 向量
     * @param value 指定标量
     */
    export function vec3SetAll(vector: vector3, value: number) {
        // vector.rawData[0] = value;
        // vector.rawData[1] = value;
        // vector.rawData[2] = value;
        vector.x = value;
        vector.y = value;
        vector.z = value;
    }

    /**
     * 三维向量 设置所有维度 通过指定xyz 标量
     * @param vector 向量
     * @param x x值
     * @param y y值
     * @param z z值
     */
    export function vec3Set(vector: vector3, x: number, y: number, z: number) {
        // vector.rawData[0] = x;
        // vector.rawData[1] = y;
        // vector.rawData[2] = z;
        vector.x = x;
        vector.y = y;
        vector.z = z;
    }

    /**
     * 获取指定 三维向量的 垂直向量
     * @param vector 向量
     * @param out 输出的垂直向量
     */
    export function vec3Perpendicular(vector: vector3, out: vector3) {
        m4m.math.vec3Cross(pool.vector3_right, vector, out);
        var dot = m4m.math.vec3Dot(out, out);
        if (dot < 0.05) {
            m4m.math.vec3Cross(pool.vector3_up, vector, out);
        }
    }

    //static sDirection(vector: vector3, vector2: vector3, dest: vector3 = null): vector3 {
    //    if (!dest) dest = new vector3();

    //    var x = vector.x - vector2.x,
    //        y = vector.y - vector2.y,
    //        z = vector.z - vector2.z;

    //    var length = Math.sqrt(x * x + y * y + z * z);

    //    if (length === 0)
    //    {
    //        dest.x = 0;
    //        dest.y = 0;
    //        dest.z = 0;

    //        return dest;
    //    }

    //    length = 1 / length;

    //    dest.x = x * length;
    //    dest.y = y * length;
    //    dest.z = z * length;

    //    return dest;
    //}


    var tagMap: { [key: string]: { count: number, time: number } } = {};
    var tagMap1: { [key: string]: number } = {};
    
    export function countStart(tag: string) {
        tagMap[tag] = { count: 0, time: Date.now() };
    }
    export function count(tag: string) {
        ++tagMap[tag].count;
    }
    export function countEnd(tag: string) {
        if (tagMap1[tag] == undefined || tagMap1[tag] != tagMap[tag].count) {
            tagMap1[tag] = tagMap[tag].count;
            console.log(`tag:${tag},count:${tagMap[tag].count},time:${Date.now() - tagMap[tag].time}/ms`);
        }
    }
}