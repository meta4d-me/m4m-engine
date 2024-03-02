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
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 场景数据资源
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class rawscene implements IAsset
    {
        static readonly ClassName: string = "rawscene";

        private name: constText;
        private id: resID = new resID();
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 是否为默认资源
         * @version m4m 1.0
         */
        defaultAsset: boolean = false;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 雾效
         * @version m4m 1.0
         */
        fog: Fog;
        /**
         * raw 场景资源
         * @param assetName 资源名 
         */
        constructor(assetName: string = null)
        {
            if (!assetName)
            {
                assetName = "rawscene_" + this.getGUID();
            }
            this.name = new constText(assetName);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取资源名称
         * @version m4m 1.0
         */
        getName(): string
        {
            return this.name.getText();
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取资源唯一id
         * @version m4m 1.0
         */
        getGUID(): number
        {
            return this.id.getID();
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 依赖的AssetBundle
         * @version m4m 1.0
         */
        assetbundle: string = null;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 引用计数加一
         * @version m4m 1.0
         */
        use()
        {
            sceneMgr.app.getAssetMgr().use(this);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 引用计数减一
         * @version m4m 1.0
         */
        unuse(disposeNow: boolean = false)
        {
            sceneMgr.app.getAssetMgr().unuse(this, disposeNow);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 计算资源字节大小
         * @version m4m 1.0
         */
        caclByteLength(): number
        {
            let total = 0;
            return total;
        }
        /**
         * 重置 LightMap
         */
        resetLightMap(assetmgr: assetMgr, bundleName: string = null)
        {
            this.lightmaps.length = 0;
            let lightmapCount = this.lightmapData.length;
            for (let i = 0; i < lightmapCount; i++)
            {
                if (this.lightmapData[i] == null)
                {
                    this.lightmaps.push(null);
                }
                else
                {
                    let lightmapName = this.lightmapData[i].name;
                    let lightmap = assetmgr.getAssetByName(lightmapName, bundleName) as texture;
                    if (lightmap)
                        lightmap.use();
                    this.lightmaps.push(lightmap);
                }
            }
        }
        private lightmapData;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 解析资源
         * @param txt json数据
         * @param assetmgr 资源管理实例
         * @version m4m 1.0
         */
        Parse(txt: string, assetmgr: assetMgr)
        {
            return new Promise<rawscene>((resolve, reject) =>
            {
                io.JSONParse(txt).then((_json) =>
                {
                    try
                    {
                        this.rootNode = new transform();
                        this.rootNode.name = this.getName();
                        io.deSerialize(_json["rootNode"], this.rootNode, assetmgr, this.assetbundle);

                        this.lightmaps = [];
                        this.lightmapData = _json["lightmap"];
                        let lightmapCount = this.lightmapData.length;
                        for (let i = 0; i < lightmapCount; i++)
                        {
                            if (this.lightmapData[i] == null)
                            {
                                this.lightmaps.push(null);
                            }
                            else
                            {
                                let lightmapName = this.lightmapData[i].name;
                                let lightmap = assetmgr.getAssetByName(lightmapName, this.assetbundle) as texture;
                                if (lightmap)
                                {
                                    lightmap.use();
                                    this.lightmaps.push(lightmap);
                                }
                            }
                        }

                        let fogData = _json["fog"];
                        if (fogData != undefined)
                        {
                            this.fog = new Fog();
                            this.fog._Start = <number>fogData["_Start"];
                            this.fog._End = <number>fogData["_End"];

                            let cor: string = fogData["_Color"];
                            if (typeof (cor) == "string")
                            {
                                let array: string[] = cor.split(",");
                                this.fog._Color = new m4m.math.vector4(parseFloat(array[0]), parseFloat(array[1]), parseFloat(array[2]), parseFloat(array[3]));
                            } else
                                this.fog._Color = cor;
                            this.fog._Density = <number>fogData["_Density"];
                        }

                        //navMesh
                        let nav = _json["navmesh"];
                        if (nav != undefined && nav.data != null)
                        {
                            this.navMeshJson = nav.data;
                        }
                    } catch (error)
                    {
                        reject(error.stack);
                        return;
                    }
                    resolve(this);
                }).catch(e =>
                {
                    reject(e);
                });
            });
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取场景根节点的克隆
         * @version m4m 1.0
         */
        getSceneRoot(): transform
        {
            return io.cloneObj(this.rootNode);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 应用lightmap到场景中
         * @param scene 场景实例
         * @version m4m 1.0
         */
        useLightMap(scene: scene)
        {
            scene.lightmaps.length = 0;
            for (let i = 0; i < this.lightmaps.length; i++)
            {
                scene.lightmaps.push(this.lightmaps[i]);
            }
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 应用雾效到场景中
         * @param scene 场景实例
         * @version m4m 1.0
         */
        useFog(scene: scene)
        {
            scene.fog = this.fog;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 应用导航网格到场景中
         * @param scene 场景实例
         * @version m4m 1.0
         */
        useNavMesh(scene: scene)
        {
            let loaded = false;
            if (this.navMeshJson == null || this.navMeshJson == "") return loaded;
            NavMeshLoadManager.Instance.loadNavMeshByDate(this.navMeshJson, scene.app, () =>
            {
                loaded = true;
            });
            return loaded;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 释放资源
         * @version m4m 1.0
         */
        dispose()
        {
            if (this.rootNode)
            {
                this.rootNode.dispose();
            }
            for (let key in this.lightmaps)
            {
                this.lightmaps[key].unuse();
            }
        }

        private navMeshJson: string;
        private rootNode: transform;
        private lightmaps: texture[];
    }
    /**
     * @private
     */
    export class Fog
    {
        public _Start: number;
        public _End: number;
        public _Color: m4m.math.vector4;
        public _Density: number;
    }
}