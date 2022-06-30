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
// namespace m4m.framework
// {
//     export class AssetFactory_PackTxt implements IAssetFactory
//     {
//         newAsset(): IAsset
//         {
//             return null;
//         }

//         load(url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset?: IAsset)
//         {
//             let filename = getFileName(url);

//             m4m.io.loadArrayBuffer(url, (_buffer, err) =>
//                 {
//                     if (AssetFactoryTools.catchError(err, onstate, state))
//                         return;

//                     var read: m4m.io.binReader = new m4m.io.binReader(_buffer);

//                     var arr = new Uint8Array(_buffer.byteLength);
//                     read.readUint8Array(arr);
//                     let txt = m4m.io.binReader.utf8ArrayToString(arr);

//                     assetMgr.bundlePackJson = JSON.parse(txt);
//                     onstate(state);
//                 },
//                 (loadedLength, totalLength) =>
//                 {
//                     state.compressTextLoaded = loadedLength;
//                     // state.resstate[filename].loadedLength = loadedLength;
//                     // state.resstate[filename].totalLength = totalLength;
//                     state.progressCall = true;
//                     onstate(state);
//                 });
//         }

//         loadByPack(packnum: number, url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset?: IAsset)
//         {
            
//         }
//     }
// }