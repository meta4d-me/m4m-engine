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
namespace m4m.framework {
    /**
     * @private
     */
    export class renderContext {
        /**
         * 渲染上下文
         * @param webgl webgl上下文
         */
        constructor(webgl: WebGL2RenderingContext) {
            this.webgl = webgl;
        }

        drawtype: string;
        webgl: WebGL2RenderingContext;
        viewPortPixel: m4m.math.rect = new m4m.math.rect(0, 0, 0, 0);//像素的viewport
        eyePos: m4m.math.vector4 = new m4m.math.vector4();

        matrixView: m4m.math.matrix = new m4m.math.matrix();
        matrixProject: m4m.math.matrix = new m4m.math.matrix();
        matrixModel: m4m.math.matrix = new m4m.math.matrix();
        private _lastM_IT: m4m.math.matrix = new m4m.math.matrix();
        private _matrixWorld2Object: m4m.math.matrix = new m4m.math.matrix();
        /** M 矩阵的逆矩阵 */
        get matrixWorld2Object() {
            if (!m4m.math.matrixEqual(this._lastM_IT, this.matrixModel, 0)) {
                m4m.math.matrixInverse(this.matrixModel, this._matrixWorld2Object);
                m4m.math.matrixClone(this.matrixModel, this._lastM_IT);
            }
            return this._matrixWorld2Object;
        }
        matrixModelViewProject: m4m.math.matrix = new m4m.math.matrix;

        private _matrixModelView: m4m.math.matrix = new m4m.math.matrix;
        get matrixModelView() {
            m4m.math.matrixMultiply(this.matrixView, this.matrixModel, this._matrixModelView);
            return this._matrixModelView;
        }

        private _matrixInverseModelView: m4m.math.matrix = new m4m.math.matrix;
        private _lastMV_IT: m4m.math.matrix = new m4m.math.matrix;
        /** MV 矩阵的逆转置矩阵 */
        get matrixInverseModelView() {
            // if(!m4m.math.matrixEqual(this._lastMV_IT , this.matrixModelView , 0)){
            m4m.math.matrixInverse(this.matrixModel, this._matrixInverseModelView);
            m4m.math.matrixTranspose(this._matrixInverseModelView, this._matrixInverseModelView);
            // m4m.math.matrixClone(this._matrixInverseModelView ,this._lastMV_IT);
            // }
            return this._matrixInverseModelView;
        }

        matrixViewProject: m4m.math.matrix = new m4m.math.matrix;
        //matrixNormal: m4m.math.matrix = new m4m.math.matrix();
        floatTimer: number = 0;
        //最多8灯，再多不管
        intLightCount: number = 0;
        vec4LightPos: Float32Array = new Float32Array(32);
        vec4LightDir: Float32Array = new Float32Array(32);
        vec4LightColor: Float32Array = new Float32Array(32);
        floatLightRange: Float32Array = new Float32Array(8);
        floatLightIntensity: Float32Array = new Float32Array(8);
        floatLightSpotAngleCos: Float32Array = new Float32Array(8);
        private _intLightCount: number = 0;
        private _lightCullingMask: number[] = [];
        private _vec4LightPos: Float32Array = new Float32Array(32);
        private _vec4LightDir: Float32Array = new Float32Array(32);
        private _vec4LightColor: Float32Array = new Float32Array(32);
        private _floatLightRange: Float32Array = new Float32Array(8);
        private _floatLightIntensity: Float32Array = new Float32Array(8);
        private _floatLightSpotAngleCos: Float32Array = new Float32Array(8);


        lightmap: m4m.framework.texture = null;
        lightmap_01: m4m.framework.texture = null;
        lightmapUV: number = 1;
        lightmapRGBAF16: number = 0;                //是否为RGBA16 纹理，0: 不是 1：是
        lightmapOffset: m4m.math.vector4 = new m4m.math.vector4(1, 1, 0, 0);
        fog: Fog;

        //skin auto uniform
        vec4_bones: Float32Array;
        matrix_bones: Float32Array;
        /**
         * 更新相机
         * @param app 引擎app对象 
         * @param camera 相机
         */
        updateCamera(app: application, camera: camera) {
            // camera.calcViewPortPixel(app, this.viewPortPixel);
            // var asp = this.viewPortPixel.w / this.viewPortPixel.h;
            //update viewport

            // camera.calcViewMatrix(this.matrixView);
            // camera.calcProjectMatrix(asp, this.matrixProject);
            // m4m.math.matrixMultiply(this.matrixProject, this.matrixView, this.matrixViewProject);
            camera.calcViewProjectMatrix(app, this.matrixViewProject, this.matrixView, this.matrixProject);
            this.floatTimer = app.getTotalTime();

            var pso = camera.gameObject.transform.getWorldTranslate();
            this.eyePos.x = pso.x;
            this.eyePos.y = pso.y;
            this.eyePos.z = pso.z;
        }
        /**
         * 更新光源
         * @param lights 光源列表 
         */
        updateLights(lights: light[]) {
            this._intLightCount = lights.length;
            if (this._intLightCount < 1) return;

            this._lightCullingMask.length = 0;
            var dirt = math.pool.new_vector3();
            for (var i = 0, len = lights.length; i < len; i++) {
                this._lightCullingMask.push(lights[i].cullingMask);
                {
                    var pos = lights[i].gameObject.transform.getWorldTranslate();
                    this._vec4LightPos[i * 4 + 0] = pos.x;
                    this._vec4LightPos[i * 4 + 1] = pos.y;
                    this._vec4LightPos[i * 4 + 2] = pos.z;
                    this._vec4LightPos[i * 4 + 3] = lights[i].type == framework.LightTypeEnum.Direction ? 0 : 1;

                    lights[i].gameObject.transform.getForwardInWorld(dirt);
                    this._vec4LightDir[i * 4 + 0] = dirt.x;
                    this._vec4LightDir[i * 4 + 1] = dirt.y;
                    this._vec4LightDir[i * 4 + 2] = dirt.z;
                    this._vec4LightDir[i * 4 + 3] = lights[i].type == framework.LightTypeEnum.Point ? 0 : 1;
                    //dir.w=1 && pos.w=1 表示聚光灯
                    //dir.w=0 && pos.w=1 表示点光源
                    //dir.w=1 && pos.w=0 表示方向光
                    this._floatLightSpotAngleCos[i] = lights[i].spotAngelCos;

                    this._vec4LightColor[i * 4 + 0] = lights[i].color.r;
                    this._vec4LightColor[i * 4 + 1] = lights[i].color.g;
                    this._vec4LightColor[i * 4 + 2] = lights[i].color.b;
                    this._vec4LightColor[i * 4 + 3] = lights[i].color.a;

                    this._floatLightRange[i] = lights[i].range;
                    this._floatLightIntensity[i] = lights[i].intensity;
                }

            }
            math.pool.delete_vector3(dirt);
            //收集灯光参数
        }
        /**
         * 更新 渲染后叠加层(UI、后渲染)
         */
        updateOverlay() {   //可能性优化点 UI 不用乘MVP 矩阵
            //v 特殊
            //m4m.math.matrixMakeIdentity(this.matrixView);//v
            //m4m.math.matrixMakeIdentity(this.matrixProject);//p
            //m4m.math.matrixMultiply(this.matrixProject, this.matrixView, this.matrixViewProject);//vp

            //m4m.math.matrixMakeIdentity(this.matrixModel);//m
            //m4m.math.matrixMultiply(this.matrixView, this.matrixModel, this.matrixModelView);//mv
            //m4m.math.matrixMultiply(this.matrixViewProject, this.matrixModel, this.matrixModelViewProject);//mvp
            m4m.math.matrixMakeIdentity(this.matrixModelViewProject);
        }
        /**
         * 更新模型
         * @param model 模型节点
         */
        updateModel(model: transform) {
            this.updateModelByMatrix(model.getWorldMatrix());
        }
        /**
         * 通过矩阵更新模型
         * @param m_matrix 矩阵
         */
        updateModelByMatrix(m_matrix: m4m.math.matrix) {
            //注意，这tm是个引用
            m4m.math.matrixClone(m_matrix, this.matrixModel);
            m4m.math.matrixMultiply(this.matrixViewProject, this.matrixModel, this.matrixModelViewProject);
        }

        /**
         * 更新模型拖尾 
         */
        updateModeTrail() {
            m4m.math.matrixClone(this.matrixView, this.matrixModelView);
            m4m.math.matrixClone(this.matrixViewProject, this.matrixModelViewProject);
        }

        /**
         * 更新 光照剔除mask
         * @param layer 不剔除的Layer mask
         */
        updateLightMask(layer: number) {
            this.intLightCount = 0;
            if (this._intLightCount == 0) return;
            let num = 1 << layer;
            let indexList: number[] = [];
            for (var i = 0; i < this._lightCullingMask.length; i++) {
                let mask = this._lightCullingMask[i];
                if (mask & num) indexList.push(i);
            }
            this.intLightCount = indexList.length;
            for (var i = 0; i < indexList.length; i++) {
                let idx = indexList[i];
                this.floatLightSpotAngleCos[i] = this._floatLightSpotAngleCos[idx];
                this.floatLightRange[i] = this._floatLightRange[idx];
                this.floatLightIntensity[i] = this._floatLightIntensity[idx];
                //pos
                this.vec4LightPos[i * 4 + 0] = this._vec4LightPos[idx * 4 + 0];
                this.vec4LightPos[i * 4 + 1] = this._vec4LightPos[idx * 4 + 1];
                this.vec4LightPos[i * 4 + 2] = this._vec4LightPos[idx * 4 + 2];
                this.vec4LightPos[i * 4 + 3] = this._vec4LightPos[idx * 4 + 3];
                //dir
                this.vec4LightDir[i * 4 + 0] = this._vec4LightDir[idx * 4 + 0];
                this.vec4LightDir[i * 4 + 1] = this._vec4LightDir[idx * 4 + 1];
                this.vec4LightDir[i * 4 + 2] = this._vec4LightDir[idx * 4 + 2];
                this.vec4LightDir[i * 4 + 3] = this._vec4LightDir[idx * 4 + 3];
                //color
                this.vec4LightColor[i * 4 + 0] = this._vec4LightColor[idx * 4 + 0];
                this.vec4LightColor[i * 4 + 1] = this._vec4LightColor[idx * 4 + 1];
                this.vec4LightColor[i * 4 + 2] = this._vec4LightColor[idx * 4 + 2];
                this.vec4LightColor[i * 4 + 3] = this._vec4LightColor[idx * 4 + 3];
            }
        }
    }
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 渲染的层级
     * @version m4m 1.0
     */
    export enum RenderLayerEnum {
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 不透明
         * @version m4m 1.0
         */
        Common,
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 半透明
         * @version m4m 1.0
         */
        Transparent,
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * Overlay层
         * @version m4m 1.0
         */
        Overlay,
    }
    // /**
    //  * @public
    //  * @language zh_CN
    //  * @classdesc
    //  * 渲染器接口 继承自组件接口
    //  * @version m4m 1.0
    //  */
    // export interface IRenderer extends INodeComponent
    // {
    //     layer: RenderLayerEnum;
    //     renderLayer: number;  //后期发现 和 gameObject.layer 概念冲突 ，实现时 对接处理
    //     queue: number;

    //     render(context: renderContext, assetmgr: assetMgr, camera: m4m.framework.camera);
    // }

    /**
     * @private
     */
    export class renderList {
        /**
         * 渲染列表
         */
        constructor() {
            this.renderLayers = [];
            var common = new renderLayer(false);
            var transparent = new renderLayer(true);
            var overlay = new renderLayer(true);
            this.renderLayers.push(common);
            this.renderLayers.push(transparent);
            this.renderLayers.push(overlay);
        }
        /**
         * 清理列表
         */
        clear() {
            let lys = this.renderLayers;
            for (let i = 0, len = lys.length; i < len; i++) {
                lys[i].list.length = 0;
                let obj = lys[i].gpuInstanceMap;
                for (let key in obj) {
                    // obj[key].clear();
                    obj[key].length = 0;
                }
                // this.renderLayers[i].gpuInstanceMap = {};
            }
        }
        /**
         * 清理合批
         */
        clearBatcher() {
            let lys = this.renderLayers;
            for (let i = 0, len = lys.length; i < len; i++) {
                let obj = lys[i].gpuInstanceBatcherMap;
                for (let key in obj) {
                    obj[key].dispose();
                    delete obj[key];
                }
            }
        }
        /**
         * 添加渲染节点到列表
         * @param renderer 渲染节点
         * @param webgl webgl上下文
         */
        addRenderer(renderer: IRenderer, webgl: WebGL2RenderingContext) {
            var idx = renderer.layer;
            // let layer = renderer.layer;
            // var idx = 0;
            // if (layer == RenderLayerEnum.Common)
            // {
            // }
            // else if (layer == RenderLayerEnum.Overlay)
            // {
            //     idx = 2;
            // }
            // else if (layer == RenderLayerEnum.Transparent)
            // {
            //     idx = 1;
            // }
            let gpuInsR = (renderer as IRendererGpuIns);
            if (!webgl.drawArraysInstanced || !gpuInsR.isGpuInstancing || !gpuInsR.isGpuInstancing()) {
                this.renderLayers[idx].list.push(renderer);
            } else {
                this.renderLayers[idx].addInstance(gpuInsR);
            }
        }
        /**
         * 添加静态GPUInstance 渲染节点
         * @param renderer GPUInstance 渲染节点
         * @param webgl webgl上下文
         * @param isStatic 是静态
         */
        addStaticInstanceRenderer(renderer: IRendererGpuIns, webgl: WebGL2RenderingContext, isStatic: boolean) {
            if (!isStatic) return;
            let go = renderer.gameObject;
            if (!go || !go.transform.needGpuInstancBatcher || !renderer.isGpuInstancing || !renderer.isGpuInstancing()) return;
            let idx = renderer.layer;
            this.renderLayers[idx].addInstanceToBatcher(renderer);
        }


        //此处应该根据绘制分类处理
        renderLayers: renderLayer[];
    }
    /**
     * @private
     */
    export class renderLayer {
        needSort: boolean = false;
        //先暂时分配 透明与不透明两组
        list: IRenderer[] = [];
        /**
         * 渲染层
         * @param _sort 排序？
         */
        constructor(_sort: boolean = false) {
            this.needSort = _sort;
        }

        /** gpu instance map*/
        // gpuInstanceMap: {[sID:string] : IRendererGpuIns[]} = {};
        gpuInstanceMap: { [sID: string]: math.ReuseArray<IRendererGpuIns> } = {};
        gpuInstanceBatcherMap: { [sID: string]: meshGpuInsBatcher } = {};
        /**
         * 添加 GPUInstance 渲染节点
         * @param r GPUInstance 渲染节点
         */
        addInstance(r: IRendererGpuIns) {
            let mr = r as meshRenderer;
            let mf = mr.filter;
            if (!mf || !mf.mesh) return;
            let mat = mr.materials[0];
            if (!mat) return;
            let gpuInstancingGUID = mat.gpuInstancingGUID;
            if (!gpuInstancingGUID) return;
            let id = renderLayer.getRandererGUID(mf.mesh.getGUID(), gpuInstancingGUID);
            if (!this.gpuInstanceMap[id]) {
                this.gpuInstanceMap[id] = new math.ReuseArray<IRendererGpuIns>();
            }
            this.gpuInstanceMap[id].push(r);
        }
        /**
         * 添加 GPUInstance 渲染节点到合批
         * @param r GPUInstance 渲染节点
         */
        addInstanceToBatcher(r: IRendererGpuIns) {
            let mr = r as meshRenderer;
            let mf = mr.filter;
            if (!mf) return;
            let mat = mr.materials[0];
            if (!mat) return;
            let gpuInstancingGUID = mat.gpuInstancingGUID;
            if (!gpuInstancingGUID) return;
            // if(!mf){
            //     mf = mr.gameObject.getComponent("meshFilter") as m4m.framework.meshFilter;
            // }
            let mesh = mf.mesh;
            let id = renderLayer.getRandererGUID(mesh.getGUID(), gpuInstancingGUID);
            let bs: m4m.framework.meshGpuInsBatcher = this.gpuInstanceBatcherMap[id];
            if (!bs) {
                bs = this.gpuInstanceBatcherMap[id] = new m4m.framework.meshGpuInsBatcher(mr.gameObject.layer, mesh, mr.materials);
            }

            for (let i = 0, len = bs.bufferDArrs.length; i < len; i++) {
                let pass = bs.passArr[i];
                let darr = bs.bufferDArrs[i];
                m4m.framework.meshRenderer.setInstanceOffsetMatrix(mr.gameObject.transform, mat, pass); //RTS offset 矩阵
                mat.uploadInstanceAtteribute(pass, darr);  //收集 各material instance atteribute
            }

            bs.count++;
        }


        private static gpuInsRandererGUID = -1;
        private static gpuInsRandererGUIDMap = {};
        /**
         * GPUInstance 唯一ID
         * @param meshGuid meshID
         * @param materialGuid 材质ID
         * @returns GPUInstance 唯一ID
         */
        private static getRandererGUID(meshGuid: number, materialGuid: string): number {
            let meshTemp = this.gpuInsRandererGUIDMap[meshGuid];
            if (!meshTemp) {
                meshTemp = this.gpuInsRandererGUIDMap[meshGuid] = {};
            }
            let rId = meshTemp[materialGuid];
            if (rId == null) {
                this.gpuInsRandererGUID++;
                rId = meshTemp[materialGuid] = this.gpuInsRandererGUID;
            }
            return rId;
        }
    }

}