/**
@license
Copyright 2022 meta4d.me Authors

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
// namespace m4m.framework.old {
//     /**
//      * @public
//      * @language zh_CN
//      * @classdesc
//      * 资源包
//      * @version m4m 1.0
//      */
//     export class assetBundle {

//         /**
//          * @public
//          * @language zh_CN
//          * @classdesc
//          * 包名
//          * @version m4m 1.0
//          */
//         public name: string;
//         /**
//          * @public
//          * @language zh_CN
//          * 资源管理器实例
//          * @version m4m 1.0
//          */
//         assetmgr: assetMgr;
//         private files: { name: string, length: number, packes: number, guid: string, zip_Length: number }[] = [];
//         private packages: string[] = [];

//         private bundlePackBin: { [name: string]: ArrayBuffer } = {};
//         private bundlePackJson: JSON;
//         /**
//          * @public
//          * @language zh_CN
//          * @classdesc
//          * 包完整路径
//          * @version m4m 1.0
//          */
//         url: string;
//         /**
//          * @public
//          * @language zh_CN
//          * @classdesc
//          * 不带包名路径
//          * @version m4m 1.0
//          */
//         path: string;

//         /**
//          * @public
//          * @language zh_CN
//          * @classdesc
//          * 资源的总字节数
//          * @version m4m 1.0
//          */
//         totalLength: number = 0;

//         loadLightMap: boolean = true;

//         //guid等待加载完毕回调 资源计数
//         private waitGuidCount = 0;

//         constructor(url: string) {
//             this.url = url;
//             let i = url.lastIndexOf("/");
//             this.path = url.substring(0, i);

//             // this.assetmgr = m4m.framework.sceneMgr.app.getAssetMgr();
//             if (this.assetmgr.waitlightmapScene[url]) {
//                 this.loadLightMap = false;
//             }
//         }
//         loadCompressBundle(url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetmgr: assetMgr) {
//             state.totalByteLength = this.totalLength;
//             // console.log(`ab loadCompressBundle ${url}`);
//             m4m.io.loadText(url, (txt, err, isloadFail) => {
//                 if (err != null) {
//                     state.isloadFail = isloadFail ? true : false;
//                     state.iserror = true;
//                     state.errs.push(new Error(err.message));
//                     onstate(state);
//                     return;
//                 }
//                 // console.log(`ab loadCompressBundlew 下载完成 ${url}`);

//                 let json = JSON.parse(txt);
//                 this.bundlePackJson = json;
//                 this.parse(json["bundleinfo"], this.totalLength);
//                 this.load(assetmgr, onstate, state);

//                 assetmgr.mapBundle[this.name] = this;
//             },
//                 (loadedLength, totalLength) => {
//                     state.compressTextLoaded = loadedLength;
//                     onstate(state);
//                 });
//         }

//         /**
//          * @public
//          * @language zh_CN
//          * @classdesc
//          * 解析包
//          * @param json 
//          * @version m4m 1.0
//          */
//         parse(json: any, totalLength: number = 0) {
//             let files = json["files"];
//             for (let i = 0; i < files.length; i++) {
//                 let item = files[i];
//                 let packes = -1;
//                 if (item.packes != undefined)
//                     packes = item.packes;
//                 if (!this.loadLightMap && (item.name as string).indexOf("LightmapFar-") >= 0) {
//                     this.assetmgr.waitlightmapScene[this.url].push(this.path + "/" + item.name);
//                     continue;
//                 }
//                 this.files.push({ name: item.name, length: item.length, packes: packes, guid: item.guid, zip_Length: item.zip_Length });
//                 if (item.guid != undefined) {
//                     this.mapNameGuid[item.name] = item.guid;
//                 }
//             }
//             if (json["packes"] != undefined) {
//                 let packes = json["packes"];
//                 for (let i = 0; i < packes.length; i++) {
//                     this.packages.push(packes[i]);
//                 }
//             } else {
//                 if (json["totalLength"] != undefined) {
//                     if (totalLength == 0) {
//                         this.totalLength = json["totalLength"];
//                     }
//                 }
//             }
//         }
//         /**
//          * @public
//          * @language zh_CN
//          * @classdesc
//          * 卸载包 包内对应的资源引用计数减一
//          * @param disposeNow 如果引用计数归零则立即释放
//          * @version m4m 1.0
//          */
//         unload(disposeNow: boolean = false) {
//             for (let key in this.mapNamed) {
//                 let asset = this.assetmgr.getAssetByName(key, this.name);
//                 if (asset) {
//                     this.assetmgr.unuse(asset, disposeNow);
//                 }
//             }
//             this.assetmgr.removeAssetBundle(this.name);
//         }

//         private isTextureRepeat(_type : AssetTypeEnum , name : string , list : {[name:string] : boolean }):boolean{
//             //是否是图片资源
//             if(_type != AssetTypeEnum.Texture && _type != AssetTypeEnum.PVR && _type != AssetTypeEnum.DDS) return false;
//             let idx = name.indexOf(".");
//             let decName = name.substr(0,idx) + `.imgdesc.json`;
//             return list[decName] == true;
//         }

//         /**
//          * @public
//          * @language zh_CN
//          * @classdesc
//          * 加载包
//          * @param assetmgr 资源管理器实例
//          * @param stateinfo 加载的状态信息实例
//          * @version m4m 1.0
//          */
//         load(assetmgr: assetMgr, onstate: (state: stateLoad) => void, state: stateLoad) {
//             if (assetmgr && assetmgr != this.assetmgr) {
//                 this.assetmgr = assetmgr;
//             }
//             state.totalByteLength = this.totalLength;
//             let filse = this.files;
//             let fLen = filse.length;

//             let glvshaders: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let glfshaders: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let shaders: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let meshs: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let textures: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let texturedescs: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let materials: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let anclips: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let prefabs: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let scenes: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let textassets: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let pvrs: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let packs: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let f14effs: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let fonts: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let atlass: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let ddss: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];
//             let kfaniclips: { url: string, type: AssetTypeEnum, asset: IAsset }[] = [];

            
//             let asslist: any[] = [];

//             //这里定义了加载顺序
//             asslist.push(packs, glvshaders, glfshaders, shaders, textassets, meshs,
//                 textures, pvrs, ddss, texturedescs, fonts, atlass,
//                 materials, anclips, kfaniclips, f14effs, prefabs, scenes);

//             let mapPackes: { [id: string]: number } = {};


//             //合并的包要先加载
//             for (let pack of this.packages) {
//                 let type: AssetTypeEnum = assetmgr.calcType(pack);
//                 let url = this.path + "/" + pack;
//                 packs.push({ url: url, type: type, asset: null });
//             }

//             //name map 重复贴图资源需要使用
//             let nameMap = {};
//             for(let i=0; i < fLen ;i++){
//                 let file = filse[i];
//                 nameMap[file.name] = true;
//             }            
            
//             let guidList : {[guid:string] : boolean} = {};
//             let list: { url: string, type: AssetTypeEnum, guid : string , asset: IAsset, handle: () => any }[] = [];
//             //遍历每项资源 整理到加载列表
//             for(let i=0; i < fLen ;i++){
//                 let fitem = filse[i];
//                 let type: AssetTypeEnum = assetmgr.calcType(fitem.name);
//                 //检查重复贴图资源
//                 if(this.isTextureRepeat(type,fitem.name,nameMap)) continue;

//                 let url = this.path + "/" + fitem.name;
//                 let fileName = assetmgr.getFileName(url);
//                 let guid = fitem.guid;
//                 // if (guid != undefined && !assetBundle.noParsingLoadedDic[guid]) {   //已预载过 处理
//                     if (guid != undefined) {   //已预载过 处理
//                     let mapGuid = assetmgr.mapGuidId;
//                     let mAssId = mapGuid[guid];
//                     // guid重复性检查
//                     //是否guid_map 中包含 (重复资源)
//                     if (mAssId != undefined) {
//                         //如果是来自同一个ab包的 guid重复资源 ，则不放入等待列表
//                         if (guidList[guid]) {
//                             continue;
//                         }

//                         let sRef = assetmgr.mapRes[mAssId];
//                         //同guid 资源 是否 正在加载中 
//                         if (sRef && assetmgr.assetIsLoing(sRef)) {
//                             //是 加入 guid_waitLoad_map
//                             //关联到 bundle 的 加载状态队列
//                             state.resstate[fileName] = new ResourceState();
//                             //考虑-- 失败 情况
//                             //等待执行 前后时间
//                             this.waitGuidCount++; //加入等待列表 ，计数增加

//                             let waitLoaded = () => {
//                                 let old = this.waitGuidCount;
//                                 this.waitGuidCount--; //减少计数
//                                 //检查加载结束to解析资源
//                                 this.CkNextHandleOfGuid(list, state, onstate);
//                             };

//                             assetBundle.addToWaitList(this.assetmgr,waitLoaded,guid);

//                         }
//                         continue;  //跳过 不放入加载队列
//                     }
//                 }

//                 guidList[guid] = true; //

//                 // let url = this.path + "/" + fitem.name;
//                 // let fileName = assetmgr.getFileName(url);
//                 if (fitem.packes != -1) {
//                     //压缩在包里的
//                     mapPackes[url] = fitem.packes;
//                 }

//                 {
//                     let asset = null;
//                     let _item = { url, type, guid, asset: null };
//                     switch (type) {
//                         case AssetTypeEnum.GLFragmentShader:
//                             glfshaders.push(_item);
//                             break;
//                         case AssetTypeEnum.GLVertexShader:
//                             glvshaders.push(_item);
//                             break;
//                         case AssetTypeEnum.Shader:
//                             asset = new shader(fileName);
//                             shaders.push(_item);
//                             break;
//                         case AssetTypeEnum.Texture:
//                             asset = new texture(fileName);
//                             textures.push(_item);
//                             break;
//                         case AssetTypeEnum.TextureDesc:
//                             asset = new texture(fileName);
//                             texturedescs.push(_item);
//                             break;
//                         case AssetTypeEnum.Mesh:
//                             asset = new mesh(fileName);
//                             meshs.push(_item);
//                             break;
//                         case AssetTypeEnum.Material:
//                             asset = new material(fileName);
//                             materials.push(_item);
//                             break;
//                         case AssetTypeEnum.Aniclip:
//                             asset = new animationClip(fileName);
//                             anclips.push(_item);
//                             break;
//                         case AssetTypeEnum.Prefab:
//                             asset = new prefab(fileName);
//                             prefabs.push(_item);
//                             break;
//                         case AssetTypeEnum.cPrefab:
//                             asset = new prefab(fileName);
//                             prefabs.push(_item);
//                             break;
//                         case AssetTypeEnum.Scene:
//                             asset = new rawscene(fileName);
//                             scenes.push(_item);
//                             break;
//                         case AssetTypeEnum.TextAsset:
//                             asset = new textasset(fileName);
//                             textassets.push(_item);
//                             break;
//                         case AssetTypeEnum.PVR:
//                             asset = new texture(fileName);
//                             pvrs.push(_item);
//                             break;
//                         case AssetTypeEnum.F14Effect:
//                             asset = new f14eff(fileName);
//                             f14effs.push(_item);
//                             break;
//                         case AssetTypeEnum.DDS:
//                             asset = new texture(fileName);
//                             ddss.push(_item);
//                             break;
//                         case AssetTypeEnum.Font:
//                             asset = new font(fileName);
//                             fonts.push(_item);
//                             break;
//                         case AssetTypeEnum.Atlas:
//                             asset = new atlas(fileName);
//                             atlass.push(_item);
//                             break;
//                         case AssetTypeEnum.KeyFrameAniclip:
//                             asset = new keyFrameAniClip(fileName);
//                             kfaniclips.push(_item);
//                             break;
//                     }
//                     _item.asset = asset;

//                     if (type != AssetTypeEnum.GLVertexShader && 
//                         type != AssetTypeEnum.GLFragmentShader && 
//                         type != AssetTypeEnum.Shader&& 
//                         type != AssetTypeEnum.PackBin && 
//                         type != AssetTypeEnum.PackTxt && 
//                         type != AssetTypeEnum.Prefab&&
//                         type != AssetTypeEnum.cPrefab
//                         ) {
//                         if (!asset)
//                             continue;
//                         let assId = asset.getGUID();
//                         this.mapNamed[fileName] = assId;
//                         assetmgr.regRes(fileName, asset);
//                         //注册 guid_map  {guid : AssetId}
//                         if (guid && assetmgr.mapGuidId[guid] == undefined) {
//                             assetmgr.mapGuidId[guid] = assId;
//                         }
//                     }
//                 }
//             }

//             let handles = {};
//             //按类型整理顺序到list 
//             for (let i = 0, len = asslist.length; i < len; ++i) {
//                 for (let j = 0, clen = asslist[i].length; j < clen; ++j) {
//                     let item = asslist[i][j];
//                     handles[item.url] = list.length;
//                     list.push({ url: item.url, type: item.type, guid: item.guid, asset: item.asset, handle: undefined });
//                 }
//             }


//             let packlist = [];
//             let haveBin = false;
//             let tempMap = {};
//             //按list 顺序加载
//             for (let item of list) {
//                 // let guid = item.guid;
//                 // if(guid != undefined && assetBundle.noParsingLoadedDic[guid]) continue; //判断是否在 不解析加载流程中 已经完成
//                 let surl = item.url;
//                 let type = item.type;
//                 let asset = item.asset;
//                 tempMap[surl] = 1;
//                 if (mapPackes[surl] != undefined) {
//                     packlist.push({ surl, type, asset });
//                     delete tempMap[surl];
//                     if (this.mapIsNull(tempMap))
//                         this.downloadFinsih(state, list, haveBin, onstate, packlist, mapPackes, handles);
//                 }
//                 else {
//                     if (type == AssetTypeEnum.PackBin) {
//                         haveBin = true;
//                         m4m.io.loadArrayBuffer(surl, (_buffer, err, isloadFail) => {

//                             if (err != null) {
//                                 state.isloadFail = isloadFail ? true : false;
//                                 state.iserror = true;
//                                 state.errs.push(new Error(err.message));
//                                 onstate(state);

//                                 return;
//                             }
//                             let read: m4m.io.binReader = new m4m.io.binReader(_buffer);
//                             let index = read.readInt32();
//                             read.position = index;
//                             while (read.canread()) {
//                                 let indindex = read.readInt32();
//                                 if (index == 0) break;

//                                 let key = read.readStringUtf8FixLength(indindex);
//                                 let strs: string[] = key.split('|');

//                                 let start = parseInt(strs[1]);
//                                 let len = parseInt(strs[2]);

//                                 let bufs: ArrayBuffer = _buffer.slice(start, start + len);
//                                 this.bundlePackBin[strs[0]] = bufs;
//                             }


//                             delete tempMap[surl];
//                             if (this.mapIsNull(tempMap))
//                                 this.downloadFinsih(state, list, haveBin, onstate, packlist, mapPackes, handles);

//                         },
//                             (loadedLength, totalLength) => {
//                                 state.compressBinLoaded = loadedLength;
//                                 onstate(state);
//                             });
//                     }
//                     else {

//                         assetmgr.loadSingleRes(surl, type, (s) => {
//                             if (s.iserror) {
//                                 state.iserror = true;
//                                 onstate(state);
//                                 return;
//                             }

//                             if (s.progressCall) {
//                                 s.progressCall = false;
//                                 onstate(state);
//                                 return;
//                             }



//                         }, state, asset, (data) => {

//                             list[handles[data.url]].handle = data.handle;
//                             delete tempMap[data.url];
//                             if (this.mapIsNull(tempMap))
//                                 this.downloadFinsih(state, list, haveBin, onstate, packlist, mapPackes, handles);
//                         });
//                     }

//                 }
//             }

//         }

//         //加载完毕处理
//         private downloadFinsih(state, list, haveBin: boolean, onstate, packlist, mapPackes, handles) {
//             if (haveBin) {
//                 let respackCall = (fcall: () => void) => {
//                     if (packlist.length < 1)
//                         fcall();
//                     let count = 0;
//                     for (let uitem of packlist) {
//                         //在pack里
//                         let respack;
//                         if (mapPackes[uitem.surl] == 0) respack = this.bundlePackJson;
//                         else if (mapPackes[uitem.surl] == 1) respack = this.bundlePackBin;
//                         else console.log("未识别的packnum: " + mapPackes[uitem.surl]);
//                         this.assetmgr.loadResByPack(respack, uitem.surl, uitem.type, (s) => {
//                             if (s.progressCall) {
//                                 s.progressCall = false;
//                                 onstate(state);
//                                 return;
//                             }

//                             if (state != undefined)
//                                 state.bundleLoadState |= uitem.loadstate;

//                         }, state, uitem.asset, (data) => {
//                             list[handles[data.url]].handle = data.handle;
//                             if (++count >= packlist.length)
//                                 fcall();
//                         });
//                     }
//                 };
//                 respackCall(() => {
//                     // this.NextHandle(list, state, onstate , assetmgr);
//                     this.CkNextHandleOfGuid(list, state, onstate);
//                 });
//             }
//             else
//                 // this.NextHandle(list, state, onstate,assetmgr);
//                 this.CkNextHandleOfGuid(list, state, onstate);
//         }

//         //检查GUID 去重 依赖资源包加载完毕
//         private CkNextHandleOfGuid(list, state, onstate) {
//             if (this.waitGuidCount > 0) return;
//             // this.NextHandle(list, state, onstate);
//             this.NextHandleParsing(list, state, onstate);
//         }

//         /**
//          * 添加到仅加载不解析列表 (true 成功)
//          * @param url assetBundle 的 url
//          * @param assetmgr 
//          */
//         // static addNoParsing(url:string , assetmgr : assetMgr):boolean{
//         //     if(! url || assetmgr.maploaded[url]) return false;  //对应资源已在 加载中或加载完成的 不处理
//         //     let fname = assetmgr.getFileName(url);
//         //     if(assetmgr.mapInLoad[fname] ) return false;
//         //     this.noParsingDic[url] = true;
//         //     return true;
//         // }
//         // private static noParsingDic : {[url:string]: boolean} = {};

//         // //是否需要解析
//         // static needParsing: boolean = true;

//         //待解析列表
//         // private static needParsesArr: {
//         //     [key: string]: {
//         //         keyList : string [];
//         //         list: { url: string, type: AssetTypeEnum, guid: string, asset: IAsset, handle: () => any }[],
//         //         state,
//         //         onstate,
//         //         call: (list: { url: string, type: AssetTypeEnum, guid: string, asset: IAsset, handle: () => any }[], state, onstate) => void
//         //     }
//         // } = {};


//         // //加载完毕后没解析的 字典列表
//         // private static noParsingLoadedDic : {[guid:string] : { url: string, type: AssetTypeEnum, guid: string, asset: IAsset, handle: () => any }} = {};

//         // private static pardingGuidDic : {[key:string] : boolean} = {};

//         /**
//          * 尝试解析预载过的 AB 资源 
//          * return true 解析成功
//          * @param url assetBundle 的 url
//          */
//         // static tryParsePreloadAB(url: string , onstate: (state: stateLoad) => void , assetmgr : assetMgr):boolean {
//         //     let source = this.needParsesArr[url];
//         //     if(!source) return false;
//         //     delete this.needParsesArr[url];

//         //     // let fname = assetmgr.getFileName(url);
//         //     // assetmgr.mapInLoad[fname] = source.state; //inload add

//         //     let loadlist = [];
//         //     let keys = source.keyList;
//         //     let len = keys.length;
//         //     let guidCount = 0;
//         //     let waitLoaded = () => {
//         //         guidCount--; //减少计数
//         //         if(guidCount <= 0 ){
//         //             //检查加载结束to解析资源
//         //             source.call(loadlist, source.state, onstate);
//         //         }
//         //     };
//         //     for(let i=0;i < len ;i++){
//         //         let key = keys[i];
//         //         let l = assetBundle.noParsingLoadedDic[key];
//         //         let needWait = false;
//         //         if(!l){
//         //             if(this.pardingGuidDic[key]) {
//         //                 needWait = true;
//         //             }

//         //             if(needWait){
//         //                 guidCount++;
//         //                 assetBundle.addToWaitList(assetmgr,waitLoaded,l.guid);
//         //             }

//         //             continue;
//         //         }

//         //         if(l && l.guid == key){
//         //             //guid 标记(需要等待去重解析回调)
//         //             this.pardingGuidDic[key] = true;
//         //             delete assetBundle.noParsingLoadedDic[key];
//         //         }
//         //         loadlist.push(l);
//         //     }

//         //     if(guidCount == 0){
//         //         source.call(loadlist, source.state, onstate);                           
//         //     }
//         //     return true;
//         // }

//         /** 仅资源加载完毕 回调 , ( 仅 addNoParsing() 调用过的有效 ) */
//         // static preloadCompleteFun:(url:string)=>any;


//         //文件加载完毕后统一解析处理 
//         // private NextHandle(list: { url: string, type: AssetTypeEnum, guid: string, asset: IAsset, handle: () => any }[], state, onstate) {
//         //     // if (assetBundle.needParsing) {
//         //     if (!assetBundle.noParsingDic[this.url]) {
//         //         this.NextHandleParsing(list, state, onstate);
//         //     } else {
//         //         // console.log("只预加载    " + this.url);
//         //         delete assetBundle.noParsingDic[this.url];  //清理记录
//         //         // let fname = this.assetmgr.getFileName(this.url);
//         //         // delete this.assetmgr.mapInLoad[fname]; //inload 记录清除

//         //         let keyList = [];
//         //         let len = list.length;
//         //         for(let i=0; i < len ;i++){  //不解析资源 下载完毕 的guid 或者 url 标记 
//         //             let l = list[i];
//         //             let key = "";   
//         //             if(!l )continue;
//         //             key = l.guid;
//         //             if(!key) key = l.url;
//         //             if(!key) continue;
//         //             if(!assetBundle.noParsingLoadedDic[key])    assetBundle.noParsingLoadedDic[key] = l;
//         //             keyList.push(key);
//         //         }

//         //         //放入容器等待 以后调用解析
//         //         assetBundle.needParsesArr[this.url] = {
//         //             keyList : keyList,
//         //             list: list,
//         //             state: state,
//         //             onstate: onstate,
//         //             call: this.NextHandleParsing.bind(this)
//         //         }


//         //         assetBundle.endWaitList(this.assetmgr,list); //去重依赖调用

//         //         if(assetBundle.preloadCompleteFun)  assetBundle.preloadCompleteFun(this.url);  //回调
//         //     }
//         // }

//         private NextHandleParsing(list: { url: string, type: AssetTypeEnum, guid: string, asset: IAsset, handle: () => any }[], state, onstate) {
//             let waitArrs = [];
//             let count = 0;
//             let lastHandle = [];
//             let finish = () => {
//                 // console.log(`资源包 :${this.url} 加载完成`);
//                 state.isfinish = true;
//                 onstate(state);
//                 //回调 guid列表
//                 assetBundle.endWaitList(this.assetmgr,list);
//             };
//             for (var i = 0, l = list.length; i < l; ++i) {
//                 var hitem = list[i];
//                 if (!hitem.handle)
//                     continue;

//                 if (hitem.type == AssetTypeEnum.Scene || 
//                     hitem.type == AssetTypeEnum.Prefab || 
//                     hitem.type == AssetTypeEnum.cPrefab || 
//                     hitem.type == AssetTypeEnum.F14Effect) {
//                     lastHandle.push(hitem)
//                     continue;
//                 }

//                 let waiting = hitem.handle();
//                 if (waiting&&waiting.then) {
//                     waitArrs.push(waiting);
//                     waiting.then(() => {
//                         if (++count >= waitArrs.length) {
//                             lastHandle.sort((a, b) => {
//                                 return b.type - a.type;
//                             })
//                             this.ReadyFinish(lastHandle,finish);
//                             waitArrs.length = 0;
                            
//                             // finish();
//                         }
//                     });

//                 }
//             }
//             if (waitArrs.length < 1) {
//                 this.ReadyFinish(lastHandle,finish);
//             }
//         }

//         private ReadyFinish(lastHandle:any[],finish:()=>void)
//         {
//             let awaits = [];
//             let count = 0;
//             while (lastHandle.length > 0){
//                 let awaiting =  lastHandle.shift().handle();
//                 if(awaiting&&awaiting.then)
//                 {
//                     awaits.push(awaiting);
//                     awaiting.then(() => {
//                         if (++count >= awaits.length) {
//                             finish();
//                             awaits.length = 0;
//                         }
//                     });                   
//                 }
//             }
//             if(awaits.length == 0){
//                 finish();
//             }
//         }

//         private static addToWaitList(assetmgr : assetMgr,fun:Function,guid: string){
//             if(!guid)return;
//             let waitList: any[];
//             if (!assetmgr.mapGuidWaitLoaded[guid]) {
//                 assetmgr.mapGuidWaitLoaded[guid] = [];
//             }
//             waitList = assetmgr.mapGuidWaitLoaded[guid];
//             waitList.push(fun);//等待同guid资源加完 回调处理
//         }

//         private static endWaitList(assetmgr : assetMgr , list: { url: string, type: AssetTypeEnum, guid: string, asset: IAsset, handle: () => any }[]) {
//             //回调guid列表
//             let len = list.length;
//             for (let i = 0; i < len; i++) {
//                 let item = list[i];
//                 if (item.guid == undefined) continue;
//                 let guid = item.guid;
//                 // if(this.pardingGuidDic[guid]) delete this.pardingGuidDic[guid];
//                 let wlMap = assetmgr.mapGuidWaitLoaded;
//                 if (wlMap[guid] == undefined) continue;
//                 let waitList = wlMap[guid];
//                 if (waitList) {
//                     let len = waitList.length;
//                     for(let i=0 ;i < len ; i++){
//                         waitList[i]();
//                     }
//                     waitList.length = 0;
//                     delete wlMap[guid];
//                 }
//             }
//         }

//         private mapIsNull(map): boolean {
//             if (!map)
//                 return true;
//             for (let k in map)
//                 return false;
//             return true;
//         }
//         /**
//          * @public
//          * @language zh_CN
//          * 资源GUID的字典，key为资源的名称
//          * @version m4m 1.0
//          */
//         mapNamed: { [name: string]: number } = {};

//         /**
//          * 资源名- Guid 字典
//          */
//         mapNameGuid: { [name: string]: string } = {};
//     }
// }