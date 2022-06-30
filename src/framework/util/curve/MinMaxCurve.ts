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
     * 最大最小曲线
     * 
     * @author feng3d
     */
    export class MinMaxCurve
    {
        __class__: "m4m.framework.MinMaxCurve";

        /**
         * 模式
         */

        mode = MinMaxCurveMode.Constant;

        /**
         * Set the constant value.
         * 
         * 设置常数值。
         */

        constant = 0;

        /**
         * Set a constant for the lower bound.
         * 
         * 为下界设置一个常数。
         */

        constantMin = 0;

        /**
         * Set a constant for the upper bound.
         * 
         * 为上界设置一个常数。
         */

        constantMax = 0;

        /**
         * Set the curve.
         * 
         * 设置曲线。
         */

        curve = new AnimationCurve1();

        /**
         * Set a curve for the lower bound.
         * 
         * 为下界设置一条曲线。
         */

        curveMin = new AnimationCurve1();

        /**
         * Set a curve for the upper bound.
         * 
         * 为上界设置一条曲线。
         */

        curveMax = new AnimationCurve1();

        /**
         * Set a multiplier to be applied to the curves.
         * 
         * 设置一个乘数应用于曲线。
         */

        curveMultiplier = 1;

        /**
         * 是否在编辑器中只显示Y轴 0-1 区域，例如 lifetime 为非负，需要设置为true
         */
        between0And1 = false;

        /**
         * 获取值
         * @param time 时间
         */
        getValue(time: number, randomBetween: number = Math.random())
        {
            switch (this.mode)
            {
                case MinMaxCurveMode.Constant:
                    return this.constant;
                case MinMaxCurveMode.Curve:
                    return this.curve.getValue(time) * this.curveMultiplier;
                case MinMaxCurveMode.TwoConstants:
                    return math.numberLerp(this.constantMin, this.constantMax, randomBetween);
                case MinMaxCurveMode.TwoCurves:
                    return math.numberLerp(this.curveMin.getValue(time), this.curveMax.getValue(time), randomBetween) * this.curveMultiplier;
            }

            return this.constant;
        }
    }
}