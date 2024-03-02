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
     * sprite资源
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class sprite implements IAsset
    {
        static readonly ClassName:string="sprite";

        private name: constText;
        private id: resID = new resID();
        bundle:assetBundle;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 是否为默认资源
         * @version m4m 1.0
         */
        defaultAsset: boolean;//是否为系统默认资源
        /**
         * sprite 图资源
         * @param assetName 资源名
         */
        constructor(assetName: string = null)
        {
            if (!assetName)
            {
                assetName = "sprite_" + this.getGUID();
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
            if (this.texture != null)
            {
                this.texture.unuse();
            }
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
            if (this._texture)
            {
                total += this._texture.caclByteLength();
            }
            
            return total;
        }
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
         * 设置texture
         * @param value texture实例
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
         * 所属图集
         * @version m4m 1.0
         */
        atlas: string;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 有效区域
         * @version m4m 1.0
         */
        rect: math.rect ;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 边距
         * @version m4m 1.0
         */
        border: math.border = new math.border();
        private _urange: math.vector2;
        private _vrange: math.vector2;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * uv的u范围
         * @version m4m 1.0
         */
        public get urange()
        {
            if (this._urange == null)
            {
                this._urange = new math.vector2();
                this._urange.x = this.rect.x / this._texture.glTexture.width;
                this._urange.y = (this.rect.x + this.rect.w) / this._texture.glTexture.width;
            }
            return this._urange;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * uv的v范围
         * @version m4m 1.0
         */
        public get vrange()
        {
            if (this._vrange == null)
            {
                this._vrange = new math.vector2();
                this._vrange.x = this.rect.y / this._texture.glTexture.height;
                this._vrange.y = (this.rect.y + this.rect.h) / this._texture.glTexture.height;
            }
            return this._vrange;
        }
        
    }
}