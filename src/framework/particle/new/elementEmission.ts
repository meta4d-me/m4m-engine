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
    @m4m.reflect.SerializeType
    export class EffectElementEmission implements IEffectElement
    {
        //---------------------------private hierachy---------------------------------------------------------
        public webgl: WebGL2RenderingContext;
        public gameObject: gameObject;
        public effectSys: TestEffectSystem;
        public active: boolean = true;//激活状态
        //-------静态属性----------------------------
        public vf: number=m4m.render.VertexFormatMask.Position | render.VertexFormatMask.Color | render.VertexFormatMask.UV0;//法线切线不要
        private maxVertexCount: number = 2048;//batcher 最大定点数

        //------------------------------------show  in hierachy--------------------------------------------------
        //----------------root
        rotTranslate: m4m.math.vector3 = new m4m.math.vector3();
        rotScale: m4m.math.vector3 = new m4m.math.vector3(1, 1, 1);
        rotRotation: m4m.math.vector3 = new m4m.math.vector3();
        private rotQuta: m4m.math.quaternion = new m4m.math.quaternion();
        //----------------
        name: string;
        elementType: EffectElementTypeEnum = EffectElementTypeEnum.EmissionType;//singlemesh,emission....
        delayTime: number=0;
        beloop: boolean=true;

        lifeTime: NumberData=new NumberData(5);
        simulateInLocalSpace: boolean = true;//粒子运动运动空间（世界还是本地)
        startScale:Vector3Data=new Vector3Data(1,1,1);
        startEuler:Vector3Data=new Vector3Data();
        startColor:math.color=new math.color(1,1,1,1);
        colorRate:number=1;
        //----------------emision
        duration: NumberData=new NumberData();
        emissionCount: NumberData=new NumberData();
        // emitRate:NumberData=new NumberData();
        // burst:{[time:number]:number};
        emissionType: ParticleEmissionType=ParticleEmissionType.burst;

        //----------------emission shape
        shapeType:ParticleSystemShape=ParticleSystemShape.NORMAL;
        simulationSpeed:NumberData=new NumberData();
        //box---/width/height/depth
        width:number;
        height:number;
        depth:number;
        //sphere---/radius/
        radius:number;
        //hemisphere---/radius/
        //cone---/angle/radius/height/emitfrom
        angle:number;
        emitFrom:emitfromenum=emitfromenum.base;
        //----------------render
        rendermodel:RenderModel=RenderModel.BillBoard;
        
        mat: material;
        mesh: m4m.framework.mesh;//仅在rendermodel为mesh的时候显示     

        //----------------------------------------可选类型-----------------------------------------------------------
        //-----------------position over lifetime
        enableVelocityOverLifetime=false;
        moveSpeed:Vector3Data;
        //-----------------scale over lifetime
        enableSizeOverLifetime=false;
        sizeNodes:NumberKey[];
        //-----------------rot over lifetime
        enableRotOverLifeTime=false;
        angleSpeed:NumberData;
        //-----------------color over lifetime
        enableColorOverLifetime=false;
        colorNodes:Vector3Key[];
        //-----------------alpha over lifetime
        alphaNodes:NumberKey[];
        //-----------------texture animation
        enableTexAnimation=false;
        uvType:UVTypeEnum=UVTypeEnum.NONE;
        //uvroll---/uspeed/vspeed
        uSpeed:number;
        vSpeed:number;
        //UVSprite---/row/column/count
        row:number;
        column:number;
        count:number;
        //------------------------------------show  in hierachy--------------------------------------------------//

        //---------衍生属性---------------------------
        private _continueSpaceTime: number;
        public perVertexCount: number;//单个粒子的顶点数
        public perIndexxCount: number;
        public vertexSize:number;

        //---------------运行逻辑---------------------------------------
        public emissionBatchers: EmissionBatcher_new[];//一个发射器可能有多个batcher 需要有一个管理机制
        private curbatcher: EmissionBatcher_new;
        public deadParticles: Particle_new[];

        private curTime: number;
        private beBurst:boolean=false;
        private numcount: number;
        private beover: boolean = false;
        //-----------------------------------------------------------------
        /**
         * 特效元素发射器
         * @param sys test特效系统
         * @param data 特效数据
         */
        constructor(sys: TestEffectSystem,data:EffectElementData=null)
        {
            this.webgl = m4m.framework.sceneMgr.app.webgl;
            this.effectSys = sys;
            this.gameObject = sys.gameObject;
            this.vertexSize = m4m.render.meshData.calcByteSize(this.vf) / 4;
            if(data==null)
            {
                this.initDefparticleData();
            }
            else
            {
                this.initByEmissonData(data);
            }

            this.perVertexCount = this.mesh.data.getVertexCount();
            this.perIndexxCount = this.mesh.data.getTriIndexCount();

            if(this.emissionType==ParticleEmissionType.continue)
            {
                this._continueSpaceTime = this.duration.getValue() / this.emissionCount.getValue();
            }
            this.getmatrixToObj();

            this.emissionBatchers = [];
            this.deadParticles = [];
            this.curTime = 0;
            this.numcount = 0;

            this.addBatcher();
        }
        /**
         * 初始化 设置默认值粒子数据
         */
        private initDefparticleData()
        {
            //emissiontype
            this.duration.setValue(2.0);
            this.emissionCount.setValue(10);
            //emissionShape
            this.shapeType=ParticleSystemShape.CONE;
            this.simulationSpeed.setValue(0.1);
            this.radius=1.0;
            this.angle=45;
            this.height=1.0;
            //render
            this.mat=sceneMgr.app.getAssetMgr().getDefParticleMat();
            this.mesh=sceneMgr.app.getAssetMgr().getDefaultMesh("quad");
        }
        /**
         * 初始化发射数据
         * @param data 数据
         */
        private initByEmissonData(data:EffectElementData)
        {

        }

        private worldRotation: m4m.math.quaternion = new m4m.math.quaternion();
        /**
         * 获取世界旋转
         * @returns 旋转四元数
         */
        getWorldRotation(): m4m.math.quaternion
        {
            var parRot = this.gameObject.transform.getWorldRotate();
            m4m.math.quatMultiply(parRot, this.rotQuta, this.worldRotation);
            return this.worldRotation;
        }

        matToObj: m4m.math.matrix = new m4m.math.matrix();
        private matToWorld: m4m.math.matrix = new m4m.math.matrix();
        /**
         * 计算 转到 Object 空间的 矩阵
         */
        public getmatrixToObj()//-----------------------------------------------------------------------------------------------------改变pos.rot.scale
        {
            m4m.math.quatFromEulerAngles(this.rotRotation.x, this.rotRotation.y, this.rotRotation.z, this.rotQuta);
            m4m.math.matrixMakeTransformRTS(this.rotTranslate, this.rotScale, this.rotQuta, this.matToObj);
        }

        /**
         *   计算 转到 世界 空间的 矩阵
         * @returns 矩阵
         */
        public getmatrixToWorld(): m4m.math.matrix
        {
            var mat = this.gameObject.transform.getWorldMatrix();
            m4m.math.matrixMultiply(mat, this.matToObj, this.matToWorld);
            return this.matToWorld;
        }

        /** 更新 */
        public update(delta: number)
        {
            this.updateLife(delta);
            this.updateBatcher(delta);
        }

        /**
         * 更新 合批
         * @param delta 
         */
        private updateBatcher(delta: number)
        {
            for (let key in this.emissionBatchers)
            {
                this.emissionBatchers[key].update(delta);
            }
        }

        /**
         * 更新 发射粒子生命周期
         * @param delta 
         * @returns 
         */
        private updateLife(delta: number)
        {
            if (this.beover) return;
            this.curTime += delta;
            //--------------update in Livelife-------------------
            this.updateEmission();

            if(this.curTime>this.lifeTime.getValue())
            {
                if(this.beloop)
                {
                    this.reInit();
                }
                else
                {
                    this.beover=true;
                }
            }
        }

        /**
         * 重新初始化
         */
        private reInit()
        {
            this.beover=false;
            this.curTime=0;
            this.beBurst=false;
        }

        /**
         * 更新粒子发射
         */
        private updateEmission()
        {
            if (this.emissionType == ParticleEmissionType.continue)
            {
                var rate=this.curTime/this.duration.getValue();
                rate=m4m.math.floatClamp(rate,0,1);
                var needCount=Math.floor(rate*this.emissionCount.getValue());
                needCount=needCount-this.numcount;
                for(var i=0;i<needCount;i++)
                {
                    this.addParticle();
                    this.numcount++;
                }
            }
            else if (this.emissionType == ParticleEmissionType.burst&&!this.beBurst)
            {
                this.addParticle(this.emissionCount.getValue());
                this.beBurst=true;
            }
        }

        /**
         * 添加粒子
         * @param count 数量
         */
        private addParticle(count: number = 1)
        {
            for (var i = 0; i < count; i++) 
            {
                if (this.deadParticles.length > 0)
                {
                    var particle = this.deadParticles.pop();
                    particle.initByData();
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

        /**
         * 添加合批
         */
        private addBatcher()
        {
            var batcher = new EmissionBatcher_new(this);
            this.emissionBatchers.push(batcher);
            this.curbatcher = batcher;
        }

        private _renderCamera:camera;
        public get renderCamera():camera
        {
            if(this._renderCamera!=null)
            {
                return this._renderCamera;
            }else
            {
                return m4m.framework.sceneMgr.app.getScene().mainCamera;
            }
        }
        /**
         * 执行渲染
         * @param context 渲染上下文
         * @param assetmgr 资源管理器
         * @param camera 相机
         */
        render(context: renderContext, assetmgr: assetMgr, camera: m4m.framework.camera)
        {
            this._renderCamera=camera;
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

        /**
         * 销毁
         */
        dispose()
        {
            for (let key in this.emissionBatchers)
            {
                this.emissionBatchers[key].dispose();
            }
            this.emissionBatchers.length = 0;
        }

        vbo:Float32Array;
        private ebo:Uint16Array;
        /**
         * 获取mesh
         * @returns mesh
         */
        private getMesh()
        {
            if(this.rendermodel==RenderModel.Mesh)
            {
                return this.mesh;
            }else if(this.rendermodel==RenderModel.StretchedBillBoard)
            {
                this.mesh=m4m.framework.sceneMgr.app.getAssetMgr().getDefaultMesh("quad_particle");
            }else
            {
                this.mesh=m4m.framework.sceneMgr.app.getAssetMgr().getDefaultMesh("quad");
            }
        }
        /**
         * 克隆mesh 的vBO
         * @returns 
         */
        cloneMeshVBO()
        {
            if(this.vbo==null)
            {
                this.vbo=this.mesh.data.genVertexDataArray(this.vf);
            }
            return new Float32Array(this.vbo);
        }
        /**
         * 克隆mesh 的EBO
         * @returns 
         */
        cloneMeshEBO()
        {
            if(this.ebo==null)
            {
                this.ebo=this.mesh.data.genIndexDataArray() as Uint16Array;
            }
            return new Uint16Array(this.ebo);
        }

        /**
         * 写成json数据
         * @param obj 
         */
        writeToJson(obj: any) {
            throw new Error("Method not implemented.");
        }
    }

}    
