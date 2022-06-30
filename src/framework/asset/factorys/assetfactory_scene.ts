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
    @assetF(AssetTypeEnum.Scene)
    export class AssetFactory_Scene implements IAssetFactory
    {
        //#region 废弃de参考代码
        // newAsset(): rawscene
        // {
        //     return null;
        // }

        // load(url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: rawscene, call: (handle: () => void) => void)
        // {
        //     let bundlename = getFileName(state.url);
        //     let filename = getFileName(url);

        //     state.resstate[filename] = new ResourceState();
        //     if (state.resstateFirst == null)
        //     {
        //         state.resstateFirst = state.resstate[filename];
        //     }
        //     m4m.io.loadText(url,
        //         (txt, err, isloadFail) =>
        //         {
        //             call(() =>
        //             {
        //                 state.isloadFail = isloadFail ? true : false;
        //                 if (AssetFactoryTools.catchError(err, onstate, state))
        //                     return;

        //                 let _scene = asset ? asset : new rawscene(filename);
        //                 _scene.assetbundle = bundlename;
        //                 // _scene.Parse(txt, assetMgr);
        //                 // AssetFactoryTools.useAsset(assetMgr, onstate, state, _scene, url);
        //                 return _scene.Parse(txt, assetMgr).then(() =>
        //                 {
        //                     AssetFactoryTools.useAsset(assetMgr, onstate, state, _scene, url);
        //                 });
        //             });
        //         },
        //         (loadedLength, totalLength) =>
        //         {
        //             AssetFactoryTools.onProgress(loadedLength, totalLength, onstate, state, filename);
        //         })
        // }

        // loadByPack(respack: any, url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: rawscene, call: (handle: () => void) => void)
        // {
        //     call(() =>
        //     {
        //         let bundlename = getFileName(state.url);
        //         let filename = getFileName(url);

        //         state.resstate[filename] = new ResourceState();
        //         if (state.resstateFirst == null)
        //         {
        //             state.resstateFirst = state.resstate[filename];
        //         }
        //         let txt = respack[filename];
        //         let _scene = asset ? asset : new rawscene(filename);
        //         _scene.assetbundle = bundlename;
        //         //  _scene.Parse(txt, assetMgr);
        //         // AssetFactoryTools.useAsset(assetMgr, onstate, state, _scene, url);
        //         return _scene.Parse(txt, assetMgr).then(() =>
        //         {
        //             AssetFactoryTools.useAsset(assetMgr, onstate, state, _scene, url);
        //         });
        //     });
        // }
        //#endregion
        parse(assetmgr: assetMgr, bundle: assetBundle, name: string, txt: string)
        {
            let _scene = new rawscene(name);
            _scene.assetbundle = bundle.name;
            return _scene.Parse(txt, assetmgr)
        }
    }
}