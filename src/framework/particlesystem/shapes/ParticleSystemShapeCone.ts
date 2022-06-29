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
     * 粒子系统发射圆锥体，用于定义基于圆锥体的粒子发射时的初始状态。
     * 
     * @author feng3d
     */
    export class ParticleSystemShapeCone extends ParticleSystemShapeBase
    {
        /**
         * Angle of the cone.
         * 圆锥的角度。
         */
        get angle()
        {
            return this._module.angle;
        }

        set angle(v)
        {
            this._module.angle = v;
        }

        /**
         * 圆锥体底部半径。
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
         * Length of the cone.
         * 
         * 圆锥的长度（高度）。
         */
        get length()
        {
            return this._module.length;
        }

        set length(v)
        {
            this._module.length = v;
        }

        /**
         * Circle arc angle.
         */
        get arc()
        {
            return this._module.arc;
        }

        set arc(v)
        {
            this._module.arc = v;
        }

        /**
         * The mode used for generating particles around the arc.
         * 在弧线周围产生粒子的模式。
         */
        get arcMode()
        {
            return this._module.arcMode;
        }

        set arcMode(v)
        {
            this._module.arcMode = v;
        }

        /**
         * Control the gap between emission points around the arc.
         * 控制弧线周围发射点之间的间隙。
         */
        get arcSpread()
        {
            return this._module.arcSpread;
        }

        set arcSpread(v)
        {
            this._module.arcSpread = v;
        }

        /**
         * When using one of the animated modes, how quickly to move the emission position around the arc.
         * 当使用一个动画模式时，如何快速移动发射位置周围的弧。
         */
        get arcSpeed()
        {
            return this._module.arcSpeed;
        }

        set arcSpeed(v)
        {
            this._module.arcSpeed = v;
        }

        /**
         * 粒子系统圆锥体发射类型。
         */
        emitFrom = ParticleSystemShapeConeEmitFrom.Base;

        /**
         * 计算粒子的发射位置与方向
         * 
         * @param particle 
         * @param position 
         * @param dir 
         */
        calcParticlePosDir(particle: Particle1, position: math.vector3, dir: math.vector3)
        {
            var radius = this.radius;
            var angle = this.angle;
            var arc = this.arc;
            angle = math.floatClamp(angle, 0, 87);
            // 在圆心的方向
            var radiusAngle = 0;
            if (this.arcMode == ParticleSystemShapeMultiModeValue.Random)
            {
                radiusAngle = Math.random() * arc;
            } else if (this.arcMode == ParticleSystemShapeMultiModeValue.Loop)
            {
                var totalAngle = particle.birthTime * this.arcSpeed.getValue(particle.birthRateAtDuration) * 360;
                radiusAngle = totalAngle % arc;
            } else if (this.arcMode == ParticleSystemShapeMultiModeValue.PingPong)
            {
                var totalAngle = particle.birthTime * this.arcSpeed.getValue(particle.birthRateAtDuration) * 360;
                radiusAngle = totalAngle % arc;
                if (Math.floor(totalAngle / arc) % 2 == 1)
                {
                    radiusAngle = arc - radiusAngle;
                }
            }
            if (this.arcSpread > 0)
            {
                radiusAngle = Math.floor(radiusAngle / arc / this.arcSpread) * arc * this.arcSpread;
            }
            radiusAngle = math.degToRad(radiusAngle);
            // 在圆的位置
            var radiusRate = 1;
            if (this.emitFrom == ParticleSystemShapeConeEmitFrom.Base || this.emitFrom == ParticleSystemShapeConeEmitFrom.Volume)
            {
                radiusRate = Math.random();
            }
            // 在圆的位置
            var basePos = new math.vector3(Math.cos(radiusAngle), Math.sin(radiusAngle), 0);
            // 底面位置
            var bottomPos = new math.vector3(basePos.x * radius * radiusRate, basePos.y * radius * radiusRate, 0);
            // 顶面位置
            var scale = (radius + this.length * Math.tan(math.degToRad(angle))) * radiusRate;
            var topPos = new math.vector3(basePos.x * scale, basePos.y * scale, this.length);

            // 计算方向
            math.vec3Subtract(topPos, bottomPos, dir);
            math.vec3Normalize(dir, dir);
            // 计算位置
            position.x = bottomPos.x;
            position.y = bottomPos.y;
            position.z = bottomPos.z;
            if (this.emitFrom == ParticleSystemShapeConeEmitFrom.Volume || this.emitFrom == ParticleSystemShapeConeEmitFrom.VolumeShell)
            {
                // 上下点进行插值
                math.vec3SLerp(position, topPos, Math.random(), position);
            }
        }
    }
}