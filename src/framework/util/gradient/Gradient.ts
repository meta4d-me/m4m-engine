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
     * 颜色渐变
     * 
     * @author feng3d
     */
    export class Gradient
    {
        __class__: "m4m.framework.Gradient";

        /**
         * 渐变模式
         */

        mode = GradientMode.Blend;

        /**
         * 在渐变中定义的所有alpha键。
         * 
         * 注： 该值已对时间排序，否则赋值前请使用 sort((a, b) => a.time - b.time) 进行排序
         */

        alphaKeys: GradientAlphaKey[] = [{ alpha: 1, time: 0 }, { alpha: 1, time: 1 }];

        /**
         * 在渐变中定义的所有color键。
         * 
         * 注： 该值已对时间排序，否则赋值前请使用 sort((a, b) => a.time - b.time) 进行排序
         */

        colorKeys: GradientColorKey[] = [{ color: new math.color(1, 1, 1), time: 0 }, { color: new math.color(1, 1, 1), time: 1 }];

        /**
         * 获取值
         * @param time 时间
         */
        getValue(time: number)
        {
            var alpha = this.getAlpha(time);
            var color = this.getColor(time);
            return new math.color(color.r, color.g, color.b, alpha);
        }

        /**
         * 获取透明度
         * @param time 时间
         */
        getAlpha(time: number)
        {
            var alphaKeys = this.alphaKeys;
            if (alphaKeys.length == 1) return alphaKeys[0].alpha;
            if (time <= alphaKeys[0].time) return alphaKeys[0].alpha;
            if (time >= alphaKeys[alphaKeys.length - 1].time) return alphaKeys[alphaKeys.length - 1].alpha;

            for (let i = 0, n = alphaKeys.length - 1; i < n; i++)
            {
                var t = alphaKeys[i].time, v = alphaKeys[i].alpha, nt = alphaKeys[i + 1].time, nv = alphaKeys[i + 1].alpha;
                if (time == t) return v;
                if (time == nt) return nv;
                if (t < time && time < nt)
                {
                    if (this.mode == GradientMode.Fixed) return nv;
                    return math.mapLinear(time, t, nt, v, nv);
                }
            }
            return 1;
        }

        /**
         * 获取透明度
         * @param time 时间
         */
        getColor(time: number)
        {
            var colorKeys = this.colorKeys;
            if (colorKeys.length == 1) return colorKeys[0].color;
            if (time <= colorKeys[0].time) return colorKeys[0].color;
            if (time >= colorKeys[colorKeys.length - 1].time) return colorKeys[colorKeys.length - 1].color;

            for (let i = 0, n = colorKeys.length - 1; i < n; i++)
            {
                var t = colorKeys[i].time, v = colorKeys[i].color, nt = colorKeys[i + 1].time, nv = colorKeys[i + 1].color;
                if (time == t) return v;
                if (time == nt) return nv;
                if (t < time && time < nt)
                {
                    if (this.mode == GradientMode.Fixed) return nv;
                    var color = new math.color();
                    math.colorLerp(v, nv, (time - t) / (nt - t), color);
                    return color;
                }
            }
            return new math.color();
        }
    }
}