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
     * The quality of the generated noise.
     * 
     * 产生的噪音的质量。
     */
    export enum ParticleSystemNoiseQuality
    {
        /**
         * Low quality 1D noise.
         * 
         * 低质量的一维噪声。
         */
        Low,

        /**
         * Medium quality 2D noise.
         * 
         * 中等质量2D噪音。
         */
        Medium,

        /**
         * High quality 3D noise.
         * 
         * 高品质3D噪音。
         */
        High,
    }
}