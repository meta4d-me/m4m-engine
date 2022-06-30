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
     * 粒子模拟空间
     * 
     * @author feng3d
     */
    export enum ParticleSystemSimulationSpace
    {
        /**
         * Simulate particles in local space.
         * 
         * 模拟局部空间中的粒子。
         */
        Local = 0,

        /**
         * Simulate particles in world space.
         * 
         * 模拟世界空间中的粒子。
         */
        World = 1,
    }

}