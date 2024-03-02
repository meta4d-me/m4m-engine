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
    @assetF(AssetTypeEnum.Aniclip)
    export class AssetFactory_Aniclip implements IAssetFactory
    {
        //#region 废弃de参考代码
        /*
        newAsset(): animationClip
        {
            return null;
        }

        load(url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: animationClip, call: (handle: () => void) => void)
        {
            let filename = getFileName(url);

            state.resstate[filename] = new ResourceState();
            if(state.resstateFirst==null)
            {
                state.resstateFirst=state.resstate[filename];
            }
            m4m.io.loadArrayBuffer(url,
                (_buffer, err, isloadFail) =>
                {

                    call(() =>
                    {
                        state.isloadFail = isloadFail ? true : false;
                        if (AssetFactoryTools.catchError(err, onstate, state))
                            return;
                        let time = Date.now();
                        let _clip = asset ? asset : new animationClip(filename);
                        // _clip.Parse(_buffer);

                        // AssetFactoryTools.useAsset(assetMgr, onstate, state, _clip, url);
                        return _clip.Parse(_buffer).then(() =>
                        {
                            let calc = Date.now() - time;
                            console.log(`[animiclip]解析:${url}  耗时:${calc}/ms`);
                            AssetFactoryTools.useAsset(assetMgr, onstate, state, _clip, url);
                        });
                    });

                },
                (loadedLength, totalLength) =>
                {
                    AssetFactoryTools.onProgress(loadedLength, totalLength, onstate, state, filename);
                })
        }

        loadByPack(respack, url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: animationClip, call: (handle: () => void) => void)
        {
            let filename = getFileName(url);

            state.resstate[filename] = new ResourceState();
            if(state.resstateFirst==null)
            {
                state.resstateFirst=state.resstate[filename];
            }
            let time = Date.now();
            let _buffer = respack[filename];
            let _clip = asset ? asset : new animationClip(filename);
            // _clip.Parse(_buffer);

            // AssetFactoryTools.useAsset(assetMgr, onstate, state, _clip, url);
            call(() =>
            {
               return _clip.Parse(_buffer).then(() =>
                {
                    let calc = Date.now() - time;
                    console.log(`[animiclip]解析:${url}  耗时:${calc}/ms`);
                    AssetFactoryTools.useAsset(assetMgr, onstate, state, _clip, url);
                });
            });
        }        
        */
        //#endregion

        /**
         * 解析
         * @param assetmgr 资源管理器
         * @param bundle bundle包
         * @param filename 文件名
         * @param bytes 资源二进制数据
         * @returns Promise动画片段
         */
        parse(assetmgr: assetMgr, bundle: assetBundle, filename: string, bytes: ArrayBuffer)
        {            
            return new animationClip(filename).Parse(bytes);
        }

    }
}