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

declare var WebGLTextureUtil;
namespace m4m.framework
{
    @assetF(AssetTypeEnum.DDS)
    export class AssetFactory_DDS implements IAssetFactory
    {
        //#region 废弃de参考代码        
        // newAsset(): texture
        // {
        //     return null;
        // }

        // loadByPack(respack: any, url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: texture, call: (handle: () => void) => void)
        // {
        //     call(() =>
        //     {});
        // }

        // load(url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: texture, call: (handle: () => void) => void)
        // {
        //     // let sc = document.createElement("script") as HTMLScriptElement;
        //     // sc.src = "lib/webgl-util.js";
        //     // let sc1 = document.createElement("script") as HTMLScriptElement;
        //     // sc1.src = "lib/webgl-texture-util.js";
        //     // document.body.appendChild(sc);
        //     // document.body.appendChild(sc1);
        //     // document.body.addEventListener("load", () => {
        //     //     document.body.appendChild(sc);
        //     //     document.body.appendChild(sc1);
        //     // }, false);
        //     let filename = getFileName(url);

        //     state.resstate[filename] = new ResourceState();
        //     if(state.resstateFirst==null)
        //     {
        //         state.resstateFirst=state.resstate[filename];
        //     }
        //     m4m.io.loadArrayBuffer(url,
        //         (_buffer, err, isloadFail) =>
        //         {
        //             call(() =>
        //             {
        //                 state.isloadFail = isloadFail ? true : false;
        //                 if (AssetFactoryTools.catchError(err, onstate, state))
        //                     return;
        //                 let _texture = asset ? asset : new texture(filename);
        //                 assetMgr.webgl.pixelStorei(assetMgr.webgl.UNPACK_FLIP_Y_WEBGL, 1);
        //                 let textureUtil = new WebGLTextureUtil(assetMgr.webgl, true);
        //                 textureUtil.loadDDS(url, null, (texture, error, stats) =>
        //                 {
        //                     let t2d = new m4m.render.glTexture2D(assetMgr.webgl);
        //                     t2d.format = m4m.render.TextureFormatEnum.PVRTC2_RGB;
        //                     t2d.texture = texture;
        //                     _texture.glTexture = t2d;
        //                 });

        //                 AssetFactoryTools.useAsset(assetMgr, onstate, state, _texture, url);
        //             });
        //         },
        //         (loadedLength, totalLength) =>
        //         {
        //             AssetFactoryTools.onProgress(loadedLength, totalLength, onstate, state, filename);
        //         });
        // }        
        //#endregion

        parse(assetmgr: assetMgr, bundle: assetBundle, filename: string, bytes: ArrayBuffer)
        {
            throw Error("暂不支持dds");
        }
    }
}