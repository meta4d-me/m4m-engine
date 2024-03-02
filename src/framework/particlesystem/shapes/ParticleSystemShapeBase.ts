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
     * 粒子系统 发射形状
     * 
     * @author feng3d
     */
    export class ParticleSystemShapeBase
    {
        protected _module: ParticleShapeModule;
        /**
         * 粒子系统形状
         * @param module 粒子形状模块
         */
        constructor(module: ParticleShapeModule)
        {
            this._module = module;
        }


        /**
         * 计算粒子的发射位置与方向
         * 
         * @param particle 
         * @param position 
         * @param dir 
         */
        calcParticlePosDir(particle: Particle1, position: math.vector3, dir: math.vector3)
        {

        }
    }
}