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
     * 四元数初始化值
     * @param src 四元数
     */
    export function quatIdentity(src:quaternion)
    {
        src.x=0;
        src.y=0;
        src.z=0;
        src.w=1;
    }

    /**
     * 四元数归一化
     * @param src 四元数
     * @param out 输出归一化后的四元数
     */
    export function quatNormalize(src: quaternion, out: quaternion) {
        var mag: number = 1 / Math.sqrt(src.x * src.x + src.y * src.y + src.z * src.z + src.w * src.w);

        out.x *= mag;
        out.y *= mag;
        out.z *= mag;
        out.w *= mag;
    }

    /**
     * 通过四元数变换三维向量
     * @param src 四元数
     * @param vector 三维向量
     * @param out 输出的三维向量
     */
    export function quatTransformVector(src: quaternion, vector: vector3, out: vector3) {
        var x1: number, y1: number, z1: number, w1: number;
        var x2: number = vector.x, y2: number = vector.y, z2: number = vector.z;

        w1 = -src.x * x2 - src.y * y2 - src.z * z2;
        x1 = src.w * x2 + src.y * z2 - src.z * y2;
        y1 = src.w * y2 - src.x * z2 + src.z * x2;
        z1 = src.w * z2 + src.x * y2 - src.y * x2;

        out.x = -w1 * src.x + x1 * src.w - y1 * src.z + z1 * src.y;
        out.y = -w1 * src.y + x1 * src.z + y1 * src.w - z1 * src.x;
        out.z = -w1 * src.z - x1 * src.y + y1 * src.x + z1 * src.w;

    }
    /**
     * 通过buffer中的四元数数据变换三维向量
     * @param src buffer
     * @param srcseek buffer中的偏移
     * @param vector 三维向量
     * @param out 输出的三维向量
     */
    export function quatTransformVectorDataAndQuat(src: Float32Array, srcseek: number, vector: vector3, out: vector3) {
        var x1: number, y1: number, z1: number, w1: number;
        var x2: number = vector.x, y2: number = vector.y, z2: number = vector.z;
        var srcx = src[srcseek]; var srcy = src[srcseek + 1]; var srcz = src[srcseek + 2]; var srcw = src[srcseek + 3];

        w1 = -srcx * x2 - srcy * y2 - srcz * z2;
        x1 = srcw * x2 + srcy * z2 - srcz * y2;
        y1 = srcw * y2 - srcx * z2 + srcz * x2;
        z1 = srcw * z2 + srcx * y2 - srcy * x2;

        out.x = -w1 * srcx + x1 * srcw - y1 * srcz + z1 * srcy;
        out.y = -w1 * srcy + x1 * srcz + y1 * srcw - z1 * srcx;
        out.z = -w1 * srcz - x1 * srcy + y1 * srcx + z1 * srcw;

    }

    /**
     * 获取四元数的标量值（长度）
     * @param src 四元数
     * @returns 标量值（长度）
     */
    export function quatMagnitude(src: quaternion): number {
        return Math.sqrt(src.w * src.w + src.x * src.x + src.y * src.y + src.z * src.z);
    }

    /**
     * 克隆四元数
     * @param src 源四元数
     * @param out 输出的克隆四元数
     */
    export function quatClone(src: quaternion, out: quaternion) {
        out.x = src.x;
        out.y = src.y;
        out.z = src.z;
        out.w = src.w;
        //out.rawData.set(src.rawData);
        // out.rawData[0]=src.rawData[0];
        // out.rawData[1]=src.rawData[1];
        // out.rawData[2]=src.rawData[2];
        // out.rawData[3]=src.rawData[3];
    }

    /**
     * 判断四元数是否相等
     * @param quat 四元数a
     * @param quat2 四元数b
     * @param threshold 误差范围
     * @returns 是相等？
     */
    export function quatEqual(quat:quaternion,quat2:quaternion,threshold = 0.000001){
        if (Math.abs(quat.x - quat2.x) > threshold)
        return false;
        if (Math.abs(quat.y - quat2.y) > threshold)
        return false;
        if (Math.abs(quat.z - quat2.z) > threshold)
        return false;
        if (Math.abs(quat.w - quat2.w) > threshold)
        return false;

        return true;
    }

    /**
     * 用四元数构建 旋转矩阵
     * @param src 四元数
     * @param out 输出的旋转矩阵
     */
    export function quatToMatrix(src: quaternion, out: matrix) {
        var xy2: number = 2.0 * src.x * src.y, xz2: number = 2.0 * src.x * src.z, xw2: number = 2.0 * src.x * src.w;
        var yz2: number = 2.0 * src.y * src.z, yw2: number = 2.0 * src.y * src.w, zw2: number = 2.0 * src.z * src.w;
        var xx: number = src.x * src.x, yy: number = src.y * src.y, zz: number = src.z * src.z, ww: number = src.w * src.w;

        out.rawData[0] = xx - yy - zz + ww;
        out.rawData[4] = xy2 - zw2;
        out.rawData[8] = xz2 + yw2;
        out.rawData[12] = 0;
        out.rawData[1] = xy2 + zw2;
        out.rawData[5] = -xx + yy - zz + ww;
        out.rawData[9] = yz2 - xw2;
        out.rawData[13] = 0;
        out.rawData[2] = xz2 - yw2;
        out.rawData[6] = yz2 + xw2;
        out.rawData[10] = -xx - yy + zz + ww;
        out.rawData[14] = 0;
        out.rawData[3] = 0.0;
        out.rawData[7] = 0.0;
        out.rawData[11] = 0;
        out.rawData[15] = 1;
    }

    /**
     * 计算四元数的逆
     * @param src 四元数
     * @param out 输出的四元数的逆
     */
    export function quatInverse(src: quaternion, out: quaternion) {
        var norm: number = src.w * src.w + src.x * src.x + src.y * src.y + src.z * src.z;

        if (norm > 0.0) {
            var invNorm = 1.0 / norm;
            out.w = src.w * invNorm;
            out.x = -src.x * invNorm;
            out.y = -src.y * invNorm;
            out.z = -src.z * invNorm;
        }
    }

    /**
     * 构建四元数通过 偏航角、抛角、滚转角 
     * @param yaw 偏航角
     * @param pitch 抛角
     * @param roll 滚转角
     * @param result 输出的四元数
     */
    export function quatFromYawPitchRoll(yaw: number, pitch: number, roll: number, result: quaternion): void {
        // Produces a quaternion from Euler angles in the z-y-x orientation (Tait-Bryan angles)
        var halfRoll = roll * 0.5;
        var halfPitch = pitch * 0.5;
        var halfYaw = yaw * 0.5;

        var sinRoll = Math.sin(halfRoll);
        var cosRoll = Math.cos(halfRoll);
        var sinPitch = Math.sin(halfPitch);
        var cosPitch = Math.cos(halfPitch);
        var sinYaw = Math.sin(halfYaw);
        var cosYaw = Math.cos(halfYaw);

        result.x = (cosYaw * sinPitch * cosRoll) + (sinYaw * cosPitch * sinRoll);
        result.y = (sinYaw * cosPitch * cosRoll) - (cosYaw * sinPitch * sinRoll);
        result.z = (cosYaw * cosPitch * sinRoll) - (sinYaw * sinPitch * cosRoll);
        result.w = (cosYaw * cosPitch * cosRoll) + (sinYaw * sinPitch * sinRoll);
    }

    /**
     * 计算两个四元数相乘
     * @param srca 四元数a
     * @param srcb 四元数b
     * @param out 输出的四元数
     */
    export function quatMultiply(srca: quaternion, srcb: quaternion, out: quaternion) {
        var w1: number = srca.w, x1: number = srca.x, y1: number = srca.y, z1: number = srca.z;
        var w2: number = srcb.w, x2: number = srcb.x, y2: number = srcb.y, z2: number = srcb.z;

        out.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
        out.x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2;
        out.y = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2;
        out.z = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2;

        math.quatNormalize(out, out);
        // out.w = x1 * x2 - y1 * y2 - z1 * z2 + w1 * w2;
        // out.x = x1 * w2 + y1 * z2 - z1 * y2 + w1 * x2;
        // out.y = -x1 * z2 + y1 * w2 + z1 * x2 + w1 * y2;
        // out.z = x1 * y2 - y1 * x2 + z1 * w2 + w1 * z2;
    }

    /**
     * 计算一个buffer中的四元数 与另一个四元数相乘
     * @param srca 四元数a 的 buffer
     * @param srcaseek buffer的偏移 
     * @param srcb 四元数b
     * @param out 输出的四元数
     */
    export function quatMultiplyDataAndQuat(srca: Float32Array, srcaseek: number, srcb: quaternion, out: quaternion) {
        var w1: number = srca[srcaseek + 3], x1: number = srca[srcaseek + 0], y1: number = srca[srcaseek + 1], z1: number = srca[srcaseek + 2];
        var w2: number = srcb.w, x2: number = srcb.x, y2: number = srcb.y, z2: number = srcb.z;

        out.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
        out.x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2;
        out.y = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2;
        out.z = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2;

        math.quatNormalize(out, out);
        // out.w = x1 * x2 - y1 * y2 - z1 * z2 + w1 * w2;
        // out.x = x1 * w2 + y1 * z2 - z1 * y2 + w1 * x2;
        // out.y = -x1 * z2 + y1 * w2 + z1 * x2 + w1 * y2;
        // out.z = x1 * y2 - y1 * x2 + z1 * w2 + w1 * z2;
    }

    /**
     * 计算一个四元数与一个三维向量相乘
     * @param vector 三维向量
     * @param scr 四元数
     * @param out 输出的四元数
     */
    export function quatMultiplyVector(vector: vector3, scr: quaternion, out: quaternion) {
        var x2: number = vector.x;
        var y2: number = vector.y;
        var z2: number = vector.z;

        out.w = -scr.x * x2 - scr.y * y2 - scr.z * z2;
        out.x = scr.w * x2 + scr.y * z2 - scr.z * y2;
        out.y = scr.w * y2 - scr.x * z2 + scr.z * x2;
        out.z = scr.w * z2 + scr.x * y2 - scr.y * x2;
    }

    /**
     * 通过差值度计算两个四元数的线性差值
     * @param srca 开始的四元数
     * @param srcb 结束的四元数
     * @param out 输出的四元数
     * @param t 差值度（0-1）
     */
    export function quatLerp(srca: quaternion, srcb: quaternion, out: quaternion, t: number) {
        var w1: number = srca.w, x1: number = srca.x, y1: number = srca.y, z1: number = srca.z;
        var w2: number = srcb.w, x2: number = srcb.x, y2: number = srcb.y, z2: number = srcb.z;

        if (w1 * w2 + x1 * x2 + y1 * y2 + z1 * z2 < 0) {
            w2 = -w2;
            x2 = -x2;
            y2 = -y2;
            z2 = -z2;
        }

        out.w = w1 + t * (w2 - w1);
        out.x = x1 + t * (x2 - x1);
        out.y = y1 + t * (y2 - y1);
        out.z = z1 + t * (z2 - z1);

        var len: number = 1.0 / Math.sqrt(out.w * out.w + out.x * out.x + out.y * out.y + out.z * out.z);
        out.w *= len;
        out.x *= len;
        out.y *= len;
        out.z *= len;
    }

    /**
     * 构建四元数 通过 轴和旋转度
     * @param axis  轴
     * @param angle 旋转度
     * @param out 输出的四元数
     */
    export function quatFromAxisAngle(axis: vector3, angle: number, out: quaternion) {
        angle *= Math.PI / 180.0;
        var halfAngle: number = angle * 0.5;
        var sin_a: number = Math.sin(halfAngle);
        vec3Normalize(axis,axis);
        out.w = Math.cos(halfAngle);
        out.x = axis.x * sin_a;
        out.y = axis.y * sin_a;
        out.z = axis.z * sin_a;
        // math.quatNormalize(out, out);
    }

    /**
     * 通过四元数和指定轴 获取 旋转度 
     * @param src 四元数
     * @param axis 轴
     * @returns 旋转度 
     */
    export function quatToAxisAngle(src: quaternion, axis: vector3): number {
        var sqrLength: number = src.x * src.x + src.y * src.y + src.z * src.z;
        var angle: number = 0;
        if (sqrLength > 0.0) {
            angle = 2.0 * Math.acos(src.w);
            sqrLength = 1.0 / Math.sqrt(sqrLength);
            axis.x = src.x * sqrLength;
            axis.y = src.y * sqrLength;
            axis.z = src.z * sqrLength;
        }
        else {
            angle = 0;
            axis.x = 1.0;
            axis.y = 0;
            axis.z = 0;
        }
        angle /= Math.PI / 180.0;
        return angle;
    }

    /**
     * 构建四元数 通过 xyz欧拉角 
     * @param ax x欧拉角
     * @param ay y欧拉角
     * @param az z欧拉角
     * @param out 输出的四元数
     */
    export function quatFromEulerAngles(ax: number, ay: number, az: number, out: quaternion) {
        ax *= Math.PI / 180;
        ay *= Math.PI / 180;
        az *= Math.PI / 180;

        var halfX: number = ax * 0.5, halfY: number = ay * 0.5, halfZ: number = az * 0.5;
        var cosX: number = Math.cos(halfX), sinX: number = Math.sin(halfX);
        var cosY: number = Math.cos(halfY), sinY: number = Math.sin(halfY);
        var cosZ: number = Math.cos(halfZ), sinZ: number = Math.sin(halfZ);

        out.w = cosX * cosY * cosZ + sinX * sinY * sinZ;
        out.x = sinX * cosY * cosZ + cosX * sinY * sinZ;
        out.y = cosX * sinY * cosZ - sinX * cosY * sinZ;
        out.z = cosX * cosY * sinZ - sinX * sinY * cosZ;

        math.quatNormalize(out, out);
    }

    /**
     * 通过四元数 获取 xyz欧拉角度 
     * @param src 四元数
     * @param result 输出xyz欧拉角度
     */
    export function quatToEulerAngles(src: quaternion, result: vector3) {
        let qz = src.z;
        let qx = src.x;
        let qy = src.y;
        let qw = src.w;

        let sqw = qw * qw;
        let sqz = qz * qz;
        let sqx = qx * qx;
        let sqy = qy * qy;

        let zAxisY = qy * qz - qx * qw;
        let limit = .4999999;

        if (zAxisY < -limit) {
            result.y = 2 * Math.atan2(qy, qw);
            result.x = Math.PI / 2;
            result.z = 0;
        } else if (zAxisY > limit) {
            result.y = 2 * Math.atan2(qy, qw);
            result.x = -Math.PI / 2;
            result.z = 0;
        } else {
            result.z = Math.atan2(2.0 * (qx * qy + qz * qw), (-sqz - sqx + sqy + sqw));
            result.x = Math.asin(-2.0 * (qz * qy - qx * qw));
            result.y = Math.atan2(2.0 * (qz * qx + qy * qw), (sqz - sqx - sqy + sqw));
        }

        result.x /= Math.PI / 180;
        result.y /= Math.PI / 180;
        result.z /= Math.PI / 180;
    }
    
    /**
     * 重置四元数
     * @param src 四元数
     */
    export function quatReset(src: quaternion) {
        src.x = 0;
        src.y = 0;
        src.z = 0;
        src.w = 1;
    }
    
    /**
     * 构建四元数 通过 一个点坐标和一个需要看向目标点坐标
     * @param pos 点坐标
     * @param targetpos 目标点坐标
     * @param out 输出的四元数
     */
    export function quatLookat(pos: vector3, targetpos: vector3, out: quaternion) {
        var dir = pool.new_vector3();
        math.vec3Subtract(targetpos, pos, dir);
        math.vec3Normalize(dir, dir);

        //dir在xz面上的单位投影
        var dirxz = pool.new_vector3(dir.x, 0, dir.z);
        math.vec3Normalize(dirxz, dirxz);

        var yaw = Math.acos(dirxz.z);// / Math.PI * 180;
        if (dirxz.x < 0) {
            yaw = -yaw;
        }
        //dir在xz面上的投影
        var dirxz1 = pool.new_vector3(dir.x, 0, dir.z);
        let v3length = math.vec3Length(dirxz1);
        if (v3length > 0.9999999999)
            v3length = 1;
        if (v3length < -0.9999999999)
            v3length = -1;
        var pitch = Math.acos(v3length);// / Math.PI * 180;
        if (dir.y > 0) {
            pitch = -pitch;
        }
        quatFromYawPitchRoll(yaw, pitch, 0, out);
        math.quatNormalize(out, out);

        pool.delete_vector3(dir);
        pool.delete_vector3(dirxz);
        pool.delete_vector3(dirxz1);
    }

    /**
     * 构建四元数 通过 一个点坐标和一个需要看向目标点坐标 以及视窗上方向量
     * @param pos 点坐标
     * @param targetpos 目标点坐标
     * @param out 输出的四元数
     * @param updir 视窗上方向量
     */
    export function quat2Lookat(pos: vector3, targetpos: vector3, out: quaternion, updir: m4m.math.vector3 = m4m.math.pool.vector3_up) {
        var dir = m4m.math.pool.new_vector3();
        math.vec3Subtract(targetpos, pos, dir);
        math.vec3Normalize(dir, dir);
        var dot = m4m.math.vec3Dot(m4m.math.pool.vector3_forward, dir);
        dot = m4m.math.floatClamp(dot, -1, 1);
        var rotangle = Math.acos(dot) * 180 / Math.PI;

        if (rotangle < 0.01) {
            out.x = 0;
            out.y = 0;
            out.z = 0;
            out.w = 1;
            return;
        }
        if (rotangle > 179.9) {
            m4m.math.quatFromAxisAngle(updir, 180, out);
            return;
        }
        var rotAxis = m4m.math.pool.new_vector3();
        m4m.math.vec3Cross(m4m.math.pool.vector3_forward, dir, rotAxis);
        m4m.math.vec3Normalize(rotAxis, rotAxis);
        m4m.math.quatFromAxisAngle(rotAxis, rotangle, out);
    }

    /**
     * 构建四元数 通过 一个点坐标和一个需要看向目标点坐标 以及视窗上方向量
     * @param pos 点坐标
     * @param targetpos 目标点坐标
     * @param upwards 视窗上方向量
     * @param out 输出的四元数
     */
    export function quat2LookRotation(pos: vector3, targetpos: vector3, upwards: vector3, out: quaternion) {
        let dir = m4m.math.pool.new_vector3();
        math.vec3Subtract(targetpos, pos, dir);
        math.quatLookRotation(dir,upwards,out);
    }

    /**
     * 构建四元数 通过 一个视线方向向量 和 视窗上方向量
     * @param dir 视线方向向量
     * @param upwards 视窗上方向量
     * @param out 输出的四元数
     */
    export function quatLookRotation(dir:vector3, upwards: vector3, out: quaternion){
        math.vec3Normalize(dir, dir);
        let ab = math.vec3Dot(dir, m4m.math.pool.vector3_forward);
        let an_dz = Math.acos(ab);

        let cdz = m4m.math.pool.new_vector3();
        vec3Cross(dir, m4m.math.pool.vector3_forward, cdz);
        math.vec3Normalize(cdz, cdz);
        if(vec3Dot(cdz, m4m.math.pool.vector3_forward)<0)
        {
            an_dz = 2*Math.PI -an_dz;
        }
        an_dz = 180 / Math.PI * an_dz;

        quatFromAxisAngle(cdz, -an_dz, out);

        let y = m4m.math.pool.new_vector3();
        quatTransformVector(out, m4m.math.pool.vector3_up, y);
        let cyw = cdz;
        vec3Cross(dir, upwards, cyw);

        math.vec3Normalize(y, y);
        math.vec3Normalize(cyw, cyw);
        let cos2Y = vec3Dot(cyw, y);
        // if(cos2Y>1){
        //     cos2Y=1;
        // }
        // if(cos2Y<-1){
        //     cos2Y=-1;
        // }
        // if(cos2Y>-0.001&&cos2Y<0.001){
        //     cos2Y=0;
        // }

        let sin2Y = Math.sqrt(1 - cos2Y * cos2Y);
        console.log(vec3Dot(y,upwards));
        if(vec3Dot(y,upwards)<=0){
            sin2Y=-sin2Y;
        }

        let siny = Math.sqrt((1 - sin2Y) / 2);
        let cosy = -Math.sqrt((sin2Y + 1) / 2);
        console.log(cos2Y);
        if (cos2Y < 0){
            cosy = -cosy;
        }
        let yq = m4m.math.pool.new_quaternion();
        yq.x = 0;
        yq.y = 0;
        yq.z = siny;
        yq.w = cosy;
        quatMultiply(out, yq,  out);
        m4m.math.pool.delete_vector3(dir);
        m4m.math.pool.delete_vector3(cdz);
        // m4m.math.pool.delete_vector3(y);
        // m4m.math.pool.delete_quaternion(yq);
    }

    /**
     * 构建四元数 通过 一个点坐标和一个需要看向目标点坐标 以及视窗上方为单位Y轴
     * @param pos 点坐标
     * @param targetpos 目标点坐标
     * @param out 输出的四元数
     */
    export function quatYAxis(pos: vector3, targetpos: vector3, out: quaternion) {
        var dir = pool.new_vector3();
        math.vec3Subtract(targetpos, pos, dir);
        math.vec3Normalize(dir, dir);

        //dir在xz面上的单位投影
        var dirxz = pool.new_vector3(dir.x, 0, dir.z);
        math.vec3Normalize(dirxz, dirxz);

        var yaw = Math.acos(dirxz.z);// / Math.PI * 180;
        if (dirxz.x < 0) {
            yaw = -yaw;
        }
        // //dir在xz面上的投影
        // var dirxz1 = new vector3(dir.x, 0, dir.z);
        // let v3length = math.vec3Length(dirxz1);
        // if (v3length > 0.999)
        //     v3length = 1;
        // if (v3length < -0.999)
        //     v3length = -1;
        // var pitch = Math.acos(v3length);// / Math.PI * 180;
        // if (dir.y > 0)
        // {
        //     pitch = -pitch;
        // }
        quatFromYawPitchRoll(yaw, 0, 0, out);
        math.quatNormalize(out, out);

        pool.delete_vector3(dir);
        pool.delete_vector3(dirxz);
    }

    /**
     * 计算 从 start方向 到 end方向 旋转的四元数
     * @param start  start方向
     * @param end end方向
     * @param out 输出的四元数
     */
    export function quatRotationTo (start: vector3, end: vector3,out: quaternion){
        vec3Normalize(start,start);
        vec3Normalize(end,end);
        let dot=vec3Dot(start,end);

        if (dot >= 0.99999847691) {
            quatIdentity(out);
            return;
          }

        if (dot <= -0.99999847691) {
            var pVec = pool.new_vector3();
            vec3Perpendicular(start,pVec);
            out.w = 0;
            out.x = pVec.x;
            out.y = pVec.y;
            out.z = pVec.z;
            pool.delete_vector3(pVec);
            return;
        }

        var cross_product = pool.new_vector3();
        vec3Cross(start,end,cross_product);
        out.w = 1 + dot;
        out.x = cross_product.x;
        out.y = cross_product.y;
        out.z = cross_product.z;
        quatNormalize(out,out);

        pool.delete_vector3(cross_product);
    }

    /**
     * 构建四元数 通过 一个视线方向向量 以及视窗上方向量
     * @param dir 视线方向向量
     * @param out 输出的四元数
     * @param up 视窗上方向量
     */
    export function myLookRotation(dir:vector3, out:quaternion,up:vector3=pool.vector3_up)
    {
        if(vec3Equal(dir,pool.vector3_zero))
        {
            console.log("Zero direction in MyLookRotation");
            quatIdentity(out);
            return;
        }
        if (!vec3Equal(dir,up)) {

            let tempv=pool.new_vector3();
            vec3ScaleByNum(up,vec3Dot(up,dir),tempv);
            vec3Subtract(dir,tempv,tempv);
            let qu=pool.new_quaternion();
            this.quatRotationTo(pool.vector3_forward,tempv,qu);
            let qu2=pool.new_quaternion();
            this.quatRotationTo(tempv,dir,qu2);
            quatMultiply(qu,qu2,out);

            pool.delete_quaternion(qu);
            pool.delete_quaternion(qu2);
            pool.delete_vector3(tempv);
        }
        else {
            this.quatRotationTo(pool.vector3_forward,dir,out);
        }
    }
}