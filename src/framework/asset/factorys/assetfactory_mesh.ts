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
    @assetF(AssetTypeEnum.Mesh)
    export class AssetFactory_Mesh implements IAssetFactory
    {

        //#region  废弃de参考代码
        // newAsset(): mesh
        // {
        //     return null;
        // }

        // load(url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: mesh, call: (handle: () => void) => void)
        // {
        //     let filename = getFileName(url);

        //     state.resstate[filename] = new ResourceState();
        //     if (state.resstateFirst == null)
        //     {
        //         state.resstateFirst = state.resstate[filename];
        //     }

        //     // if (url.lastIndexOf(".bin") != -1)
        //     // {
        //     m4m.io.loadArrayBuffer(url,
        //         (_buffer, err, isloadFail) =>
        //         {

        //             call(() =>
        //             {
        //                 state.isloadFail = isloadFail ? true : false;
        //                 if (AssetFactoryTools.catchError(err, onstate, state))
        //                     return;
        //                 let _mesh = asset ? asset : new mesh(filename);

        //                 let time = Date.now();
        //                 return _mesh.Parse(_buffer, assetMgr.webgl).then(() =>
        //                 {
        //                     let calc = Date.now() - time;
        //                     console.log(`[bin]加载:${url}  耗时:${calc}/ms`);
        //                     AssetFactoryTools.useAsset(assetMgr, onstate, state, _mesh, url);
        //                 });
        //             });
        //         },
        //         (loadedLength, totalLength) =>
        //         {
        //             AssetFactoryTools.onProgress(loadedLength, totalLength, onstate, state, filename);
        //         })
        //     // } else if (url.lastIndexOf(".json") != -1)
        //     // {
        //     //     m4m.io.loadJSON(url, (_buffer, err, isloadFail) =>
        //     //     {
        //     //         call(() =>
        //     //         {
        //     //             state.isloadFail = isloadFail ? true : false;
        //     //             if (AssetFactoryTools.catchError(err, onstate, state))
        //     //                 return;
        //     //             let _mesh = asset ? asset : new mesh(filename);

        //     //             let time = Date.now();
        //     //             return _mesh.Parse(_buffer, assetMgr.webgl).then(() =>
        //     //             {                            
        //     //                 AssetFactoryTools.useAsset(assetMgr, onstate, state, _mesh, url);
        //     //                 let calc = Date.now() - time;
        //     //                 console.log(`[json]加载:${url}  耗时:${calc}/ms`);
        //     //             });
        //     //             // _mesh.Parse(_buffer, assetMgr.webgl);
        //     //             // AssetFactoryTools.useAsset(assetMgr, onstate, state, _mesh, url);

        //     //         });
        //     //     }, (loadedLength, totalLength) =>
        //     //         {
        //     //             AssetFactoryTools.onProgress(loadedLength, totalLength, onstate, state, filename);
        //     //         });
        //     // }
        // }

        // loadByPack(respack: any, url: string, onstate: (state: stateLoad) => void, state: stateLoad, assetMgr: assetMgr, asset: mesh, call: (handle: () => void) => void)
        // {
        //     let filename = getFileName(url);

        //     state.resstate[filename] = new ResourceState();
        //     if (state.resstateFirst == null)
        //     {
        //         state.resstateFirst = state.resstate[filename];
        //     }
        //     let _buffer = respack[filename];
        //     let _mesh = asset ? asset : new mesh(filename);

        //     call(() =>
        //     {
        //         // if(typeof(_buffer)=="string")
        //         //     _buffer = JSON.parse(_buffer);
        //         return _mesh.Parse(_buffer, assetMgr.webgl).then(() =>
        //         {

        //             AssetFactoryTools.useAsset(assetMgr, onstate, state, _mesh, url);

        //         });
        //         // _mesh.Parse(io.GetJSON(url,_buffer), assetMgr.webgl);
        //         // AssetFactoryTools.useAsset(assetMgr, onstate, state, _mesh, url);
        //     });
        // }
        //#endregion

        parse(assetMgr: assetMgr, bundle: assetBundle, name: string, data: ArrayBuffer)
        //parse(assetMgr: assetMgr, bundle: assetBundle, name: string = "Meshes_nav_test.obj_Generic.cmesh.bin", data: ArrayBuffer)
        {
            
            // if (name.lastIndexOf("jellysh3") != -1)
            // {
            //     console.error(`######### 水母3 #######`);
            //     console.error(data);
            //     console.error(data.byteLength);
            // }

            if (!(data instanceof ArrayBuffer))
            {
                // console.error(`####### data not ArrayBuffer instance ,mesh name:${name},bundle:${bundle ? bundle.url : null} `);
                // console.error(data);
                // error.push(new Error(`data not ArrayBuffer instance ,mesh name:${name},bundle:${bundle ? bundle.url : null} `));
                // return new mesh(name);
                throw new Error(`data not ArrayBuffer instance ,mesh name:${name},bundle:${bundle ? bundle.url : null} `);
            }

            return new mesh(name).Parse(data, assetMgr.webgl);
            //return new mesh("Meshes_nav_test.obj_Generic.cmesh.bin").Parse(data, assetMgr.webgl);
            
        }
    }
}