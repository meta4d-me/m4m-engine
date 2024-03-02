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
        static readonly ClassName: string = "gltf";
        /** 必要依赖 已支持 记录字典容器 */
        static readonly requiredSupportedMap: { [key: string]: boolean } = {
            "KHR_texture_transform": true,
            "gd_realtime_lights": true,
            "gd_linfo": true,
            "gd_linfo_scene": true,
        };

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
        /**
         * gltf 资源
         * @param assetName 资源名 
         * @param data 数据
         */
        constructor(assetName: string = null, public data: any) {
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


        static dumpmem(): void {
            var meminfo = window.performance["memory"];
            var memsize = meminfo.usedJSHeapSize / 1024 / 1024 | 0;

            console.log("====gltf mem= " + memsize + " MB");

            //if (memsize > 2048)
            //throw "use too mush memory";
        }

        /**
         * 颜色编码 hex 转RGB
         * @param hex hex Color 
         * @returns RGB color
         */
        hexToRgb = hex =>
            hex?.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
                , (m, r, g, b) => '#' + r + r + g + g + b + b)
                .substring(1).match(/.{2}/g)
                .map(x => parseInt(x, 16) / 255);

        buffers: bin[];
        
        /**
         * 异步加载 glft资源
         * @param mgr 资源管理器
         * @param ctx webgl 上下文对象
         * @param folder 文件目录路径
         * @param brdf brdf 纹理
         * @param env 间接光环境纹理（高频信息）
         * @param irrSH 间接光环境纹理（低频信息）
         * @param exposure HDR曝光度
         * @param specFactor 镜面反射系数
         * @param irrFactor 漫反射系数
         * @param uvChecker 基础纹理
         * @returns 引擎场景节点对象（异步） 
         */
        async load(mgr: assetMgr, ctx: WebGL2RenderingContext, folder: string, brdf: texture, env: texture, irrSH: texture, exposure?, specFactor = 1, irrFactor = 1, uvChecker?: texture) {
            if (!this.data) {
                console.error(`load fail , data is Null.`);
                return;
            }

            console.log("====gltf begin log==");
            gltf.dumpmem();

            const load = (uri) => new Promise((res) => {
                mgr.load(folder + uri, AssetTypeEnum.Auto, () => {
                    res(mgr.getAssetByName(uri.split('/').pop()));
                });
            });
            const defaltScene = this.data.scene ?? 0;
            const extensionsUsed = this.data.extensionsUsed as string[] ?? [];
            const hasKHR_texture_transform = extensionsUsed.indexOf("KHR_texture_transform") != -1;
            //检查 extensionsRequired
            const extensionsRequired: string[] = this.data.extensionsRequired ?? [];
            for (let i = 0, len = extensionsRequired.length; i < len; i++) {
                let key = extensionsRequired[i];
                if (!gltf.requiredSupportedMap[key]) {
                    console.warn(`extensionsRequired of "${key}" not suppered!`);
                }
            }

            const loadImg = (url) => new Promise<HTMLImageElement>((res) => {
                m4m.io.loadImg(folder + url, (img, err) => {
                    if (!err) res(img);
                });
            });

            const getImgByBin = (view, mimeType: string) => {
                const bufferView = new Uint8Array(view.rawBuffer, view.byteOffset ?? 0, view.byteLength);
                const blob = new Blob([bufferView], {
                    type: mimeType
                });
                let sourceURI = URL.createObjectURL(blob);

                return new Promise<HTMLImageElement>((res) => {
                    m4m.io.loadImg(sourceURI, (img, err) => {
                        if (!err) res(img);
                    });
                });
            }
            console.log("====gltf begin buffers==");
            gltf.dumpmem();


            const samplers = this.data.samplers ?? [];
            //buffers
            let currBufLen = 0;
            let glbBin = this.buffers ? this.buffers[0] : null;
            let bufCount = 0;
            this.buffers = await Promise.all(this.data.buffers?.map(({ byteLength, uri }) => {
                if (uri) { return load(uri); }
                else if (glbBin) {
                    const buf = glbBin.data.slice(currBufLen, currBufLen + byteLength);
                    currBufLen += byteLength;
                    const _bin = new bin(`${glbBin.getName()}_${bufCount}`, buf);
                    bufCount++;
                    return _bin;
                }
            }) ?? []);


            console.log("====gltf begin accessor==");
            gltf.dumpmem();

            //bufferView
            const views = this.data.bufferViews?.map(({ buffer = 0, byteOffset = 0, byteLength = 0, byteStride = 0 }) => {
                // return {byteStride ,dv: new DataView(this.buffers[buffer].data, byteOffset, byteLength)};
                return { byteOffset, byteLength, byteStride, rawBuffer: this.buffers[buffer].data };
            });
            //accessors
            const accessors = this.data?.accessors?.map(acc => {
                return {
                    ...acc,
                    bufferView: views[acc.bufferView],
                }
            });
            console.log("====gltf begin loadimage==");
            gltf.dumpmem();
            //images
            const images: HTMLImageElement[] = await Promise.all(this.data?.images?.map(({ uri, mimeType, bufferView }) => {
                if (uri) { return loadImg(uri); }
                else {
                    const view = views[bufferView];
                    return getImgByBin(view, mimeType);
                }
            }) ?? []);
            console.log("====gltf begin loadtexture==");
            gltf.dumpmem();
            const textures: texture[] = await Promise.all(this.data.textures?.map(({ sampler, source }) => {
                const img = images[source];
                const tex = new m4m.framework.texture(img.src);
                let format = m4m.render.TextureFormatEnum.RGBA;
                if (img.src.length > 4 && img.src.substr(img.src.length - 4) == ".jpg") {
                    format = m4m.render.TextureFormatEnum.RGB;
                }
                const glt = new m4m.render.glTexture2D(ctx, format);
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
            console.log("====gltf begin load lightmap==");
            gltf.dumpmem();
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
                lightMapTexs = await Promise.all(maps.map((path) => {
                    const bufferViewIdx = Number.parseInt(path);
                    if (isNaN(bufferViewIdx)) {
                        return load(path) as Promise<texture>;
                    } else {
                        const view = views[bufferViewIdx];
                        const bOffset = view.byteOffset ?? 0;
                        const buffer = (view.rawBuffer as ArrayBuffer).slice(bOffset, bOffset + view.byteLength);
                        // const bufferView = new Uint8Array(view.rawBuffer, view.byteOffset ?? 0, view.byteLength);
                        let _texture = new texture(`Lightmap-${bufferViewIdx}_comp_light.raw`);
                        _texture.glTexture = RAWParse.parse(ctx, buffer);
                        return _texture;
                    }
                }));
            }
            console.log("====gltf begin load material==");
            gltf.dumpmem();
            const extrasCfg = this.data.extras?.clayViewerConfig?.materials as any[];
            const materials: material[] = this.data.materials?.map(m => {
                const mat = new material(m.name);
                let matCfg;
                let cfgs = extrasCfg?.filter(e => e.name === m.name);
                if (cfgs?.length > 0) matCfg = cfgs[0];
                let pbrSH: shader;
                let alphaMode = m.alphaMode ?? "OPAQUE";
                let alphaCutoff = m.alphaCutoff ?? 0.5;
                let doubleSided = m.doubleSided ?? false;
                let shaderRes = "pbr";
                switch (alphaMode) {
                    case "OPAQUE": alphaCutoff = 0; break;
                    case "MASK": break;
                    case "BLEND": shaderRes += `_blend`; break;
                }

                if (doubleSided) {
                    shaderRes += `_2sided`;
                }
                // //-------test
                // shaderRes = `shader/def`;
                // //----------

                shaderRes += `.shader.json`;
                pbrSH = mgr.getShader(shaderRes);
                mat.setShader(pbrSH);
                mat.setFloat("alphaCutoff", alphaCutoff);

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
                let _eColor = m.emissiveFactor ?? [0, 0, 0];
                // //test--------
                // _eColor[0] = 3;
                // _eColor[1] = 0;
                // _eColor[2] = 0;
                // //------------
                //
                mat.setVector4('CustomBasecolor', new math.vector4(_bColor[0], _bColor[1], _bColor[2], _bColor[3]));
                mat.setFloat('CustomMetallic', matCfg?.metalness ?? m.pbrMetallicRoughness?.metallicFactor ?? 1);
                mat.setFloat('CustomRoughness', matCfg?.roughness ?? m.pbrMetallicRoughness?.roughnessFactor ?? 1);
                mat.setVector4('CustomEmissiveColor', new math.vector4(_eColor[0], _eColor[1], _eColor[2], 1));
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

                if (m.emissiveTexture) {
                    mat.setTexture("uv_Emissive", textures[m.emissiveTexture.index]);
                }

                //tex transfrom
                let tex_ST = new math.vector4(1, 1, 0, 0);
                // clay-viewer 的配置优先
                let cViewScale = matCfg?.uvRepeat[0] ?? 1;
                if (cViewScale != 1) {
                    tex_ST.x = cViewScale;
                    tex_ST.y = cViewScale;
                } else {
                    if (extenKHR_tex_t) {
                        if (extenKHR_tex_t.scale) {
                            tex_ST.x *= extenKHR_tex_t.scale[0] ?? 1;
                            tex_ST.y *= extenKHR_tex_t.scale[1] ?? 1;
                        }
                        if (extenKHR_tex_t.offset) {
                            tex_ST.z = extenKHR_tex_t.offset[0] ?? 0;
                            tex_ST.w = extenKHR_tex_t.offset[1] ?? 0;
                        }
                    }
                }

                mat.setFloat("uvRepeat", tex_ST.x);     //之后 用 tex_ST 代替 uvRepeat

                return mat;
            });

            console.log("====gltf begin load mesh==");
            gltf.dumpmem();

            //问题1
            //ebo count 远远小于vbo 且大量vbo长度相同，这说明有大量mesh公用一个vbo的情况
            //如何识别
            const meshes = this.data.meshes?.map(({ name, primitives }) => {
                //二了呀，一个mesh的primitives基本上就是 同一个vbo
                //结果未必，不一定是同一个，要检查

                let samevbo = true;
                for (var i = 1; i < primitives.length; i++) {
                    if (primitives[i].attributes != primitives[0].attributes) {
                        samevbo = false;
                        break;
                    }
                }
                console.log("====same vbo?" + samevbo);

                if (samevbo) {
                    //这是为大型gltf优化的,有些大型gltf文件会公用vbo
                    console.log("====gltf begin load one mesh " + name);
                    gltf.dumpmem();


                    let mf = new mesh(folder + name);
                    gltf.loadgltfvbo(ctx, mf, primitives[0], accessors);
                    let info = new meshinfo();
                    info.mesh = mf;
                    info.lightMapTexST = [];
                    info.outmats = [];

                    console.log("after uploadVertexData");
                    gltf.dumpmem();



                    gltf.loadgltfebo_mix(ctx, mf, primitives, accessors, materials, hasLightMap, lightMapTexs, info);


                    console.log("====gltf end load mesh " + name);
                    gltf.dumpmem();

                    return [info];
                }
                else {
                    console.log("====gltf begin load one mesh " + name);
                    gltf.dumpmem();

                    let infos: meshinfo[] = [];
                    for (var i = 0; i < primitives.length; i++) {
                        let mf = new mesh(folder + name);
                        gltf.loadgltfvbo(ctx, mf, primitives[i], accessors);
                        let info = new meshinfo();
                        info.mesh = mf;
                        info.lightMapTexST = [];
                        info.outmats = [];


                        gltf.loadgltfebo_one(ctx, mf, primitives[i], accessors, materials, hasLightMap, lightMapTexs, info);

                        infos.push(info);

                    }
                    console.log("====gltf end load mesh " + name);
                    gltf.dumpmem();


                    return infos;
                }


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
                    let realmeshs = meshes[mesh] as meshinfo[];
                    for (var imesh = 0; imesh < realmeshs.length; imesh++) {
                        let realmesh = realmeshs[imesh];
                        let submesh = new m4m.framework.transform();
                        let mfit = submesh.gameObject.addComponent("meshFilter") as meshFilter;
                        mfit.mesh = realmesh.mesh;
                        const renderer = submesh.gameObject.addComponent("meshRenderer") as meshRenderer;
                        renderer.materials = realmesh.outmats;
                        for (var i = 0; i < realmesh.outmats.length; i++) {
                            if (realmesh.lightMapTexST[i] != null) {
                                renderer.lightmapIndex = -2;    //标记该节点使用非全局lightmap
                                math.vec4Set(renderer.lightmapScaleOffset, realmesh.lightMapTexST[i][0], realmesh.lightMapTexST[i][1], realmesh.lightMapTexST[i][2], realmesh.lightMapTexST[i][3]);
                            }
                        }
                        n.addChild(submesh);
                    }

                    // const child = meshes[mesh].map(({ m, mat, lTexST }) => {
                    //     const texST: number[] = lTexST;
                    //     const submesh = new m4m.framework.transform();

                    //     const mf = submesh.gameObject.addComponent("meshFilter") as meshFilter;
                    //     mf.mesh = m;
                    //     const renderer = submesh.gameObject.addComponent("meshRenderer") as meshRenderer;
                    //     renderer.materials = [mat];
                    //     if (texST) {
                    //         renderer.lightmapIndex = -2;    //标记该节点使用非全局lightmap
                    //         math.vec4Set(renderer.lightmapScaleOffset, texST[0], texST[1], texST[2], texST[3]);
                    //     }
                    //     // renderer.materials.push(mat);
                    //     // renderer.materials.push(new framework.material());
                    //     // renderer.materials[0].setShader(mgr.getShader("shader/def"));
                    //     // renderer.materials[0].setShader(mgr.getShader("simple.shader.json"));
                    //     return submesh;
                    // });
                    // child.forEach(c => n.addChild(c));

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
        
        /**
         * 解析gltf mesh 的 ebo部分
         * @param ctx webgl上下文
         * @param mf mesh对象
         * @param primitives gltf primitives数据
         * @param accessors gltf accessors数据
         * @param materials 使用渲染材质
         * @param hasLightMap 是否有LightMap
         * @param lightMapTexs LightMap的纹理索引
         * @param info mesh附信息
         */
        static loadgltfebo_mix(ctx: WebGL2RenderingContext, mf: mesh, primitives: any[], accessors: any[], materials: material[],
            hasLightMap: boolean, lightMapTexs: texture[], info: meshinfo): void {
            let mdata = mf.data;
            mdata.trisindex = [];
            mf.submesh = [];

            //let { attributes, indices, material, extensions } =primitive;    
            primitives.map(({ attributes, indices, material, extensions }) => {
                let eboacc = accessors[indices] as GltfAttr;
                gltf.loadgltfebo(eboacc, mf, materials[material], hasLightMap, lightMapTexs, info, extensions)
            });
            mf.glMesh.addIndex(ctx, mdata.trisindex.length);
            mf.glMesh.uploadIndexData(ctx, 0, mdata.genIndexDataArray());

            mf.glMesh.initVAO();
        }
        /**
         * 解析gltf mesh 的 ebo 独立的(不共享vbo)
         * @param ctx webgl上下文
         * @param mf mesh对象
         * @param primitive gltf primitives数据
         * @param accessors gltf accessors数据
         * @param materials 使用渲染材质
         * @param hasLightMap 是否有LightMap
         * @param lightMapTexs LightMap的纹理索引
         * @param info mesh附信息
         */
        static loadgltfebo_one(ctx: WebGL2RenderingContext, mf: mesh, primitive: any, accessors: any[], materials: material[],
            hasLightMap: boolean, lightMapTexs: texture[], info: meshinfo): void {
            let mdata = mf.data;
            mdata.trisindex = [];
            mf.submesh = [];

            let { attributes, indices, material, extensions } = primitive;
            //primitives.map(({ attributes, indices, material, extensions }) => {
            let eboacc = accessors[indices] as GltfAttr;
            gltf.loadgltfebo(eboacc, mf, materials[material], hasLightMap, lightMapTexs, info, extensions)
            //});
            mf.glMesh.addIndex(ctx, mdata.trisindex.length);
            mf.glMesh.uploadIndexData(ctx, 0, mdata.genIndexDataArray());

            mf.glMesh.initVAO();
        }
        /**
         * 解析gltf mesh 的 ebo
         * @param eboacc 
         * @param mf mesh对象
         * @param outMat 使用渲染材质
         * @param hasLightMap 是否有LightMap
         * @param lightMapTexs LightMap的纹理索引
         * @param info mesh附信息
         * @param extensions gltf 拓展信息
         */
        static loadgltfebo(eboacc: GltfAttr, mf: mesh, outMat: material, hasLightMap: boolean, lightMapTexs: texture[], info: meshinfo, extensions: any): void {
            //let eboacc = accessors[indices] as GltfAttr;
            //let eboAcc = new Accessor(accessors[indices], "indices");
            //let ebo = eboAcc.data as Uint32Array;
            let ebo: any;
            const byteOffset = (eboacc.bufferView.byteOffset ?? 0) + (eboacc.byteOffset ?? 0);
            if (eboacc.componentType == 5125)
                ebo = new Uint32Array(eboacc.bufferView.rawBuffer, byteOffset, eboacc.count);
            if (eboacc.componentType == 5123)
                ebo = new Uint16Array(eboacc.bufferView.rawBuffer, byteOffset, eboacc.count);
            if (eboacc.componentType == 5121)
                ebo = new Uint8Array(eboacc.bufferView.rawBuffer, byteOffset, eboacc.count);
            console.log("ebo count=" + ebo.length);

            let indexbegin = mf.data.trisindex.length;
            let mdata = mf.data;
            for (var i = 0; i < ebo.length / 3; i++) {
                var i0 = ebo[i * 3 + 0];
                var i1 = ebo[i * 3 + 1];
                var i2 = ebo[i * 3 + 2];
                mdata.trisindex.push(i0);
                mdata.trisindex.push(i1);
                mdata.trisindex.push(i2);
            }
            //mdata.trisindex = Array.from(ebo);
            // mf.glMesh.addIndex(ctx, ebo.length);
            // mf.glMesh.uploadIndexData(ctx, 0, ebo, eboAcc.componentType);
            //mf.submesh = [];
            const sm = new m4m.framework.subMeshInfo();
            sm.matIndex = mf.submesh.length;
            sm.useVertexIndex = 0;
            sm.start = indexbegin;
            sm.size = ebo.length;
            sm.line = false;
            mf.submesh.push(sm);
            // mf.glMesh.uploadIndexSubData(ctx, 0, ebo);

            //light Map
            let lightMapTexST = null;
            //let outMat: material = materials[matid];
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
            info.outmats.push(outMat);
            info.lightMapTexST.push(lightMapTexST);
        }

        /**
         * 解析gltf mesh 的 vbo
         * @param ctx webgl上下文
         * @param mf mesh对象
         * @param primitive gltf primitives数据
         * @param accessors gltf accessors数据
         */
        static loadgltfvbo(ctx: WebGL2RenderingContext, mf: mesh, primitive: any, accessors: any[]): void {

            let mdata = mf.data = new m4m.render.meshData();
            mdata.triIndexUint32Mode = true;

            const vert: m4m.math.vector3[] = mdata.pos = [];
            const uv1: m4m.math.vector2[] = mdata.uv = [];
            const uv2: m4m.math.vector2[] = mdata.uv2 = [];
            const normal: m4m.math.vector3[] = mdata.normal = [];
            const tangent: m4m.math.vector3[] = mdata.tangent = [];



            const attr: { [k: string]: GltfAttr } = {};
            for (let k in primitive.attributes) {
                let attrview = accessors[primitive.attributes[k]];
                attr[k] = attrview;
            }

            const vcount = attr.POSITION.count;
            const bs =
                + (attr.POSITION ? 3 : 0)
                + (attr.NORMAL ? 3 : 0)
                + (attr.COLOR ? 4 : 0)
                + (attr.TANGENT ? 3 : 0) // 引擎里的Tangent是vec3，而不是vec4
                + (attr.TEXCOORD_0 ? 2 : 0)
                + (attr.TEXCOORD_1 ? 2 : 0);
            const vbo = new Float32Array(vcount * bs);

            console.log("vcount=" + vcount);

            mf.glMesh = new m4m.render.glMesh();
            let vf
            if (attr.POSITION)
                vf |= m4m.render.VertexFormatMask.Position;
            if (attr.NORMAL)
                vf |= m4m.render.VertexFormatMask.Normal;
            if (attr.COLOR)
                vf |= m4m.render.VertexFormatMask.Color
            if (attr.TANGENT)
                vf |= m4m.render.VertexFormatMask.Tangent;
            if (attr.TEXCOORD_0)
                vf |= m4m.render.VertexFormatMask.UV0;
            if (attr.TEXCOORD_1)
                vf |= m4m.render.VertexFormatMask.UV1;
            // | m4m.render.VertexFormatMask.BlendIndex4
            // | m4m.render.VertexFormatMask.BlendWeight4;
            console.log("before initBuffer");
            gltf.dumpmem();

            mf.glMesh.initBuffer(ctx, vf, vcount, m4m.render.MeshTypeEnum.Static);

            let uv0data: Float32Array = null;
            let uv1data: Float32Array = null;
            let posdata: Float32Array = null;
            let nordata: Float32Array = null;
            let tandata: Float32Array = null;
            if (attr.TEXCOORD_0 != null) {
                uv0data = new Float32Array(attr.TEXCOORD_0.bufferView.rawBuffer, (attr.TEXCOORD_0.bufferView.byteOffset ?? 0) + (attr.TEXCOORD_0.byteOffset ?? 0));

                console.log("attr uv0");
                gltf.dumpmem();
            }
            if (attr.TEXCOORD_1 != null) {
                uv1data = new Float32Array(attr.TEXCOORD_1.bufferView.rawBuffer, (attr.TEXCOORD_1.bufferView.byteOffset ?? 0) + (attr.TEXCOORD_1.byteOffset ?? 0));

                console.log("attr uv1");
                gltf.dumpmem();
            }

            if (attr.POSITION != null) {
                posdata = new Float32Array(attr.POSITION.bufferView.rawBuffer, (attr.POSITION.bufferView.byteOffset ?? 0) + (attr.POSITION.byteOffset ?? 0));

                console.log("attr pos");
                gltf.dumpmem();
            }
            if (attr.NORMAL != null) {
                nordata = new Float32Array(attr.NORMAL.bufferView.rawBuffer, (attr.NORMAL.bufferView.byteOffset ?? 0) + (attr.NORMAL.byteOffset ?? 0));

                console.log("attr nor");
                gltf.dumpmem();
            }
            if (attr.TANGENT != null) {
                tandata = new Float32Array(attr.TANGENT.bufferView.rawBuffer, (attr.TANGENT.bufferView.byteOffset ?? 0) + (attr.TANGENT.byteOffset ?? 0));


                console.log("attr tan");
                gltf.dumpmem();
            }
            console.log("after initBuffer");
            gltf.dumpmem();
            for (let i = 0; i < vcount; i++) {
                if (uv0data != null) {
                    let uvFliped0 = uv0data[i * 2 + 0];
                    let uvFliped1 = uv0data[i * 2 + 1];
                    uv1[i] = new m4m.math.vector2(uvFliped0, uvFliped1 * -1 + 1);
                }

                if (uv1data != null) {
                    let uvFliped0 = uv1data[i * 2 + 0];
                    let uvFliped1 = uv1data[i * 2 + 1];
                    uv2[i] = new m4m.math.vector2(uvFliped0, uvFliped1 * -1 + 1);
                }

                if (posdata != null) {
                    let _pos0 = posdata[i * 3 + 0];
                    let _pos1 = posdata[i * 3 + 1];
                    let _pos2 = posdata[i * 3 + 2];
                    vert[i] = new m4m.math.vector3(_pos0, _pos1, _pos2);
                }

                if (nordata != null) {
                    let _pos0 = nordata[i * 3 + 0];
                    let _pos1 = nordata[i * 3 + 1];
                    let _pos2 = nordata[i * 3 + 2];
                    normal[i] = new m4m.math.vector3(_pos0, _pos1, _pos2);
                }

                if (tandata != null) {

                    let t = new m4m.math.vector3(tandata[i * 4 + 0], tandata[i * 4 + 1], tandata[i * 4 + 2]);
                    //处理 w 分量 , w 存入 xyz 中, w 只因为为1 或 -1 ,表示为切向方向性。
                    //将w 平移2 , 映射为 -1 -> 1 , 1 -> 3 ，这样保障 normalize 后 xyz 一致                                                                                                                                                                                                                                      
                    let w = tandata[i * 4 + 3] + 2;
                    //将w 乘入 xyz , x = x * w , y = y * w , y = y * w 
                    m4m.math.vec3ScaleByNum(t, w, t);
                    tangent[i] = t;
                }

                const cur = vbo.subarray(i * bs); // offset
                let bit = 0;
                if (attr.POSITION != null) {
                    const position = cur.subarray(bit, bit += 3);
                    position[0] = vert[i].x;
                    position[1] = vert[i].y;
                    position[2] = vert[i].z;
                }

                // const color = cur.subarray(3, 7);
                if (attr.NORMAL != null) {
                    const n = cur.subarray(bit, bit += 3);
                    n[0] = normal[i].x;
                    n[1] = normal[i].y;
                    n[2] = normal[i].z;
                }

                if (attr.TANGENT != null) {
                    const tan = cur.subarray(bit, bit += 3);
                    const t = tangent[i];
                    tan[0] = t.x;
                    tan[1] = t.y;
                    tan[2] = t.z;
                }

                if (attr.TEXCOORD_0 != null) {
                    const _uv = cur.subarray(bit, bit += 2);
                    let u = uv1[i];
                    _uv[0] = u.x;
                    _uv[1] = u.y;
                }

                if (attr.TEXCOORD_1 != null) {
                    const _uv2 = cur.subarray(bit, bit += 2);
                    let u = uv2[i];
                    _uv2[0] = u.x;
                    _uv2[1] = u.y;
                }

                // const tangent = cur.subarray(7, 9);

                // colors[i] = new m4m.math.vector4();
            }
            mf.glMesh.uploadVertexData(ctx, vbo);


        }
        /**
         * 获取实时灯光列表详细
         */
        getRealtimeLights(): gltfRealtimeLight[] {
            let extUsed = this.data.extensionsUsed as string[];
            if (!extUsed || extUsed.indexOf("gd_realtime_lights") == -1) return;
            let scenes = this.data.scenes;
            if (!scenes || !scenes[0].extensions) return;
            let gd_realtime_lights = scenes[0].extensions.gd_realtime_lights;
            if (!gd_realtime_lights || !gd_realtime_lights.lightInfos) return;
            return gd_realtime_lights.lightInfos;
        }
    }

    /** 灯光阴影质量 */
    export enum ShadowQualityType {
        None,
        Low,
        Medium,
        High,
    }

    /** gltf 实时灯光 */
    export type gltfRealtimeLight = {
        /** 光灯类型 */
        type: LightTypeEnum,
        /** 影响范围 */
        range: number,
        /** 聚光灯张角度 */
        spotAngle: number,
        /** 阴影质量 */
        shadowQuality: ShadowQualityType,
        /** 光照强度 */
        intensity: number,
        /** 灯光颜色 */
        color: number[],
        /** 灯光角度 [x,y] */
        angles: number[],
        /** 灯光位置 [x,y,z] */
        pos: number[],
    };

    type AccTypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Uint32Array | Float32Array;
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
        private _data: AccTypedArray | AccTypedArray[];
        /**
         * gltf 内存访问器
         * @param param0 参数0
         * @param name 名
         */
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
        static getSubChunks(acc: Accessor, data: AccTypedArray) {
            let blocks: AccTypedArray[] = [];
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
    class meshinfo {
        mesh: mesh;
        outmats: material[];
        lightMapTexST: number[][];
    }


    class GltfAttr {
        bufferView: {
            rawBuffer: ArrayBuffer;
            byteOffset: number;
            byteLength: number;
            byteStride: number;
        };
        byteOffset?: number;
        componentType: number;//5126 ==float //5125 =uint32 5123 ==uint16
        count: number;
        name: string;
        type: string;
        normalized: boolean;
    }
}
