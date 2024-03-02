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
/// <reference path="../../../io/reflect.ts" />

namespace m4m.framework
{
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * json资源
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class bin implements IAsset
    {
        static readonly ClassName:string="json";

        @m4m.reflect.Field("constText")
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
         * 二进制数据资源
         * @param assetName 资源名 
         * @param data 数据
         */
        constructor(assetName: string = null, public data: ArrayBuffer)
        {
            if (!assetName)
            {
                assetName = "json_" + this.getGUID();
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
            return this.data.byteLength;
        }

        private _realName: string;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 如果是imgdesc加载来的图片，通过这个可以获取到真实的图片名字
         * @version m4m 1.0
         */
        get realName(): string
        {
            return this._realName;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 设置图片名称
         * @version m4m 1.0
         */
        set realName(name: string)
        {
            this._realName = name;
        }
    }
}