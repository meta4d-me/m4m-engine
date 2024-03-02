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
    type loadCallback = (state?: stateLoad) => void;
    type downloadBindType = (guid: number, url: string, type: AssetTypeEnum, finish: () => void) => void;

    export const assetParseMap: { [key: number]: IAssetFactory } = {};
    /**
     * 资源处理装饰器
     * @param type 类型
     * @returns 
     */
    export function assetF(type: AssetTypeEnum)
    {
        return function (ctor)
        {
            assetParseMap[type] = new ctor();
        }
    }

    /**
     * 通过url获取资源类型
     * @param url 资源路径
     * @returns 资源类型
     */
    export function calcType(url: string | any): AssetTypeEnum
    {
        var filei = url.lastIndexOf("/");
        var file = url.substr(filei + 1);
        var i = file.indexOf(".", 0);
        var extname = null;
        while (i >= 0)
        {
            extname = file.substr(i);

            switch (extname)
            {
                case ".vs.glsl":
                    return AssetTypeEnum.GLVertexShader;
                case ".fs.glsl":
                    return AssetTypeEnum.GLFragmentShader;
                case ".assetbundle.json":
                    return AssetTypeEnum.Bundle;
                case ".shader.json":
                    return AssetTypeEnum.Shader;
                case ".png":
                case ".jpg":
                    return AssetTypeEnum.Texture;
                case ".pvr.bin":
                case ".pvr":
                case ".pvr.bin.js":
                    return AssetTypeEnum.PVR;
                case ".astc.bin":
                case ".astc":
                case ".astc.bin.js":
                    return AssetTypeEnum.ASTC;
                case ".raw.bin":
                case ".raw":
                case ".raw.bin.js":
                    return AssetTypeEnum.RAW;
                case ".ktx.bin":
                case ".ktx":
                case ".ktx.bin.js":
                    return AssetTypeEnum.KTX;
                case ".imgdesc.json":
                    return AssetTypeEnum.TextureDesc;
                case ".mesh.bin":
                case ".mesh.bin.js":
                case ".cmesh.bin":
                    return AssetTypeEnum.Mesh;
                case ".aniclip.bin":
                case ".aniclip.bin.js":
                    return AssetTypeEnum.Aniclip;
                case ".prefab.json":
                    return AssetTypeEnum.Prefab;
                case ".cprefab.json":
                    return AssetTypeEnum.cPrefab;
                case ".scene.json":
                    return AssetTypeEnum.Scene;
                case ".atlas.json":
                    return AssetTypeEnum.Atlas;
                case ".font.json":
                    return AssetTypeEnum.Font;
                case ".json":
                case ".txt":
                case ".effect.json":
                    return AssetTypeEnum.TextAsset;
                case ".mat.json":
                    return AssetTypeEnum.Material;
                case ".bpkg.json":
                case ".packs.bin":
                case ".packs.bin.js":
                    return AssetTypeEnum.PackBin;
                case ".jpkg.json":
                case ".packs.txt":
                    return AssetTypeEnum.PackTxt;
                case ".path.json":
                    return AssetTypeEnum.PathAsset;
                case ".f14effect.json":
                    return AssetTypeEnum.F14Effect;
                case ".dds":
                case ".dds.bin":
                    return AssetTypeEnum.DDS;
                case ".keyframeAniclip.json":
                    return AssetTypeEnum.KeyFrameAniclip;
                case ".particlesystem.json":
                    return AssetTypeEnum.ParticleSystem;
                case ".trailrenderer.json":
                    return AssetTypeEnum.TrailRenderer;
                case ".hdr":
                    return AssetTypeEnum.HDR;
                case ".gltf":
                    return AssetTypeEnum.GLTF;
                case ".glb":
                    return AssetTypeEnum.GLB;
                case ".bin":
                    return AssetTypeEnum.BIN;
            }

            i = file.indexOf(".", i + 1);
        }
    }

    /**
     * 获取http请求的类型
     * @param type 资源类型
     * @returns http请求类型
     */
    export function calcReqType(type: AssetTypeEnum): "text" | "arraybuffer"
    {
        var e = AssetTypeEnum;
        switch (type)
        {
            case e.PackTxt:
            case e.Bundle:
            case e.Atlas:
            case e.cPrefab:
            case e.F14Effect:
            case e.Font:
            case e.GLFragmentShader:
            case e.GLVertexShader:
            case e.KeyFrameAniclip:
            case e.Material:
            case e.PathAsset:
            case e.Scene:
            case e.Shader:
            case e.TextAsset:
            case e.TextureDesc:
            case e.PackTxt:
            case e.ParticleSystem:
            case e.GLTF:
                return "text";
            case e.Aniclip:
            case e.DDS:
            case e.Mesh:
            case e.PVR:
            case e.KTX:
            case e.ASTC:
            case e.PackBin:
            case e.HDR:
            case e.RAW:
            case e.BIN:
            case e.GLB:
                return "arraybuffer";
            default:
                // throw Error(`无法识别类型 enum:${AssetTypeEnum[type]},type:${type}`);
                return null;
        }
    }

    //资源管理器
    export class assetMgr
    {
        static urlmapGuid: { [key: string]: number } = {};//全局资源记录
        static cdnRoot: string;//资源根目录
        static guidlistURL: string;//资源根目录
        static onGuidInit: () => void;
        public static Instance: assetMgr;

        static mapLoading: { [key: number]: { url?: string, readyok: boolean, data?: any, cbQueue?: loadCallback[], subRes?: number[] } } = {};//下载好的,未下载好的,资源
        static mapGuid: { [key: number]: assetRef } = {};//解析好的资源
        static mapImage: { [key: number]: HTMLImageElement | ArrayBuffer} = {};//图片缓存
        static mapNamed: { [key: string]: IAsset } = {};//资源名是 ,系统资源类型的名字 或自己定义的名字
        static mapBundleNamed: { [key: number]: { [name: string]: assetRef } } = {};

        static noparseBundle: Array<assetBundle> = [];//未解析的资源包

        static atonceParse: boolean = true;//是否立即解析
        static openGuid: boolean = true;//是否开启去重能力
        name_bundles: { [key: string]: assetBundle } = {};
        kurl_bundles: { [key: string]: assetBundle } = {};
        guid_bundles: { [key: string]: assetBundle } = {};

        mapShader: { [id: string]: shader } = {};



        /**
         * 外部才能确定在哪用,初始化全局资源记录
         */
        static initGuidList()
        {
            io.loadJSON(assetMgr.guidlistURL, (json) =>
            {
                assetMgr.urlmapGuid = json.res;
                // console.log(`initGuidList  资源GUID从[${json.__useid}]开始计数`);
                // resID.idAll = json.__useid;
                if (assetMgr.onGuidInit)
                    assetMgr.onGuidInit();
            });
        }

        /**
         * 设置加载中
         * @param guid id 
         * @param data 加载中的数据对象
         */
        static setLoading(guid: number, data: any)
        {
            // let loading = assetMgr.mapLoading[guid];
            // if (loading && loading.readyok)
            //     throw new Error(`冲突的guid:${guid}`);
            assetMgr.mapLoading[guid] = data;
        }
        /**
         * 加载资源
         * @param url 资源路径
         * @param type 资源类型
         * @param onstate 状态时变化回调
         * @param downloadFinish 加载结束
         */
        load(url: string, type: AssetTypeEnum = AssetTypeEnum.Auto,
            /** 这是解析完成的回调 */
            onstate: loadCallback = null, downloadFinish: () => void = null)
        {
            let keyUrl = url.replace(assetMgr.cdnRoot, "");
            let guid = assetMgr.urlmapGuid[keyUrl];
            if (!guid)
            {
                if (url.endsWith(".assetbundle.json"))
                    guid = assetBundle.buildGuid();
                else
                    guid = resID.next();//生成一个guid
            }
            let state = new stateLoad();
            type = type == AssetTypeEnum.Auto ? calcType(url) : type;
            if (assetMgr.mapGuid[guid])//已下载的资源
            {

                state.bundle = this.guid_bundles[guid];
                state.isfinish = true;
                if(onstate) onstate (state);
                return;
            }

            //只下载一次 其他入队
            this.download(guid, url, type, () =>
            {//下载完毕
                let loading = assetMgr.mapLoading[guid];
                if (type == AssetTypeEnum.Bundle)
                {
                    let bundle = new assetBundle(url, this, guid);
                    bundle.onDownloadFinish = downloadFinish;
                    this.name_bundles[bundle.name] = this.kurl_bundles[keyUrl] = this.guid_bundles[bundle.guid] = bundle;
                    //这个过程中有可能会被释放 ,所以以下从新赋值引用
                    bundle.parseBundle(loading.data).then(() =>
                    {
                        //加载完成时再次 存储引用
                        if (!this.name_bundles[bundle.name] || !this.kurl_bundles[keyUrl] || !this.guid_bundles[bundle.guid])
                            this.name_bundles[bundle.name] = this.kurl_bundles[keyUrl] = this.guid_bundles[bundle.guid] = bundle;
                        state.bundle = bundle;
                        state.isfinish = true;
                        if(onstate) onstate (state);
                    }).catch((err) =>
                    {
                        error.push(err);
                        state.iserror = true;
                        // console.error(`##抛出重试 ${bundle.name} ---- `);
                        if(onstate) onstate (state);
                    });
                } else
                {
                    let filename = getFileName(url);
                    const next = (name, guid, type, dwguid?: number) =>
                    {
                        this.parseRes({ name, guid, type, dwguid }).then((asset: IAsset) =>
                        {
                            //解析完毕
                            state.isfinish = true;
                            if (asset)
                            {
                                state.resstateFirst = {
                                    res: asset,
                                    state: 0,
                                    loadedLength: 0
                                };
                            }
                            if(onstate) onstate (state);
                        });
                    }

                    let factory = assetParseMap[type];
                    if (factory.needDownload)
                    {
                        let nname = factory.needDownload(assetMgr.mapLoading[guid].data);
                        let nurl = url.replace(filename, nname);
                        let nguid = resID.next();
                        let ntype = calcType(nname);
                        if (ntype == AssetTypeEnum.Texture)
                            this.loadImg(nguid, nurl, next.bind(this, filename, guid, type, nguid));//不一样的是这里带了一个需要下载的GUID
                        else
                            this.download(nguid, nurl, ntype, next.bind(this, filename, guid, type, nguid), (err) =>
                            {
                                assetMgr.setStateError(state, onstate, err);
                            });//不一样的是这里带了一个需要下载的GUID
                    } else
                    {
                        let dwguid = type == AssetTypeEnum.Texture ? guid : null;
                        next.call(this, filename, guid, type, dwguid);
                    }

                }
            }, (err) =>
            {
                assetMgr.setStateError(state, onstate, err);
            });
        }
        /**
         * 设置状态异常
         * @param state 状态
         * @param onstate 状态时变化回调函数
         * @param err 异常
         */
        static setStateError(state: stateLoad, onstate: (state?: stateLoad) => void, err: Error)
        {
            state.errs.push(err);
            state.iserror = true;
            if(onstate) onstate (state);
        }

        /**
         * 执行下载资源
         * @param guid id
         * @param url 资源路径
         * @param type 资源类型
         * @param finish 结束回调
         * @param errcb 异常回调
         * @param bundle bundle包对象
         * @returns 
         */
        download(guid: number, url: string, type: AssetTypeEnum, finish: () => void, errcb?: (err: Error) => void, bundle?: assetBundle)
        {
            let loading = assetMgr.mapLoading[guid];
            //下载完成的不再下载
            if (loading && loading.readyok && finish)
                return finish();
            else if (!loading)
            {
                loading = { readyok: false, url: url };
                assetMgr.setLoading(guid, loading);
            }

            if (type == AssetTypeEnum.Texture)
            {
                loading.cbQueue = [];
                this.loadImg(guid, url, (img) =>
                {
                    finish();
                }, bundle);
                return;
            }

            let repType: "text" | "arraybuffer" = calcReqType(type);
            if (repType == null)
            {
                error.push(new Error(`无法识别类型 url:${url} , guid:${guid} , enum:${AssetTypeEnum[type]},type:${type}`));
                return;
            }
            io.xhrLoad(url, (data, err) =>
            {
                console.error(err.stack);
                if (errcb)
                    errcb(err);
            }, () => { }, repType, (xhr) =>
            {
                let loading = assetMgr.mapLoading[guid];
                if (!loading)
                {
                    if (bundle && bundle.isunload == true)
                    {
                        console.error(`资源下载取消:${url} , bundle:${bundle.name} 已释放`);
                        return;
                    }
                    loading = { readyok: true };
                    assetMgr.setLoading(guid, loading);
                } else
                {
                    loading.readyok = true;
                }
                loading.data = xhr.response;
                finish();
            });
        }

        /**
         * 加载图片
         * @param guid id
         * @param url 资源路径
         * @param cb 回调
         * @param bundle bundle包对象
         */
        loadImg(guid: number, url: string, cb: (img , err?) => void, bundle?: assetBundle)
        {
            if (assetMgr.mapImage[guid])
                return cb(assetMgr.mapImage[guid]);

            let loading = assetMgr.mapLoading[guid];
            if (!loading)
            {
                loading = { readyok: false, cbQueue: [] };
                assetMgr.setLoading(guid, loading);
            }
            loading.cbQueue.push(cb);
            this._loadImg(url, (img , err) =>
            {
                if (bundle && bundle.isunload == true)
                {
                    console.error(`img下载取消:${url} , bundle:${bundle.name} 已释放`);
                    loading.cbQueue = [];
                    return;
                }
                assetMgr.mapImage[guid] = img;
                loading.readyok = true;
                loading.data = img;
                while (loading.cbQueue.length > 0){
                    let _cb = loading.cbQueue.shift() as (img , err?) => void;
                    if(_cb) _cb(img , err);
                }
            });
        }

        /**
         * 微信可复写
         * @param url 资源路径
         * @param cb 回调
         */
        protected _loadImg(url: string, cb: (img , err?) => void)
        {
            let img = new Image();
            //webgl跨域渲染要这样玩 [crossOrigin = ""]否则服务器允许跨域也没用
            img.crossOrigin = "";
            img.src = url;
            img.onload = ()=>{
                if(cb) cb(img);
            }
            img.onerror = (_err)=>{
                if(cb) cb(img , _err);
            }
        }

        /**
         * 注册使用资源
         * @param asset 
         */
        use(asset: IAsset)
        {
            let guid = asset.getGUID();
            let ref = assetMgr.mapGuid[guid];
            if (!ref)
            {
                ref = new assetRef();
                ref.asset = asset;
                ref.refcount = 1;
                assetMgr.mapGuid[guid] = ref;
                if (asset.bundle)
                {
                    if (!assetMgr.mapBundleNamed[asset.bundle.guid])
                    {
                        assetMgr.mapBundleNamed[asset.bundle.guid] = {};
                        assetMgr.mapBundleNamed[asset.bundle.guid][asset.getName()] = ref;
                    } else
                    {
                        if (!assetMgr.mapBundleNamed[asset.bundle.guid][asset.getName()])
                            assetMgr.mapBundleNamed[asset.bundle.guid][asset.getName()] = ref;
                        // else
                        //     console.warn(`资源命名冲突:${asset.getName()}`);
                    }
                } else
                {
                    // if (assetMgr.mapNamed[asset.getName()])
                    //     console.warn(`资源命名冲突:${asset.getName()}`);
                    assetMgr.mapNamed[asset.getName()] = asset;
                }
            } else
                ++ref.refcount;
        }

        /**
         * 取消使用资源
         * @param asset 
         */
        unuse(asset: IAsset, disposeNow: boolean = true)
        {
            let guid = asset.getGUID();
            let assetref = assetMgr.mapGuid[guid];
            if (disposeNow && assetref && --assetref.refcount < 1)
            {
                delete assetMgr.mapGuid[guid];
                delete assetMgr.mapLoading[asset.getGUID()];
                delete assetMgr.mapNamed[assetref.asset.getName()];
            }
        }

        /**
         * 解析资源
         * @param asset 资源
         * @param bundle bundle包对象
         * @returns 资源Promise
         */
        parseRes(asset: { guid: number, type: number, name: string, dwguid?: number }, bundle?: assetBundle)
        {
            return new Promise<IAsset>((resolve, reject) =>
            {
                if (assetMgr.mapGuid[asset.guid])
                {
                    resolve(assetMgr.mapGuid[asset.guid].asset);
                    return;
                }
                // let ctime = Date.now();
                let loading = assetMgr.mapLoading[asset.guid];
                if (!loading)
                    return reject(new Error(`资源解析失败 name:${asset.name},bundle:${bundle ? bundle.url : ""} assetMgr.mapLoading 无法找到guid:${asset.guid}`));
                let data = loading.data;
                let factory = assetParseMap[asset.type];
                if (!factory)
                    return reject(new Error(`无法找到[${AssetTypeEnum[asset.type]}]的解析器`));
                if (!factory.parse)
                    return reject(new Error(`解析器 ${factory.constructor.name} 没有实现parse方法`));

                let _this = this;
                function nextRes(retasset)
                {
                    if (retasset)
                    {
                        if (bundle)
                        {
                            if (bundle.isunload == true)
                            {
                                console.error(`资源解析取消 name:${asset.name} , bundle:${bundle.name}`);
                                return;
                            }
                            retasset["id"].id = asset.guid;
                        }
                        retasset.bundle = bundle;
                        _this.use(retasset);
                    }
                    resolve(retasset);
                }
                try
                {
                    let __asset: any = factory.parse(this, bundle, asset.name, data, asset.dwguid);

                    let retasset: IAsset = __asset;
                    // if (__asset instanceof threading.gdPromise){
                    if (__asset && __asset["then"])
                    {
                        __asset.then((res) =>
                        {
                            nextRes(res);
                        }).catch((e) =>
                        {
                            reject(e);
                        });
                        // console.error(`[解析资源] await 完成 ${asset.name}`);
                    } else
                        nextRes(retasset);
                } catch (error)
                {
                    console.error(`资源解析错误:${error.message}\n${error.stack}`);
                    reject(error);
                }
                // console.log(`解析完成[${AssetTypeEnum[asset.type]}]${Date.now() - ctime}ms,解析器:${factory.constructor.name},guid:${asset.guid},name:${asset.name}`);
            });
        }

        /**
         * 通过资源名获取资源
         * @param name 资源名
         * @param bundlename bundle名
         * @returns 资源
         */
        getAssetByName<T extends IAsset>(name: string, bundlename?: string): T
        {
            if (bundlename)
            {
                let bundle = this.kurl_bundles[bundlename] || this.name_bundles[bundlename];
                if (bundle)
                {
                    let guid = bundle.files[name.replace(".prefab", ".cprefab")];
                    if (guid != undefined && assetMgr.mapGuid[guid])
                        return assetMgr.mapGuid[guid].asset as T;
                }
            }
            return assetMgr.mapNamed[name] as T;
        }

        //#region api保留
        mapDefaultMesh: { [id: string]: mesh } = {};
        mapDefaultTexture: { [id: string]: texture } = {};
        mapDefaultCubeTexture: { [id: string]: texture } = {};
        mapDefaultSprite: { [id: string]: sprite } = {};
        mapMaterial: { [id: string]: material } = {};
        /**
         * 获取默认mesh
         * @param name mesh名
         * @returns mesh
         */
        getDefaultMesh(name: string): mesh { return this.mapDefaultMesh[name]; }
        /**
         * 获取默认纹理
         * @param name 纹理名
         * @returns 纹理
         */
        getDefaultTexture(name: string): texture { return this.mapDefaultTexture[name]; }
        /**
         * 获取默认cube纹理
         * @param name cube纹理名
         * @returns cube纹理
         */
        getDefaultCubeTexture(name: string): texture { return this.mapDefaultCubeTexture[name]; }
        /**
         * 获取默认sprite
         * @param name sprite名
         * @returns sprite
         */
        getDefaultSprite(name: string): sprite { return this.mapDefaultSprite[name]; }
        /**
         * 获取默认材质
         * @param name 材质名
         * @returns 材质
         */
        getMaterial(name: string): material { return this.mapMaterial[name]; }

        static useBinJs: boolean = false;
        static txt = ".txt";
        private static bin = ".bin";
        app: m4m.framework.application;
        shaderPool: m4m.render.shaderPool;
        webgl: WebGL2RenderingContext;
        mapRes: { [id: number]: any } = {};
        /**
         * 资源管理器
         * @param app 引擎app
         */
        constructor(app: application)
        {
            this.app = app;
            this.webgl = app.webgl;
            this.shaderPool = new m4m.render.shaderPool();
            // this.initAssetFactorys();
        }
        /**
         * 修正文件名
         * @param name 文件名
         * @returns 修正的文件名
         */
        static correctFileName(name: string): string
        {
            if (name.indexOf(this.bin) < 0)
            {
                return name;
            }
            let binlen = this.bin.length;
            let substr = name.substring(name.length - binlen);
            if (substr == this.bin)
            {
                return name + ".js";
            }
            return name;
        }
        /**
         * 修正文本文件名
         * @param name 文件名
         * @returns 修正的文件名
         */
        static correctTxtFileName(name: string): string
        {
            if (name.indexOf(this.txt) < 0)
            {
                return name;
            }
            let len = this.txt.length;
            let substr = name.substring(name.length - len);
            if (substr == this.txt)
            {
                return name + ".js";
            }
            return name;
        }
        /**
         * 获取着色器
         * @param name 着色器名
         * @returns 着色器
         */
        getShader(name: string): m4m.framework.shader
        {
            return this.mapShader[name];
        }
        private linerenderermat: material;
        /**
         * 获取默认线渲染材质
         * @returns 材质
         */
        getDefLineRendererMat(): material
        {
            if (this.linerenderermat == null)
            {
                let material = new framework.material();
                material.use();
                material.setShader(sceneMgr.app.getAssetMgr().getShader("shader/deflinetrail"));

                var tex = this.getDefaultTexture(defTexture.white);
                material.setTexture("_MainTex", tex);
                this.linerenderermat = material;
            }
            return this.linerenderermat;
        }
        private particlemat: material;
        /**
         * 获取默认粒子渲染材质
         * @returns 材质
         */
        getDefParticleMat(): material
        {
            if (this.particlemat == null)
            {
                var mat = new material("defparticle");
                var shader = this.getShader("particles_additive.shader.json");
                if (shader == null)
                {
                    shader = this.getShader("shader/def");
                }
                mat.setShader(shader);
                var tex = this.getDefaultTexture("grid");
                mat.setTexture("_MainTex", tex);
                this.particlemat = mat;
            }
            return this.particlemat;
        }
        private assetUrlDic: { [id: number]: string };// = {};
        /**
         * 设置资源url
         * @param asset 资源
         * @param url url
         */
        setAssetUrl(asset: IAsset, url: string)
        {
            // this.assetUrlDic[asset.getGUID()] = url;
        }
        /**
         * 获取资源url
         * @param asset 资源
         * @returns 资源url
         */
        getAssetUrl(asset: IAsset): string
        {
            return this.assetUrlDic[asset.getGUID()];
        }
        maploaded: { [url: string]: IAsset };// = {};
        /** @deprecated [已弃用] */
        savePrefab(trans: transform, prefabName: string, fun: (data: SaveInfo, resourses?: string[], contents?: any[]) => void)
        {
        }
        /** @deprecated [已弃用] */
        loadCompressBundle(url: string, a?)
        {
        }
        /** @deprecated [已弃用] */
        loadImmediate(url: string)
        {
            return null;
        }
        /** @deprecated [已弃用] */
        getAssetBundle(url: string): assetBundle
        {
            return this.name_bundles[url];
        }
        /** @deprecated [已弃用] */
        releaseUnuseAsset()
        {
        }
        /**
         * 初始默认资源
         */
        initDefAsset()
        {
            defMesh.initDefaultMesh(this);
            defTexture.initDefaultTexture(this);
            defsprite.initDefaultSprite(this);
            defShader.initDefaultShader(this);
            defmaterial.initDefaultMaterial(this);
        }
        /**
         * 加载场景
         * @param sceneName 场景名
         * @param onComplete 结束回调
         */
        loadScene(sceneName: string, onComplete: (firstChilds: Array<transform>) => void)
        {
            let firstChilds = new Array<transform>();
            let scene = this.app.getScene();
            if (sceneName.length > 0)
            {
                var _rawscene: rawscene = this.getAssetByName(sceneName, sceneName.replace(".scene.json", ".assetbundle.json")) as rawscene;
                let willLoadRoot = _rawscene.getSceneRoot();
                while (willLoadRoot.children.length > 0)
                {
                    let trans = willLoadRoot.children.shift();
                    firstChilds.push(trans);
                    scene.addChild(trans);
                }
                //清空原场景UI
                scene["_overlay2d"] = new Array<overlay2D>();
                //lightmap
                _rawscene.useLightMap(scene);
                //fog
                _rawscene.useFog(scene);
                //nav
                _rawscene.useNavMesh(scene);
            }
            else
            {
                var _camera: transform = new transform();
                _camera.gameObject.addComponent("camera");
                _camera.name = "camera";
                firstChilds.push(_camera);
                scene.addChild(_camera);
            }
            scene.name = sceneName;
            scene.getRoot().markDirty();
            onComplete(firstChilds);
        }
        /**
         * 卸载
         * @param url 资源url
         */
        unload(url: string): void
        {
            let keyUrl = url.replace(assetMgr.cdnRoot, "");

            let guid = assetMgr.urlmapGuid[keyUrl];
            if (guid)
            {
                let name = getFileName(keyUrl);
                delete assetMgr.mapNamed[name];
                delete assetMgr.mapLoading[guid];
                delete assetMgr.mapGuid[guid];
            } else if (this.kurl_bundles[keyUrl])
            {
                let bundle = this.kurl_bundles[keyUrl];
                bundle.unload();
            }
        }
        //#endregion
    }
    //#region api保留
    export class SaveInfo
    {
        files: { [key: string]: string } = {};
    }
    //#endregion api保留

    //--------------api保留----------------end
}