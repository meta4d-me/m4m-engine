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
     * 最大最小颜色渐变模式
     * 
     * @author feng3d
     */
    export enum MinMaxGradientMode
    {
        /**
         * Use a single color for the MinMaxGradient.
         * 
         * 使用单一颜色的。
         */
        Color = 0,

        /**
         * Use a single color gradient for the MinMaxGradient.
         * 
         * 使用单一颜色渐变。
         */
        Gradient = 1,

        /**
         * Use a random value between 2 colors for the MinMaxGradient.
         * 
         * 在两种颜色之间使用一个随机值。
         */
        TwoColors = 2,

        /**
         * Use a random value between 2 color gradients for the MinMaxGradient.
         * 
         * 在两个颜色梯度之间使用一个随机值。
         */
        TwoGradients = 3,

        /**
         * Define a list of colors in the MinMaxGradient, to be chosen from at random.
         * 
         * 在一个颜色列表中随机选择。
         */
        RandomColor = 4
    }
}