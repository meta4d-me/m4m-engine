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
     * The Inherit Velocity Module controls how the velocity of the emitter is transferred to the particles as they are emitted.
     * 
     * 遗传速度模块控制发射体的速度在粒子发射时如何传递到粒子上。（只有粒子系统在世界空间中模拟时生效）
     */
    export class ParticleInheritVelocityModule extends ParticleModule
    {
        "__class__": "m4m.framework.ParticleInheritVelocityModule" = "m4m.framework.ParticleInheritVelocityModule";

        /**
         * How to apply emitter velocity to particles.
         * 
         * 如何将发射体速度应用于粒子。
         */
        mode = ParticleSystemInheritVelocityMode.Initial;

        /**
         * Curve to define how much emitter velocity is applied during the lifetime of a particle.
         * 
         * 曲线，用来定义在粒子的生命周期内应用了多少发射速度。
         */
        multiplier = serialization.setValue(new MinMaxCurve(), { constant: 1, constantMin: 1, constantMax: 1 });

        /**
         * Curve to define how much emitter velocity is applied during the lifetime of a particle.
         * 
         * 曲线，用来定义在粒子的生命周期内应用了多少发射速度。
         */
        get curve()
        {
            return this.multiplier;
        }

        set curve(v)
        {
            this.multiplier = v;
        }

        /**
         * Change the curve multiplier.
         * 
         * 改变曲线的乘数。
         */
        get curveMultiplier()
        {
            return this.multiplier.curveMultiplier;
        }

        set curveMultiplier(v)
        {
            this.multiplier.curveMultiplier = v;
        }

        /**
         * 初始化粒子状态
         * @param particle 粒子
         */
        initParticleState(particle: Particle1)
        {
            particle[_InheritVelocity_rate] = Math.random();

            if (!this.enabled) return;
            if (this.particleSystem.main.simulationSpace == ParticleSystemSimulationSpace.Local) return;
            if (this.mode != ParticleSystemInheritVelocityMode.Initial) return;

            var multiplier = this.multiplier.getValue(particle.rateAtLifeTime, particle[_InheritVelocity_rate]);
            particle.velocity.x += multiplier * this.particleSystem.speed.x;
            particle.velocity.y += multiplier * this.particleSystem.speed.y;
            particle.velocity.z += multiplier * this.particleSystem.speed.z;
        }

        /**
         * 更新粒子状态
         * @param particle 粒子
         */
        updateParticleState(particle: Particle1)
        {
            if (!this.enabled) return;
            if (this.particleSystem.main.simulationSpace == ParticleSystemSimulationSpace.Local) return;
            if (this.mode != ParticleSystemInheritVelocityMode.Current) return;

            var multiplier = this.multiplier.getValue(particle.rateAtLifeTime, particle[_InheritVelocity_rate]);
            particle.position.x += multiplier * this.particleSystem.moveVec.x;
            particle.position.y += multiplier * this.particleSystem.moveVec.y;
            particle.position.z += multiplier * this.particleSystem.moveVec.z;
        }
    }
    var _InheritVelocity_rate = "_InheritVelocity_rate";
}