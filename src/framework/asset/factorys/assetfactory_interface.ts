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
    export interface IAssetFactory
    {
        /** @deprecated [已弃用] */
        newAsset?(assetName?: string): IAsset;
        /** @deprecated [已弃用] */
        load?(url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: IAsset, call: (handle: () => void) => void): void;
        /** @deprecated [已弃用] */
        loadByPack?(respack: any, url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: IAsset, call: (handle: () => void) => void): void;
        /**
         * 解析引擎资源
         * @param assetMgr 资源管理器
         * @param bundle bundle包
         * @param name 资源名
         * @param data 资源数据（二进制或字符串）
         * @param dwguid (纹理资源会用到的 标记GUID)
         */
        parse(assetMgr: assetMgr, bundle: assetBundle, name: string, data: string | ArrayBuffer, dwguid?: number): IAsset | Promise<IAsset> | void;
        /**
         * (仅 TextureDesc 资源会用到)
         * @param textJSON 
         */
        needDownload?(textJSON: string): string;
    }

    export class AssetFactoryTools
    {
        /** @deprecated [已弃用] */
        static catchError(err: Error, onstate: (state: stateLoad) => void, state: stateLoad): boolean
        {
            if (err != null)
            {
                state.iserror = true;
                state.errs.push(new Error(err.message));
                onstate(state);
                return true;
            }
            return false;
        }

        /** @deprecated [已弃用] */
        static useAsset(assetMgr: assetMgr, onstate: (state: stateLoad) => void, state: stateLoad, asset: IAsset, url: string)
        {
            let fileName = getFileName(url);

            assetMgr.setAssetUrl(asset, url);
            assetMgr.maploaded[url] = asset;

            assetMgr.use(asset);
            state.resstate[fileName].state = 1;
            state.resstate[fileName].res = asset;
            onstate(state);
        }

        /** @deprecated [已弃用] */
        static onProgress(loadedLength: number, totalLength: number, onstate: (state: stateLoad) => void, state: stateLoad, filename: string)
        {
            state.resstate[filename].loadedLength = loadedLength;
            // state.resstate[filename].totalLength = totalLength;
            state.progressCall = true;
            onstate(state);
        }

        /** @deprecated [已弃用] */
        static onRefProgress(loadedLength: number, totalLength: number, onstate: (state: stateLoad) => void, state: stateLoad, filename: string)
        {
            let _restate = state.resstate[filename] as RefResourceState;
            _restate.refLoadedLength = loadedLength;
            // state.resstate[filename].totalLength = totalLength;
            state.progressCall = true;
            onstate(state);
        }
    }

    /**
     * 通过url 获取资源文件名
     * @param url 
     * @returns 
     */
    export function getFileName(url: string)
    {
        var filei = url.lastIndexOf("/");
        var file = url.substr(filei + 1);
        return file;
    }
}