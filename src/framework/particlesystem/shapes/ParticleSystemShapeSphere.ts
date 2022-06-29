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
     * 从球体的体积中发射。
     * 
     * @author feng3d
     */
    export class ParticleSystemShapeSphere extends ParticleSystemShapeBase
    {
        /**
         * 球体半径
         */
        get radius()
        {
            return this._module.radius;
        }

        set radius(v)
        {
            this._module.radius = v;
        }

        /**
         * 是否从球面发射
         */
        emitFromShell = false;

        /**
         * 计算粒子的发射位置与方向
         * 
         * @param particle 
         * @param position 
         * @param dir 
         */
        calcParticlePosDir(particle: Particle1, position: math.vector3, dir: math.vector3)
        {
            //
            dir.x = Math.random() * 2 - 1;
            dir.y = Math.random() * 2 - 1;
            dir.z = Math.random() * 2 - 1;
            math.vec3Normalize(dir, dir);
            //
            position.x = this.radius * dir.x;
            position.y = this.radius * dir.y;
            position.z = this.radius * dir.z;
            if (!this.emitFromShell)
            {
                var rand = Math.random();
                position.x *= rand;
                position.y *= rand;
                position.z *= rand;
            }
        }
    }

    /**
     * 从半球体的体积中发出。
     */
    export class ParticleSystemShapeHemisphere extends ParticleSystemShapeBase
    {
        radius = 1;

        /**
         * 是否从球面发射
         */
        emitFromShell = false;

        /**
         * 计算粒子的发射位置与方向
         * 
         * @param particle 
         * @param position 
         * @param dir 
         */
        calcParticlePosDir(particle: Particle1, position: math.vector3, dir: math.vector3)
        {
            //
            dir.x = Math.random() * 2 - 1;
            dir.y = Math.random() * 2 - 1;
            dir.z = Math.random() * 2 - 1;

            math.vec3Normalize(dir, dir);
            dir.z = Math.abs(dir.z);

            //
            position.x = this.radius * dir.x;
            position.y = this.radius * dir.y;
            position.z = this.radius * dir.z;
            if (!this.emitFromShell)
            {
                var rand = Math.random();
                position.x *= rand;
                position.y *= rand;
                position.z *= rand;
            }
        }
    }
}