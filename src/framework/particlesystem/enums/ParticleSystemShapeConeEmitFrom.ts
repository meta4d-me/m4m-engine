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
     * 粒子系统圆锥体发射类型，用于定义基于圆锥体的发射类型。
     */
    export enum ParticleSystemShapeConeEmitFrom
    {
        /**
         * 从圆锥体底面发射。
         */
        Base,
        /**
         * 从圆锥体底面边缘沿着曲面发射。
         */
        BaseShell,
        /**
         * 从圆锥体内部发射。
         */
        Volume,
        /**
         * 从圆锥体曲面沿着曲面发射。
         */
        VolumeShell,
    }
}