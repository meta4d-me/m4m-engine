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
    export interface ComponentMap { ParticleSystem: ParticleSystem }

    export interface GameObjectEventMap
    {
        /**
         * 粒子效果播放结束
         */
        particleCompleted: ParticleSystem;
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * ui事件
     * @version m4m 1.0
     */
    export class ParticleSystemEvent extends AEvent
    {
        On<K extends keyof GameObjectEventMap>(event: K, func: (args: GameObjectEventMap[K]) => void, thisArg: any)
        {
            super.On(event, func, thisArg);
        }

        /**
         * 移除事件监听者
         * @param event 事件类型
         * @param func 事件触发回调方法
         * @param thisArg 回调方法执行者
         */
        Off<K extends keyof GameObjectEventMap>(event: K, func: (args: GameObjectEventMap[K]) => void, thisArg: any)
        {
            super.RemoveListener(event, func, thisArg);
        }

        Emit<K extends keyof GameObjectEventMap>(event: K, args: GameObjectEventMap[K])
        {
            super.Emit(event, args);
        }
    }

    /**
     * 粒子系统
     * 
     * @author feng3d
     */
    @reflect.nodeRender
    @reflect.nodeComponent
    export class ParticleSystem implements IRenderer
    {
        static readonly ClassName: string = "particlesystem";

        __class__: "m4m.framework.ParticleSystem";

        layer: RenderLayerEnum = RenderLayerEnum.Transparent;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 渲染层级
         * @version m4m 1.0
         */
        //renderLayer: CullingMask = CullingMask.default;
        get renderLayer() { return this.gameObject.layer; }
        set renderLayer(layer: number)
        {
            this.gameObject.layer = layer;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 同场景渲染层级时候先后排序依据
         * @version m4m 1.0
         */
        queue: number = 0;

        /**
         * Biases Particle System sorting amongst other transparencies.
         * 
         * Use lower (negative) numbers to prioritize the Particle System to draw closer to the front, and use higher numbers to prioritize other transparent objects.
         */
        sortingFudge = 0;

        /**
         * 参考Unity ParticleSystemRenderer.pivot
         * 
         * Modify the pivot point used for rotating particles.
         * 
         * The units are expressed as a multiplier of the particle sizes, relative to their diameters. For example, a value of 0.5 adjusts the pivot by the particle radius, allowing particles to rotate around their edges.
         */
        pivot = new math.vector3(0, 0, 0);

        get transform()
        {
            return this.gameObject && this.gameObject.transform;
        }

        /**
         * Is the particle system playing right now ?
         * 
         * 粒子系统正在运行吗?
         */
        get isPlaying()
        {
            return this._isPlaying;
        }
        private _isPlaying = false;

        /**
         * Is the particle system stopped right now ?
         * 
         * 粒子系统现在停止了吗?
         */
        get isStopped()
        {
            return !this._isPlaying && this.time == 0;
        }

        /**
         * Is the particle system paused right now ?
         * 
         * 粒子系统现在暂停了吗?
         */
        get isPaused()
        {
            return !this._isPlaying && this.time != 0;
        }

        /**
         * The current number of particles (Read Only).
         * 
         * 当前粒子数(只读)。
         */
        get particleCount()
        {
            return this._activeParticles.length;
        }

        /**
         * Playback position in seconds.
         * 
         * 回放位置(秒)
         */
        time = 0;

        get main() { return this._main; }
        set main(v)
        {
            ArrayUtil.replace(this._modules, this._main, v);
            v.particleSystem = this;
            this._main = v;
        }
        private _main: ParticleMainModule;

        get emission() { return this._emission; }
        set emission(v)
        {
            ArrayUtil.replace(this._modules, this._emission, v);
            v.particleSystem = this;
            this._emission = v;
        }
        private _emission: ParticleEmissionModule;

        get shape() { return this._shape; }
        set shape(v)
        {
            ArrayUtil.replace(this._modules, this._shape, v);
            v.particleSystem = this;
            this._shape = v;
        }
        private _shape: ParticleShapeModule;

        get velocityOverLifetime() { return this._velocityOverLifetime; }
        set velocityOverLifetime(v)
        {
            ArrayUtil.replace(this._modules, this._velocityOverLifetime, v);
            v.particleSystem = this;
            this._velocityOverLifetime = v;
        }
        private _velocityOverLifetime: ParticleVelocityOverLifetimeModule;

        get limitVelocityOverLifetime() { return this._limitVelocityOverLifetime; }
        set limitVelocityOverLifetime(v)
        {
            ArrayUtil.replace(this._modules, this._limitVelocityOverLifetime, v);
            v.particleSystem = this;
            this._limitVelocityOverLifetime = v;
        }
        private _limitVelocityOverLifetime: ParticleLimitVelocityOverLifetimeModule;

        /**
         * Script interface for the Particle System velocity inheritance module.
         * 
         * 粒子系统速度继承模块。
         */
        get inheritVelocity() { return this._inheritVelocity; }
        set inheritVelocity(v)
        {
            ArrayUtil.replace(this._modules, this._inheritVelocity, v);
            v.particleSystem = this;
            this._inheritVelocity = v;
        }
        private _inheritVelocity: ParticleInheritVelocityModule;

        get forceOverLifetime() { return this._forceOverLifetime; }
        set forceOverLifetime(v)
        {
            ArrayUtil.replace(this._modules, this._forceOverLifetime, v);
            v.particleSystem = this;
            this._forceOverLifetime = v;
        }
        private _forceOverLifetime: ParticleForceOverLifetimeModule;

        get colorOverLifetime() { return this._colorOverLifetime; }
        set colorOverLifetime(v)
        {
            ArrayUtil.replace(this._modules, this._colorOverLifetime, v);
            v.particleSystem = this;
            this._colorOverLifetime = v;
        }
        private _colorOverLifetime: ParticleColorOverLifetimeModule;

        /**
         * 颜色随速度变化模块。
         */
        get colorBySpeed() { return this._colorBySpeed; }
        set colorBySpeed(v)
        {
            ArrayUtil.replace(this._modules, this._colorBySpeed, v);
            v.particleSystem = this;
            this._colorBySpeed = v;
        }
        private _colorBySpeed: ParticleColorBySpeedModule;

        get sizeOverLifetime() { return this._sizeOverLifetime; }
        set sizeOverLifetime(v)
        {
            ArrayUtil.replace(this._modules, this._sizeOverLifetime, v);
            v.particleSystem = this;
            this._sizeOverLifetime = v;
        }
        private _sizeOverLifetime: ParticleSizeOverLifetimeModule;

        /**
         * 缩放随速度变化模块
         */
        get sizeBySpeed() { return this._sizeBySpeed; }
        set sizeBySpeed(v)
        {
            ArrayUtil.replace(this._modules, this._sizeBySpeed, v);
            v.particleSystem = this;
            this._sizeBySpeed = v;
        }
        private _sizeBySpeed: ParticleSizeBySpeedModule;

        get rotationOverLifetime() { return this._rotationOverLifetime; }
        set rotationOverLifetime(v)
        {
            ArrayUtil.replace(this._modules, this._rotationOverLifetime, v);
            v.particleSystem = this;
            this._rotationOverLifetime = v;
        }
        private _rotationOverLifetime: ParticleRotationOverLifetimeModule;

        /**
         * 旋转角度随速度变化模块
         */
        get rotationBySpeed() { return this._rotationBySpeed; }
        set rotationBySpeed(v)
        {
            ArrayUtil.replace(this._modules, this._rotationBySpeed, v);
            v.particleSystem = this;
            this._rotationBySpeed = v;
        }
        private _rotationBySpeed: ParticleRotationBySpeedModule;

        /**
         * 旋转角度随速度变化模块
         */
        get noise() { return this._noise; }
        set noise(v)
        {
            ArrayUtil.replace(this._modules, this._noise, v);
            v.particleSystem = this;
            this._noise = v;
        }
        private _noise: ParticleNoiseModule;

        /**
         * 粒子系统纹理表动画模块。
         */
        get textureSheetAnimation() { return this._textureSheetAnimation; }
        set textureSheetAnimation(v)
        {
            ArrayUtil.replace(this._modules, this._textureSheetAnimation, v);
            v.particleSystem = this;
            this._textureSheetAnimation = v;
        }
        private _textureSheetAnimation: ParticleTextureSheetAnimationModule;

        private _mesh: mesh;
        private _meshAABB: aabb;

        //本意mesh filter 可以弄一点 模型处理，比如lod
        //先直进直出吧
        /**
         * @private
         */
        @m4m.reflect.Field("mesh")
        @m4m.reflect.UIStyle("WidgetDragSelect")
        get mesh()
        {
            return this._mesh;
        }
        /**
        * @public
        * @language zh_CN
        * @param mesh 此组件的mesh
        * @classdesc
        * 设置mesh数据
        * @version m4m 1.0
        */
        set mesh(mesh: mesh)
        {
            if (this._mesh != null)
            {
                this._mesh.unuse();
            }
            this._mesh = mesh;
            this._meshAABB = this._mesh.data.getAABB();
            if (this._mesh != null)
            {
                this._mesh.use();
            }
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * mesh的材质数组
         * @version m4m 1.0
         */
        @m4m.reflect.Field("material")
        material: material;

        get single() { return true; }

        /**
         * Start delay in seconds.
         * 启动延迟(以秒为单位)。在调用.play()时初始化值。
         */
        startDelay = 0;

        @m4m.reflect.Field("ParticleSystemData")
        get particleSystemData()
        {
            return this._particleSystemData;
        }

        set particleSystemData(v)
        {
            var data = ParticleSystemData.get(v.value);
            if (data.objectData)
            {
                serialization.setValue(this, data.objectData);
            } else
            {
                data.particleSystem = this;
            }
            this._particleSystemData = data;
        }
        private _particleSystemData: ParticleSystemData;

        /**
         * 用于处理事件的监听与派发
         */
        private aEvent = new ParticleSystemEvent();

        /**
        * 添加UI事件监听者
        * @param eventEnum 事件类型
        * @param func 事件触发回调方法 (Warn: 不要使用 func.bind() , 它会导致相等判断失败)
        * @param thisArg 回调方法执行者
        */
        addListener<K extends keyof GameObjectEventMap>(event: K, func: (args: GameObjectEventMap[K]) => void, thisArg: any)
        {
            this.aEvent.On(event, func, thisArg);
        }

        /**
         * 移除事件监听者
         * @param event 事件类型
         * @param func 事件触发回调方法
         * @param thisArg 回调方法执行者
         */
        removeListener<K extends keyof GameObjectEventMap>(event: K, func: (args: GameObjectEventMap[K]) => void, thisArg: any)
        {
            this.aEvent.Off(event, func, thisArg);
        }

        onPlay()
        {

        }

        start()
        {
            if (!this._mesh)
            {
                this._mesh = sceneMgr.app.getAssetMgr().getDefaultMesh(m4m.framework.defMesh.quad);
                this._meshAABB = this._mesh.data.getAABB();
            }

            if (!this.material)
            {
                this.material = sceneMgr.app.getAssetMgr().getDefParticleMat();
            }
        }

        remove()
        {
            console.warn(`未实现 ParticleSystem  remove`);
            // throw "未实现";
        }

        clone()
        {
            console.warn(`未实现 ParticleSystem  clone`);
            //throw "未实现";
        }

        gameObject: gameObject;
        /**
         * 粒子系统
         */
        constructor()
        {
            this.main = new ParticleMainModule();
            this.emission = new ParticleEmissionModule();
            this.shape = new ParticleShapeModule();
            this.velocityOverLifetime = new ParticleVelocityOverLifetimeModule();
            this.inheritVelocity = new ParticleInheritVelocityModule();
            this.forceOverLifetime = new ParticleForceOverLifetimeModule();
            this.limitVelocityOverLifetime = new ParticleLimitVelocityOverLifetimeModule();
            this.colorOverLifetime = new ParticleColorOverLifetimeModule();
            this.colorBySpeed = new ParticleColorBySpeedModule();
            this.sizeOverLifetime = new ParticleSizeOverLifetimeModule();
            this.sizeBySpeed = new ParticleSizeBySpeedModule();
            this.rotationOverLifetime = new ParticleRotationOverLifetimeModule();
            this.rotationBySpeed = new ParticleRotationBySpeedModule();
            this.noise = new ParticleNoiseModule();
            this.textureSheetAnimation = new ParticleTextureSheetAnimationModule();

            this.main.enabled = true;
            this.emission.enabled = true;
            this.shape.enabled = true;
        }

        update(interval: number)
        {
            if (!this.isPlaying) return;

            math.matrixClone(this.transform.getWorldMatrix(), this.localToWorldMatrix);
            math.matrixInverse(this.localToWorldMatrix, this.worldToLocalMatrix);

            this.time = this.time + this.main.simulationSpeed * interval;
            this._realTime = this.time - this.startDelay;
            // 粒子系统位置
            math.matrixGetTranslation(this.localToWorldMatrix, this.worldPos);
            // 粒子系统位移
            this.moveVec.x = this.worldPos.x - this._preworldPos.x;
            this.moveVec.y = this.worldPos.y - this._preworldPos.y;
            this.moveVec.z = this.worldPos.z - this._preworldPos.z;
            // 粒子系统速度
            this.speed.x = this.moveVec.x / (this.main.simulationSpeed * interval);
            this.speed.y = this.moveVec.y / (this.main.simulationSpeed * interval);
            this.speed.z = this.moveVec.z / (this.main.simulationSpeed * interval);

            this._updateActiveParticlesState();

            // 完成一个循环
            if (this.main.loop && Math.floor(this._preRealTime / this.main.duration) < Math.floor(this._realTime / this.main.duration))
            {
                // 重新计算喷发概率
                this.emission.bursts.forEach(element =>
                {
                    element.calculateProbability();
                });
            }

            this._emit();

            this._preRealTime = this._realTime;
            this._preworldPos.x = this.worldPos.x;
            this._preworldPos.y = this.worldPos.y;
            this._preworldPos.z = this.worldPos.z;

            // 判断非循环的效果是否播放结束
            if (!this.main.loop && this._activeParticles.length == 0 && this._realTime > this.main.duration)
            {
                this.stop();
                this.aEvent.Emit("particleCompleted", this);
            }
        }

        /**
         * 停止
         */
        stop()
        {
            this._isPlaying = false;
            this.time = 0;

            this._particlePool = this._particlePool.concat(this._activeParticles);
            this._activeParticles.length = 0;
        }

        /**
         * 播放
         */
        play()
        {
            this._isPlaying = true;
            this.time = 0;
            this._startDelay_rate = Math.random();
            this.updateStartDelay();
            this._preRealTime = 0;

            this._particlePool = this._particlePool.concat(this._activeParticles);
            this._activeParticles.length = 0;

            this._preworldPos.x = this.worldPos.x;
            this._preworldPos.y = this.worldPos.y;
            this._preworldPos.z = this.worldPos.z;

            this._isRateOverDistance = false;
            this._leftRateOverDistance = 0;

            // 重新计算喷发概率
            this.emission.bursts.forEach(element =>
            {
                element.calculateProbability();
            });
        }

        private _startDelay_rate = Math.random();

        /**
         * 更新开始延迟
         */
        updateStartDelay()
        {
            this.startDelay = this.main.startDelay.getValue(this._startDelay_rate);
        }

        /**
         * 暂停
         */
        pause()
        {
            this._isPlaying = false;
        }

        /**
         * 继续
         */
        continue()
        {
            if (this.time == 0)
            {
                this.play();
            } else
            {
                this._isPlaying = true;
                this._preRealTime = Math.max(0, this._realTime);
            }
        }

        render(context: renderContext, assetmgr: assetMgr, camera: camera)
        {
            math.matrixClone(this.transform.getWorldMatrix(), this.localToWorldMatrix);
            math.matrixInverse(this.localToWorldMatrix, this.worldToLocalMatrix);

            if (!this._awaked)
            {
                this._isPlaying = this._isPlaying || this.main.playOnAwake;
                this._awaked = true;
            }

            if (this.particleCount < 1) return;

            DrawCallInfo.inc.currentState = DrawCallEnum.EffectSystem;
            let go = this.gameObject;
            let tran = go.transform;

            context.updateLightMask(go.layer);
            context.updateModel(tran);
            if (!this.material) return;
            let mesh = this.mesh;
            if (mesh == null || mesh.glMesh == null || mesh.submesh == null) return;
            let subMeshs = mesh.submesh;
            if (subMeshs == null) return;

            // mesh.glMesh.bindVboBuffer(context.webgl);

            // 获取批量渲染扩展
            var isSupportDrawInstancedArrays = !!context.webgl.drawArraysInstanced;
            // isSupportDrawInstancedArrays = false;

            // 计算公告牌矩阵
            var isbillboard = !this.shape.alignToDirection && this.mesh == sceneMgr.app.getAssetMgr().getDefaultMesh(m4m.framework.defMesh.quad);
            var billboardMatrix = new math.matrix();
            if (isbillboard)
            {
                //
                var cameraForward = new math.vector3();
                var cameraUp = new math.vector3();
                camera.gameObject.transform.getForwardInWorld(cameraForward);
                camera.gameObject.transform.getUpInWorld(cameraUp);
                if (this.main.simulationSpace == ParticleSystemSimulationSpace.Local)
                {
                    math.matrixTransformNormal(cameraForward, this.worldToLocalMatrix, cameraForward);
                    math.matrixTransformNormal(cameraUp, this.worldToLocalMatrix, cameraUp);
                }

                math.matrixLookat(new math.vector3(), cameraForward, cameraUp, billboardMatrix);
            }

            this.material.setMatrix("u_particle_billboardMatrix", billboardMatrix);

            // 计算中心点偏移
            var pivotOffset = new math.vector4(
                this.pivot.x * (this._meshAABB.maximum.x - this._meshAABB.minimum.x),
                -this.pivot.z * (this._meshAABB.maximum.y - this._meshAABB.minimum.y),
                this.pivot.y * (this._meshAABB.maximum.z - this._meshAABB.minimum.z),
                0
            );
            this.material.setVector4("u_particle_pivotOffset", pivotOffset);

            if (this.main.simulationSpace == ParticleSystemSimulationSpace.World)
            {
                m4m.math.matrixClone(context.matrixViewProject, context.matrixModelViewProject);
            }
            if (!isSupportDrawInstancedArrays)
            {
                for (let i = 0, n = this._activeParticles.length; i < n; i++)
                {
                    var particle = this._activeParticles[i];

                    this.material.setVector4("a_particle_position", new math.vector4(particle.position.x, particle.position.y, particle.position.z, 1));
                    this.material.setVector4("a_particle_scale", new math.vector4(particle.size.x, particle.size.y, particle.size.z, 1));
                    this.material.setVector4("a_particle_rotation", new math.vector4(particle.rotation.x, particle.rotation.y, (isbillboard ? -1 : 1) * particle.rotation.z, 1));
                    this.material.setVector4("a_particle_color", new math.vector4(particle.color.r, particle.color.g, particle.color.b, particle.color.a));
                    this.material.setVector4("a_particle_tilingOffset", new math.vector4(particle.tilingOffset.x, particle.tilingOffset.y, particle.tilingOffset.z, particle.tilingOffset.w));
                    this.material.setVector4("a_particle_flipUV", new math.vector4(particle.flipUV.x, particle.flipUV.y, 0, 0));

                    this.material.draw(context, mesh, subMeshs[0]);
                }
            } else
            {
                var data: number[] = [];
                for (let i = 0, n = this._activeParticles.length; i < n; i++)
                {
                    var particle = this._activeParticles[i];

                    data.push(
                        particle.position.x, particle.position.y, particle.position.z, 1,
                        particle.size.x, particle.size.y, particle.size.z, 1,
                        particle.rotation.x, particle.rotation.y, (isbillboard ? -1 : 1) * particle.rotation.z, 1,
                        particle.color.r, particle.color.g, particle.color.b, particle.color.a,
                        particle.tilingOffset.x, particle.tilingOffset.y, particle.tilingOffset.z, particle.tilingOffset.w,
                        particle.flipUV.x, particle.flipUV.y, 0, 0,
                    );

                }

                var stride = this._attributes.reduce((pv, cv) => pv += cv[1], 0) * 4;
                if (isSupportDrawInstancedArrays && this.particleCount > 0)
                {
                    var vbo = this._getVBO(context.webgl);

                    var drawInstanceInfo: DrawInstanceInfo = {
                        instanceCount: this.particleCount,
                        initBuffer: (gl) =>
                        {
                            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
                            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
                        },
                        activeAttributes: (gl, pass , mat: material) =>
                        {
                            let program = pass.program.program;
                            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

                            var offset = 0;
                            this._attributes.forEach(element =>
                            {
                                var location = gl.getAttribLocation(program, element[0]);
                                if (location == -1) return;

                                gl.enableVertexAttribArray(location);
                                gl.vertexAttribPointer(location, element[1], gl.FLOAT, false, stride, offset);
                                gl.vertexAttribDivisor(location, 1);
                                offset += element[1] * 4;

                            });
                        },
                        disableAttributes: (gl, pass) =>
                        {
                            let program = pass.program.program;
                            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

                            this._attributes.forEach(element =>
                            {
                                var location = gl.getAttribLocation(program, element[0]);
                                if (location == -1) return;

                                gl.vertexAttribDivisor(location, 0);
                                gl.disableVertexAttribArray(location);
                            });
                        },
                    };

                    let drawtype = meshRenderer.instanceDrawType();
                    this.material.draw(context, mesh, subMeshs[0], drawtype, drawInstanceInfo);
                }
            }
        }

        private _vbos: [WebGL2RenderingContext, WebGLBuffer][] = [];
        /**
         * 获取VBO
         * @param gl webgl上下文 
         * @returns webgl buffer
         */
        private _getVBO(gl: WebGL2RenderingContext)
        {
            for (let i = 0, n = this._vbos.length; i < n; i++)
            {
                if (this._vbos[i][0] == gl)
                    return this._vbos[i][1];
            }
            var vbo = gl.createBuffer();
            this._vbos.push([gl, vbo]);
            return vbo;
        }

        private _attributes: [string, number][] = [
            ["a_particle_position", 4],
            ["a_particle_scale", 4],
            ["a_particle_rotation", 4],
            ["a_particle_color", 4],
            ["a_particle_tilingOffset", 4],
            ["a_particle_flipUV", 4],
        ];

        private _awaked = false;

        /**
         * 当前真实时间（time - startDelay）
         */
        private _realTime = 0;
        /**
         * 上次真实时间
         */
        private _preRealTime = 0;

        /**
         * 粒子池，用于存放未发射或者死亡粒子
         */
        private _particlePool: Particle1[] = [];
        /**
         * 活跃的粒子列表
         */
        private _activeParticles: Particle1[] = [];

        private readonly _modules: ParticleModule[] = [];

        /**
         * 此时在周期中的位置
         */
        get rateAtDuration()
        {
            return (this._realTime % this.main.duration) / this.main.duration;
        }

        /**
         * 发射粒子
         * @param time 当前粒子时间
         */
        private _emit()
        {
            if (!this.emission.enabled) return;

            // 判断是否达到最大粒子数量
            if (this._activeParticles.length >= this.main.maxParticles) return;

            // 判断是否开始发射
            if (this._realTime <= 0) return;

            var loop = this.main.loop;
            var duration = this.main.duration;
            var rateAtDuration = this.rateAtDuration;
            var preRealTime = this._preRealTime;

            // 判断是否结束发射
            if (!loop && preRealTime >= duration) return;

            // 计算最后发射时间
            var realEmitTime = this._realTime;
            if (!loop) realEmitTime = Math.min(realEmitTime, duration);

            // 
            var emits: { time: number, num: number, position?: math.vector3 }[] = [];
            // 单粒子发射周期
            var step = 1 / this.emission.rateOverTime.getValue(rateAtDuration);
            var bursts = this.emission.bursts;
            // 处理移动发射粒子
            if (this.main.simulationSpace == ParticleSystemSimulationSpace.World)
            {
                if (this._isRateOverDistance)
                {
                    var moveVec = this.moveVec;
                    var worldPos = this.worldPos;
                    // 本次移动距离
                    if (math.vec3SqrLength(moveVec) > 0)
                    {
                        // 移动方向
                        var moveDir = new math.vector3(moveVec.x, moveVec.y, moveVec.z);
                        math.vec3Normalize(moveDir, moveDir);
                        // 剩余移动量
                        var leftRateOverDistance = this._leftRateOverDistance + math.vec3Length(moveVec);
                        // 发射频率
                        var rateOverDistance = this.emission.rateOverDistance.getValue(rateAtDuration);
                        // 发射间隔距离
                        var invRateOverDistance = 1 / rateOverDistance;
                        // 发射间隔位移
                        var invRateOverDistanceVec = new math.vector3(moveDir.x / rateOverDistance, moveDir.y / rateOverDistance, moveDir.z / rateOverDistance);
                        // 上次发射位置
                        var lastRateOverDistance = new math.vector3(
                            this._preworldPos.x - moveDir.x * this._leftRateOverDistance,
                            this._preworldPos.y - moveDir.y * this._leftRateOverDistance,
                            this._preworldPos.z - moveDir.z * this._leftRateOverDistance,
                        );
                        // 发射位置列表
                        var emitPosArr: math.vector3[] = [];
                        while (invRateOverDistance < leftRateOverDistance)
                        {
                            emitPosArr.push(new math.vector3(
                                lastRateOverDistance.x + invRateOverDistanceVec.x,
                                lastRateOverDistance.y + invRateOverDistanceVec.y,
                                lastRateOverDistance.z + invRateOverDistanceVec.z,
                            ));

                            leftRateOverDistance -= invRateOverDistance;
                        }
                        this._leftRateOverDistance = leftRateOverDistance;
                        emitPosArr.forEach(p =>
                        {
                            emits.push({ time: this.time, num: 1, position: new math.vector3(p.x - worldPos.x, p.y - worldPos.y, p.z - worldPos.z) });
                        });
                    }
                }
                this._isRateOverDistance = true;
            } else
            {
                this._isRateOverDistance = false;
                this._leftRateOverDistance = 0;
            }

            // 遍历所有发射周期
            var cycleStartIndex = Math.floor(preRealTime / duration);
            var cycleEndIndex = Math.ceil(realEmitTime / duration);
            for (let k = cycleStartIndex; k < cycleEndIndex; k++)
            {
                var cycleStartTime = k * duration;
                var cycleEndTime = (k + 1) * duration;

                // 单个周期内的起始与结束时间
                var startTime = Math.max(preRealTime, cycleStartTime);
                var endTime = Math.min(realEmitTime, cycleEndTime);

                // 处理稳定发射
                var singleStart = Math.ceil(startTime / step) * step;
                for (var i = singleStart; i < endTime; i += step)
                {
                    emits.push({ time: i, num: 1 });
                }

                // 处理喷发
                var inCycleStart = startTime - cycleStartTime;
                var inCycleEnd = endTime - cycleStartTime;
                for (let i = 0; i < bursts.length; i++)
                {
                    const burst = bursts[i];
                    if (burst.isProbability && inCycleStart <= burst.time && burst.time < inCycleEnd)
                    {
                        emits.push({ time: cycleStartTime + burst.time, num: burst.count.getValue(rateAtDuration) });
                    }
                }
            }

            emits.sort((a, b) => { return a.time - b.time });;

            emits.forEach(v =>
            {
                this._emitParticles(v);
            });
        }

        /**
         * 发射粒子
         * @param birthTime 发射时间
         * @param num 发射数量
         */
        private _emitParticles(v: { time: number; num: number; position?: math.vector3; })
        {
            var rateAtDuration = this.rateAtDuration;
            var num = v.num;
            var birthTime = v.time;
            var position = v.position || new math.vector3();
            for (let i = 0; i < num; i++)
            {
                if (this._activeParticles.length >= this.main.maxParticles) return;
                var lifetime = this.main.startLifetime.getValue(rateAtDuration);
                var birthRateAtDuration = (birthTime - this.startDelay) / this.main.duration;
                var rateAtLifeTime = (this._realTime - birthTime) / lifetime;

                if (rateAtLifeTime < 1)
                {
                    var particle = this._particlePool.pop() || new Particle1();
                    particle.cache = {};
                    particle.position.x = position.x;
                    particle.position.y = position.y;
                    particle.position.z = position.z;
                    particle.birthTime = birthTime;
                    particle.lifetime = lifetime;
                    particle.rateAtLifeTime = rateAtLifeTime;
                    //
                    particle.birthRateAtDuration = birthRateAtDuration - Math.floor(birthRateAtDuration);

                    this._activeParticles.push(particle);
                    this._initParticleState(particle);
                    this._updateParticleState(particle);
                }
            }
        }

        /**
         * 更新活跃粒子状态
         */
        private _updateActiveParticlesState()
        {
            for (let i = this._activeParticles.length - 1; i >= 0; i--)
            {
                var particle = this._activeParticles[i];
                particle.rateAtLifeTime = (this._realTime - particle.birthTime) / particle.lifetime;
                if (particle.rateAtLifeTime < 0 || particle.rateAtLifeTime > 1)
                {
                    this._activeParticles.splice(i, 1);
                    this._particlePool.push(particle);
                } else
                {
                    this._updateParticleState(particle);
                }
            }
        }

        /**
         * 初始化粒子状态
         * @param particle 粒子
         */
        private _initParticleState(particle: Particle1)
        {
            this._modules.forEach(v => { v.initParticleState(particle) });
        }

        /**
         * 更新粒子状态
         * @param particle 粒子
         */
        private _updateParticleState(particle: Particle1)
        {
            var preTime = Math.max(this._preRealTime, particle.birthTime);
            //
            this._modules.forEach(v => { v.updateParticleState(particle) });
            particle.updateState(preTime, this._realTime);
        }

        /**
         * 模拟形状改变
         */
        _simulationSpaceChanged()
        {
            if (!this.transform) return;
            if (this._activeParticles.length == 0) return;

            if (this._main.simulationSpace == ParticleSystemSimulationSpace.Local)
            {
                var worldToLocalMatrix = this.worldToLocalMatrix;
                this._activeParticles.forEach(p =>
                {
                    math.matrixTransformVector3(p.position, worldToLocalMatrix, p.position);
                    math.matrixTransformNormal(p.velocity, worldToLocalMatrix, p.velocity);
                    math.matrixTransformNormal(p.acceleration, worldToLocalMatrix, p.acceleration);
                });
            } else
            {
                var localToWorldMatrix = this.localToWorldMatrix;
                this._activeParticles.forEach(p =>
                {
                    math.matrixTransformVector3(p.position, localToWorldMatrix, p.position);
                    math.matrixTransformNormal(p.velocity, localToWorldMatrix, p.velocity);
                    math.matrixTransformNormal(p.acceleration, localToWorldMatrix, p.acceleration);
                });
            }
        }

        /**
         * 给指定粒子添加指定空间的位移。
         * 
         * @param particle 粒子。
         * @param position 速度。
         * @param space 速度所在空间。
         * @param name  速度名称。如果不为 undefined 时保存，调用 removeParticleVelocity 可以移除该部分速度。
         */
        addParticlePosition(particle: Particle1, position: math.vector3, space: ParticleSystemSimulationSpace, name?: string)
        {
            if (name != undefined)
            {
                this.removeParticleVelocity(particle, name);
                particle.cache[name] = { value: new math.vector3(position.x, position.y, position.z), space: space };
            }

            if (space != this.main.simulationSpace)
            {
                if (space == ParticleSystemSimulationSpace.World)
                {
                    math.matrixTransformVector3(position, this.worldToLocalMatrix, position);
                } else
                {
                    math.matrixTransformVector3(position, this.localToWorldMatrix, position);
                }
            }
            //
            particle.position.x += position.x;
            particle.position.y += position.y;
            particle.position.z += position.z;
        }

        /**
         * 移除指定粒子上的位移
         * 
         * @param particle 粒子。
         * @param name 位移名称。
         */
        removeParticlePosition(particle: Particle1, name: string)
        {
            var obj: { value: math.vector3, space: ParticleSystemSimulationSpace } = particle.cache[name];
            if (obj)
            {
                delete particle.cache[name];

                var space = obj.space;
                var value = obj.value;
                if (space != this.main.simulationSpace)
                {
                    if (space == ParticleSystemSimulationSpace.World)
                    {
                        math.matrixTransformVector3(value, this.worldToLocalMatrix, value);
                    } else
                    {
                        math.matrixTransformVector3(value, this.localToWorldMatrix, value);
                    }
                }
                //
                particle.position.x -= value.x;
                particle.position.y -= value.y;
                particle.position.z -= value.z;
            }
        }

        /**
         * 给指定粒子添加指定空间的速度。
         * 
         * @param particle 粒子。
         * @param velocity 速度。
         * @param space 速度所在空间。
         * @param name  速度名称。如果不为 undefined 时保存，调用 removeParticleVelocity 可以移除该部分速度。
         */
        addParticleVelocity(particle: Particle1, velocity: math.vector3, space: ParticleSystemSimulationSpace, name?: string)
        {
            if (name != undefined)
            {
                this.removeParticleVelocity(particle, name);
                particle.cache[name] = { value: new math.vector3(velocity.x, velocity.y, velocity.z), space: space };
            }

            if (space != this.main.simulationSpace)
            {
                if (space == ParticleSystemSimulationSpace.World)
                {
                    math.matrixTransformNormal(velocity, this.worldToLocalMatrix, velocity);
                } else
                {
                    math.matrixTransformNormal(velocity, this.localToWorldMatrix, velocity);
                }
            }
            //
            particle.velocity.x += velocity.x;
            particle.velocity.y += velocity.y;
            particle.velocity.z += velocity.z;
        }

        /**
         * 移除指定粒子上的速度
         * 
         * @param particle 粒子。
         * @param name 速度名称。
         */
        removeParticleVelocity(particle: Particle1, name: string)
        {
            var obj: { value: math.vector3, space: ParticleSystemSimulationSpace } = particle.cache[name];
            if (obj)
            {
                delete particle.cache[name];

                var space = obj.space;
                var value = obj.value;
                if (space != this.main.simulationSpace)
                {
                    if (space == ParticleSystemSimulationSpace.World)
                    {
                        math.matrixTransformNormal(value, this.worldToLocalMatrix, value);
                    } else
                    {
                        math.matrixTransformNormal(value, this.localToWorldMatrix, value);
                    }
                }
                //
                particle.velocity.x -= value.x;
                particle.velocity.y -= value.y;
                particle.velocity.z -= value.z;
            }
        }

        /**
         * 给指定粒子添加指定空间的速度。
         * 
         * @param particle 粒子。
         * @param acceleration 加速度。
         * @param space 加速度所在空间。
         * @param name  加速度名称。如果不为 undefined 时保存，调用 removeParticleVelocity 可以移除该部分速度。
         */
        addParticleAcceleration(particle: Particle1, acceleration: math.vector3, space: ParticleSystemSimulationSpace, name?: string)
        {
            if (name != undefined)
            {
                this.removeParticleAcceleration(particle, name);
                particle.cache[name] = { value: new math.vector3(acceleration.x, acceleration.y, acceleration.z), space: space };
            }

            if (space != this.main.simulationSpace)
            {
                if (space == ParticleSystemSimulationSpace.World)
                {
                    math.matrixTransformNormal(acceleration, this.worldToLocalMatrix, acceleration);
                } else
                {
                    math.matrixTransformNormal(acceleration, this.localToWorldMatrix, acceleration);
                }
            }
            //
            particle.acceleration.x += acceleration.x;
            particle.acceleration.y += acceleration.y;
            particle.acceleration.z += acceleration.z;
        }

        /**
         * 移除指定粒子上的加速度
         * 
         * @param particle 粒子。
         * @param name 加速度名称。
         */
        removeParticleAcceleration(particle: Particle1, name: string)
        {
            var obj: { value: math.vector3, space: ParticleSystemSimulationSpace } = particle.cache[name];
            if (obj)
            {
                delete particle.cache[name];

                var space = obj.space;
                var value = obj.value;
                if (space != this.main.simulationSpace)
                {
                    if (space == ParticleSystemSimulationSpace.World)
                    {
                        math.matrixTransformNormal(value, this.worldToLocalMatrix, value);
                    } else
                    {
                        math.matrixTransformNormal(value, this.localToWorldMatrix, value);
                    }
                }
                //
                particle.acceleration.x -= value.x;
                particle.acceleration.y -= value.y;
                particle.acceleration.z -= value.z;
            }
        }

        /**
         * 上次移动发射的位置
         */
        private _preworldPos = new math.vector3();
        private _isRateOverDistance = false;
        private _leftRateOverDistance = 0;
        //
        worldPos = new math.vector3();
        moveVec = new math.vector3();
        speed = new math.vector3();

        //
        localToWorldMatrix = new math.matrix();
        worldToLocalMatrix = new math.matrix();
    }
}