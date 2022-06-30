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
     * 粒子系统发射模块。
     * 
     * @author feng3d
     */
    export class ParticleEmissionModule extends ParticleModule
    {
        __class__: "m4m.framework.ParticleEmissionModule";

        /**
         * 随着时间的推移，新粒子产生的速度。
         */
        
        rateOverTime = serialization.setValue(new MinMaxCurve(), { between0And1: true, constant: 10, constantMin: 10, constantMax: 10, curveMultiplier: 10 });

        /**
         * Change the rate over time multiplier.
         * This is more efficient than accessing the whole curve, if you only want to change the overall rate multiplier.
         * 
         * 改变率随时间的乘数。
         * 如果您只想更改整体的速率乘数，那么这比访问整个曲线更有效。
         * 只在
         */
        get rateOverTimeMultiplier()
        {
            return this.rateOverTime.curveMultiplier;
        }

        set rateOverTimeMultiplier(v)
        {
            this.rateOverTime.curveMultiplier = v;
        }

        /**
         * The rate at which new particles are spawned, over distance.
         * New particles will only be emitted when the emitter moves. 
         * 
         * 产生新粒子的速度，通过距离。
         * 新粒子只有在发射器移动时才会被发射出来。
         * 
         * @todo
         */
        rateOverDistance = serialization.setValue(new MinMaxCurve(), { between0And1: true, constant: 0, constantMin: 0, constantMax: 1 });

        /**
         * Change the rate over distance multiplier.
         * This is more efficient than accessing the whole curve, if you only want to change the overall rate multiplier.
         * 
         * 改变速率随距离变化的乘数。
         * 如果您只想更改整体的速率乘数，那么这比访问整个曲线更有效。
         */
        get rateOverDistanceMultiplier()
        {
            return this.rateOverDistance.curveMultiplier;
        }

        set rateOverDistanceMultiplier(v)
        {
            this.rateOverDistance.curveMultiplier = v;
        }

        /**
         * 爆发数组
         */
        
        bursts: ParticleEmissionBurst[] = [];

        /**
         * The current number of bursts.
         * 
         * 当前的爆发次数。
         */
        get burstCount()
        {
            return this.bursts.length;
        }

        /**
         * Get the burst array.
         * 获取爆发数组。
         * 
         * @param bursts Array of bursts to be filled in.要填充的爆发数组。
         * @returns The number of bursts in the array.数组中的爆发次数。
         */
        getBursts(bursts: ParticleEmissionBurst[])
        {
            bursts.length = this.bursts.length;
            for (let i = 0, n = bursts.length; i < n; i++)
            {
                bursts[i] = this.bursts[i];
            }
            return bursts.length;
        }

        /**
         * Set the burst array.
         * 设置爆发数组。
         * 
         * @param bursts Array of bursts.爆发的数组。
         * @param size Optional array size, if burst count is less than array size.可选的数组大小，如果爆发计数小于数组大小。
         */
        setBursts(bursts: ParticleEmissionBurst[], size: number = Number.MAX_SAFE_INTEGER)
        {
            var size = Math.min(bursts.length, size);
            for (let i = 0; i < size; i++)
            {
                this.bursts[i] = bursts[i];
            }
        }
    }
}