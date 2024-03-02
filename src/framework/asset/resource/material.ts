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
/// <reference path="../../../io/reflect.ts" />

namespace m4m.framework {
    /**
     * @private
     */
    @m4m.reflect.SerializeType
    export class UniformData {
        @m4m.reflect.Field("number")
        @m4m.reflect.UIStyle("UniformTypeEnum")
        type: render.UniformTypeEnum;
        @m4m.reflect.Field("any")
        value: any;
        defaultValue: any;

        resname: string;
        /**
         * uniform数据
         * @param type 类型 
         * @param value 值
         * @param defaultValue 默认值 
         */
        constructor(type: render.UniformTypeEnum, value: any, defaultValue: any = null) {
            this.type = type;
            this.value = value;
            this.defaultValue = defaultValue;
        }
    }

    /**
     * 批量渲染相关接口
     */
    export interface DrawInstanceInfo {
        /**
         * 渲染数量
         */
        instanceCount: number;
        /**
         * 初始化Buffer
         *
         * @param gl
         */
        initBuffer(gl: WebGL2RenderingContext): void;
        /**
         * 启用批量渲染相关顶点属性
         */
        activeAttributes(gl: WebGL2RenderingContext, pass: render.glDrawPass, mat: material): void;
        /**
         * 禁用批量渲染相关顶点属性
         */
        disableAttributes(gl: WebGL2RenderingContext, pass: render.glDrawPass, mat: material): void;
    }



    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 材质资源
     * @param buf buffer数组
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class material implements IAsset {
        static readonly ClassName: string = "material";

        @m4m.reflect.Field("constText")
        private name: constText = null;
        private id: resID = new resID();
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 是否为默认资源
         * @version m4m 1.0
         */
        defaultAsset: boolean = false;

        private _enableGpuInstancing: boolean = false;
        @m4m.reflect.Field("number")
        /**
         * 开启使用Gpu Instance 渲染模式
         */
        get enableGpuInstancing() { return this._enableGpuInstancing; };
        set enableGpuInstancing(enable: boolean) {
            this._enableGpuInstancing = enable;
            if (enable) {
                this.getTexGuid(this);   //贴图使用唯一标识ID，gupInstance 使用
                this.getShaderGuid(this.shader);
                this.refreshGpuInstancingGUID();
            }
        };

        //
        private _shaderGUID: string = "";
        private _textureGUID: string = "";
        /** gpuInstancing 材质唯一ID */
        gpuInstancingGUID: string = "";
        /**
         * 材质资源
         * @param assetName 资源名 
         */
        constructor(assetName: string = null) {
            if (!assetName) {
                assetName = "material_" + this.getGUID();
            }
            this.name = new constText(assetName);
            m4m.io.enumMgr.enumMap["UniformTypeEnum"] = render.UniformTypeEnum;
            // this.mapUniformTemp = {};
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取资源名称
         * @version m4m 1.0
         */
        getName(): string {
            if (this.name == undefined) {
                return null;
            }
            return this.name.getText();
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取资源唯一id
         * @version m4m 1.0
         */
        getGUID(): number {
            return this.id.getID();
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 释放资源
         * @version m4m 1.0
         */
        dispose() {
            for (let id in this.statedMapUniforms) {
                switch (this.defaultMapUniform[id].type) {
                    case render.UniformTypeEnum.Texture:
                    case render.UniformTypeEnum.CubeTexture:
                        if (this.statedMapUniforms[id] != null)
                            this.statedMapUniforms[id].unuse();
                        break;
                }
            }
            delete this.statedMapUniforms;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 引用计数加一
         * @version m4m 1.0
         */
        use() {
            sceneMgr.app.getAssetMgr().use(this);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 引用计数减一
         * @version m4m 1.0
         */
        unuse(disposeNow: boolean = false) {
            sceneMgr.app.getAssetMgr().unuse(this, disposeNow);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 计算资源字节大小
         * @version m4m 1.0
         */
        caclByteLength(): number {
            let total = 0;
            if (this.shader) {
                total += this.shader.caclByteLength();
            }
            for (let k in this.statedMapUniforms) {
                let type = this.defaultMapUniform[k].type;
                let value = this.statedMapUniforms[k].value;
                let defaultValue = this.defaultMapUniform[k].value;
                switch (type) {
                    case render.UniformTypeEnum.Float:
                        total += 4;
                        break;
                    case render.UniformTypeEnum.Floatv:
                        total += value.byteLength;
                        break;
                    case render.UniformTypeEnum.Float4:
                        total += 16;
                        break;
                    case render.UniformTypeEnum.Float4v:
                        total += value.byteLength;
                        break;
                    case render.UniformTypeEnum.Float4x4:
                        total += 64;
                        break;
                    case render.UniformTypeEnum.Float4x4v:
                        total += value.byteLength;
                        break;
                    case render.UniformTypeEnum.Texture:
                    case render.UniformTypeEnum.CubeTexture:
                        if (value != null) {
                            total += value.caclByteLength();
                        }
                        else if (defaultValue != null) {
                            total += defaultValue.caclByteLength();
                        }
                        break;
                }
            }
            return total;
        }

        //状态去重忽略列表
        private static sameMatPassMap = {
            glstate_matrix_model: true,
            glstate_matrix_world2object: true,
            glstate_matrix_modelview: true,
            glstate_matrix_it_modelview: true,
            glstate_matrix_mvp: true,
            glstate_vec4_bones: true,
            glstate_matrix_bones: true,
            boneSampler: true,
            glstate_lightmapOffset: true,
            _LightmapTex: true,
            glstate_lightmapUV: true,
            glstate_lightmapRGBAF16: true
        }

        /**
         * 提交 uniform 数据到webgl API
         * @param pass 绘制的 glDrawPass 对象
         * @param context webgl 上下文
         * @param lastMatSame 是否和上一次渲染提交的材质相同
         */
        uploadUnifoms(pass: render.glDrawPass, context: renderContext, lastMatSame = false) {
            render.shaderUniform.texindex = 0;
            let udMap = this.uniformDirtyMap;
            let uTEnum = render.UniformTypeEnum;
            for (let key in pass.mapuniforms) {
                let unifom = pass.mapuniforms[key];
                if (lastMatSame && !material.sameMatPassMap[unifom.name] && !udMap[unifom.name]) {
                    if (uTEnum.Texture == unifom.type || uTEnum.CubeTexture == unifom.type) {
                        render.shaderUniform.texindex++;
                    }
                    //材质里做什么缓存？VAO？
                    //如果用了VAO，这也有个bug
                    //即使材质相同，shader 有#define，还是会不同，这个缓存机制有坑
                    //比如同一个材质，同时被Skin 和 非skin的模型用了，这个缓存就会变成天坑
                    //continue;
                }
                udMap[unifom.name] = false;  //标记为 没有 变化

                let func = render.shaderUniform.applyuniformFunc[unifom.type];
                let unifomValue: any;
                if (uniformSetter.autoUniformDic[unifom.name] != null) {
                    let autoFunc = uniformSetter.autoUniformDic[unifom.name];
                    unifomValue = autoFunc(context);
                } else {
                    if (this.statedMapUniforms[unifom.name] != null) {
                        unifomValue = this.statedMapUniforms[unifom.name];
                    } else if (this.defaultMapUniform[unifom.name]) {
                        unifomValue = this.defaultMapUniform[unifom.name].value;
                    } else {
                        console.error("Uniform don't be setted or have def value. uniform:" + unifom.name + "mat:" + this.getName());
                    }
                }

                if (unifomValue == null) {
                    error.push(new Error(`material [${this.name.getText()}], unifrom [${unifom.name}] uploadunifrom fail! unifom Value is null!! `));
                    continue;
                }

                if (unifom.type == render.UniformTypeEnum.Texture && !unifomValue.glTexture) {
                    error.push(new Error(`material [${this.name.getText()}] uploadunifrom fail! glTexture is null!! `));
                    continue;
                }
                func(unifom.location, unifomValue);
            }
        }

        /** GPUinstance Attrib ID 数据 map  */
        instanceAttribIDValMap: { [id: string]: number[] } = {};

        /**
         * 上传InstanceAtteribute 数据
         * @param pass 绘制通道
         * @param darr 数组对象
         */
        uploadInstanceAtteribute(pass: render.glDrawPass, darr: m4m.math.ExtenArray<Float32Array>) {
            // let attmap = pass.program.mapInstanceAttribID;
            let attmap = pass.program.mapAllAttrID;
            for (let id in attmap) {
                //通过地址获取 ID
                let arr = this.instanceAttribIDValMap[id];
                if (!arr) continue;
                // let att = attmap[id];
                // if (!arr) {
                //     for (let i = 0, len = att.size; i < len; i++) {
                //         darr.push(0);
                //     }
                // } else {
                //     InsSize += att.size;
                //     for (let i = 0, len = arr.length; i < len; i++) {
                //         darr.push(arr[i]);
                //     }
                // }
                for (let i = 0, len = arr.length; i < len; i++) {
                    darr.push(arr[i]);
                }
            }
        }

        /**
         * 获取InstanceAtteribute 上传数据的大小
         * @param pass 绘制通道
         */
        getInstanceAtteributeSize(pass: render.glDrawPass) {
            // let attmap = pass.program.mapInstanceAttribID;
            let attmap = pass.program.mapAllAttrID;
            let InsSize = 0;
            for (let id in attmap) {
                //通过地址获取 ID
                let arr = this.instanceAttribIDValMap[id];
                if (!arr) continue;
                let att = attmap[id];
                InsSize += att.size;
            }
            return InsSize;
        }

        // private setInstanceAttribValue(id:string,arr:number[]){
        //     if(!id) return;
        //     this.instanceAttribValMap[id] = arr;
        // }

        /**
         * 获取 GPU实例 Attrib值
         * @param id AttribID
         * @returns 值
         */
        private getInstanceAttribValue(id: string) {
            if (this.instanceAttribIDValMap[id] == null) {
                this.instanceAttribIDValMap[id] = [];
            }
            return this.instanceAttribIDValMap[id];
        }

        // private isNotBuildinAttribId(id: string) {
        //     return !render.glProgram.isBuildInAttrib(id);
        // }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 设置shader 不保留原有数据
         * @param shader shader实例
         * @version m4m 1.0
         */
        setShader(shader: shader) {
            this.shader = shader;
            this.defaultMapUniform = shader.defaultMapUniform;
            if (this._enableGpuInstancing) {
                this.getShaderGuid(shader);
                this.refreshGpuInstancingGUID();
            }
        }
        // private _changeShaderMap: { [name: string]: material } = {};
        // /**
        //  * @public
        //  * @language zh_CN
        //  * @classdesc
        //  * 修改shader 保留原有数据
        //  * @param shader shader实例
        //  * @version m4m 1.0
        //  */
        // changeShader(shader: shader)
        // {
        //     let map: { [id: string]: UniformData };
        //     if (this._changeShaderMap[shader.getName()] != undefined)
        //     {
        //         map = this._changeShaderMap[shader.getName()].mapUniform;
        //     }
        //     else
        //     {
        //         let mat: material = this.clone();
        //         map = mat.mapUniform;
        //         this._changeShaderMap[shader.getName()] = mat;
        //     }
        //     this.setShader(shader);
        //     for (let key in map)
        //     {
        //         if (this.mapUniform[key] != undefined)
        //         {
        //             this.mapUniform[key] = map[key];
        //         }
        //     }
        // }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取shader的layer
         * @version m4m 1.0
         */
        getLayer() {
            return this.shader.layer;
        }
        private queue: number = 0;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取shader的queue
         * @version m4m 1.0
         */
        getQueue() {
            return this.queue;
        }
        setQueue(queue: number) {
            this.queue = queue;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取shader
         * @version m4m 1.0
         */
        getShader() {
            return this.shader;
        }
        @m4m.reflect.Field("shader")
        private shader: shader;

        /**
         * @private
         */
        //@m4m.reflect.Field("UniformDataDic")
        //mapUniform: {[id: string]: UniformData} = {};//参数
        defaultMapUniform: { [key: string]: { type: render.UniformTypeEnum, value?: any, becolor?: boolean, min?: number, max?: number } };
        statedMapUniforms: { [id: string]: any } = {};
        //private mapUniformTemp: {[id: string]: UniformData}={};
        /**
         * 设置 float 格式的 uniform 值 
         * @param _id uniform ID
         * @param _number 值
         */
        setFloat(_id: string, _number: number) {
            if (this.defaultMapUniform[_id] != null && this.defaultMapUniform[_id].type == render.UniformTypeEnum.Float) {
                if (this.statedMapUniforms[_id] != _number) {
                    this.uniformDirtyMap[_id] = true;
                }
                this.statedMapUniforms[_id] = _number;
            } else {
                console.log("Set wrong uniform value. Mat Name: " + this.getName() + " Unifom :" + _id);
            }

            // if (this._enableGpuInstancing && this.isNotBuildinAttribId(_id)) {
            if (this._enableGpuInstancing) {
                let arr = this.getInstanceAttribValue(_id);
                arr[0] = _number ?? 0;
            }
        }
        /**
         * 设置 Int 格式的 uniform 值 
         * @param _id uniform ID
         * @param _number 值
         */
        setInt(_id: string, _number: number) {
            if (this.defaultMapUniform[_id] != null && this.defaultMapUniform[_id].type == render.UniformTypeEnum.Int) {
                if (this.statedMapUniforms[_id] != _number) {
                    this.uniformDirtyMap[_id] = true;
                }
                this.statedMapUniforms[_id] = _number;
            } else {
                console.log("Set wrong uniform value. Mat Name: " + this.getName() + " Unifom :" + _id);
            }

            // if (this._enableGpuInstancing && this.isNotBuildinAttribId(_id)) {
            if (this._enableGpuInstancing) {
                let arr = this.getInstanceAttribValue(_id);
                arr[0] = _number ?? 0;
            }
        }
        /**
        * 设置 Float数组 格式的 uniform 值 
        * @param _id uniform ID
        * @param _number 值
        */
        setFloatv(_id: string, _numbers: Float32Array) {
            if (this.defaultMapUniform[_id] != null && this.defaultMapUniform[_id].type == render.UniformTypeEnum.Floatv) {
                this.statedMapUniforms[_id] = _numbers;
                this.uniformDirtyMap[_id] = true;
            } else {
                console.log("Set wrong uniform value. Mat Name: " + this.getName() + " Unifom :" + _id);
            }

            // if (this._enableGpuInstancing && this.isNotBuildinAttribId(_id)) {
            if (this._enableGpuInstancing && _numbers) {
                this.setInsAttribVal(_id, _numbers.length, _numbers);
            }
        }
        /**
        * 设置 Vector4 格式的 uniform 值 
        * @param _id uniform ID
        * @param _number 值
        */
        setVector4(_id: string, _vector4: math.vector4) {
            if (this.defaultMapUniform[_id] != null && this.defaultMapUniform[_id].type == render.UniformTypeEnum.Float4) {
                this.statedMapUniforms[_id] = _vector4;
                this.uniformDirtyMap[_id] = true;
            } else {
                console.log("Set wrong uniform value. Mat Name: " + this.getName() + " Unifom :" + _id);
            }

            // if (this._enableGpuInstancing && this.isNotBuildinAttribId(_id)) {
            if (this._enableGpuInstancing) {
                let arr = this.getInstanceAttribValue(_id);
                if (_vector4) {
                    arr[0] = _vector4.x;
                    arr[1] = _vector4.y;
                    arr[2] = _vector4.z;
                    arr[3] = _vector4.w;
                } else {
                    for (let i = 0; i < 4; i++) arr[i] = 0;
                }
            }
        }
        /**
        * 设置 Vector4数组 格式的 uniform 值 
        * @param _id uniform ID
        * @param _number 值
        */
        setVector4v(_id: string, _vector4v: Float32Array) {
            if (this.defaultMapUniform[_id] != null && this.defaultMapUniform[_id].type == render.UniformTypeEnum.Float4v) {
                this.statedMapUniforms[_id] = _vector4v;
                this.uniformDirtyMap[_id] = true;
                _vector4v.length
            } else {
                console.log("Set wrong uniform value. Mat Name: " + this.getName() + " Unifom :" + _id);
            }
            // if (this._enableGpuInstancing && this.isNotBuildinAttribId(_id)) {
            if (this._enableGpuInstancing) {
                this.setInsAttribVal(_id, 4, _vector4v);
            }
        }
        /**
        * 设置 矩阵 格式的 uniform 值 
        * @param _id uniform ID
        * @param _number 值
        */
        setMatrix(_id: string, _matrix: math.matrix) {
            if (this.defaultMapUniform[_id] != null && this.defaultMapUniform[_id].type == render.UniformTypeEnum.Float4x4) {
                this.statedMapUniforms[_id] = _matrix;
                this.uniformDirtyMap[_id] = true;
            } else {
                console.log("Set wrong uniform value. Mat Name: " + this.getName() + " Unifom :" + _id);
            }

            if (this._enableGpuInstancing) {
                let data = _matrix ? _matrix.rawData : null;
                this.setInsAttribVal(_id, 16, data);
            }
        }
        /**
        * 设置 矩阵数组 格式的 uniform 值 
        * @param _id uniform ID
        * @param _number 值
        */
        setMatrixv(_id: string, _matrixv: Float32Array) {
            if (this.defaultMapUniform[_id] != null && this.defaultMapUniform[_id].type == render.UniformTypeEnum.Float4x4v) {
                this.statedMapUniforms[_id] = _matrixv;
                this.uniformDirtyMap[_id] = true;

            } else {
                console.log("Set wrong uniform value. Mat Name: " + this.getName() + " Unifom :" + _id);
            }

            if (this._enableGpuInstancing) {
                this.setInsAttribVal(_id, 16, _matrixv);
            }
        }
        /**
        * 设置 纹理 格式的 uniform 值 
        * @param _id uniform ID
        * @param _number 值
        */
        setTexture(_id: string, _texture: m4m.framework.texture, resname: string = "") {
            // if((this.defaultMapUniform[_id] != null && this.defaultMapUniform[_id].type == render.UniformTypeEnum.Texture) || _id == "_LightmapTex"){
            if (!(this.defaultMapUniform[_id] != null && this.defaultMapUniform[_id].type == render.UniformTypeEnum.Texture) && _id != "_LightmapTex") {
                console.log("Set wrong uniform value. Mat Name: " + this.getName() + " Unifom :" + _id);
                return;
            }

            let oldTex = this.statedMapUniforms[_id] as m4m.framework.texture;
            if (oldTex != null) {
                if (oldTex == _texture) return;
                if (this.statedMapUniforms[_id].defaultAsset) {
                    oldTex = null;
                    // this.statedMapUniforms[_id].unuse();
                }

            }
            // let old;
            this.statedMapUniforms[_id] = _texture;
            if (_texture != null) {
                if (!_texture.defaultAsset) {
                    _texture.use();
                }
                //图片的尺寸信息(1/width,1/height,width,height)
                let _texelsizeName = _id + "_TexelSize";
                let _gltexture = _texture.glTexture;
                if (_gltexture != null && this.defaultMapUniform[_texelsizeName] != null) {
                    this.setVector4(_texelsizeName, new math.vector4(1.0 / _gltexture.width, 1.0 / _gltexture.height, _gltexture.width, _gltexture.height));
                }
                this.uniformDirtyMap[_id] = true;

                if (this._enableGpuInstancing) {
                    this.getTexGuid(this);   //贴图使用唯一标识ID，gupInstance 使用
                    this.refreshGpuInstancingGUID();
                }

            } else {
                console.log("Set wrong uniform value. Mat Name: " + this.getName() + " Unifom :" + _id);
            }

            if (oldTex) oldTex.unuse();

            // if ((this.defaultMapUniform[_id] != null && this.defaultMapUniform[_id].type == render.UniformTypeEnum.Texture) || _id == "_LightmapTex")
            // {
            // } else
            // {
            //     console.log("Set wrong uniform value. Mat Name: " + this.getName() + " Unifom :" + _id);
            // }

        }

        /** 设置 GPU instance attribute 的值 */
        private setInsAttribVal(id: string, len: number, data: ArrayLike<number>) {
            let arr = this.getInstanceAttribValue(id);
            if (data) {
                for (let i = 0; i < len; i++) arr[i] = data[i] ?? 0;
            } else {
                for (let i = 0; i < len; i++) arr[i] = 0;
            }
        }

        /**
         * 贴图使用唯一标识ID，gupInstance 使用
         * @param mat 材质
         */
        private getTexGuid(mat: material) {
            let staMap = mat.statedMapUniforms;
            this._textureGUID = "";
            for (let key in staMap) {
                let val = staMap[key];
                if (val.getGUID == null) continue;
                let guid = (val as m4m.framework.texture).getGUID();
                this._textureGUID += `_${guid}`;
            }
        }

        /**
         * 获取指定shader的GUID
         * @param sh 指定shader
         * @returns guid
         */
        private getShaderGuid(sh: m4m.framework.shader) {
            if (!sh) return;
            if (!sh.passes["instance"] && !sh.passes["instance_fog"]) {
                console.warn(`shader ${sh.getName()} , has not "instance" pass when enable gpuInstance on the material ${this.getName()}.`);
            } else {
                this._shaderGUID = "" + sh.getGUID();
            }
        }

        /**
         * 刷新GPU实例 GUID
         * @returns 
         */
        private refreshGpuInstancingGUID() {
            if (!this._shaderGUID) {
                this.gpuInstancingGUID = "";
                return;
            }
            this.gpuInstancingGUID = `${this._shaderGUID}_${this._textureGUID}`;
        }

        /**
        * 设置 cube纹理 格式的 uniform 值 
        * @param _id uniform ID
        * @param _number 值
        */
        setCubeTexture(_id: string, _texture: m4m.framework.texture) {
            if (this.defaultMapUniform[_id] != null && this.defaultMapUniform[_id].type == render.UniformTypeEnum.CubeTexture) {
                if (this.statedMapUniforms[_id] != null && (!this.statedMapUniforms[_id].defaultAsset)) {
                    this.statedMapUniforms[_id].unuse();
                }
                this.statedMapUniforms[_id] = _texture;
                if (_texture != null) {
                    if (!_texture.defaultAsset) {
                        _texture.use();
                    }
                    //图片的尺寸信息(1/width,1/height,width,height)
                    let _texelsizeName = _id + "_TexelSize";
                    let _gltexture = _texture.glTexture;
                    if (_gltexture != null && this.defaultMapUniform[_texelsizeName] != null) {
                        this.setVector4(_texelsizeName, new math.vector4(1.0 / _gltexture.width, 1.0 / _gltexture.height, _gltexture.width, _gltexture.height));
                    }
                }
                this.uniformDirtyMap[_id] = true;
            } else {
                console.log("Set wrong uniform value. Mat Name: " + this.getName() + " Unifom :" + _id);
            }
        }

        private uniformDirtyMap: { [id: string]: boolean } = {};//值变化标记map

        private static lastDrawMatID = -1;
        private static lastDrawMeshID = -1;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 绘制
         * @param context 渲染上下文
         * @param mesh 渲染的mesh
         * @param sm 渲染的submesh信息
         *
         * @param instanceCount 批量渲染时绘制数量
         * @version m4m 1.0
         */
        draw(context: renderContext, mesh: mesh, sm: subMeshInfo, basetype: string = "base", drawInstanceInfo: DrawInstanceInfo = undefined) {
            let matGUID = this.getGUID();
            let meshGUID = mesh.getGUID();
            let LastMatSame = matGUID == material.lastDrawMatID;
            let LastMeshSame = meshGUID == material.lastDrawMeshID;

            let drawPasses = this.shader.passes[basetype + context.drawtype];
            if (drawPasses == undefined) {
                basetype = basetype.indexOf("fog") != -1 ? "base_fog" : "base";
                drawPasses = this.shader.passes[basetype + context.drawtype];
                if (drawPasses == undefined) {
                    drawPasses = this.shader.passes["base" + context.drawtype];
                    if (drawPasses == undefined)
                        return;
                }
            }
            let instanceCount = (drawInstanceInfo && drawInstanceInfo.instanceCount) || 1;
            for (let i = 0, l = drawPasses.length; i < l; i++) {
                //渲染状态 和 gl程序启用
                let pass = drawPasses[i];
                pass.use(context.webgl);

                //顶点状态绑定
                //模型的状态属性绑定
                // mesh.glMesh.bindVboBuffer(context.webgl);
                // if (!LastMatSame || !LastMeshSame) mesh.glMesh.bind(context.webgl, pass.program, sm.useVertexIndex);
                mesh.glMesh.onVAO();
                //drawInstance 的状态属性绑定
                drawInstanceInfo && drawInstanceInfo.initBuffer(context.webgl);
                drawInstanceInfo && drawInstanceInfo.activeAttributes(context.webgl, pass, this);

                //unifoms 数据上传
                this.uploadUnifoms(pass, context, LastMatSame);

                //绘制call
                DrawCallInfo.inc.add();
                if (sm.useVertexIndex < 0) {    //判断是否走 EBO
                    if (sm.line) {
                        mesh.glMesh.drawArrayLines(context.webgl, sm.start, sm.size, instanceCount);
                    }
                    else {
                        mesh.glMesh.drawArrayTris(context.webgl, sm.start, sm.size, instanceCount);
                    }
                }
                else {
                    if (sm.line) {
                        mesh.glMesh.drawElementLines(context.webgl, sm.start, sm.size, instanceCount);
                    }
                    else {
                        mesh.glMesh.drawElementTris(context.webgl, sm.start, sm.size, instanceCount);
                    }
                }

                //顶点状态解绑 （drawInstance 的修改放置在中间 ，这样它不会影响 我们模型的VAO ）
                drawInstanceInfo && drawInstanceInfo.disableAttributes(context.webgl, pass, this);
                mesh.glMesh.offVAO();
            }

            material.lastDrawMatID = matGUID;
            material.lastDrawMeshID = meshGUID;

        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 解析资源
         * @param assetmgr 资源管理实例
         * @param json json数据
         * @version m4m 1.0
         */
        Parse(assetmgr: assetMgr, json: any, bundleName: string = null) {
            var shaderName = json["shader"];
            var shader = assetmgr.getShader(shaderName) as m4m.framework.shader;
            if (shader == null) {
                //                 let shaders = [];
                //                 for(let k in assetmgr.mapShader)
                //                 {
                //                     shaders.push(k);
                //                 }
                //                 console.error(` 
                // #######当前shader#######:
                //                 ${shaders.join("\n")}`);
                throw new Error("mat解析错误:" + this.name + "  shader 为空！shadername：" + shaderName + " bundleName: " + bundleName);
            }
            this.setShader(shader);
            var queue = json["queue"];
            if (queue) {
                this.queue = queue;
            }

            var mapUniform = json["mapUniform"];
            for (var i in mapUniform) {
                var jsonChild = mapUniform[i];
                var _uniformType: render.UniformTypeEnum = jsonChild["type"] as render.UniformTypeEnum;
                if (_uniformType == null) continue;
                switch (_uniformType) {
                    case render.UniformTypeEnum.Texture:
                    case render.UniformTypeEnum.CubeTexture:
                        var _value: string = jsonChild["value"];
                        var _texture: m4m.framework.texture = assetmgr.getAssetByName(_value, bundleName) as m4m.framework.texture;
                        if (_texture == null) {
                            console.error("Material Mapuniform Texture 无效(" + _value + ")！shadername：" + shaderName + " bundleName: " + bundleName);
                            //_texture = assetmgr.getDefaultTexture("grid");
                        } else {
                            this.setTexture(i, _texture, _value);
                        }
                        break;
                    case render.UniformTypeEnum.Float:
                        var _value: string = jsonChild["value"];
                        this.setFloat(i, parseFloat(_value));
                        break;
                    case render.UniformTypeEnum.Float4:
                        var tempValue = jsonChild["value"];
                        try {
                            let values = tempValue.match(RegexpUtil.vector4Regexp);
                            if (values != null) {
                                var _float4: math.vector4 = new math.vector4(parseFloat(values[1]), parseFloat(values[2]), parseFloat(values[3]), parseFloat(values[4]));
                                this.setVector4(i, _float4);
                            }
                        }
                        catch (e) {
                            //数据不合法就不提交了
                            console.error("Material Mapuniform float4 无效:value (" + tempValue + ")！shadername：" + shaderName + " bundleName: " + bundleName);
                        }
                        break;
                    default:
                        console.error("Material Mapuniform 无效: 未识别类型(" + jsonChild["type"] + ")！shadername：" + shaderName + " bundleName: " + bundleName);
                        break;
                }
            }
            return this;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 克隆
         * @version m4m 1.0
         */
        public clone(): material {
            let mat: material = new material(this.getName());
            mat.setShader(this.shader);
            mat._enableGpuInstancing = this._enableGpuInstancing;
            mat.defaultMapUniform = this.defaultMapUniform;
            mat.queue = this.queue;
            for (let key in this.uniformDirtyMap) {
                mat.uniformDirtyMap[key] = this.uniformDirtyMap[key];
            }
            for (var i in this.statedMapUniforms) {
                let srcSta = this.statedMapUniforms[i];
                if (srcSta == null) continue;
                let typeStr = typeof (srcSta);
                if (typeStr != "object") {
                    mat.statedMapUniforms[i] = srcSta;
                } else {
                    if (srcSta.use != null) {
                        //是资源、texture
                        mat.statedMapUniforms[i] = srcSta;
                    } else if (srcSta.length != null) {
                        //arry
                        mat.statedMapUniforms[i] = new Float32Array(srcSta);
                    } else if (srcSta.x != null) {
                        //vec4
                        mat.statedMapUniforms[i] = new math.vector4();
                        math.vec4Clone(srcSta, mat.statedMapUniforms[i]);
                    } else if (srcSta.rawData != null) {
                        //matrix
                        mat.statedMapUniforms[i] = new math.matrix();
                        math.matrixClone(srcSta, mat.statedMapUniforms[i]);
                    }
                }
            }
            if (mat._enableGpuInstancing) {
                for (let key in this.instanceAttribIDValMap) {
                    let arr = this.instanceAttribIDValMap[key];
                    mat.instanceAttribIDValMap[key] = arr.concat();//copy
                }
            }
            return mat;
        }

        /**
         * 序列成字符串，方便保存
         * @returns 序列json字符串数据
         */
        public save(): string {
            let obj: any = {};
            obj["shader"] = this.shader.getName();
            obj["srcshader"] = "";
            obj["mapUniform"] = {};
            for (let item in this.statedMapUniforms) {
                let __type = this.defaultMapUniform[item].type;
                let val = this.statedMapUniforms;
                let jsonValue = {};
                jsonValue["type"] = __type;
                switch (__type) {
                    case render.UniformTypeEnum.CubeTexture:
                    case render.UniformTypeEnum.Texture:
                        jsonValue["value"] = `${val[item].name.name}`;
                        break;
                    case render.UniformTypeEnum.Float4:
                        jsonValue["value"] = `(${val[item].x},${val[item].y},${val[item].z},${val[item].w})`;
                        break;
                    case render.UniformTypeEnum.Float:
                        jsonValue["value"] = val[item];
                        break;
                    default:
                        console.warn(`无法存储未解析类型:${__type},${item}`);
                        continue;
                }
                obj["mapUniform"][item] = jsonValue;
            }
            return JSON.stringify(obj);
        }
    }
}