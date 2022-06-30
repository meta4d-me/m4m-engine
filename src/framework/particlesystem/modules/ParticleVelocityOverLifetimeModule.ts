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
namespace m4m.framework
{
    /**
     * 粒子系统 速度随时间变化模块
     * 
     * Controls the velocity of each particle during its lifetime.
     * 控制每个粒子在其生命周期内的速度。
     * 
     * @author feng3d
     */
    export class ParticleVelocityOverLifetimeModule extends ParticleModule
    {
        __class__: "m4m.framework.ParticleVelocityOverLifetimeModule";

        /**
         * Curve to control particle speed based on lifetime.
         * 
         * 基于寿命的粒子速度控制曲线。
         */

        velocity = new MinMaxCurveVector3();

        /**
         * Specifies if the velocities are in local space (rotated with the transform) or world space.
         * 
         * 指定速度是在局部空间(与变换一起旋转)还是在世界空间。
         */

        space = ParticleSystemSimulationSpace.Local;

        /**
         * Curve to control particle speed based on lifetime, on the X axis.
         * 
         * 曲线控制粒子速度基于寿命，在X轴上。
         */
        get x()
        {
            return this.velocity.xCurve;
        }

        set x(v)
        {
            this.velocity.xCurve = v;
        }

        /**
         * X axis speed multiplier.
         * 
         * X轴速度倍增器。
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
         * Curve to control particle speed based on lifetime, on the Y axis.
         * 
         * 曲线控制粒子速度基于寿命，在Y轴上。
         */
        get y()
        {
            return this.velocity.yCurve;
        }

        set y(v)
        {
            this.velocity.yCurve = v;
        }

        /**
         * Y axis speed multiplier.
         * 
         * Y轴速度倍增器。
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
         * Curve to control particle speed based on lifetime, on the Z axis.
         * 
         * 曲线控制粒子速度基于寿命，在Z轴上。
         */
        get z()
        {
            return this.velocity.zCurve;
        }

        set z(v)
        {
            this.velocity.zCurve = v;
        }

        /**
         * Z axis speed multiplier.
         * 
         * Z轴速度倍增器。
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
            particle[_VelocityOverLifetime_rate] = Math.random();
        }

        /**
         * 更新粒子状态
         * @param particle 粒子
         */
        updateParticleState(particle: Particle1)
        {
            this.particleSystem.removeParticleVelocity(particle, _VelocityOverLifetime_preVelocity);
            if (!this.enabled) return;

            var velocity = this.velocity.getValue(particle.rateAtLifeTime, particle[_VelocityOverLifetime_rate]);
            this.particleSystem.addParticleVelocity(particle, velocity, this.space, _VelocityOverLifetime_preVelocity);
        }
    }

    var _VelocityOverLifetime_rate = "_VelocityOverLifetime_rate";
    var _VelocityOverLifetime_preVelocity = "_VelocityOverLifetime_preVelocity";
}