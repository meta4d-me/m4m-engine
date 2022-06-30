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
    @assetF(AssetTypeEnum.TextureDesc)
    export class AssetFactory_TextureDesc implements IAssetFactory {
        private readonly t_Normal = "t_Normal";
        private readonly t_PVR = "t_PVR";
        private readonly t_DDS = "t_DDS";
        private readonly t_KTX = "t_KTX";
        private readonly t_ASTC = "t_ASTC";
        private readonly t_RAW = "t_RAW";
        //#region 废弃de参考代码
        // newAsset(): texture
        // {
        //     return null;
        // }

        // private parseTexture(txt: string, url: string, call: (handle: () => void) => void, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: texture)
        // {
        //     let filename = getFileName(url);
        //     var _texturedesc = JSON.parse(txt);
        //     var _name: string = _texturedesc["name"];
        //     var _filterMode: string = _texturedesc["filterMode"];
        //     var _format: string = _texturedesc["format"];
        //     var _mipmap: boolean = _texturedesc["mipmap"];
        //     var _wrap: string = _texturedesc["wrap"];
        //     var _premultiplyAlpha: boolean = _texturedesc["premultiplyAlpha"];

        //     if (_premultiplyAlpha == undefined)
        //     {
        //         _premultiplyAlpha = true;
        //     }
        //     var _textureFormat = render.TextureFormatEnum.RGBA;//这里需要确定格式
        //     if (_format == "RGB")
        //         _textureFormat = render.TextureFormatEnum.RGB;
        //     else if (_format == "Gray")
        //         _textureFormat = render.TextureFormatEnum.Gray;

        //     var _linear: boolean = true;
        //     if (_filterMode.indexOf("linear") < 0)
        //         _linear = false;

        //     var _repeat: boolean = false;
        //     if (_wrap.indexOf("Repeat") >= 0)
        //         _repeat = true;

        //     var _textureSrc: string = url.replace(filename, _name);

        //     //图片类型
        //     let loadFun: (url: string, fun: (_bin: ArrayBuffer | HTMLImageElement, _err: Error, isloadFail?: boolean) => void, onprocess: (curLength: number, totalLength: number) => void) => any;
        //     let tType = this.t_Normal;
        //     if (_textureSrc.indexOf(".pvr.bin") >= 0)
        //     {
        //         tType = this.t_PVR;
        //     } else if (_textureSrc.indexOf(".dds.bin") >= 0)
        //     {
        //         tType = this.t_DDS;
        //     }

        //     loadFun = tType == this.t_Normal ? m4m.io.loadImg : m4m.io.loadArrayBuffer;

        //     loadFun(_textureSrc,
        //         (data, _err, isloadFail) =>
        //         {
        //             call(() =>
        //             {
        //                 state.isloadFail = isloadFail ? true : false;
        //                 if (AssetFactoryTools.catchError(_err, onstate, state))
        //                     return;

        //                 let _texture = asset ? asset : new texture(filename);
        //                 _texture.realName = _name;

        //                 //构建贴图
        //                 switch (tType)
        //                 {
        //                     case this.t_Normal:
        //                         var t2d = new m4m.render.glTexture2D(assetMgr.webgl, _textureFormat);
        //                         t2d.uploadImage(data as any, _mipmap, _linear, _premultiplyAlpha, _repeat);
        //                         _texture.glTexture = t2d;
        //                         break;
        //                     case this.t_PVR:
        //                         let pvr: PvrParse = new PvrParse(assetMgr.webgl);
        //                         _texture.glTexture = pvr.parse(data as any);
        //                         break;
        //                     case this.t_DDS:
        //                         assetMgr.webgl.pixelStorei(assetMgr.webgl.UNPACK_FLIP_Y_WEBGL, 1);
        //                         let textureUtil = new WebGLTextureUtil(assetMgr.webgl, true);
        //                         textureUtil.loadDDS(_textureSrc, null, (texture, error, stats) =>
        //                         {
        //                             let t2d = new m4m.render.glTexture2D(assetMgr.webgl);
        //                             t2d.format = m4m.render.TextureFormatEnum.PVRTC2_RGB;
        //                             t2d.texture = texture;
        //                             _texture.glTexture = t2d;
        //                         });
        //                         break;
        //                 }

        //                 AssetFactoryTools.useAsset(assetMgr, onstate, state, _texture, url);
        //             });
        //         },
        //         (loadedLength, totalLength) =>
        //         {
        //             AssetFactoryTools.onRefProgress(loadedLength, totalLength, onstate, state, filename);
        //         });
        // }

        // load(url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: texture, call: (handle: () => void) => void)
        // {
        //     let filename = getFileName(url);

        //     state.resstate[filename] = new RefResourceState();
        //     if (state.resstateFirst == null)
        //     {
        //         state.resstateFirst = state.resstate[filename];
        //     }

        //     m4m.io.loadText(url,
        //         (txt, err, isloadFail) =>
        //         {
        //             state.isloadFail = isloadFail ? true : false;
        //             if (AssetFactoryTools.catchError(err, onstate, state))
        //                 return;

        //             this.parseTexture(txt, url, call, onstate, state, assetMgr, asset);
        //         },
        //         (loadedLength, totalLength) => { AssetFactoryTools.onProgress(loadedLength, totalLength, onstate, state, filename); }
        //     );
        // }

        // loadByPack(respack: any, url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: texture, call: (handle: () => void) => void)
        // {
        //     let filename = getFileName(url);
        //     state.resstate[filename] = new RefResourceState();

        //     let txt = respack[filename];

        //     this.parseTexture(txt, url, call, onstate, state, assetMgr, asset);
        // }
        //#endregion


        parse(assetmgr: assetMgr, bundle: assetBundle, name: string, data: string, dwguid: number) {
            var _texturedesc = JSON.parse(data);
            var _name: string = _texturedesc["name"];
            var _filterMode: string = _texturedesc["filterMode"];
            var _format: string = _texturedesc["format"];
            var _mipmap: boolean = _texturedesc["mipmap"];
            var _wrap: string = _texturedesc["wrap"];
            var _premultiplyAlpha: boolean = _texturedesc["premultiplyAlpha"];

            if (_premultiplyAlpha == undefined) {
                _premultiplyAlpha = true;
            }
            var _textureFormat = render.TextureFormatEnum.RGBA;//这里需要确定格式
            if (_format == "RGB")
                _textureFormat = render.TextureFormatEnum.RGB;
            else if (_format == "Gray")
                _textureFormat = render.TextureFormatEnum.Gray;

            var _linear: boolean = true;
            if (_filterMode.indexOf("linear") < 0)
                _linear = false;

            var _repeat: boolean = false;
            if (_wrap.indexOf("Repeat") >= 0)
                _repeat = true;



            // let _texture = asset ? asset : new texture(url);
            let _texture = new texture(name);

            _texture.realName = _name;
            let tType = this.t_Normal;
            if (_name.indexOf(".astc") >= 0) {
                tType = this.t_ASTC;
            }
            else if (_name.indexOf(".pvr.bin") >= 0) {
                tType = this.t_PVR;
            }
            else if (_name.indexOf(".ktx") >= 0) {
                tType = this.t_KTX;
            }
            else if (_name.indexOf(".dds.bin") >= 0) {
                tType = this.t_DDS;
            }
            else if (_name.indexOf(".raw") >= 0) {
                tType = this.t_RAW;
            }
            let imgGuid = dwguid || bundle.texs[_name] || bundle.files[_name];
            let img = assetMgr.mapImage[imgGuid] || assetMgr.mapLoading[imgGuid].data;
            //构建贴图
            switch (tType) {
                case this.t_Normal:
                    var t2d = new m4m.render.glTexture2D(assetmgr.webgl, _textureFormat);
                    if (img) {
                        t2d.uploadImage(img, _mipmap, _linear, _premultiplyAlpha, _repeat);
                    }
                    _texture.glTexture = t2d;
                    break;
                case this.t_RAW:
                    //检查是否有 已经解析完的 资源了 
                        //替换原有资源
                    _texture.glTexture = RAWParse.parseByAtt(assetmgr.webgl, img, _mipmap, _linear, _premultiplyAlpha, _repeat);
                    break;
                case this.t_ASTC:
                    _texture.glTexture = ASTCParse.parse(assetmgr.webgl, img);
                    break;
                case this.t_PVR:
                    let pvr: PvrParse = new PvrParse(assetmgr.webgl);
                    _texture.glTexture = pvr.parse(img);
                    break;
                case this.t_KTX:
                    _texture.glTexture = KTXParse.parse(assetmgr.webgl, img);
                    break;
                case this.t_DDS:
                    throw new Error("暂不支持DDS");
                // assetMgr.webgl.pixelStorei(assetMgr.webgl.UNPACK_FLIP_Y_WEBGL, 1);
                // let textureUtil = new WebGLTextureUtil(assetMgr.webgl, true);
                // textureUtil.loadDDS(_textureSrc, null, (texture, error, stats) =>
                // {
                //     let t2d = new m4m.render.glTexture2D(assetMgr.webgl);
                //     t2d.format = m4m.render.TextureFormatEnum.PVRTC2_RGB;
                //     t2d.texture = texture;
                //     _texture.glTexture = t2d;
                // });
                // break;
            }

            return _texture;
        }

        needDownload(text: string) {
            let json = JSON.parse(text);
            return json.name;
        }
    }
}