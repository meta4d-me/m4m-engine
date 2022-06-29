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
    export interface IAssetFactory
    {
        newAsset?(assetName?: string): IAsset;
        load?(url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: IAsset, call: (handle: () => void) => void): void;
        loadByPack?(respack: any, url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: IAsset, call: (handle: () => void) => void): void;
        parse(assetMgr: assetMgr, bundle: assetBundle, name: string, data: string | ArrayBuffer, dwguid?: number): IAsset | Promise<IAsset> | void;
        needDownload?(textJSON: string): string;
    }

    export class AssetFactoryTools
    {
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

        static onProgress(loadedLength: number, totalLength: number, onstate: (state: stateLoad) => void, state: stateLoad, filename: string)
        {
            state.resstate[filename].loadedLength = loadedLength;
            // state.resstate[filename].totalLength = totalLength;
            state.progressCall = true;
            onstate(state);
        }

        static onRefProgress(loadedLength: number, totalLength: number, onstate: (state: stateLoad) => void, state: stateLoad, filename: string)
        {
            let _restate = state.resstate[filename] as RefResourceState;
            _restate.refLoadedLength = loadedLength;
            // state.resstate[filename].totalLength = totalLength;
            state.progressCall = true;
            onstate(state);
        }
    }

    export function getFileName(url: string)
    {
        var filei = url.lastIndexOf("/");
        var file = url.substr(filei + 1);
        return file;
    }
}