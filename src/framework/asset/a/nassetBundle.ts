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
    type fileIdMap = { [name: string]: number };
    export class assetBundle {
        /** 解析后清理 加载缓存资源数据 */
        static needClearLoadedRes = false;
        static idNext = -1;//id起始位置               
        /** 关注的 二进制 纹理格式 字符串 */
        private static careBinTexMap = {
            ".raw": AssetTypeEnum.RAW,
            ".pvr": AssetTypeEnum.PVR,
            ".pvr.bin": AssetTypeEnum.PVR,
            ".astc": AssetTypeEnum.ASTC,
            ".ktx": AssetTypeEnum.KTX,
        }
        /** 关注的 基础 纹理格式 字符串 */
        private static careBaseTexMap = {
            ".png": AssetTypeEnum.Texture,
            ".jpg": AssetTypeEnum.Texture,
        }

        /** 修复 texs map */
        private static enableFixTexs = true;

        files: fileIdMap = {}; //Array<{ name: string, guid: number }>;

        texs: fileIdMap = {};

        pkgs: string[] = [];

        pkgsGuid: number[] = [];

        url: string;

        baseUrl: string;

        keyUrl: string;

        guid: number; //bundle 的guid和普通资源的guid 是靠起始位置区分的        

        name: string;

        dw_imgCount: number;

        dw_fileCount: number;
        /**
         * onReady
         */
        onReady: () => void;
        /**
         * 加载完毕回调
         */
        onDownloadFinish: () => void;
        ready: boolean;
        isunload: boolean = false;
        /**
         * 解析成功执行函数
         */
        parseResolve: (o?) => void;
        /**
         * 解析失败执行函数
         */
        parseReject: (o: Error) => void;
        static reTryTest = {};
        /**
         * 资源包
         * @param url url
         * @param assetmgr 资源管理器 
         * @param guid id
         */
        constructor(url: string, private assetmgr: assetMgr, guid?: number) {
            this.guid = guid || assetBundle.buildGuid();
            this.url = url;
            this.baseUrl = url.substring(0, url.lastIndexOf("/") + 1);
            this.name = url.substring(url.lastIndexOf("/") + 1);
            this.keyUrl = url.replace(assetMgr.cdnRoot, "");
        }

        /**
         * 生成GUID
         * @returns 
         */
        public static buildGuid() {
            //资源包自己的使用的GUID
            return --assetBundle.idNext;
        }

        /**
         * 获取Bundle的所有纹理
         * @param texMap 纹理容器字典
         * @param fileMap 文件字典
         * @returns 所有纹理
         */
        private getFixBundleTextures(texMap: fileIdMap, fileMap: fileIdMap): fileIdMap {
            let result: fileIdMap = {};
            let careBinMap = assetBundle.careBinTexMap;
            let careMap = assetBundle.careBaseTexMap;
            let texStrList = Object.keys(careMap).concat(Object.keys(careBinMap));
            for (let key in texMap) {
                if (!key) continue;
                let val = texMap[key];
                result[key] = val;  //已有的 
                let idx = key.lastIndexOf(".");
                let fileName = key;
                if (idx != -1) {
                    fileName = key.substring(0, idx);
                }
                for (let i = 0, len = texStrList.length; i < len; i++) {
                    //包含以有文件
                    let val = texStrList[i];
                    let fullName = `${fileName}${val}`;
                    if (fileMap[fullName] == null) continue;
                    result[fullName] = fileMap[fullName];   //其他格式的
                }
            }
            return result;
        }



        /**
         * 解析资源包描述文件 和下载
         * @param data json文本字符串数据
         * @returns Promise
         */
        parseBundle(data: string) {
            return new Promise((resolve, reject) => {
                this.parseResolve = resolve;
                this.parseReject = reject;

                if (assetBundle.reTryTest[this.name]) {
                    console.error(`资源 ${this.name} 正在重试 , ${this.url}`);
                    delete assetBundle.reTryTest[this.name];
                    this.ready = false;
                }

                let json;
                try {
                    json = JSON.parse(data);
                } catch (error) {
                    this.fail(new Error(`[资源]描述文件错误 ${this.url} ,${error.message}`));
                    return;
                }
                this.files = json.files;
                this.texs = assetBundle.enableFixTexs ? this.getFixBundleTextures(json.texs, json.files) : json.texs;
                this.pkgs = json.pkg;

                if (!assetMgr.openGuid) {
                    for (let k in this.files)
                        this.files[k] = assetBundle.buildGuid();
                    for (let k in this.texs)
                        this.texs[k] = assetBundle.buildGuid();
                }

                this.dw_imgCount = this.dw_fileCount = Object.keys(this.texs || {}).length;
                let dwpkgCount = 0;
                if (this.pkgs) {
                    this.dw_fileCount += Object.keys(this.pkgs).length;
                    // console.log(`当前资源是压缩状态.`);

                    this.pkgsGuid = this.pkgsGuid || [];

                    var nameURL = this.url.substring(0, this.url.lastIndexOf(".assetbundle"));

                    for (let i = 0, len = this.pkgs.length; i < len; ++i) {
                        let extName = this.pkgs[i].substring(this.pkgs[i].indexOf("."));
                        let url = nameURL + extName;
                        let kurl = url.replace(assetMgr.cdnRoot, "");
                        let guid = assetMgr.urlmapGuid[kurl];
                        if (!guid)
                            guid = assetBundle.buildGuid();
                        this.pkgsGuid.push(guid);
                        // console.error(`[下載資源] 00 ${this.name},${url}  ,${dwpkgCount}/${this.dw_fileCount}`);
                        this.assetmgr.download(guid, url, calcType(url), () => {
                            ++dwpkgCount;
                            // console.error(`[下載資源] 11 ${this.name},${url}  ,${dwpkgCount}/${this.dw_fileCount}`);
                            if (dwpkgCount >= this.dw_fileCount)
                                this.parseFile();
                        }, () => {
                            console.error(`[下載資源]失败:${kurl} ,bundle:${this.name}`);
                        }, this);
                    }
                } else {
                    this.dw_fileCount += Object.keys(this.files).length;
                    // console.log(`当前资源是分包状态.`);
                    for (let k in this.files) {
                        let guid = this.files[k];
                        let url = `${this.baseUrl}resources/${k}`;
                        // console.error(`[下載資源] 00 ${this.name},${url}  ,${dwpkgCount}/${this.dw_fileCount}`);
                        this.assetmgr.download(guid, url, calcType(k), () => {
                            ++dwpkgCount;
                            // console.error(`[下載資源] 11 ${this.name},${url}  ,${dwpkgCount}/${this.dw_fileCount}`);
                            if (dwpkgCount >= this.dw_fileCount)
                                this.parseFile();
                        }, () => {
                            console.error(`[下載資源]失败:${url} ,bundle:${this.name}`);
                        }, this);
                    }
                }


                //下载图片
                const imageNext = function (url) {
                    ++dwpkgCount;
                    // console.error(`[下載資源] 11 ${this.name},${url}  ,${dwpkgCount}/${this.dw_fileCount}`);
                    if (dwpkgCount >= this.dw_fileCount)
                        this.parseFile();
                }
                
                let careBinMap = assetBundle.careBinTexMap;
                let careMap = assetBundle.careBaseTexMap;
                for (let k in this.texs) {
                    let guid = this.texs[k];
                    this.files[k] = guid;//先下载 然后给解析器补充一个key
                    let url = `${this.baseUrl}resources/${k}`;
                    // console.error(`[下載資源] 00 ${this.name},${url}  ,${dwpkgCount}/${this.dw_fileCount}`);
                    let suffix = StringUtil.GetSuffix(k);

                    if(careMap[suffix] != null){
                        this.assetmgr.loadImg(guid, url, imageNext.bind(this, url), this);
                        continue;
                    }

                    if(careBinMap[suffix] != null){
                        let t = careBinMap[suffix];
                        this.assetmgr.download(guid, url, t, imageNext.bind(this, url), () => {
                            console.error(`[下載資源]失败:${url} ,bundle:${this.name}`);
                        }, this);
                    }

                    // if (k.endsWith(".png") || k.endsWith(".jpg"))
                    //     this.assetmgr.loadImg(guid, url, imageNext.bind(this, url), this);
                    // else if (k.endsWith(".raw"))
                    //     this.assetmgr.download(guid, url, AssetTypeEnum.RAW, imageNext.bind(this, url), () => {
                    //         console.error(`[下載資源]失败:${url} ,bundle:${this.name}`);
                    //     }, this);
                    // else if (k.endsWith(".astc"))
                    //     this.assetmgr.download(guid, url, AssetTypeEnum.ASTC, imageNext.bind(this, url), () => {
                    //         console.error(`[下載資源]失败:${url} ,bundle:${this.name}`);
                    //     }, this);
                    // else if (k.endsWith(".pvr"))
                    //     this.assetmgr.download(guid, url, AssetTypeEnum.PVR, imageNext.bind(this, url), () => {
                    //         console.error(`[下載資源]失败:${url} ,bundle:${this.name}`);
                    //     }, this);
                    // else if (k.endsWith(".pvr.bin"))
                    //     this.assetmgr.download(guid, url, AssetTypeEnum.PVR, imageNext.bind(this, url), () => {
                    //         console.error(`[下載資源]失败:${url} ,bundle:${this.name}`);
                    //     }, this);
                    // else if (k.endsWith(".ktx"))
                    //     this.assetmgr.download(guid, url, AssetTypeEnum.KTX, imageNext.bind(this, url), () => {
                    //         console.error(`[下載資源]失败:${url} ,bundle:${this.name}`);
                    //     }, this);
                }
            });
        }

        /**
         * 解包
         */
        private unpkg() {
            for (let i = this.pkgsGuid.length - 1; i >= 0; --i) {
                var pkgGuid = this.pkgsGuid[i];
                var pkgld = assetMgr.mapLoading[pkgGuid];
                if (!pkgld || !pkgld.data || pkgld.data == 0)//被解析过了不再解析 项目中标记的 
                    continue;
                var isbin = this.pkgs[i].endsWith(".bpkg.json");
                pkgld.subRes = [];
                if (isbin) {   //二进制压缩 带图片
                    try {
                        var buffer: ArrayBuffer = pkgld.data;
                        var reader = new io.binReader(buffer);
                        var count = reader.readByte();
                        // console.log(`解压二进制包,文件数:${count}`);
                        while (count-- > 0) {
                            var nl = reader.readByte();
                            var namebytes = reader.readBytesRef(nl);
                            var name = String.fromCharCode.apply(null, namebytes);
                            var fsize = reader.readUInt32();
                            var bin = reader.readBytesRef(fsize);
                            var guid = this.files[name] || this.texs[name];//如果文件找不到,就去找图片                            

                            assetMgr.setLoading(guid, { readyok: true, data: bin.buffer });

                            pkgld.subRes.push(guid);
                            // console.log(`解压 bin文件${name},size:${fsize},guid:${guid}`);
                        }
                    } catch (error) {
                        throw new Error(`[解析資源]unpkg bpkg失败:${this.url},${this.pkgs[i]}\n${error.message}`);
                    }
                } else {
                    try {
                        let json = JSON.parse(pkgld.data);
                        // console.log(`解压文本包,文件数:${Object.keys(json).length}`);
                        for (let k in json) {
                            var guid = this.files[k];
                            assetMgr.setLoading(guid, { readyok: true, data: json[k] });
                            pkgld.subRes.push(guid);
                            // console.log(`解压 text文件${k},size:${json[k].length},${guid}`);
                        }
                    } catch (error) {
                        throw new Error(`[解析資源]unpkg jpkg失败:${this.url},${this.pkgs[i]}\n${error.message}`);
                    }

                }
                //释放原数据
                delete pkgld.data;

            }

        }

        /**
         * 解析文件
         * @returns Promise
         */
        async parseFile() {
            if (this.onDownloadFinish)
                this.onDownloadFinish();
            // console.error(`解析资源:${this.url}`);
            // if (!this.ready)
            {
                // if (!assetMgr.atonceParse)
                // {
                //     assetMgr.noparseBundle.push(this);
                //     return;
                // }


                if (this.pkgs)//如果需要解包就解
                {
                    try {
                        this.unpkg();
                    } catch (error) {
                        this.fail(error);
                        return;
                    }
                }

                let assets: Array<any> = [];
                // let idx = 0;
                for (let k in this.files) {
                    //已经解析的资源不再做解析
                    if (assetMgr.mapGuid[this.files[k]])
                        continue;
                    let type = calcType(k);
                    assets.push({
                        type,
                        name: k,
                        guid: this.files[k]
                    });

                }

                //解析顺序按枚举从小到大来排序
                assets.sort((a, b) => { return a.type - b.type; });

                for (var i = 0, len = assets.length; i < len; ++i) {
                    let asset = assets[i];
                    // console.error(`[解析资源] 00 name:${asset.name} ,bundle:${this.name}  ${i}/${assets.length}`);
                    if (assetMgr.mapGuid[asset.guid])
                        continue;//已经解析好的资源不需要再解析

                    try {
                        await this.assetmgr.parseRes(asset, this);
                        // console.error(`[解析资源] 11 name:${asset.name} ,bundle:${this.name} ${i}/${assets.length}`);
                    } catch (error) {
                        // console.error(`[解析资源]失败:${asset.name} ,bundle:${this.name} ${i}/${assets.length}`);
                        this.fail(error);
                        return;
                    }

                }
                this.ready = true;
                // console.log(`资源包:${this.name} 准备完毕. 解析耗时${Date.now() - time}/ms`);

                //清理 多余img
                if (assetBundle.needClearLoadedRes) {
                    //img map
                    let texs = this.texs;
                    for (let key in texs) {
                        let id = texs[key];
                        delete assetMgr.mapImage[id];
                        //loading map 
                        let loading = assetMgr.mapLoading[id];
                        if (loading && loading.readyok) {
                            delete loading.data;
                        }
                    }
                }
            }
            this.parseResolve();
        }

        /**
         * 卸载资源
         * @param disposeNow 
         */
        unload(disposeNow: boolean = false) {
            this.isunload = true;
            for (let k in this.files) {
                var ref = assetMgr.mapGuid[this.files[k]];
                if (ref)
                    this.assetmgr.unuse(ref.asset, disposeNow);
            }
            for (let k in this.texs)
                delete assetMgr.mapImage[this.texs[k]];

            while (this.pkgsGuid.length > 0) {
                let guid = this.pkgsGuid.pop();
                let ref = assetMgr.mapGuid[guid];
                if (ref)
                    this.assetmgr.unuse(ref.asset, disposeNow);
                else
                    delete assetMgr.mapLoading[guid];
            }
            delete this.assetmgr.guid_bundles[this.guid];
            delete this.assetmgr.name_bundles[this.name];
            delete this.assetmgr.kurl_bundles[this.keyUrl];
            delete assetMgr.mapBundleNamed[this.guid];
            delete assetMgr.mapGuid[this.guid];
        }
        /**
         * 失败调用函数
         * @param error 
         */
        fail(error: Error) {
            assetBundle.reTryTest[this.name] = 1;
            // this.unload(true);
            this.parseReject(error);
        }
    }
}