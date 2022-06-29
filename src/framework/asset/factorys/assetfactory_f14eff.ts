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
namespace m4m.framework
{
    @assetF(AssetTypeEnum.F14Effect)
    export class AssetFactory_f14eff implements IAssetFactory
    {
        //#region 废弃de参考代码
        // newAsset(): f14eff
        // {
        //     return null;
        // }

        // load(url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: f14eff, call: (handle: () => void) => void)
        // {
        //     let bundlename = getFileName(state.url);
        //     let filename = getFileName(url);

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
        //             let time = Date.now();
        //             let _f14eff = asset ? asset : new f14eff(filename);
        //             _f14eff.assetbundle = bundlename;
        //             _f14eff.Parse(txt, assetMgr);
        //             let calc = Date.now() - time;
        //             console.log(`[特效]解析:${url}  耗时:${calc}/ms`);
        //             AssetFactoryTools.useAsset(assetMgr, onstate, state, _f14eff, url);
        //             // _f14eff.Parse(txt, assetMgr).then(() =>
        //             // {
        //             //     AssetFactoryTools.useAsset(assetMgr, onstate, state, _f14eff, url);
        //             // });
        //         });

        //     },
        //         (loadedLength, totalLength) =>
        //         {
        //             AssetFactoryTools.onProgress(loadedLength, totalLength, onstate, state, filename);
        //         })
        // }

        // loadByPack(respack: any, url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: f14eff, call: (handle: () => void) => void)
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
        //         let time = Date.now();
        //         let txt = respack[filename];
        //         let _f14eff = asset ? asset : new f14eff(filename);
        //         _f14eff.assetbundle = bundlename;
        //         _f14eff.Parse(txt, assetMgr);
        //         let calc = Date.now() - time;
        //         console.log(`[特效]解析:${url}  耗时:${calc}/ms`);
        //         AssetFactoryTools.useAsset(assetMgr, onstate, state, _f14eff, url);
        //         // _f14eff.Parse(txt, assetMgr).then(() =>
        //         // {
        //         //     AssetFactoryTools.useAsset(assetMgr, onstate, state, _f14eff, url);
        //         // });
        //     });
        // }
        //#endregion
        parse(assetmgr: assetMgr, bundle: assetBundle, filename: string, txt: string)
        {
            let _f14eff = new f14eff(filename);
            _f14eff.assetbundle = bundle.name;
            _f14eff.Parse(txt, assetmgr);
            return _f14eff;
        }
    }
}