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
     * Shape of the emitter volume, which controls where particles are emitted and their initial direction.
     * 发射体体积的形状，它控制粒子发射的位置和初始方向。
     * 
     * @author feng3d
     */
    export class ParticleShapeModule extends ParticleModule
    {
        __class__: "m4m.framework.ParticleShapeModule";
        /**
         * Type of shape to emit particles from.
         * 发射粒子的形状类型。
         */

        get shapeType()
        {
            return this._shapeType;
        }
        set shapeType(v)
        {
            if (this._shapeType == v) return;
            this._shapeType = v;
            this._onShapeTypeChanged();
        }
        private _shapeType: ParticleSystemShapeType;

        /**
         * Type of shape to emit particles from.
         * 发射粒子的形状类型。
         */
        get shape()
        {
            return this._shape;
        }
        set shape(v)
        {
            if (this._shape == v) return;
            this._shape = v;
            this._onShapeChanged();
        }
        private _shape: ParticleSystemShapeType1;

        /**
         * 当前使用的发射形状
         */
        activeShape: ParticleSystemShapeBase;

        /**
         * Align particles based on their initial direction of travel.
         * 根据粒子的初始运动方向排列粒子。
         * 
         * Using align to Direction in the Shape module forces the system to be rendered using Local Billboard Alignment.
         * 在形状模块中使用align to Direction迫使系统使用本地看板对齐方式呈现。
         */

        alignToDirection = false;

        /**
         * Randomizes the starting direction of particles.
         * 随机化粒子的起始方向。
         */

        randomDirectionAmount = 0;

        /**
         * Spherizes the starting direction of particles.
         * 使粒子的起始方向球面化。
         */

        sphericalDirectionAmount = 0;

        /**
         * Angle of the cone.
         * 
         * 圆锥的角度。
         */

        angle = 25;

        /**
         * Circle arc angle.
         * 
         * 圆弧角。
         */

        arc = 360;

        /**
         * The mode used for generating particles around the arc.
         * 
         * 在弧线周围产生粒子的模式。
         */

        arcMode = ParticleSystemShapeMultiModeValue.Random;

        /**
         * When using one of the animated modes, how quickly to move the emission position around the arc.
         * 
         * 当使用一个动画模式时，如何快速移动发射位置周围的弧。
         */

        arcSpeed = serialization.setValue(new MinMaxCurve(), { constant: 1, constantMin: 1, constantMax: 1 });

        /**
         * A multiplier of the arc speed of the emission shape.
         * 
         * 发射形状的电弧速度的乘数。
         */
        get arcSpeedMultiplier()
        {
            return this.arcSpeed.curveMultiplier;
        }

        set arcSpeedMultiplier(v)
        {
            this.arcSpeed.curveMultiplier = v;
        }

        /**
         * Control the gap between emission points around the arc.
         * 
         * 控制弧线周围发射点之间的间隙。
         */

        arcSpread = 0;

        /**
         * Scale of the box.
         * 
         * 盒子的缩放。
         */

        box = new math.vector3(1, 1, 1);

        /**
         * Length of the cone.
         * 
         * 圆锥的长度（高度）。
         */

        length = 5;

        /**
         * Mesh to emit particles from.
         * 
         * 发射粒子的网格。
         * 
         * @todo
         */
        mesh: any;

        /**
         * Emit from a single material, or the whole mesh.
         * 
         * 从一个单一的材料，或整个网格发射。
         * 
         * @todo
         */
        useMeshMaterialIndex: boolean;

        /**
         * Emit particles from a single material of a mesh.
         * 
         * 从一个网格的单一材料发射粒子。
         * 
         * @todo
         */
        meshMaterialIndex: number;

        /**
         * MeshRenderer to emit particles from.
         * 
         * 从 MeshRenderer 发射粒子。
         * 
         * @todo
         */
        // meshRenderer: MeshRenderer
        meshRenderer: any;

        /**
         * SkinnedMeshRenderer to emit particles from.
         * 
         * 从 SkinnedMeshRenderer 发射粒子。
         * 
         * @todo
         */
        skinnedMeshRenderer: any;

        /**
         * Apply a scaling factor to the mesh used for generating source positions.
         * 
         * 对用于生成源位置的网格应用缩放因子。
         * 
         * @todo
         */
        meshScale = 1;

        /**
         * Where on the mesh to emit particles from.
         * 
         * 从网格的什么地方发射粒子。
         * 
         * @todo
         */
        meshShapeType = ParticleSystemMeshShapeType.Vertex;

        /**
         * Modulate the particle colors with the vertex colors, or the material color if no vertex colors exist.
         * 
         * 用顶点颜色调节粒子颜色，如果没有顶点颜色，则调节材质颜色。
         * 
         * @todo
         */
        useMeshColors = true;

        /**
         * Move particles away from the surface of the source mesh.
         * 
         * 将粒子从源网格的表面移开。
         */
        normalOffset = 0;

        /**
         * Radius of the shape.
         * 
         * 形状的半径。
         */

        radius = 1;

        /**
         * The mode used for generating particles around the radius.
         * 
         * 在弧线周围产生粒子的模式。
         */

        radiusMode = ParticleSystemShapeMultiModeValue.Random;

        /**
         * When using one of the animated modes, how quickly to move the emission position along the radius.
         * 
         * 当使用一个动画模式时，如何快速移动发射位置周围的弧。
         */

        radiusSpeed = serialization.setValue(new MinMaxCurve(), { constant: 1, constantMin: 1, constantMax: 1 });

        /**
         * A multiplier of the radius speed of the emission shape.
         * 
         * 发射形状的半径速度的乘法器。
         */
        get radiusSpeedMultiplier()
        {
            return this.radiusSpeed.curveMultiplier;
        }

        set radiusSpeedMultiplier(v)
        {
            this.radiusSpeed.curveMultiplier = v;
        }

        /**
         * Control the gap between emission points around the radius.
         * 
         * 控制弧线周围发射点之间的间隙。
         */

        radiusSpread = 0;

        private _shapeSphere = new ParticleSystemShapeSphere(this);
        private _shapeHemisphere = new ParticleSystemShapeHemisphere(this);
        private _shapeCone = new ParticleSystemShapeCone(this);
        private _shapeBox = new ParticleSystemShapeBox(this);
        private _shapeCircle = new ParticleSystemShapeCircle(this);
        private _shapeEdge = new ParticleSystemShapeEdge(this);
        /**
         * 粒子形状模块
         */
        constructor()
        {
            super();
            this.shapeType = ParticleSystemShapeType.Cone;
        }

        /**
         * 初始化粒子状态
         * @param particle 粒子
         */
        initParticleState(particle: Particle1)
        {
            var startSpeed = this.particleSystem.main.startSpeed.getValue(particle.birthRateAtDuration);
            //
            var position = new math.vector3(0, 0, 0);
            var dir = new math.vector3(0, 0, 1);
            //
            if (this.enabled)
            {
                this.activeShape.calcParticlePosDir(particle, position, dir);
            }
            dir.x *= startSpeed;
            dir.y *= startSpeed;
            dir.z *= startSpeed;
            if (this.particleSystem.main.simulationSpace == ParticleSystemSimulationSpace.World)
            {
                var localToWorldMatrix = this.particleSystem.localToWorldMatrix;

                math.matrixTransformVector3(position, localToWorldMatrix, position);
                math.matrixTransformNormal(dir, localToWorldMatrix, dir);
            }
            particle.position.x += position.x;
            particle.position.y += position.y;
            particle.position.z += position.z;

            particle.velocity.x += dir.x;
            particle.velocity.y += dir.y;
            particle.velocity.z += dir.z;

            if (!this.enabled) return;

            if (this.alignToDirection)
            {
                // 看向矩阵
                var mat = new math.matrix();
                var dir = particle.velocity;
                math.matrixLookatLH(dir, new math.vector3(0, 1, 0), mat);

                // 旋转矩阵
                var mat0 = new math.matrix();
                var rotation = new m4m.math.vector3(particle.rotation.x, particle.rotation.y, particle.rotation.z);
                math.vec3ScaleByNum(rotation, Math.PI / 180, rotation);
                math.matrixMakeEuler(rotation, math.defaultRotationOrder, mat0);

                //
                math.matrixMultiply(mat0, mat, mat0);

                // 获取被变换后的旋转
                math.matrixGetEuler(mat0, math.defaultRotationOrder, rotation);
                math.vec3ScaleByNum(rotation, 180 / Math.PI, rotation);

                //
                particle.rotation.x = rotation.x;
                particle.rotation.y = rotation.y;
                particle.rotation.z = rotation.z;
            }
            var length = math.vec3Length(particle.velocity);
            var velocity = new math.vector3();
            if (this.randomDirectionAmount > 0)
            {
                velocity.x = Math.random() * 2 - 1;
                velocity.y = Math.random() * 2 - 1;
                velocity.z = Math.random() * 2 - 1;
                var len = math.vec3Length(velocity);
                velocity.x = velocity.x / len * length;
                velocity.y = velocity.y / len * length;
                velocity.z = velocity.z / len * length;
                //
                math.vec3SLerp(particle.velocity, velocity, this.randomDirectionAmount, particle.velocity);
                //
                var len = math.vec3Length(particle.velocity);
                particle.velocity.x = particle.velocity.x / len * length;
                particle.velocity.y = particle.velocity.y / len * length;
                particle.velocity.z = particle.velocity.z / len * length;
            }
            if (this.sphericalDirectionAmount > 0)
            {
                velocity.x = particle.position.x;
                velocity.y = particle.position.y;
                velocity.z = particle.position.z;
                var len = math.vec3Length(velocity);
                velocity.x = velocity.x / len * length;
                velocity.y = velocity.y / len * length;
                velocity.z = velocity.z / len * length;
                //
                math.vec3SLerp(particle.velocity, velocity, this.sphericalDirectionAmount, particle.velocity);
                //
                var len = math.vec3Length(particle.velocity);
                particle.velocity.x = particle.velocity.x / len * length;
                particle.velocity.y = particle.velocity.y / len * length;
                particle.velocity.z = particle.velocity.z / len * length;
            }
        }
        
        /**
         * 当形状类型改变
         */
        private _onShapeTypeChanged()
        {
            var preValue = this.activeShape;
            switch (this.shapeType)
            {
                case ParticleSystemShapeType.Sphere:
                    this._shape = ParticleSystemShapeType1.Sphere;
                    this._shapeSphere.emitFromShell = false;
                    this.activeShape = this._shapeSphere;
                    break;
                case ParticleSystemShapeType.SphereShell:
                    this._shape = ParticleSystemShapeType1.Sphere;
                    this._shapeSphere.emitFromShell = true;
                    this.activeShape = this._shapeSphere;
                    break;
                case ParticleSystemShapeType.Hemisphere:
                    this._shape = ParticleSystemShapeType1.Hemisphere;
                    this._shapeHemisphere.emitFromShell = false;
                    this.activeShape = this._shapeHemisphere;
                    break;
                case ParticleSystemShapeType.HemisphereShell:
                    this._shape = ParticleSystemShapeType1.Hemisphere;
                    this._shapeHemisphere.emitFromShell = true;
                    this.activeShape = this._shapeHemisphere;
                    break;
                case ParticleSystemShapeType.Cone:
                    this._shape = ParticleSystemShapeType1.Cone;
                    this._shapeCone.emitFrom = ParticleSystemShapeConeEmitFrom.Base;
                    this.activeShape = this._shapeCone;
                    break;
                case ParticleSystemShapeType.ConeShell:
                    this._shape = ParticleSystemShapeType1.Cone;
                    this._shapeCone.emitFrom = ParticleSystemShapeConeEmitFrom.BaseShell;
                    this.activeShape = this._shapeCone;
                    break;
                case ParticleSystemShapeType.ConeVolume:
                    this._shape = ParticleSystemShapeType1.Cone;
                    this._shapeCone.emitFrom = ParticleSystemShapeConeEmitFrom.Volume;
                    this.activeShape = this._shapeCone;
                    break;
                case ParticleSystemShapeType.ConeVolumeShell:
                    this._shape = ParticleSystemShapeType1.Cone;
                    this._shapeCone.emitFrom = ParticleSystemShapeConeEmitFrom.VolumeShell;
                    this.activeShape = this._shapeCone;
                    break;
                case ParticleSystemShapeType.Box:
                    this._shape = ParticleSystemShapeType1.Box;
                    this._shapeBox.emitFrom = ParticleSystemShapeBoxEmitFrom.Volume;
                    this.activeShape = this._shapeBox;
                    break;
                case ParticleSystemShapeType.BoxShell:
                    this._shape = ParticleSystemShapeType1.Box;
                    this._shapeBox.emitFrom = ParticleSystemShapeBoxEmitFrom.Shell;
                    this.activeShape = this._shapeBox;
                    break;
                case ParticleSystemShapeType.BoxEdge:
                    this._shape = ParticleSystemShapeType1.Box;
                    this._shapeBox.emitFrom = ParticleSystemShapeBoxEmitFrom.Edge;
                    this.activeShape = this._shapeBox;
                    break;
                case ParticleSystemShapeType.Mesh:
                    this._shape = ParticleSystemShapeType1.Mesh;
                    console.warn(`未实现 ParticleSystemShapeType.Mesh`);
                    this.activeShape = null;
                    break;
                case ParticleSystemShapeType.MeshRenderer:
                    this._shape = ParticleSystemShapeType1.MeshRenderer;
                    console.warn(`未实现 ParticleSystemShapeType.Mesh`);
                    this.activeShape = null;
                    break;
                case ParticleSystemShapeType.SkinnedMeshRenderer:
                    this._shape = ParticleSystemShapeType1.SkinnedMeshRenderer;
                    console.warn(`未实现 ParticleSystemShapeType.Mesh`);
                    this.activeShape = null;
                    break;
                case ParticleSystemShapeType.Circle:
                    this._shape = ParticleSystemShapeType1.Circle;
                    this._shapeCircle.emitFromEdge = false;
                    this.activeShape = this._shapeCircle;
                    break;
                case ParticleSystemShapeType.CircleEdge:
                    this._shape = ParticleSystemShapeType1.Circle;
                    this._shapeCircle.emitFromEdge = true;
                    this.activeShape = this._shapeCircle;
                    break;
                case ParticleSystemShapeType.SingleSidedEdge:
                    this._shape = ParticleSystemShapeType1.Edge;
                    this.activeShape = this._shapeEdge;
                    break;
                default:
                    console.warn(`错误 ParticleShapeModule.shapeType 值 ${this.shapeType}`);
                    break;
            }
            serialization.setValue(this.activeShape, preValue);
        }

        /**
         * 当形状改变
         */
        private _onShapeChanged()
        {
            switch (this.shape)
            {
                case ParticleSystemShapeType1.Sphere:
                    this.shapeType = this._shapeSphere.emitFromShell ? ParticleSystemShapeType.SphereShell : ParticleSystemShapeType.Sphere;
                    break;
                case ParticleSystemShapeType1.Hemisphere:
                    this.shapeType = this._shapeHemisphere.emitFromShell ? ParticleSystemShapeType.HemisphereShell : ParticleSystemShapeType.Hemisphere;
                    break;
                case ParticleSystemShapeType1.Cone:
                    switch (this._shapeCone.emitFrom)
                    {
                        case ParticleSystemShapeConeEmitFrom.Base:
                            this.shapeType = ParticleSystemShapeType.Cone;
                            break;
                        case ParticleSystemShapeConeEmitFrom.BaseShell:
                            this.shapeType = ParticleSystemShapeType.ConeShell;
                            break;
                        case ParticleSystemShapeConeEmitFrom.Volume:
                            this.shapeType = ParticleSystemShapeType.ConeVolume;
                            break;
                        case ParticleSystemShapeConeEmitFrom.VolumeShell:
                            this.shapeType = ParticleSystemShapeType.ConeVolumeShell;
                            break;
                        default:
                            console.warn(`错误ParticleSystemShapeCone.emitFrom值 ${this._shapeCone.emitFrom}`);
                            break;
                    }
                    break;
                case ParticleSystemShapeType1.Box:
                    switch (this._shapeBox.emitFrom)
                    {
                        case ParticleSystemShapeBoxEmitFrom.Volume:
                            this.shapeType = ParticleSystemShapeType.Box;
                            break;
                        case ParticleSystemShapeBoxEmitFrom.Shell:
                            this.shapeType = ParticleSystemShapeType.BoxShell;
                            break;
                        case ParticleSystemShapeBoxEmitFrom.Edge:
                            this.shapeType = ParticleSystemShapeType.BoxEdge;
                            break;
                        default:
                            console.warn(`错误ParticleSystemShapeCone.emitFrom值 ${this._shapeCone.emitFrom}`);
                            break;
                    }
                    break;
                case ParticleSystemShapeType1.Mesh:
                    this.shapeType = ParticleSystemShapeType.Mesh;
                    break;
                case ParticleSystemShapeType1.MeshRenderer:
                    this.shapeType = ParticleSystemShapeType.MeshRenderer;
                    break;
                case ParticleSystemShapeType1.SkinnedMeshRenderer:
                    this.shapeType = ParticleSystemShapeType.SkinnedMeshRenderer;
                    break;
                case ParticleSystemShapeType1.Circle:
                    this.shapeType = this._shapeCircle.emitFromEdge ? ParticleSystemShapeType.CircleEdge : ParticleSystemShapeType.Circle;
                    break;
                case ParticleSystemShapeType1.Edge:
                    this.shapeType = ParticleSystemShapeType.SingleSidedEdge;
                    break;
                default:
                    console.warn(`错误 ParticleShapeModule.shape 值 ${this.shape}`);
                    break;
            }
        }
    }

}