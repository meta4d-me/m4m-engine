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
    @assetF(AssetTypeEnum.Atlas)
    export class AssetFactory_Atlas implements IAssetFactory
    {
        //#region 废弃de参考代码
        /*
        newAsset(): atlas
        {
            return null;
        }

        load(url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: atlas, call: (handle: () => void) => void)
        {
            let filename = getFileName(url);

            state.resstate[filename] = new ResourceState();
            if(state.resstateFirst==null)
            {
                state.resstateFirst=state.resstate[filename];
            }
            m4m.io.loadText(url, (txt, err, isloadFail) =>
            {
                call(() =>
                {
                    state.isloadFail = isloadFail ? true : false;
                    if (AssetFactoryTools.catchError(err, onstate, state))
                        return;

                    let _atlas = asset ? asset : new atlas(filename);
                    _atlas.Parse(txt, assetMgr);

                    AssetFactoryTools.useAsset(assetMgr, onstate, state, _atlas, url);
                });
            },
                (loadedLength, totalLength) =>
                {
                    AssetFactoryTools.onProgress(loadedLength, totalLength, onstate, state, filename);
                })
        }

        loadByPack(respack: any, url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: atlas, call: (handle: () => void) => void)
        {
            call(() =>
            {
                let filename = getFileName(url);
                state.resstate[filename] = new ResourceState();
                if(state.resstateFirst==null)
                {
                    state.resstateFirst=state.resstate[filename];
                }
                let txt = respack[filename];
                let _atlas = asset ? asset : new atlas(filename);
                _atlas.Parse(txt, assetMgr);

                AssetFactoryTools.useAsset(assetMgr, onstate, state, _atlas, url);
            });
        }*/
        //#endregion
        parse(assetmgr: assetMgr, bundle: assetBundle, filename: string, txt: string)
        {
            let bName = bundle ? bundle.name: null;
            return new atlas(filename).Parse(txt, assetmgr, bName);
        }
    }
}