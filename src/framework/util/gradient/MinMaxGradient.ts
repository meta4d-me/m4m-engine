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
     * 最大最小颜色渐变
     * 
     * @author feng3d
     */
    export class MinMaxGradient
    {
        __class__: "m4m.framework.MinMaxGradient";

        /**
         * Set the mode that the min-max gradient will use to evaluate colors.
         * 
         * 设置最小-最大梯度将用于评估颜色的模式。
         */

        mode = MinMaxGradientMode.Color;

        /**
         * Set a constant color.
         * 
         * 常量颜色值
         */

        color = new math.color();

        /**
         * Set a constant color for the lower bound.
         * 
         * 为下界设置一个常量颜色。
         */

        colorMin = new math.color();

        /**
         * Set a constant color for the upper bound.
         * 
         * 为上界设置一个常量颜色。
         */

        colorMax = new math.color();

        /**
         * Set the gradient.
         * 
         * 设置渐变。
         */

        gradient = new Gradient();

        /**
         * Set a gradient for the lower bound.
         * 
         * 为下界设置一个渐变。
         */

        gradientMin = new Gradient();

        /**
         * Set a gradient for the upper bound.
         * 
         * 为上界设置一个渐变。
         */

        gradientMax = new Gradient();

        /**
         * 获取值
         * @param time 时间
         */
        getValue(time: number, randomBetween: number = Math.random(), out = new math.color())
        {
            switch (this.mode)
            {
                case MinMaxGradientMode.Color:
                    math.colorClone(this.color, out);
                    break;
                case MinMaxGradientMode.Gradient:
                    math.colorClone(this.gradient.getValue(time), out);
                    break;
                case MinMaxGradientMode.TwoColors:
                    math.colorLerp(this.colorMin, this.colorMax, randomBetween, out);
                    break;
                case MinMaxGradientMode.TwoGradients:
                    var min = this.gradientMin.getValue(time);
                    var max = this.gradientMax.getValue(time);
                    math.colorLerp(min, max, randomBetween, out);
                    break;
                case MinMaxGradientMode.RandomColor:
                    var v = this.gradient.getValue(randomBetween);
                    math.colorClone(v, out);
                    break;
            }
            return out;
        }
    }
}