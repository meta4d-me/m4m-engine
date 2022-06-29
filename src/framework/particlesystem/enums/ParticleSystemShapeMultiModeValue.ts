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
     * The mode used to generate new points in a shape (Shuriken).
     * 
     * 用于在形状中生成新点的模式
     */
    export enum ParticleSystemShapeMultiModeValue
    {
        /**
         * Generate points randomly. (Default)
         * 
         * 生成随机点。(默认)
         */
        Random = 0,
        /**
         * Animate the emission point around the shape.
         * 
         * 使发射点围绕形状运动。
         */
        Loop = 1,
        /**
         * Animate the emission point around the shape, alternating between clockwise and counter-clockwise directions.
         * 
         * 使发射点围绕形状运动，在顺时针和逆时针方向之间交替。
         */
        PingPong = 2,
        /**
         * Distribute new particles around the shape evenly.
         * 
         * 在形状周围均匀分布新粒子。
         * 
         * @todo
         */
        BurstSpread = 3,
    }
}