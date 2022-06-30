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
/// <reference path="ParticleModule.ts" />

namespace m4m.framework
{
    /**
     * the Color By Speed module.
     * 
     * 颜色随速度变化模块。
     */
    export class ParticleColorBySpeedModule extends ParticleModule
    {
        /**
         * The gradient controlling the particle colors.
         * 
         * 控制粒子颜色的梯度。
         */
        color = new MinMaxGradient();

        /**
         * Apply the color gradient between these minimum and maximum speeds.
         * 
         * 在这些最小和最大速度之间应用颜色渐变。
         */
        range = new math.vector2(0, 1);

        /**
         * 初始化粒子状态
         * @param particle 粒子
         */
        initParticleState(particle: Particle1)
        {
            particle[_ColorBySpeed_rate] = Math.random();
        }

        /**
         * 更新粒子状态
         * @param particle 粒子
         */
        updateParticleState(particle: Particle1)
        {
            if (!this.enabled) return;

            var velocity = math.vec3Length(particle.velocity);
            var rate = math.floatClamp((velocity - this.range.x) / (this.range.y - this.range.x), 0, 1);
            var color = this.color.getValue(rate, particle[_ColorBySpeed_rate]);
            math.colorMultiply(particle.color, color, particle.color);
        }

    }
    var _ColorBySpeed_rate = "_ColorBySpeed_rate";
}