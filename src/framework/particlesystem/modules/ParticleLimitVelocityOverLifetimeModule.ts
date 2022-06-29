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
     * Limit Velocity Over Lifetime module.
     * 
     * 基于时间轴限制速度模块。
     * 
     * @author feng3d
     */
    export class ParticleLimitVelocityOverLifetimeModule extends ParticleModule
    {
        __class__: "m4m.framework.ParticleLimitVelocityOverLifetimeModule";

        /**
         * Set the size over lifetime on each axis separately.
         * 
         * 在每个轴上分别设置生命周期内的大小。
         */

        separateAxes = false;

        /**
         * Maximum velocity curve, when not using one curve per axis.
         * 
         * 最大速度曲线，当不使用每轴一个曲线时。
         */

        limit = serialization.setValue(new MinMaxCurve(), { between0And1: true, constant: 1, constantMin: 1, constantMax: 1 });

        /**
         * Maximum velocity.
         * 
         * 最高速度。
         */

        limit3D = serialization.setValue(new MinMaxCurveVector3(), { xCurve: { between0And1: true, constant: 1, constantMin: 1, constantMax: 1 }, yCurve: { between0And1: true, constant: 1, constantMin: 1, constantMax: 1 }, zCurve: { between0And1: true, constant: 1, constantMin: 1, constantMax: 1 } });

        /**
         * Specifies if the velocities are in local space (rotated with the transform) or world space.
         * 
         * 指定速度是在局部空间(与变换一起旋转)还是在世界空间。
         */

        space = ParticleSystemSimulationSpace.Local;

        /**
         * Controls how much the velocity that exceeds the velocity limit should be dampened.
         * 
         * 控制多少速度，超过速度限制应该被抑制。
         */

        dampen = 1;

        /**
         * Change the limit multiplier.
         * 
         * 改变限制乘法因子。
         */
        get limitMultiplier()
        {
            return this.limit.curveMultiplier;
        }

        set limitMultiplier(v)
        {
            this.limit.curveMultiplier = v;
        }

        /**
         * Maximum velocity curve for the X axis.
         * 
         * X轴的最大速度曲线。
         */
        get limitX()
        {
            return this.limit3D.xCurve;
        }

        set limitX(v)
        {
            this.limit3D.xCurve = v;
        }

        /**
         * Change the limit multiplier on the X axis.
         * 
         * 改变X轴上的极限乘法器。
         */
        get limitXMultiplier()
        {
            return this.limit3D.xCurve.curveMultiplier;
        }

        set limitXMultiplier(v)
        {
            this.limit3D.xCurve.curveMultiplier = v;
        }

        /**
         * Maximum velocity curve for the Y axis.
         * 
         * Y轴的最大速度曲线。
         */
        get limitY()
        {
            return this.limit3D.yCurve;
        }

        set limitY(v)
        {
            this.limit3D.yCurve = v;
        }

        /**
         * Change the limit multiplier on the Y axis.
         * 
         * 改变Y轴上的极限乘法器。
         */
        get limitYMultiplier()
        {
            return this.limit3D.yCurve.curveMultiplier;
        }

        set limitYMultiplier(v)
        {
            this.limit3D.yCurve.curveMultiplier = v;
        }

        /**
         * Maximum velocity curve for the Z axis.
         * 
         * Z轴的最大速度曲线。
         */
        get limitZ()
        {
            return this.limit3D.zCurve;
        }

        set limitZ(v)
        {
            this.limit3D.zCurve = v;
        }

        /**
         * Change the limit multiplier on the Z axis.
         * 
         * 更改Z轴上的极限乘法器。
         */
        get limitZMultiplier()
        {
            return this.limit3D.zCurve.curveMultiplier;
        }

        set limitZMultiplier(v)
        {
            this.limit3D.zCurve.curveMultiplier = v;
        }

        /**
         * 初始化粒子状态
         * 
         * @param particle 粒子
         */
        initParticleState(particle: Particle1)
        {
            particle[_LimitVelocityOverLifetime_rate] = Math.random();
        }

        /**
         * 更新粒子状态
         * 
         * @param particle 粒子
         */
        updateParticleState(particle: Particle1)
        {
            if (!this.enabled) return;

            var limit3D = this.limit3D.getValue(particle.rateAtLifeTime, particle[_LimitVelocityOverLifetime_rate]);
            var limit = this.limit.getValue(particle.rateAtLifeTime, particle[_LimitVelocityOverLifetime_rate]);
            var pVelocity = new math.vector3();
            math.vec3Clone(particle.velocity, pVelocity);


            // 计算变换矩阵
            var mat = new math.matrix();
            //
            if (this.space != this.particleSystem.main.simulationSpace)
            {
                if (this.space == ParticleSystemSimulationSpace.World)
                {
                    math.matrixClone(this.particleSystem.localToWorldMatrix, mat);
                } else
                {
                    math.matrixClone(this.particleSystem.worldToLocalMatrix, mat);
                }
            }
            // 变换到现在空间进行限速
            math.matrixTransformNormal(pVelocity, mat, pVelocity);
            if (this.separateAxes)
            {
                pVelocity.x = math.floatClamp(pVelocity.x, -limit3D.x, limit3D.x);
                pVelocity.y = math.floatClamp(pVelocity.y, -limit3D.y, limit3D.y);
                pVelocity.z = math.floatClamp(pVelocity.z, -limit3D.z, limit3D.z);
            } else
            {
                if (math.vec3SqrLength(pVelocity) > limit * limit)
                {
                    math.vec3Normalize(pVelocity, pVelocity);
                    math.vec3ScaleByNum(pVelocity, limit, pVelocity);
                }
            }
            math.matrixInverse(mat, mat);
            // 还原到原空间
            math.matrixTransformNormal(pVelocity, mat, pVelocity);
            // 
            math.vec3SLerp(particle.velocity, pVelocity, this.dampen, particle.velocity);
        }
    }

    var _LimitVelocityOverLifetime_rate = "_LimitVelocityOverLifetime_rate";
}