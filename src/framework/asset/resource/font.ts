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
﻿namespace m4m.framework {
    export interface IFont extends IAsset {
        cmap: { [id: string]: charinfo };
        /** 字体名 */
        fontname: string;
        /** 像素尺寸 */
        pointSize: number;
        /** 填充间隔 */
        padding: number;
        /**行高 */
        lineHeight: number;
        /** 基线 */
        baseline: number;
        /** 字符容器图的宽度 */
        atlasWidth: number;
        /** 字符容器图的高度 */
        atlasHeight: number;
        /**
         * 强制确保字体包含 指定文本内的字符串
         * @param text 指定文本
         */
        EnsureString(text: string): void;
        /**
         * 获取字体纹理
         */
        GetTexture():texture;
        /** 是否是SDF */
        IsSDF():boolean;
    }
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 字体资源
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class font implements IFont {
        static readonly ClassName: string = "font";
        IsSDF():boolean
        {
            return true;
        }
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
         * 字体资源
         * @param assetName 资源名 
         */
        constructor(assetName: string = null) {
            if (!assetName) {
                assetName = "font_" + this.getGUID();
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
        getName(): string {
            return this.name.getText();
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取资源唯一id
         * @version m4m 1.0
         */
        getGUID(): number {
            return this.id.getID();
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 引用计数加一
         * @version m4m 1.0
         */
        use() {
            sceneMgr.app.getAssetMgr().use(this);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 引用计数减一
         * @version m4m 1.0
         */
        unuse(disposeNow: boolean = false) {
            sceneMgr.app.getAssetMgr().unuse(this, disposeNow);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 释放资源
         * @version m4m 1.0
         */
        dispose() {
            if (this.texture) {
                this.texture.unuse();
            }
            delete this.cmap;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 计算资源字节大小
         * @version m4m 1.0
         */
        caclByteLength(): number {
            let total = 0;
            for (let k in this.cmap) {
                total += math.caclStringByteLength(k);
                total += charinfo.caclByteLength();
            }
            return total;
        }
        private _texture: texture;
        public get texture() {
            return this._texture;
        }
        public set texture(value: texture) {
            if (this._texture != null) {
                this._texture.unuse();
            }
            this._texture = value;
            if (this._texture)
                this._texture.use();
        }
        //mat: spriteMat;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 字体信息map
         * @version m4m 1.0
         */
        cmap: { [id: string]: charinfo };
        /** 字体名 */
        fontname: string;
        /** 像素尺寸 */
        pointSize: number;
        /** 填充间隔 */
        padding: number;
        /**行高 */
        lineHeight: number;
        /** 基线 */
        baseline: number;
        /** 字符容器图的宽度 */
        atlasWidth: number;
        /** 字符容器图的高度 */
        atlasHeight: number;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 解析资源
         * @param jsonStr json数据
         * @param assetmgr 资源管理实例
         * @version m4m 1.0
         */
        Parse(jsonStr: string, assetmgr: assetMgr, bundleName: string = null) {
            // let d1 = new Date().valueOf();
            let json = JSON.parse(jsonStr);

            //parse fontinfo
            var font = <any[]>json["font"];
            this.fontname = <string>font[0];
            var picName = <string>font[1];
            this.texture = assetmgr.getAssetByName(picName, bundleName) as m4m.framework.texture;
            this.pointSize = <number>font[2];
            this.padding = <number>font[3];
            this.lineHeight = <number>font[4];
            this.baseline = <number>font[5];
            this.atlasWidth = <number>font[6];
            this.atlasHeight = <number>font[7];

            //parse char map
            this.cmap = {};
            let map = json["map"];
            for (var c in map) {
                let finfo = new charinfo();//ness
                this.cmap[c] = finfo;
                finfo.x = (map[c][0] - 0.5) / this.atlasWidth;
                finfo.y = (map[c][1] - 0.5) / this.atlasHeight;
                finfo.w = (map[c][2] + 1.0) / this.atlasWidth;
                finfo.h = (map[c][3] + 1.0) / this.atlasHeight;
                finfo.xSize = map[c][2];
                finfo.ySize = map[c][3];
                finfo.xOffset = map[c][4];
                finfo.yOffset = map[c][5];
                finfo.xAddvance = map[c][6];
            }
            map = null;
            json = null;
            return this;
        }
        EnsureString(text: string): void
        {
            
        }
        GetTexture():texture
        {
            return this._texture;
        }
    }
    /**
     * @private
     */
    export class charinfo {
        /**
         * uv
         */
        x: number;//uv
        /**
         * uv
         */
        y: number;
        /**
         * uv宽度
         */
        w: number;//uv长度
        /**
         * uv高度
         */
        h: number;
        /**
         * 像素X尺寸
         */
        xSize: number;//像素
        /**
         * 像素Y尺寸
         */
        ySize: number;
        /**
         * 偏移
         */
        xOffset: number = 0;//偏移
        /**
         * 相对基线的偏移
         */
        yOffset: number = 0;//相对基线的偏移
        /**
         * 字符宽度
         */
        xAddvance: number;//字符宽度
        /**
         * 计算内存占用长度
         * @returns 
         */
        static caclByteLength(): number {
            return 36;
        }
    }
}