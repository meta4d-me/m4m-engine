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
/// <reference path="ParticleSystemShapeBase.ts" />

namespace m4m.framework
{
    /**
     * @author feng3d
     */
    export enum ParticleSystemShapeBoxEmitFrom
    {
        /**
         * 从盒子内部发射。
         */
        Volume,
        /**
         * 从盒子外壳发射。
         */
        Shell,
        /**
         * 从盒子边缘发射。
         */
        Edge,
    }

    /**
     * 粒子系统 发射盒子
     * 
     * @author feng3d
     */
    export class ParticleSystemShapeBox extends ParticleSystemShapeBase
    {
        /**
         * 盒子X方向缩放。
         */
        get boxX()
        {
            return this._module.box.x;
        }

        set boxX(v)
        {
            this._module.box.x = v;
        }

        /**
         * 盒子Y方向缩放。
         */
        get boxY()
        {
            return this._module.box.y;
        }

        set boxY(v)
        {
            this._module.box.y = v;
        }

        /**
         * 盒子Z方向缩放。
         */
        get boxZ()
        {
            return this._module.box.z;
        }

        set boxZ(v)
        {
            this._module.box.z = v;
        }

        /**
         * 粒子系统盒子发射类型。
         */
        emitFrom = ParticleSystemShapeBoxEmitFrom.Volume;

        /**
         * 计算粒子的发射位置与方向
         * 
         * @param particle 
         * @param position 
         * @param dir 
         */
        calcParticlePosDir(particle: Particle1, position: math.vector3, dir: math.vector3)
        {
            // 计算位置
            position.x = Math.random() * 2 - 1;
            position.y = Math.random() * 2 - 1;
            position.z = Math.random() * 2 - 1;

            if (this.emitFrom == ParticleSystemShapeBoxEmitFrom.Shell)
            {
                var max = Math.max(Math.abs(position.x), Math.abs(position.y), Math.abs(position.z));
                if (Math.abs(position.x) == max)
                {
                    position.x = position.x < 0 ? -1 : 1;
                } else if (Math.abs(position.y) == max)
                {
                    position.y = position.y < 0 ? -1 : 1;
                } else if (Math.abs(position.z) == max)
                {
                    position.z = position.z < 0 ? -1 : 1;
                }
            } else if (this.emitFrom == ParticleSystemShapeBoxEmitFrom.Edge)
            {
                var min = Math.min(Math.abs(position.x), Math.abs(position.y), Math.abs(position.z));
                if (Math.abs(position.x) == min)
                {
                    position.y = position.y < 0 ? -1 : 1;
                    position.z = position.z < 0 ? -1 : 1;
                } else if (Math.abs(position.y) == min)
                {
                    position.x = position.x < 0 ? -1 : 1;
                    position.z = position.z < 0 ? -1 : 1;
                } else if (Math.abs(position.z) == min)
                {
                    position.x = position.x < 0 ? -1 : 1;
                    position.y = position.y < 0 ? -1 : 1;
                }
            }

            var scale = 0.5;

            position.x = position.x * this.boxX * scale;
            position.y = position.y * this.boxY * scale;
            position.z = position.z * this.boxZ * scale;

            // 计算速度
            dir.x = 0;
            dir.y = 0;
            dir.z = 1;
        }
    }
}