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
/// <reference path="../../io/reflect.ts" />

namespace m4m.framework {
    /** meshRenderer GpuInstancing 合批类
     * 
     */
    export class meshGpuInsBatcher {
        /** 实例数量 */
        count: number = 0;
        /** 渲染使用mesh */
        mesh: m4m.framework.mesh;
        /** 材质数组（应对submesh） */
        materials: m4m.framework.material[];
        /** 游戏标记layer */
        gameLayer: number;
        /** batcher 缓存的array */
        bufferDArrs: m4m.math.ExtenArray<Float32Array>[];
        /** 当前材质上 使用到的通道列表 */
        passArr: m4m.render.glDrawPass[];
        /** passId 对应 passArr 中的索引map*/
        passIdMap: { [id: number]: number };
        /**
         * meshGPUIns合批
         * @param _glayer 层级
         * @param _mesh mesh
         * @param _mats 材质列表
         */
        constructor(_glayer: number, _mesh: m4m.framework.mesh, _mats: m4m.framework.material[]) {
            this.gameLayer = _glayer;
            this.mesh = _mesh;
            this.mesh.use();
            this.materials = _mats;
            let _sh = _mats[0].getShader();
            this.passArr = [];
            this.bufferDArrs = [];
            this.passIdMap = {};
            let tempArr = _sh.passes[m4m.framework.meshRenderer.instanceDrawType()];
            for (let i = 0, len = tempArr.length; i < len; i++) {
                let pass = tempArr[i];
                this.passArr.push(pass);
                this.bufferDArrs.push(new m4m.math.ExtenArray<Float32Array>(Float32Array));
                this.passIdMap[pass.id.getID()] = i;
            }
        }

        /** 清理 */
        dispose() {
            // for(let i=0 , len = this.materials.length ; i < len ;i++){
            //     let mat = this.materials[i];
            //     mat.unuse();
            // }
            for (let i = 0, len = this.bufferDArrs.length; i < len; i++) {
                this.bufferDArrs[i].dispose();
            }

            this.passArr = null;
            this.mesh = null;
            this.materials = null;
            this.bufferDArrs = null;
            this.passIdMap = null;
        }
    }

    /** mesh  Gpu 实例 绘制info数据类*/
    export class meshGpuInstanceDrawInfo implements DrawInstanceInfo {
        instanceCount: number;
        mid: number;
        vbo: WebGLBuffer;
        cacheBuffers: m4m.math.ExtenArray<Float32Array>[];
        bufferIdMap: { [passId: number]: number };
        instanceArray: m4m.math.ReuseArray<IRendererGpuIns>;
        helpDArray: m4m.math.ExtenArray<Float32Array>;
        private attSuccess: boolean = false;
        initBuffer(gl: WebGL2RenderingContext): void {

        }
        activeAttributes(gl: WebGL2RenderingContext, pass: render.glDrawPass, mat: material): void {
            if (!this.instanceArray && !this.cacheBuffers) return;
            let cacheBuffer: m4m.math.ExtenArray<Float32Array>;
            if (this.bufferIdMap) {
                let idx = this.bufferIdMap[pass.id.getID()];
                if (idx == null) idx = 0;
                cacheBuffer = this.cacheBuffers[idx]
            }

            let _mid = this.mid;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
            let dataArr: Float32Array;
            if (cacheBuffer) {
                dataArr = cacheBuffer.buffer;
            }
            if (!dataArr) {
                this.helpDArray.count = 0;
                let len = this.instanceCount;
                for (let i = 0; i < len; i++) {
                    let mr = this.instanceArray.get(i) as meshRenderer;
                    let mat = mr.materials[_mid];
                    meshRenderer.setInstanceOffsetMatrix(mr.gameObject.transform, mat, pass);
                    mat.uploadInstanceAtteribute(pass, this.helpDArray);
                }
                dataArr = this.helpDArray.buffer;
            }

            gl.bufferData(gl.ARRAY_BUFFER, dataArr, gl.STATIC_DRAW);
            //
            //stride(vbo 数据步长) 获取
            let strideInsAttrib = mat.getInstanceAtteributeSize(pass) * 4;
            //
            let offset = 0;
            // const attMap = pass.program.mapInstanceAttribID;
            const attMap = pass.program.mapAllAttrID;
            const valMap = mat.instanceAttribIDValMap;
            const dataType = gl.FLOAT;        //缓冲区中的 数据类型
            const dataByteSize = 4;           //缓冲区中的 数据字节长度
            const pointerMaxSize = 4;         //vertexAttribPointer 最大尺寸
            for (let id in attMap) {
                if (!valMap[id]) continue;
                let att = attMap[id];
                let loc = att.location;
                if (loc == -1) break;
                let subCount = Math.ceil(att.size / pointerMaxSize);    //vertexAttribPointer() 只能是 1 , 2 , 3 , 4 , 大于4 会拆分成多个地址
                let realSize = att.size <= pointerMaxSize ? att.size : Math.ceil(att.size / subCount);
                while (subCount > 0) {
                    subCount--;
                    gl.enableVertexAttribArray(loc);
                    // gl.vertexAttribPointer(location, att.size, gl.FLOAT, false, pass.program.strideInsAttrib, offset);
                    gl.vertexAttribPointer(loc, realSize, dataType, false, strideInsAttrib, offset);
                    gl.vertexAttribDivisor(loc, 1);
                    // offset += att.size * 4;
                    offset += realSize * dataByteSize;
                    loc++;
                }
            }

            this.attSuccess = true;
        }
        disableAttributes(gl: WebGL2RenderingContext, pass: render.glDrawPass, mat: material): void {
            if (this.attSuccess) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
                // let attMap = pass.program.mapInstanceAttribID;
                const valMap = mat.instanceAttribIDValMap;
                const attMap = pass.program.mapAllAttrID;
                for (let id in attMap) {
                    if (!valMap[id]) continue;
                    let att = attMap[id];
                    let location = att.location;
                    if (location == -1) break;
                    gl.vertexAttribDivisor(location, 0);
                    gl.disableVertexAttribArray(location);
                }

                this.attSuccess = false;
            }

            //clear
            this.instanceCount = this.mid = 0;
            this.vbo = null;
            this.cacheBuffers = null;
            this.instanceArray = null;
            this.helpDArray = null;
            this.bufferIdMap = null;

            if (this.onDisableAttribute) {
                this.onDisableAttribute(this);
            }
        }

        /** Disable 结束回调 */
        onDisableAttribute: (info: meshGpuInstanceDrawInfo) => any;

        private static _pool: meshGpuInstanceDrawInfo[] = [];

        /** 池子中取出一个 */
        static new_info() {
            let info = this._pool.pop();
            if (info) return info;

            info = new meshGpuInstanceDrawInfo();
            return info;
        }

        /** 放回池子 */
        static del_info(info: meshGpuInstanceDrawInfo) {
            this._pool.push(info);
        }
    }

    /**
    * @public
    * @language zh_CN
    * @classdesc
    * mesh的渲染组件
    * @version m4m 1.0
    */
    @reflect.nodeRender
    @reflect.nodeComponent
    export class meshRenderer implements IRendererGpuIns {
        static readonly ClassName: string = "meshRenderer";
        /**
         * mesh渲染组件
         */
        constructor() {

        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 挂载的gameobject
         * @version m4m 1.0
         */
        gameObject: gameObject;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * mesh的材质数组
         * @version m4m 1.0
         */
        @m4m.reflect.Field("material[]")
        materials: material[] = [];

        /**
         * @private
         * 使用全局的lightMap
         */
        useGlobalLightMap: boolean = true;
        /**
         * @private
         */
        @m4m.reflect.Field("number")
        lightmapIndex: number = -1;
        /**
        * @private
        */
        @m4m.reflect.Field("vector4")
        lightmapScaleOffset: math.vector4 = new math.vector4(1, 1, 0, 0);

        private lastMat0Id = -1;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 场景渲染层级（common、transparent、overlay）
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        layer: RenderLayerEnum = RenderLayerEnum.Common;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 渲染mask层级（和相机相对应）
         * @version m4m 1.0
         */
        // @m4m.reflect.Field("number")
        // renderLayer: m4m.framework.CullingMask = CullingMask.default;
        get renderLayer() { return this.gameObject.layer; }
        set renderLayer(layer: number) {
            this.gameObject.layer = layer;
        }
        private issetq = false;
        /**
        * @private
        */
        private _queue: number = 0;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 返回此组件的场景渲染层级排序依据queue大小
         * @version m4m 1.0
         */
        get queue(): number {
            return this._queue;
        }
        set queue(value: number) {
            this._queue = value;
            this.issetq = true;
        }

        private _filter: meshFilter;

        /**
         * 渲染使用 meshFilter
         */
        get filter() {
            if (!this._filter) {
                this._filter = this.gameObject.getComponent("meshFilter") as meshFilter;
            }
            return this._filter;
        }
        set filter(val) { this._filter = val; }

        // private static readonly insOffsetMatrixStr = "instance_offset_matrix_";
        // private static GpuInsAttrignoreMap = { "instance_offset_matrix_0": true, "instance_offset_matrix_1": true, "instance_offset_matrix_2": true, "instance_offset_matrix_3": true };
        // private static insOffsetMtxIDMap = [`instance_offset_matrix_0`, `instance_offset_matrix_1`, `instance_offset_matrix_2`, `instance_offset_matrix_3`];

        private static _InstanceOffsetMatrixLoc: render.VertexLocation;
        /** GPU Instance 偏移变化矩阵 */
        private static get InstanceOffsetMatrixLoc() {
            if (this._InstanceOffsetMatrixLoc == null) { this._InstanceOffsetMatrixLoc = render.VertexLocation.InstanceOffsetMatrix_L; };
            return this._InstanceOffsetMatrixLoc;
        };

        private static helpDArray = new m4m.math.ExtenArray<Float32Array>(Float32Array);
        private static helpIMatrix = new m4m.math.matrix();


        start() {
            this.refreshLayerAndQue();

            if (this.lightmapIndex == -2) {
                this.useGlobalLightMap = false;
            }
        }

        onPlay() {

        }

        /** 
         * 刷新 渲染layer 和 渲染 queueId （切换了材质时需要手动刷新）
         * *优化了自动处理的消耗
         *  */
        refreshLayerAndQue() {
            if (this.materials == null || this.materials.length == 0) {
                //没有材质 给一个默认材质
                this.materials = [];
                let material = new framework.material();
                material.use();
                this.materials.push(material);
                this.materials[0].setShader(sceneMgr.app.getAssetMgr().getShader("shader/def"));
            }

            this.layer = this.materials[0].getLayer();
            if (!this.issetq)
                this._queue = this.materials[0].getQueue();
        }

        update(delta: number) {

        }
        render(context: renderContext, assetmgr: assetMgr, camera: m4m.framework.camera) {
            DrawCallInfo.inc.currentState = DrawCallEnum.Meshrender;
            let go = this.gameObject;
            let tran = go.transform;
            let filter = this.filter;

            context.updateLightMask(go.layer);
            context.updateModel(tran);
            if (filter == null) return;
            let mesh = filter.getMeshOutput();
            if (mesh == null || mesh.glMesh == null || mesh.submesh == null) return;
            let subMeshs = mesh.submesh;
            if (subMeshs == null) return;

            // mesh.glMesh.bindVboBuffer(context.webgl);


            let len = subMeshs.length;
            let scene = tran.scene;
            let lightIdx = this.lightmapIndex;
            for (let i = 0; i < len; i++) {
                let sm = subMeshs[i];
                let mid = subMeshs[i].matIndex;//根据这个找到使用的具体哪个材质    
                let usemat = this.materials[mid];
                let drawtype = scene.fog ? "base_fog" : "base";
                context.lightmap = null;
                if (lightIdx >= 0 && scene.lightmaps.length > 0) {
                    drawtype = scene.fog ? "lightmap_fog" : "lightmap";
                    //usemat.shaderStatus = shaderStatus.Lightmap;
                    if (scene.lightmaps.length > lightIdx) {
                        context.lightmap = scene.lightmaps[lightIdx];
                        //context.lightmap_01 = meshRenderer.getLightMap_01Img(context.lightmap);
                    }

                }
                else {
                    if (!this.useGlobalLightMap) {
                        drawtype = scene.fog ? "lightmap_fog" : "lightmap";
                        context.lightmap = usemat.statedMapUniforms["_LightmapTex"];
                        //if(context.lightmap.getName){}
                        //context.lightmap_01 = meshRenderer.getLightMap_01Img(context.lightmap);
                    }
                }

                if (context.lightmap && context.lightmap.glTexture) {
                    context.lightmapOffset = this.lightmapScaleOffset;
                    context.lightmapUV = mesh.glMesh.vertexFormat & m4m.render.VertexFormatMask.UV1 ? 1 : 0;
                    let format = (context.lightmap.glTexture as render.glTexture2D).format;
                    context.lightmapRGBAF16 = format == render.TextureFormatEnum.FLOAT16 ? 1 : 0;
                }

                // if (scene.fog)
                // {
                //     context.fog = scene.fog;
                // }
                if (usemat != null)
                    usemat.draw(context, mesh, sm, drawtype);
            }

        }

        /**
         * 获取 李总修改 lightMap 第二图
         * @param lightMapImg 光照纹理
         * @returns 
         */
        private static getLightMap_01Img(lightMapImg: texture): texture {
            let imgName = lightMapImg.getName();
            let srcImgName = `${imgName.substr(0, imgName.length - 13)}_01.imgdesc.json`;
            let srcImgBundleName = (lightMapImg as IAsset).bundle.name;
            let assetMgrIns = m4m.framework.assetMgr.Instance;
            let lightMapimg_01 = assetMgrIns.getAssetByName(srcImgName, srcImgBundleName) as m4m.framework.texture;
            //没有 _LightmapTex_01 给一张默认图（纯黑色）
            if (!lightMapimg_01) {
                lightMapimg_01 = assetMgrIns.getDefaultTexture("black");
            }
            return lightMapimg_01;
        }

        /**
         * 当GPU实例 关闭属性
         * @param info GPU实例绘制信息
         */
        private static onGpuInsDisableAttribute(info: meshGpuInstanceDrawInfo) {
            if (!info) return;
            meshGpuInstanceDrawInfo.del_info(info);
        }

        /**
         * 当GPU实例执行渲染
         * @param context 渲染向下文
         * @param instanceArray 渲染GPU实例列表
         * @param cacheBuffer 缓存容器
         */
        static GpuInstancingRender(context: renderContext, instanceArray: m4m.math.ReuseArray<IRendererGpuIns>, cacheBuffer?: Float32Array) {
            let insLen = instanceArray.length;
            if (insLen < 1) return;
            DrawCallInfo.inc.currentState = DrawCallEnum.Meshrender;
            // let mr = instanceArray[0] as m4m.framework.meshRenderer;
            let mr = instanceArray.get(0) as m4m.framework.meshRenderer;
            // let go = instanceArray[0].gameObject;
            let go = mr.gameObject;
            // let tran = go.transform;
            let filter = mr.filter;

            context.updateLightMask(go.layer);
            context.updateModelByMatrix(this.helpIMatrix);
            if (filter == null) return;
            let mesh = filter.getMeshOutput();
            if (mesh == null || mesh.glMesh == null || mesh.submesh == null) return;
            let subMeshs = mesh.submesh;

            // mesh.glMesh.bindVboBuffer(context.webgl);
            // if (sceneMgr.scene.fog)
            // {
            //     context.fog = sceneMgr.scene.fog;
            // }
            let len = subMeshs.length;
            let drawtype = this.instanceDrawType();
            for (let i = 0; i < len; i++) {
                let sm = subMeshs[i];
                let mid = subMeshs[i].matIndex;//根据这个找到使用的具体哪个材质    
                let usemat = mr.materials[mid];

                let drawInstanceInfo: meshGpuInstanceDrawInfo = meshGpuInstanceDrawInfo.new_info();
                drawInstanceInfo.mid = mid;
                drawInstanceInfo.instanceCount = insLen;
                drawInstanceInfo.vbo = this._getVBO(context.webgl);
                drawInstanceInfo.instanceArray = instanceArray;
                drawInstanceInfo.helpDArray = this.helpDArray;
                drawInstanceInfo.onDisableAttribute = this.onGpuInsDisableAttribute.bind(this);

                ///----------------------------------------------------------------

                if (usemat != null)
                    usemat.draw(context, mesh, sm, drawtype, drawInstanceInfo);
            }
        }

        /**
         * 当GPU实例执行渲染(合批)
         * @param context 渲染向下文
         * @param batcher GPU实例合批对象
         */
        static GpuInstancingRenderBatcher(context: renderContext, batcher: meshGpuInsBatcher) {
            let insLen = batcher.count;
            if (insLen < 1) return;
            DrawCallInfo.inc.currentState = DrawCallEnum.Meshrender;
            let mesh = batcher.mesh;
            let mats = batcher.materials;
            let gameLayer = batcher.gameLayer;

            context.updateLightMask(gameLayer);
            context.updateModelByMatrix(this.helpIMatrix);
            // if (sceneMgr.scene.fog)
            // {
            //     context.fog = sceneMgr.scene.fog;
            // }

            let subMeshs = mesh.submesh;
            let len = subMeshs.length;
            for (let i = 0; i < len; i++) {
                let sm = subMeshs[i];
                let mid = subMeshs[i].matIndex;//根据这个找到使用的具体哪个材质    
                let usemat = mats[mid];
                let drawtype = this.instanceDrawType();
                let vbo = this._getVBO(context.webgl);

                let drawInstanceInfo: meshGpuInstanceDrawInfo = meshGpuInstanceDrawInfo.new_info();
                drawInstanceInfo.mid = mid;
                drawInstanceInfo.instanceCount = insLen;
                drawInstanceInfo.vbo = this._getVBO(context.webgl);
                drawInstanceInfo.cacheBuffers = batcher.bufferDArrs;
                drawInstanceInfo.bufferIdMap = batcher.passIdMap;
                drawInstanceInfo.onDisableAttribute = this.onGpuInsDisableAttribute.bind(this);

                if (usemat != null)
                    usemat.draw(context, mesh, sm, drawtype, drawInstanceInfo);
            }
        }

        /**
         * 设置 OffsetMatrix
         * @param tran transform
         * @param mat 材质对象
         * @param pass 绘制通道对象
         * @returns 是否设置成功
         */
        static setInstanceOffsetMatrix(tran: m4m.framework.transform, mat: material, pass: render.glDrawPass): boolean {
            if (!this.hasInstanceOffsetMatrix(pass)) return false;
            this._setInstanceOffsetMatrix(tran, mat, pass);
            return true;
        }

        /**
         * 是否有 InstanceOffsetMatrix 定义
         * @param pass 绘制通道对象
         */
        static hasInstanceOffsetMatrix(pass: render.glDrawPass) {
            let locMap = pass.program.mapAllAttrLoc;
            return locMap[this.InstanceOffsetMatrixLoc] != null;
        }

        /**
         * 设置GPU实例 变换偏移矩阵
         * @param tran 节点transform
         * @param mat 材质对象
         * @param pass 绘制通道对象
         */
        private static _setInstanceOffsetMatrix(tran: m4m.framework.transform, mat: material, pass: render.glDrawPass) {
            let _wmat = tran.getWorldMatrix();
            let rawdata = _wmat.rawData;
            let allLocMap = pass.program.mapAllAttrLoc;
            let valMap = mat.instanceAttribIDValMap;
            //
            let loc = this.InstanceOffsetMatrixLoc;
            let att = allLocMap[loc];
            let id = att.name;
            let arr = valMap[id];
            if (!arr) arr = valMap[id] = [];
            //复制数据
            for (let i = 0, len = rawdata.length; i < len; i++) {
                arr[i] = rawdata[i];
            }
        }

        /**
         * 获取GPU实例绘制类型标记
         * @returns 绘制类型标记
         */
        static instanceDrawType() {
            let drawtype = "instance";
            //fog
            let _fog = m4m.framework.sceneMgr.scene.fog;
            if (_fog) {
                drawtype = "instance_fog";
            }
            return drawtype;
        }

        private static _vbos: [WebGL2RenderingContext, WebGLBuffer][] = [];
        /**
         * 获取VBO 缓冲区
         * @param gl webgl上下文对象
         * @returns vbo webgl缓冲区对象
         */
        private static _getVBO(gl: WebGL2RenderingContext) {
            for (let i = 0, n = this._vbos.length; i < n; i++) {
                if (this._vbos[i][0] == gl)
                    return this._vbos[i][1];
            }
            let vbo = gl.createBuffer();
            this._vbos.push([gl, vbo]);
            return vbo;
        }

        /**
         * 是否是GPU实例
         * @returns 是GPU实例？
         */
        isGpuInstancing() {
            // if(!this.materials || !this.materials[0]) return false;
            if (!this.materials || this.materials.length < 1) return false;
            return this.materials[0].enableGpuInstancing;
        }
        /**
        * @private
        */
        remove() {
            this.materials.forEach(element => {
                if (element) element.unuse();
            });
            this.materials.length = 0;
        }
        /**
        * @private
        */
        clone() {

        }
    }

}