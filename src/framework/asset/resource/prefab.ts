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
﻿namespace m4m.framework
{
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 预设资源
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class prefab implements IAsset
    {
        static readonly ClassName: string = "prefab";

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

        isCab = false;
        /**
         * 预制体资源
         * @param assetName 资源名
         */
        constructor(assetName: string = null)
        {
            if (!assetName)
            {
                assetName = "prefab_" + this.getGUID();
            }
            if (this.isCab = assetName.lastIndexOf("cprefab") != -1)
                assetName = assetName.replace("cprefab", "prefab");
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
         * prefab依赖的AssetBundle
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
         * 释放资源
         * @version m4m 1.0
         */
        dispose()
        {
            this.trans.dispose();
            this.jsonstr = null;
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
        private trans: transform | transform2D;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取克隆的transform
         * @version m4m 1.0
         */
        getCloneTrans(): transform 
        {

            if (this.isCab)
            {
                let t = io.ndeSerialize<transform>(this.jsonstr, this.assetbundle, true);
                return t;
            }
            let temp = io.cloneObj(this.trans);
            // if (temp instanceof transform)
            return temp;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取克隆的transform2D
         * @version m4m 1.0
         */
        getCloneTrans2D(): transform2D 
        {
            if (this.isCab)
            {
                let t = io.ndeSerialize<transform2D>(this.jsonstr, this.assetbundle, true);
                return t;
            }

            let temp = io.cloneObj(this.trans);
            // if (temp instanceof transform2D)
            return temp;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 设置当前指定的transform
         * @param trans transform实例
         * @version m4m 1.0
         */
        apply(trans: transform)
        {
            // if (this.trans)
            // {
            //     this.trans.dispose();
            // }
            this.trans = trans;
        }
        /**
         * @private
         */
        jsonstr: string;
        /**
         * @deprecated [已弃用]
         * 解析资源
         * @param jsonStr json数据
         * @param assetmgr 资源管理实例
         * @version m4m 1.0
         */
        Parse(jsonStr: string, assetmgr: assetMgr)
        {
            return new Promise((resolve, reject) =>
            {
                this.jsonstr = jsonStr;
                io.JSONParse(jsonStr).then((jsonObj) =>
                {
                    let type = jsonObj["type"];
                    switch (type)
                    {
                        case "transform": this.trans = new transform; break;
                        case "transform2D": this.trans = new transform2D; break;
                    }
                    try
                    {
                        if (type != null)
                            io.deSerialize(jsonObj, this.trans, assetmgr, this.assetbundle);
                    } catch (error)
                    {
                        reject(error);
                    }

                    resolve(this);
                });
                // let jsonObj = JSON.parse(jsonStr);


            });
        }

        /**
         * 解析资源
         * @param data 数据
         */
        cParse(data: any)
        {
            this.jsonstr = data;
            if (data.cls == "transform")
                this.trans = new transform;
            else
                this.trans = new transform2D;

            console.log(`cparse:${this.name.getText()}`);
            this.trans.addChild(io.ndeSerialize(data, this.assetbundle));
        }
    }
}