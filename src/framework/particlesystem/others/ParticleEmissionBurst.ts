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
     * @author feng3d
     */
    export class ParticleEmissionBurst
    {
        __class__: "m4m.framework.ParticleEmissionBurst";

        /**
         * The time that each burst occurs.
         * 每次爆炸发生的时间。
         */

        time = 0;

        /**
         * 要发射的粒子数。
         */

        count = serialization.setValue(new MinMaxCurve(), { constant: 30, constantMin: 30, constantMax: 30, mode: MinMaxCurveMode.TwoConstants });

        /**
         * Minimum number of bursts to be emitted.
         * 要发射的最小爆发数量。
         */
        get minCount()
        {
            return this.count.constantMin;
        }

        set minCount(v)
        {
            this.count.constantMin = v;
        }

        /**
         * Maximum number of bursts to be emitted.
         * 
         * 要发射的最大爆发数量。
         */
        get maxCount()
        {
            return this.count.constantMax;
        }

        set maxCount(v)
        {
            this.count.constantMax = v;
        }

        /**
         * How many times to play the burst. (0 means infinitely).
         * 爆发次数。(0意味着无限)。
         * 
         * @todo
         */

        cycleCount = 1;

        /**
         * How often to repeat the burst, in seconds.
         * 
         * 多久重复一次，以秒为单位。
         * 
         * @todo
         */

        repeatInterval = 0.01;

        /**
         * 喷发被触发的几率。
         */

        probability = 1.0;

        /**
         * 是否喷发
         */
        get isProbability()
        {
            return this._isProbability;
        }

        private _isProbability = true;

        /**
         * 通过触发的几率计算是否喷发。
         */
        calculateProbability()
        {
            this._isProbability = this.probability >= Math.random();
            return this._isProbability;
        }
    }
}