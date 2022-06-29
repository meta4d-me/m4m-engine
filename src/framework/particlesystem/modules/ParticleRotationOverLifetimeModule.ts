/**
@license
Copyright 2022 meta4d.me Authors

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
namespace m4m.framework
{
    /**
     * 粒子系统 旋转角度随时间变化模块
     * 
     * @author feng3d
     */
    export class ParticleRotationOverLifetimeModule extends ParticleModule
    {
        /**
         * Set the rotation over lifetime on each axis separately.
         * 在每个轴上分别设置基于生命周期的旋转。
         */

        separateAxes = false;

        /**
         * 角速度，基于生命周期的旋转。
         */

        angularVelocity = serialization.setValue(new MinMaxCurveVector3(), { xCurve: { constant: 45, constantMin: 45, constantMax: 45, curveMultiplier: 45 }, yCurve: { constant: 45, constantMin: 45, constantMax: 45, curveMultiplier: 45 }, zCurve: { constant: 45, constantMin: 45, constantMax: 45, curveMultiplier: 45 } });

        /**
         * Rotation over lifetime curve for the X axis.
         * 
         * X轴的旋转寿命曲线。
         */
        get x()
        {
            return this.angularVelocity.xCurve;
        }

        set x(v)
        {
            this.angularVelocity.xCurve = v;
        }

        /**
         * Rotation multiplier around the X axis.
         * 
         * 绕X轴旋转乘法器
         */
        get xMultiplier()
        {
            return this.x.curveMultiplier;
        }

        set xMultiplier(v)
        {
            this.x.curveMultiplier = v;
        }

        /**
         * Rotation over lifetime curve for the Y axis.
         * 
         * Y轴的旋转寿命曲线。
         */
        get y()
        {
            return this.angularVelocity.yCurve;
        }

        set y(v)
        {
            this.angularVelocity.yCurve = v;
        }

        /**
         * Rotation multiplier around the Y axis.
         * 
         * 绕Y轴旋转乘法器
         */
        get yMultiplier()
        {
            return this.y.curveMultiplier;
        }

        set yMultiplier(v)
        {
            this.y.curveMultiplier = v;
        }

        /**
         * Rotation over lifetime curve for the Z axis.
         * 
         * Z轴的旋转寿命曲线。
         */
        get z()
        {
            return this.angularVelocity.zCurve;
        }

        set z(v)
        {
            this.angularVelocity.zCurve = v;
        }

        /**
         * Rotation multiplier around the Z axis.
         * 
         * 绕Z轴旋转乘法器
         */
        get zMultiplier()
        {
            return this.z.curveMultiplier;
        }

        set zMultiplier(v)
        {
            this.z.curveMultiplier = v;
        }

        /**
         * 初始化粒子状态
         * @param particle 粒子
         */
        initParticleState(particle: Particle1)
        {
            particle[_RotationOverLifetime_rate] = Math.random();
            particle[_RotationOverLifetime_preAngularVelocity] = new math.vector3();
        }

        /**
         * 更新粒子状态
         * @param particle 粒子
         */
        updateParticleState(particle: Particle1)
        {
            var preAngularVelocity: math.vector3 = particle[_RotationOverLifetime_preAngularVelocity];
            particle.angularVelocity.x -= preAngularVelocity.x;
            particle.angularVelocity.y -= preAngularVelocity.y;
            particle.angularVelocity.z -= preAngularVelocity.z;

            preAngularVelocity.x = 0;
            preAngularVelocity.y = 0;
            preAngularVelocity.z = 0;
            if (!this.enabled) return;

            var v = this.angularVelocity.getValue(particle.rateAtLifeTime, particle[_RotationOverLifetime_rate]);
            if (!this.separateAxes)
            {
                v.x = v.y = 0;
            }
            particle.angularVelocity.x += v.x;
            particle.angularVelocity.y += v.y;
            particle.angularVelocity.z += v.z;

            preAngularVelocity.x = v.x;
            preAngularVelocity.y = v.y;
            preAngularVelocity.z = v.z;
        }
    }
    var _RotationOverLifetime_rate = "_RotationOverLifetime_rate";
    var _RotationOverLifetime_preAngularVelocity = "_RotationOverLifetime_preAngularVelocity";
}