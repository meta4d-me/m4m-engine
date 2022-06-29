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
﻿namespace m4m.framework
{
    /**
     * @private
     */
    export enum ParticleEmissionType
    {
        burst,
        continue
    }
    /**
     * @private
     */
    export class EmissionData
    {
        /**
        * 发射器类型
        */
        public type: ParticleEmissionType = ParticleEmissionType.burst;

        /**
        * 发射器名字
        */
        public emissionName: string;

        /**
        * 发射器持续发射时间或者延迟爆发时间
        */
        public time: number;

        /**
        *  在发射时间内发射粒子个数
        */
        public count: number;

        constructor()
        {

        }
    }

}