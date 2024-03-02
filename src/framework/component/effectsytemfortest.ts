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
     * @public
     * @language zh_CN
     * @classdesc
     * 特效组件
     * @version m4m 1.0
     */
    @reflect.nodeRender
    @reflect.nodeComponent
    @reflect.selfClone
    export class TestEffectSystem implements IRenderer
    {
        static readonly ClassName:string="TestEffectSystem";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 挂载的gameobject
         * @version m4m 1.0
         */
        gameObject: gameObject;
        layer: RenderLayerEnum = RenderLayerEnum.Transparent;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 渲染层级
         * @version m4m 1.0
         */
        //renderLayer: CullingMask = CullingMask.default;
        get renderLayer() {return this.gameObject.layer;}
        set renderLayer(layer:number){
            this.gameObject.layer = layer;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 同层级渲染排序依据
         * @version m4m 1.0
         */
        queue: number = 0;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 自动播放
         * @version m4m 1.0
         */
        @m4m.reflect.Field("boolean")
        autoplay: boolean = true;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 特效是否循环
         * @version m4m 1.0
         */
        @m4m.reflect.Field("boolean")
        beLoop: boolean;
        /**
        * @private
        */
        state: EffectPlayStateEnum = EffectPlayStateEnum.None;
        private curFrameId: number = -1;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 特效播放速度
         * @version m4m 1.0
         */
        public static fps: number = 30;
        private playTimer: number = 0;
        private speed: number = 1;
        /**
        * @private
        */
        public webgl: WebGL2RenderingContext;
        // private time: number = 0;

        private parser = new m4m.framework.EffectParser();
        /**
        * @private
        */
        public vf = m4m.render.VertexFormatMask.Position | render.VertexFormatMask.Normal | render.VertexFormatMask.Tangent | render.VertexFormatMask.Color | render.VertexFormatMask.UV0;
        /**
        * @private
        */
        //public particleVF=m4m.render.VertexFormatMask.Position | render.VertexFormatMask.Color | render.VertexFormatMask.UV0;//法线切线不要

        private emissionElement:EffectElementEmission[];

        private effectBatchers: EffectBatcher[] = [];
        private particles: Particles;//粒子系统 发射器统一管理
        private matDataGroups: EffectMatData[] = [];
        private particleElementDic: { [name: string]: EffectElementData } = {};

        /**
        * @private
        */
        @m4m.reflect.Field("textasset")
        jsonData: textasset;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 设置特效数据 textasset
         * @version m4m 1.0
         */
        setJsonData(_jsonData: textasset)
        {
            this.webgl = m4m.framework.sceneMgr.app.webgl;
            this.jsonData = _jsonData;
            this.data = this.parser.Parse(this.jsonData.content, m4m.framework.sceneMgr.app.getAssetMgr());
        }
        /**
        * @private
        */
        set data(value: EffectSystemData)
        {
            this._data = value;
        }
        /**
        * @private
        */
        get data(): EffectSystemData
        {
            return this._data;
        }
        /**
        * 初始化
        */
        init()
        {
            if (this._data)
            {
                this.addElements();
            }
        }
        private _data: EffectSystemData;
        /**
        * @private
        */
        get totalFrameCount(): number
        {
            return this.data.life * effectSystem.fps;
        }

        start()
        {
            this.init();
        }

        onPlay()
        {

        }


        update(delta: number)
        {
            if (this.gameObject.getScene() == null || this.gameObject.getScene() == undefined)
                return;
            if (this.state == EffectPlayStateEnum.Play || this.state == EffectPlayStateEnum.Pause)
            {
                if (this.state == EffectPlayStateEnum.Play)
                    this.playTimer += delta * this.speed;
                if (!this.beLoop)
                {
                    if (this.playTimer >= this.data.life)
                    {
                        this.stop();
                    }
                }
                this._update(delta);
            }
            else if (this.state == EffectPlayStateEnum.BeReady)
            {
                if (this.autoplay)
                {
                    this.play();
                    this._update(delta);
                }
                else
                {
                    this.gameObject.visible = false;
                    this.gameObject.transform.markDirty();
                }
            }
        }

        /**
         * 更新特效数据
         * 
         * @private
         * @param {number} delta 
         * 
         * @memberof effectSystem
         */
        private _update(delta: number)
        {
            if (this.delayElements.length > 0)
            {
                if (this.refElements.length > 0)
                    this.refElements = [];
                for (let i = this.delayElements.length - 1; i >= 0; i--)
                {
                    let data = this.delayElements[i];
                    if (data.delayTime <= this.playTimer)
                    {
                        this.addElement(this.delayElements[i]);
                        this.delayElements.splice(i, 1);
                    }
                }
            }
            if (this.checkFrameId())
            {
                if(this.emissionElement!=null)
                {
                    for(var i=0;i<this.emissionElement.length;i++)
                    {
                        this.emissionElement[i].update(1 / effectSystem.fps);
                    }
                }
            }

        }

        /**
         * 提交各个EffectBatcher中的数据进行渲染
         * 
         * @param {renderContext} context 
         * @param {assetMgr} assetmgr 
         * @param {m4m.framework.camera} camera 
         * 
         * @memberof effectSystem
         */
        render(context: renderContext, assetmgr: assetMgr, camera: m4m.framework.camera)
        {
            if (!(camera.CullingMask & (1 << this.renderLayer))) return;
            if (this.state == EffectPlayStateEnum.Play)
            {
                context.updateModel(this.gameObject.transform);
                // for (let i in this.effectBatchers)
                // {
                //     let subEffectBatcher = this.effectBatchers[i];
                //     let mesh = subEffectBatcher.mesh;
                //     if (subEffectBatcher.state === EffectBatcherState.NotInitedStateType)
                //     {
                //         mesh.glMesh.initBuffer(context.webgl, this.vf, subEffectBatcher.curTotalVertexCount);
                //         if (mesh.glMesh.ebos.length == 0)
                //         {
                //             mesh.glMesh.addIndex(context.webgl, subEffectBatcher.dataForEbo.length);
                //         }
                //         else
                //         {
                //             mesh.glMesh.resetEboSize(context.webgl, 0, subEffectBatcher.dataForEbo.length);
                //         }
                //         mesh.glMesh.uploadIndexSubData(context.webgl, 0, subEffectBatcher.dataForEbo);
                //         mesh.submesh[0].size = subEffectBatcher.dataForEbo.length;
                //         subEffectBatcher.state = EffectBatcherState.InitedStateType;
                //     }
                //     else if (subEffectBatcher.state === EffectBatcherState.ResizeCapacityStateType)
                //     {

                //         mesh.glMesh.resetEboSize(context.webgl, 0, subEffectBatcher.dataForEbo.length);//动态修正掉mesh中的ebo大小
                //         mesh.submesh[0].size = subEffectBatcher.dataForEbo.length;
                //         mesh.glMesh.uploadIndexSubData(context.webgl, 0, subEffectBatcher.dataForEbo);
                //         mesh.glMesh.resetVboSize(context.webgl, subEffectBatcher.curTotalVertexCount * subEffectBatcher.vertexSize);//动态修正mesh中的vbo大小
                //         subEffectBatcher.state = EffectBatcherState.InitedStateType;
                //     }

                //     mesh.glMesh.uploadVertexSubData(context.webgl, subEffectBatcher.dataForVbo);
                //     if (this.gameObject.getScene().fog)
                //     {
                //         context.fog = this.gameObject.getScene().fog;
                //         subEffectBatcher.mat.draw(context, mesh, mesh.submesh[0], "base_fog");//只有一个submesh
                //     } else
                //     {
                //         subEffectBatcher.mat.draw(context, mesh, mesh.submesh[0], "base");//只有一个submesh
                //     }
                // }
                // if (this.particles != undefined)
                // {
                //     this.particles.render(context, assetmgr, camera);
                // }
                if(this.emissionElement!=null)
                {
                    for(var i=0;i<this.emissionElement.length;i++)
                    {
                        this.emissionElement[i].render(context,assetmgr,camera);
                    }
                }
            }
        }
        /**
         * @private
         */
        clone()
        {
            let effect = new effectSystem();
            effect.data = this.data.clone();
            return effect;
        }
        /**
         * @public
         * @language zh_CN
         * @param speed 播放速度
         * @classdesc
         * 播放特效
         * @version m4m 1.0
         */
        play(speed: number = 1)
        {
            this.speed = speed;
            this.state = EffectPlayStateEnum.Play;
            this.gameObject.visible = true;
            this.gameObject.transform.markDirty();
        }
        /**
         * @public
         * @language zh_CN
         * @param speed 播放速度
         * @classdesc
         * 暂停播放
         * @version m4m 1.0
         */
        pause()
        {
            this.state = EffectPlayStateEnum.Pause;
        }
        /**
         * @public
         * @language zh_CN
         * @param speed 播放速度
         * @classdesc
         * 停止播放
         * @version m4m 1.0
         */
        stop()
        {
            this.reset();
            this.state = EffectPlayStateEnum.Stop;
        }
        /**
         * @public
         * @language zh_CN
         * @param speed 播放速度
         * @classdesc
         * 重置到初始状态
         * @version m4m 1.0
         */
        reset(restSinglemesh: boolean = true, resetParticle: boolean = true)
        {
            this.state = EffectPlayStateEnum.BeReady;
            this.gameObject.visible = false;
            this.playTimer = 0;

            this.resetSingleMesh();
            //this.resetparticle();
        }
        private resetSingleMesh()
        {
            for (let i in this.effectBatchers)
            {
                let subEffectBatcher = this.effectBatchers[i];
                for (let key in subEffectBatcher.effectElements)
                {
                    let element = subEffectBatcher.effectElements[key];
                    element.setActive(true);
                    if (element.data.initFrameData != undefined)//引用问题还没处理
                        element.curAttrData = element.data.initFrameData.attrsData.copyandinit();
                }
            }
        }
        // private resetparticle()
        // {
        //     if (this.particles != undefined)
        //         this.particles.dispose();

        //     for (let name in this.particleElementDic)
        //     {
        //         let data = this.data.elementDic[name];
        //         if (data.delayTime > 0)
        //         {
        //             this.delayElements.push(data);
        //             continue;
        //         }
        //         if (data.refFrom == undefined)
        //         {
        //             if (this.particles == undefined)
        //             {
        //                 this.particles = new Particles(this);
        //             }
        //             this.particles.addEmission(data);
        //         } else
        //         {
        //             this.refElements.push(data);
        //         }
        //     }
        // }

        private delayElements: EffectElementData[] = [];
        private refElements: EffectElementData[] = [];
        /**
         * 向特效中增加元素
         */
        private addElements()
        {
            for (let name in this.data.elementDic)
            {
                let data = this.data.elementDic[name];
                if (data.delayTime > 0)
                {
                    this.delayElements.push(data);
                    continue;
                }
                this.addElement(data);
            }
            this.state = EffectPlayStateEnum.BeReady;
            this.beLoop = this.data.beLoop;
        }
        /**
         * 添加特效元素
         * @param data 特效元素数据
         */
        private addElement(data: EffectElementData)
        {
            // if (data.type == EffectElementTypeEnum.EmissionType)
            // {
            //     if (this.particles == undefined)
            //     {
            //         this.particles = new Particles(this);
            //     }
            //     this.particles.addEmission(data);
            //     this.particleElementDic[data.name] = data;
            // }
            // else if (data.type == EffectElementTypeEnum.SingleMeshType)
            // {
            //     this.addInitFrame(data);
            // }
        }

        /**
         * 添加发射特效元素
         * @param data 特效元素数据
         */
        addEmissionElement(data:EffectElementData=null)
        {
            if(this.emissionElement==null)
            {
                this.emissionElement=[];
            }
            var emission=new EffectElementEmission(this,data);
            this.emissionElement.push(emission);
        }


        /**
        * 设置 帧ID
        */
        public setFrameId(id: number)
        {
            if (this.state == EffectPlayStateEnum.Pause && id >= 0 && id < this.totalFrameCount)
                this.curFrameId = id;
        }

        /**
        * 获取 dt * FPS
        */
        public getDelayFrameCount(delayTime: number)
        {
            return delayTime * effectSystem.fps;
        }
        private beExecuteNextFrame: boolean = true;
        /**
         * 计算当前的frameid
         * 
         * @private
         * 
         * @memberof effectSystem
         */
        private checkFrameId(): boolean
        {
            // if(this.state == EffectPlayStateEnum.Pause)
            //     return true;
            let curid = (effectSystem.fps * this.playTimer) | 0;
            if (curid != this.curFrameId)
            {
                if (this.state == EffectPlayStateEnum.Play)
                    this.curFrameId = curid;
                this.beExecuteNextFrame = true;
                return true;
            }
            return false;
        }
      
        remove()
        {
            this.state = EffectPlayStateEnum.Dispose;
            if (this.data)
                this.data.dispose();
            for (let key in this.effectBatchers)
            {
                this.effectBatchers[key].dispose();
            }
            if (this.particles)
                this.particles.dispose();
        }
        /**
        * @private
        * 临时测试时显示使用
        * @readonly
        * @type {number}
        * @memberof effectSystem
        */
        public get leftLifeTime(): number
        {
            if (this.data != null)
            {
                return this.data.life - this.playTimer;
            } else
                return 9999999999;
        }
    }


}
