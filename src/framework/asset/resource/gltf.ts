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
     * @public
     * @language zh_CN
     * @classdesc
     * json资源
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class gltf implements IAsset {
        static readonly ClassName: string = "json";

        @m4m.reflect.Field("constText")
        private name: constText;
        private id: resID = new resID();
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 是否为默认资源
         * @version m4m 1.0
         */
        defaultAsset: boolean = false;
        constructor(assetName: string = null, public data) {
            if (!assetName) {
                assetName = "json_" + this.getGUID();
            }
            this.name = new constText(assetName);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取资源名称
         * @version m4m 1.0
         */
        getName(): string {
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
         * 释放资源
         * @version m4m 1.0
         */
        dispose() {
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 计算资源字节大小
         * @version m4m 1.0
         */
        caclByteLength(): number {
            return this.data?.buffers?.map(e => e.byteLength).reduce((a, b) => a + b, 0);
        }

        private _realName: string;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 如果是imgdesc加载来的图片，通过这个可以获取到真实的图片名字
         * @version m4m 1.0
         */
        get realName(): string {
            return this._realName;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 设置图片名称
         * @version m4m 1.0
         */
        set realName(name: string) {
            this._realName = name;
        }

        hexToRgb = hex =>
            hex?.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
                , (m, r, g, b) => '#' + r + r + g + g + b + b)
                .substring(1).match(/.{2}/g)
                .map(x => parseInt(x, 16) / 255);

        buffers: bin[];
        async load(mgr: assetMgr, ctx: WebGLRenderingContext, folder: string, brdf: texture, env: texture, irrSH: texture, exposure?, specFactor = 1, irrFactor = 1, uvChecker?: texture) {
            if (!this.data) {
                console.error(`load fail , data is Null.`);
                return;
            }
            const load = (uri) => new Promise((res) => {
                mgr.load(folder + uri, AssetTypeEnum.Auto, () => {
                    res(mgr.getAssetByName(uri.split('/').pop()));
                });
            });
            const defaltScene = this.data.scene ?? 0;
            const extensionsUsed = this.data.extensionsUsed as string[] ?? [];
            const hasKHR_texture_transform = extensionsUsed.indexOf("KHR_texture_transform") != -1;

            const loadImg = (url) => new Promise((res) => {
                m4m.io.loadImg(folder + url, (img, err) => {
                    if (!err) res(img);
                });
            });
            const samplers = this.data.samplers ?? [];
            this.buffers = await Promise.all(this.data?.buffers?.map(({ uri }) => load(uri)) ?? []);
            const images: HTMLImageElement[] = await Promise.all(this.data?.images?.map(({ uri }) => loadImg(uri)) ?? []);
            const textures: texture[] = await Promise.all(this.data.textures?.map(({ sampler, source }) => {
                const img = images[source];
                const tex = new m4m.framework.texture(img.src);
                const glt = new m4m.render.glTexture2D(ctx, m4m.render.TextureFormatEnum.RGB);
                const samp = {
                    minFilter: ctx.NEAREST,
                    magFilter: ctx.LINEAR,
                    wrapS: ctx.REPEAT,
                    wrapT: ctx.REPEAT,
                    ...samplers[sampler],
                };
                glt.uploadImage(img, false, false, false, false, false, false); // bind texture
                //额外设置
                ctx.bindTexture(ctx.TEXTURE_2D, glt.texture);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, samp.magFilter);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, samp.minFilter);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, samp.wrapS);
                ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, samp.wrapT);
                if ((samp.minFilter & 0xFF00) == ctx.NEAREST_MIPMAP_NEAREST) {
                    ctx.generateMipmap(ctx.TEXTURE_2D);
                }
                ctx.bindTexture(ctx.TEXTURE_2D, null); // unbind
                tex.glTexture = glt;
                tex.use();
                return tex;
            }) ?? []);

            //lightMap 处理
            let sceneExtensions = this.data.scenes[defaltScene].extensions;
            let gd_linfo_scene: { mode: string, maps: string[] };
            if (sceneExtensions) { gd_linfo_scene = sceneExtensions.gd_linfo_scene; }
            const hasLightMap = extensionsUsed.indexOf("gd_linfo") != -1 && extensionsUsed.indexOf("gd_linfo_scene") != -1
                && gd_linfo_scene && gd_linfo_scene.maps && gd_linfo_scene.maps.length > 0;
            let lightMapTexs: texture[];
            if (hasLightMap) {
                //加载lightmap 纹理
                let maps = gd_linfo_scene.maps;
                lightMapTexs = await Promise.all(maps.map((path) => { return load(path) as Promise<texture>; }));
            }

            const extrasCfg = this.data.extras?.clayViewerConfig?.materials as any[];
            const materials: material[] = this.data.materials?.map(m => {
                const mat = new material(m.name);
                let matCfg;
                let cfgs = extrasCfg?.filter(e => e.name === m.name);
                if (cfgs?.length > 0) matCfg = cfgs[0];
                mat.setShader(mgr.getShader("pbr.shader.json"));
                if (brdf) {
                    mat.setTexture('brdf', brdf);
                }
                if (env) {
                    mat.setCubeTexture('u_env', env);
                }
                if (irrSH) {
                    mat.setCubeTexture('u_diffuse', irrSH);
                }
                // if (m.normalTexture)
                // {
                //     mat.setTexture("uv_MetallicRoughness", textures[m.normalTexture.index]);
                // }
                if (m.occlusionTexture) {
                    mat.setTexture("uv_AO", textures[m.occlusionTexture.index]);
                }
                if (m.normalTexture) {
                    mat.setTexture("uv_Normal", textures[m.normalTexture.index]);
                }
                if (exposure != null) {
                    mat.setFloat("u_Exposure", exposure);
                }
                mat.setFloat("specularIntensity", specFactor);
                mat.setFloat("diffuseIntensity", irrFactor);
                let _bColor = m.pbrMetallicRoughness?.baseColorFactor ?? [1, 1, 1, 1];
                let _clayViewerColor = this.hexToRgb(matCfg?.color);
                if (_clayViewerColor) {
                    _bColor[0] = _clayViewerColor[0];
                    _bColor[1] = _clayViewerColor[1];
                    _bColor[2] = _clayViewerColor[2];
                }
                mat.setVector4('CustomBasecolor', new math.vector4(_bColor[0], _bColor[1], _bColor[2], _bColor[3]));
                mat.setFloat('CustomMetallic', matCfg?.metalness ?? m.pbrMetallicRoughness?.metallicFactor ?? 1);
                mat.setFloat('CustomRoughness', matCfg?.roughness ?? m.pbrMetallicRoughness?.roughnessFactor ?? 1);
                // console.log(matCfg.name);
                // console.table({...m.pbrMetallicRoughness});
                // console.table(matCfg);
                // if (matCfg && matCfg.length > 0) {
                // mat.setFloatv("uvRepeat", new Float32Array([matCfg[0]?.uvRepeat[0] ?? 1, matCfg[0]?.uvRepeat[1] ?? 1]));
                // mat.setFloat("uvRepeat", matCfg?.uvRepeat[0] ?? 1);
                // } else {
                // mat.setFloat("uvRepeat", 1);
                // }
                let extenKHR_tex_t: { offset: number[], scale: number[] };
                if (m.pbrMetallicRoughness) {
                    const { baseColorFactor, baseColorTexture, metallicFactor, roughnessFactor, metallicRoughnessTexture } = m.pbrMetallicRoughness;
                    if (baseColorTexture) {
                        mat.setTexture("uv_Basecolor", uvChecker ?? textures[baseColorTexture.index]);
                        //extensions
                        let bcTexExten = baseColorTexture.extensions;
                        if (bcTexExten) {
                            if (hasKHR_texture_transform && bcTexExten.KHR_texture_transform) {
                                extenKHR_tex_t = bcTexExten.KHR_texture_transform;
                            }
                        }
                    }
                    if (metallicRoughnessTexture) {
                        mat.setTexture("uv_MetallicRoughness", textures[metallicRoughnessTexture.index]);
                    }
                }
                if (m.occlusionTexture) {
                    mat.setTexture("uv_AO", textures[m.occlusionTexture.index]);
                }

                //tex transfrom
                let tex_ST = new math.vector4(1 , 1 , 0, 0);
                // clay-viewer 的配置优先
                let cViewScale = matCfg?.uvRepeat[0] ?? 1;
                if(cViewScale != 1){
                    tex_ST.x = cViewScale;
                    tex_ST.y = cViewScale;
                }else{
                    if(extenKHR_tex_t){
                        if(extenKHR_tex_t.scale){
                            tex_ST.x *= extenKHR_tex_t.scale[0] ?? 1; 
                            tex_ST.y *= extenKHR_tex_t.scale[1] ?? 1; 
                        }
                        if(extenKHR_tex_t.offset){
                            tex_ST.z = extenKHR_tex_t.offset[0] ?? 0; 
                            tex_ST.w = extenKHR_tex_t.offset[1] ?? 0; 
                        }
                    }
                }

                mat.setFloat("uvRepeat", tex_ST.x);     //之后 用 tex_ST 代替 uvRepeat

                return mat;
            });
            const views = this.data.bufferViews?.map(({ buffer = 0, byteOffset = 0, byteLength = 0, byteStride = 0 }) => {
                // return {byteStride ,dv: new DataView(this.buffers[buffer].data, byteOffset, byteLength)};
                return { byteOffset, byteLength, byteStride, rawBuffer: this.buffers[buffer].data };
            });
            const accessors = this.data?.accessors?.map(acc => {
                return {
                    ...acc,
                    bufferView: views[acc.bufferView],
                }
            });

            const meshes = this.data.meshes?.map(({ name, primitives }) => {
                return primitives.map(({ attributes, indices, material, extensions }) => {
                    const mf = new mesh(folder + name);
                    const mdata = mf.data = new m4m.render.meshData();
                    const vert = mdata.pos = [];
                    const uv1 = mdata.uv = [];
                    const normal = mdata.normal = [];
                    const tangent = mdata.tangent = [];
                    // const colors = mdata.color = [];
                    const attr: any = {};
                    for (let k in attributes) {
                        attr[k] = new Accessor(accessors[attributes[k]], k);
                    }

                    const vcount = attr.POSITION.count;
                    const bs =
                        + (attr.POSITION?.size ?? 0)
                        + (attr.NORMAL?.size ?? 0)
                        // + (attr.COLOR?.size ?? 0)
                        + (attr.TANGENT?.size ? 3 : 0) // 引擎里的Tangent是vec3，而不是vec4
                        + (attr.TEXCOORD_0?.size ?? 0)
                        + (attr.TEXCOORD_1?.size ?? 0);
                    const vbo = new Float32Array(vcount * bs);

                    mf.glMesh = new m4m.render.glMesh();
                    let vf
                    if (attr.POSITION?.size)
                        vf |= m4m.render.VertexFormatMask.Position;
                    if (attr.NORMAL?.size)
                        vf |= m4m.render.VertexFormatMask.Normal;
                    // | m4m.render.VertexFormatMask.Color
                    if (attr.TANGENT?.size)
                        vf |= m4m.render.VertexFormatMask.Tangent;
                    if (attr.TEXCOORD_0?.size)
                        vf |= m4m.render.VertexFormatMask.UV0;
                    if (attr.TEXCOORD_1?.size)
                        vf |= m4m.render.VertexFormatMask.UV1;
                    // | m4m.render.VertexFormatMask.BlendIndex4
                    // | m4m.render.VertexFormatMask.BlendWeight4;
                    mf.glMesh.initBuffer(ctx, vf, vcount, m4m.render.MeshTypeEnum.Dynamic);

                    const eboAcc = new Accessor(accessors[indices], "indices");
                    const ebo = eboAcc.data;
                    mdata.trisindex = Array.from(ebo);

                    for (let i = 0; i < vcount; i++) {
                        let uvFliped0;
                        if (attr.TEXCOORD_0?.size != null) {
                            uvFliped0 = [...attr.TEXCOORD_0.data[i]];
                            uvFliped0[1] = uvFliped0[1] * -1 + 1;
                            uv1[i] = new m4m.math.vector2(...uvFliped0);
                        }

                        let uvFliped1;
                        if (attr.TEXCOORD_1?.size != null) {
                            uvFliped1 = [...attr.TEXCOORD_1.data[i]];
                            uvFliped1[1] = uvFliped1[1] * -1 + 1;
                            uv1[i] = new m4m.math.vector2(...uvFliped1);
                        }

                        if (attr.POSITION?.size != null)
                            vert[i] = new m4m.math.vector3(...attr.POSITION.data[i]);

                        if (attr.NORMAL?.size != null)
                            normal[i] = new m4m.math.vector3(...attr.NORMAL.data[i]);

                        if (attr.TANGENT?.size != null)
                            tangent[i] = new m4m.math.vector3(...attr.TANGENT.data[i]);

                        const cur = vbo.subarray(i * bs); // offset
                        let bit = 0;
                        if (attr.POSITION?.size != null) {
                            const position = cur.subarray(bit, bit += 3);
                            position.set(attr.POSITION.data[i]);
                        }

                        // const color = cur.subarray(3, 7);
                        if (attr.NORMAL?.size != null) {
                            const n = cur.subarray(bit, bit += 3);
                            n.set(attr.NORMAL.data[i]);
                        }

                        if (attr.TANGENT?.size != null) {
                            const tan = cur.subarray(bit, bit += 3);
                            tan.set(attr.TANGENT.data[i].slice(0, 3));
                        }

                        if (attr.TEXCOORD_0?.size != null) {
                            const uv = cur.subarray(bit, bit += 2);
                            uv.set(uvFliped0);
                        }

                        if (attr.TEXCOORD_1?.size != null) {
                            const uv = cur.subarray(bit, bit += 2);
                            uv.set(uvFliped1);
                        }

                        // const tangent = cur.subarray(7, 9);

                        // colors[i] = new m4m.math.vector4();
                    }
                    mf.glMesh.uploadVertexData(ctx, vbo);
                    mf.glMesh.addIndex(ctx, ebo.length);
                    mf.glMesh.uploadIndexData(ctx, 0, ebo, eboAcc.componentType);
                    mf.submesh = [];
                    const sm = new m4m.framework.subMeshInfo();
                    sm.matIndex = 0;
                    sm.useVertexIndex = 0;
                    sm.start = 0;
                    sm.size = ebo.length;
                    sm.line = false;
                    mf.submesh.push(sm);
                    mf.glMesh.uploadIndexSubData(ctx, 0, ebo);
                    //light Map
                    let lightMapTexST = null;
                    let outMat: material = materials[material];
                    if (hasLightMap && extensions && extensions.gd_linfo) {
                        if (extensions.gd_linfo.so) {
                            lightMapTexST = extensions.gd_linfo.so;
                        } else {
                            lightMapTexST = [1, 1, 0, 0];
                        }
                        let texIdx = extensions.gd_linfo.index ?? 0;
                        let lightMapTex = lightMapTexs[texIdx];
                        if (lightMapTex) {
                            if (outMat.statedMapUniforms["_LightmapTex"]) {
                                outMat = outMat.clone();      //公用材质但lightmap 不同，需要clone一个新材质
                            }
                            outMat.setTexture("_LightmapTex", lightMapTex);
                            outMat = outMat;
                        }
                    }
                    return { m: mf, mat: outMat, lTexST: lightMapTexST };
                });
            });

            const nodes = this.data.nodes?.map(({ name, mesh, matrix, rotation, scale, translation, skin, camera, children }) => {
                const n = new m4m.framework.transform();
                n.name = name;
                if (matrix != null) {
                    n.getLocalMatrix().rawData = matrix;
                    math.matrixDecompose(n.getLocalMatrix(), n.localScale, n.localRotate, n.localTranslate);
                } else {
                    if (translation != null)
                        math.vec3Set(n.localTranslate, translation[0], translation[1], translation[2]);
                    if (rotation != null) {
                        n.localRotate.x = rotation[0];
                        n.localRotate.y = rotation[1];
                        n.localRotate.z = rotation[2];
                        n.localRotate.w = rotation[3];
                    }
                    if (scale != null)
                        math.vec3Set(n.localScale, scale[0], scale[1], scale[2]);
                }
                n.markDirty();
                if (mesh != null) {
                    const child = meshes[mesh].map(({ m, mat, lTexST }) => {
                        const texST: number[] = lTexST;
                        const submesh = new m4m.framework.transform();

                        const mf = submesh.gameObject.addComponent("meshFilter") as meshFilter;
                        mf.mesh = m;
                        const renderer = submesh.gameObject.addComponent("meshRenderer") as meshRenderer;
                        renderer.materials = [mat];
                        if (texST) {
                            renderer.lightmapIndex = -2;    //标记该节点使用非全局lightmap
                            math.vec4Set(renderer.lightmapScaleOffset, texST[0], texST[1], texST[2], texST[3]);
                        }
                        // renderer.materials.push(mat);
                        // renderer.materials.push(new framework.material());
                        // renderer.materials[0].setShader(mgr.getShader("shader/def"));
                        // renderer.materials[0].setShader(mgr.getShader("simple.shader.json"));
                        return submesh;
                    });
                    child.forEach(c => n.addChild(c));
                }
                return { n, children };
            });
            const scene = new m4m.framework.transform();
            const parseNode = (i) => {
                const { n, children } = nodes[i];
                children?.forEach(c => {
                    n.addChild(parseNode(c));
                });
                return n;
            }
            const roots = this.data.scenes[defaltScene].nodes.map(parseNode);
            roots.forEach(r => scene.addChild(r));
            return scene;
        }
    }

    export class Accessor {
        static types = {
            "SCALAR": 1,
            'VEC1': 1,
            'VEC2': 2,
            'VEC3': 3,
            'VEC4': 4,
            "MAT2": 4,
            "MAT3": 9,
            "MAT4": 16,
        };
        attribute: string;
        bufferView: any;
        byteOffset: number;
        componentType: number;
        normalized: boolean;
        count: number;
        max: number[];
        min: number[];
        size: number;
        private _data: any;
        constructor({ bufferView, byteOffset = 0, componentType, normalized = false, count, type, max = [], min = [] }, name = '') {
            this.attribute = name;
            this.bufferView = bufferView;
            this.byteOffset = byteOffset;
            this.componentType = componentType;
            this.normalized = normalized;
            this.count = count;
            this.max = max;
            this.min = min;
            this.size = Accessor.types[type];
        }
        get data() {
            if (!this._data)
                this._data = Accessor.getData(this);
            return this._data;
        }
        static newFloat32Array(acc: Accessor) {
            return new Float32Array(acc.bufferView.rawBuffer, acc.byteOffset + acc.bufferView.byteOffset, acc.size * acc.count);
        }
        static getSubChunks(acc, data) {
            let blocks = [];
            for (let i = 0; i < acc.count; i++) {
                let offset = i * acc.size;
                blocks.push(data.subarray(offset, offset + acc.size));
            }
            return blocks;
        }
        static getFloat32Blocks(acc: Accessor) {
            return this.getSubChunks(acc, Accessor.newTypedArray(acc));
        }

        static newTypedArray(acc: Accessor) {
            switch (acc.componentType) {
                case 5120:
                    return new Int8Array(acc.bufferView.rawBuffer, acc.byteOffset + acc.bufferView.byteOffset, acc.size * acc.count);
                case 5121:
                    return new Uint8Array(acc.bufferView.rawBuffer, acc.byteOffset + acc.bufferView.byteOffset, acc.size * acc.count);
                case 5122:
                    return new Int16Array(acc.bufferView.rawBuffer, acc.byteOffset + acc.bufferView.byteOffset, acc.size * acc.count);
                case 5123:
                    return new Uint16Array(acc.bufferView.rawBuffer, acc.byteOffset + acc.bufferView.byteOffset, acc.size * acc.count);
                case 5125:
                    return new Uint32Array(acc.bufferView.rawBuffer, acc.byteOffset + acc.bufferView.byteOffset, acc.size * acc.count);
                case 5126:
                    return new Float32Array(acc.bufferView.rawBuffer, acc.byteOffset + acc.bufferView.byteOffset, acc.size * acc.count);
            }
        }
        static getData(acc: Accessor) {

            if (acc.size > 1) {
                return this.getFloat32Blocks(acc);
            }
            return this.newTypedArray(acc);
        }
    }
}
