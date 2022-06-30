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
    @assetF(AssetTypeEnum.GLFragmentShader)
    export class AssetFactory_GLFragmentShader implements IAssetFactory
    {
        //#region 废弃de参考代码
        // newAsset(): IAsset
        // {
        //     return null;
        // }

        // load(url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: IAsset, call: (handle: () => void) => void)
        // {
        //     let filename = getFileName(url);
        //     let name = filename.substring(0, filename.indexOf("."));

        //     state.resstate[filename] = new ResourceState();
        //     if (state.resstateFirst == null)
        //     {
        //         state.resstateFirst = state.resstate[filename];
        //     }
        //     m4m.io.loadText(url, (txt, err, isloadFail) =>
        //     {
        //         call(() =>
        //         {
        //             state.isloadFail = isloadFail ? true : false;
        //             if (AssetFactoryTools.catchError(err, onstate, state))
        //                 return;

        //             state.resstate[filename].state = 1;//完成

        //             state.logs.push("load a glshader:" + filename);
        //             assetMgr.shaderPool.mapFSString[name] = txt;
        //             // assetMgr.shaderPool.compileFS(assetMgr.webgl, name, txt);
        //             onstate(state);
        //         });
        //     },
        //         (loadedLength, totalLength) =>
        //         {
        //             AssetFactoryTools.onProgress(loadedLength, totalLength, onstate, state, filename);
        //         });
        // }

        // loadByPack(respack: any, url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: IAsset, call: (handle: () => void) => void)
        // {
        //     call(() =>
        //     {
        //         let filename = getFileName(url);
        //         let name = filename.substring(0, filename.indexOf("."));

        //         state.resstate[filename] = new ResourceState();
        //         if (state.resstateFirst == null)
        //         {
        //             state.resstateFirst = state.resstate[filename];
        //         }
        //         let txt = respack[filename];
        //         txt = decodeURI(txt);
        //         state.resstate[filename].state = 1;//完成

        //         state.logs.push("load a glshader:" + filename);
        //         assetMgr.shaderPool.mapFSString[name] = txt;
        //         //assetMgr.shaderPool.compileFS(assetMgr.webgl, name, txt);
        //         onstate(state);
        //     });
        // }
        //#endregion

        parse(assetmgr: assetMgr, bundle: assetBundle, filename: string, txt: string)
        {
            assetmgr.shaderPool.mapFSString[filename.substring(0, filename.indexOf("."))] = txt;
        }
    }
}