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
     * 粒子系统 发射边
     * 
     * @author feng3d
     */
    export class ParticleSystemShapeEdge extends ParticleSystemShapeBase
    {
        /**
         * 边长的一半。
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
         * The mode used for generating particles around the radius.
         * 
         * 在弧线周围产生粒子的模式。
         */
        get radiusMode()
        {
            return this._module.radiusMode;
        }

        set radiusMode(v)
        {
            this._module.radiusMode = v;
        }

        /**
         * Control the gap between emission points around the radius.
         * 
         * 控制弧线周围发射点之间的间隙。
         */
        get radiusSpread()
        {
            return this._module.radiusSpread;
        }

        set radiusSpread(v)
        {
            this._module.radiusSpread = v;
        }

        /**
         * When using one of the animated modes, how quickly to move the emission position around the radius.
         * 
         * 当使用一个动画模式时，如何快速移动发射位置周围的弧。
         */
        get radiusSpeed()
        {
            return this._module.radiusSpeed;
        }

        set radiusSpeed(v)
        {
            this._module.radiusSpeed = v;
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
            var arc = 360 * this.radius;
            // 在圆心的方向
            var radiusAngle = 0;
            if (this.radiusMode == ParticleSystemShapeMultiModeValue.Random)
            {
                radiusAngle = Math.random() * arc;
            } else if (this.radiusMode == ParticleSystemShapeMultiModeValue.Loop)
            {
                var totalAngle = particle.birthTime * this.radiusSpeed.getValue(particle.birthRateAtDuration) * 360;
                radiusAngle = totalAngle % arc;
            } else if (this.radiusMode == ParticleSystemShapeMultiModeValue.PingPong)
            {
                var totalAngle = particle.birthTime * this.radiusSpeed.getValue(particle.birthRateAtDuration) * 360;
                radiusAngle = totalAngle % arc;
                if (Math.floor(totalAngle / arc) % 2 == 1)
                {
                    radiusAngle = arc - radiusAngle;
                }
            }
            if (this.radiusSpread > 0)
            {
                radiusAngle = Math.floor(radiusAngle / arc / this.radiusSpread) * arc * this.radiusSpread;
            }
            radiusAngle = radiusAngle / arc;

            // 计算位置
            dir.x = 0;
            dir.x = 1;
            dir.x = 0;

            position.x = this.radius * (radiusAngle * 2 - 1);
            position.y = 0;
            position.z = 0;
        }
    }
}