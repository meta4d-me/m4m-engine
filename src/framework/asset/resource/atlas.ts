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
     * 图集资源
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class atlas implements IAsset
    {
        static readonly ClassName: string = "atlas";

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
        defaultAsset: boolean;//是否为系统默认资源
        /**
         * 图集资源
         * @param assetName 资源名 
         */
        constructor(assetName: string = null)
        {
            if (!assetName)
            {
                assetName = "atlas_" + this.getGUID();
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
            for (var key in this.sprites)
            {
                this.sprites[key].unuse();
            }
            this.texture.unuse();
            delete this.sprites;
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
            for (let k in this.sprites)
            {
                total += this.sprites[k].caclByteLength();
                total += math.caclStringByteLength(k);
            }
            return total;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 贴图像素宽度
         * @version m4m 1.0
         */
        texturewidth: number;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 贴图像素高度
         * @version m4m 1.0
         */
        textureheight: number;

        private _texture: texture;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取当前texture
         * @version m4m 1.0
         */
        public get texture()
        {
            return this._texture;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 设置当前texture
         * @param value
         * @version m4m 1.0
         */
        public set texture(value: texture)
        {
            if (this._texture != null)
            {
                this._texture.unuse();
            }
            this._texture = value;
            this._texture.use();
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 解析得到的sprite列表 key-->name
         * @version m4m 1.0
         */
        sprites: { [id: string]: sprite } = {};

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 解析资源
         * @param jsonStr json数据
         * @param assetmgr 资源管理实例
         * @version m4m 1.0
         */
        Parse(jsonStr: string, assetmgr: assetMgr, bundleName: string = null)
        {

            var json = JSON.parse(jsonStr);
            var name: string = json["t"];//name
            this.texturewidth = json["w"];
            this.textureheight = json["h"];
            var s = <any[]>json["s"];

            this.texture = assetmgr.getAssetByName(name, bundleName) as m4m.framework.texture;
            
            if (this.texture == null)
            {
                console.log("atlas的图片名字不对");
            }
            for (var i in s)
            {
                var ss = <any[]>s[i];
                var spriteName = ss[0];
                var r: sprite = new sprite(this.getName() + "_" + spriteName);//用Atlas的名字的Sprite的名字拼接
                // r.bundle = assetmgr.name_bundles[bundleName];
                assetmgr.use(r);
                if (this.texture)
                {
                    r.texture = this.texture;
                }
                r.rect = new math.rect(<number>ss[1], <number>ss[2], <number>ss[3], <number>ss[4]);
                r.border = new math.border(0, 0, 0, 0);
                r.atlas = this.getName();
                this.sprites[spriteName] = r;
            }
            return this;
        }
    }
}