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
    //特效系统中的发射器都丢在这里
    /**
     * @private
     */
    export class Particles
    {
        public emissionElements: EmissionElement[] = [];//一个特效系统可以有多个发射器元素
        public vf: number = m4m.render.VertexFormatMask.Position | render.VertexFormatMask.Color | render.VertexFormatMask.UV0;//法线切线不要
        public effectSys: effectSystem;
        /**
         * 粒子发射器
         * @param sys 粒子系统
         */
        constructor(sys: effectSystem)
        {
            this.effectSys = sys;
        }
        /**
         * 添加粒子发射
         * @param _emissionNew 特效元素数据
         */
        addEmission(_emissionNew: EffectElementData)
        {
            let _emissionElement = new EmissionElement(_emissionNew, this.effectSys, this);
            this.emissionElements.push(_emissionElement);
        }
        /**
         * 通过发射更新粒子
         * @param delta 
         */
        updateForEmission(delta: number)
        {
            for (let key in this.emissionElements)
            {
                this.emissionElements[key].updateForEmission(delta);
            }
        }
        /**
         * 更新
         * @param delta 
         */
        update(delta: number)
        {
            for (let key in this.emissionElements)
            {
                this.emissionElements[key].update(delta);
            }
        }
        /**
         * 执行渲染
         * @param context   渲染上下文 
         * @param assetmgr 资源管理器
         * @param camera 相机
         */
        render(context: renderContext, assetmgr: assetMgr, camera: m4m.framework.camera)
        {
            for (let key in this.emissionElements)
            {
                this.emissionElements[key].render(context, assetmgr, camera);
            }
        }
        /**
         * 销毁
         */
        dispose()
        {
            for (let key in this.emissionElements)
            {
                this.emissionElements[key].dispose();
            }
            this.emissionElements.length = 0;
        }
    }
    //发射器也作为特效系统的一个元素
    /**
     * @private
     */
    export class EmissionElement
    {
        public webgl: WebGL2RenderingContext;
        public gameObject: gameObject;
        public effectSys: effectSystem;
        public ParticleMgr: Particles;
        public vf: number;
        public emissionData: Emission;//原始数据，不能被改变

        //-------静态属性----------------------------
        private maxVertexCount: number = 2048;//batcher 最大定点数
        //-------原属性
        private localtranslate: m4m.math.vector3 = new m4m.math.vector3();
        private localScale: m4m.math.vector3 = new m4m.math.vector3(1, 1, 1);
        private localrotate: m4m.math.quaternion = new m4m.math.quaternion();
        private eluerAngle: m4m.math.vector3 = new m4m.math.quaternion();

        private beloop: boolean = false;
        public simulateInLocalSpace: boolean = true;//粒子运动运动空间（世界还是本地）
        public active: boolean = true;//激活状态
        // private delayTime: number = 0;
        //---------衍生属性---------------------------
        // private delayFlag: boolean = false;
        private _continueSpaceTime: number;
        public perVertexCount: number;//单个粒子的顶点数
        public perIndexxCount: number;

        //---------------运行逻辑---------------------------------------
        public emissionBatchers: EmissionBatcher[];//一个发射器可能有多个batcher 需要有一个管理机制
        private curbatcher: EmissionBatcher;
        public deadParticles: Particle[];

        private curTime: number;
        private numcount: number;
        private isover: boolean = false;
        //-----------------------------------------------------------------
        /**
         * 粒子
         * @param _emission 发射器数据
         * @param sys 特效系统
         * @param mgr 粒子管理器
         */
        constructor(_emission: EffectElementData, sys: effectSystem, mgr: Particles)
        {
            this.webgl = m4m.framework.sceneMgr.app.webgl;
            this.effectSys = sys;
            this.ParticleMgr = mgr;
            this.vf = mgr.vf;
            this.gameObject = mgr.effectSys.gameObject;

            this.beloop = _emission.beloop;
            this.emissionData = _emission.emissionData;
            // this.delayTime = _emission.delayTime;
            // if (this.delayTime > 0)
            // {
            //     this.delayFlag = true;
            // }
            this.perVertexCount = this.emissionData.mesh.data.getVertexCount();
            this.perIndexxCount = this.emissionData.mesh.data.getTriIndexCount();
            this.simulateInLocalSpace = this.emissionData.simulateInLocalSpace;
            switch (this.emissionData.emissionType)
            {
                case ParticleEmissionType.burst:
                    break;
                case ParticleEmissionType.continue:
                    this._continueSpaceTime = this.emissionData.time / (this.emissionData.emissionCount);
                    break;
            }
            m4m.math.vec3Clone(this.emissionData.rootpos, this.localtranslate);
            m4m.math.vec3Clone(this.emissionData.rootRotAngle, this.eluerAngle);
            m4m.math.vec3Clone(this.emissionData.rootScale, this.localScale);
            m4m.math.quatFromEulerAngles(this.eluerAngle.x, this.eluerAngle.y, this.eluerAngle.z, this.localrotate);
            m4m.math.matrixMakeTransformRTS(this.localtranslate, this.localScale, this.localrotate, this.matToBatcher);

            this.emissionBatchers = [];
            this.deadParticles = [];
            this.curTime = 0;
            this.numcount = 0;
            this.addBatcher();
        }

        private worldRotation: m4m.math.quaternion = new m4m.math.quaternion();
        getWorldRotation(): m4m.math.quaternion
        {
            var parRot = this.gameObject.transform.getWorldRotate();
            m4m.math.quatMultiply(parRot, this.localrotate, this.worldRotation);
            return this.worldRotation;
        }

        matToBatcher: m4m.math.matrix = new m4m.math.matrix();
        private matToWorld: m4m.math.matrix = new m4m.math.matrix();

        public getmatrixToWorld(): m4m.math.matrix
        {
            var mat = this.gameObject.transform.getWorldMatrix();
            m4m.math.matrixMultiply(mat, this.matToBatcher, this.matToWorld);
            return this.matToWorld;
        }

        public update(delta: number)
        {
            //this.curTime += delta;
            // if (this.delayTime != undefined && this.curTime < this.delayTime)
            // {
            //     return;
            // } else
            // {
            //     this.curTime = this.curTime - this.delayTime;
            // }
            //this.updateEmission(delta);
            this.updateBatcher(delta);
        }

        private testtime:number=0;
        public updateForEmission(delta: number)
        {
            this.testtime+=delta;
            this.curTime += delta;
            this.updateEmission(delta);
        }


        updateBatcher(delta: number)
        {
            for (let key in this.emissionBatchers)
            {
                this.emissionBatchers[key].update(delta);
            }
        }

        updateEmission(delta: number)
        {
            if (this.isover) return;
            //detal为 0.01699995994567871  造成短短时间发射大量粒子困难(0.1 发射50)至少需要detal<=0.002,按照detal为0.0169需要0.8左右的时间才能发射完，于是不能deta仅发射一个粒子。
            //改为按照时间比例发射粒子
            if (this.emissionData.emissionType == ParticleEmissionType.continue)
            {
                // if (this.numcount == 0) 
                // {
                //     this.addParticle();
                //     this.numcount++;
                // }
                // console.log("curtime:"+this.curTime.toString()+"//detaltime:"+delta.toString());

                // if (this.curTime > this._continueSpaceTime)
                // {
                //     if (this.numcount < this.emissionData.emissionCount)
                //     {
                //         console.log("addparticle  toteltime:"+this.testtime.toString()+"    //curnumber:"+this.numcount.toString());
                //         this.addParticle();
                //         this.curTime = 0;
                //         this.numcount++;
                //     }
                //     else
                //     {
                //         if (this.beloop)
                //         {
                //             this.curTime = 0;
                //             this.numcount = 0;
                //             this.isover = false;
                //         } else
                //         {
                //             this.isover = true;
                //         }
                //     }
                // }

                var rate=this.curTime/this.emissionData.time;
                rate=m4m.math.floatClamp(rate,0,1);
                var needCount=Math.floor(rate*this.emissionData.emissionCount);
                needCount=needCount-this.numcount;
                for(var i=0;i<needCount;i++)
                {
                    this.addParticle();
                    this.numcount++;
                }
                if(rate==1)
                {
                    if (this.beloop)
                    {
                        this.curTime = 0;
                        this.numcount = 0;
                        this.isover = false;
                    } else
                    {
                        this.isover = true;
                    }
                }

            }
            else if (this.emissionData.emissionType == ParticleEmissionType.burst)
            {
                if (this.curTime > this.emissionData.time)
                {
                    this.addParticle(this.emissionData.emissionCount);
                    if (this.beloop)
                    {
                        this.curTime = 0;
                        this.isover = false;
                    } else
                    {
                        this.isover = true;
                    }
                }
            }
        }

        addParticle(count: number = 1)
        {
            for (var i = 0; i < count; i++)
            {
                if (this.deadParticles.length > 0)
                {
                    var particle = this.deadParticles.pop();
                    particle.initByData();
                    particle.update(0);
                    particle.actived = true;
                }
                else
                {
                    var total = this.curbatcher.curVerCount + this.perVertexCount;
                    if (total <= this.maxVertexCount)
                    {
                        this.curbatcher.addParticle();
                    }
                    else
                    {
                        this.addBatcher();
                        this.curbatcher.addParticle();
                    }
                }
            }
        }

        private addBatcher()
        {
            var batcher = new EmissionBatcher(this);
            this.emissionBatchers.push(batcher);
            this.curbatcher = batcher;
        }

        renderCamera:camera;
        render(context: renderContext, assetmgr: assetMgr, camera: m4m.framework.camera)
        {
            this.renderCamera=camera;
            if (this.simulateInLocalSpace)
            {
                context.updateModel(this.gameObject.transform);
            }
            else
            {
                context.updateModeTrail();
            }
            for (let key in this.emissionBatchers)
            {
                this.emissionBatchers[key].render(context, assetmgr, camera);
            }
        }
        dispose()
        {
            for (let key in this.emissionBatchers)
            {
                this.emissionBatchers[key].dispose();
            }
            this.emissionBatchers.length = 0;
        }
        public isOver(): boolean
        {
            return this.isover;
        }
    }

}