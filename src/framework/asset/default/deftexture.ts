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
    export class defTexture
    {
        static readonly white = "white";
        static readonly black = "black";
        static readonly gray = "gray";
        static readonly normal = "normal";
        static readonly grid = "grid";
        static readonly particle = "particle";
        /**
         * 初始化默认纹理
         * @param assetmgr 资源管理 
         */
        static initDefaultTexture(assetmgr: assetMgr)
        {
            var t = new texture(this.white);
            t.glTexture = m4m.render.glTexture2D.staticTexture(assetmgr.webgl, this.white);
            t.defaultAsset = true;
            assetmgr.mapDefaultTexture[this.white] = t;

            var t = new texture(this.black);
            t.glTexture = m4m.render.glTexture2D.staticTexture(assetmgr.webgl, this.black);
            t.defaultAsset = true;
            assetmgr.mapDefaultTexture[this.black] = t;

            var t = new texture(this.gray);
            t.glTexture = m4m.render.glTexture2D.staticTexture(assetmgr.webgl, this.gray);
            t.defaultAsset = true;
            assetmgr.mapDefaultTexture[this.gray] = t;

            var t = new texture(this.normal);
            t.glTexture = m4m.render.glTexture2D.staticTexture(assetmgr.webgl, this.normal);
            t.defaultAsset = true;
            assetmgr.mapDefaultTexture[this.normal] = t;

            var t = new texture(this.grid);
            t.glTexture = m4m.render.glTexture2D.staticTexture(assetmgr.webgl, this.grid);
            t.defaultAsset = true;
            assetmgr.mapDefaultTexture[this.grid] = t;

            var t = new texture(this.particle);
            t.glTexture = m4m.render.glTexture2D.particleTexture(assetmgr.webgl);
            t.defaultAsset = true;
            assetmgr.mapDefaultTexture[this.particle] = t;

            //must in end
            defTexture.initDefaultCubeTexture(assetmgr);
        }

        /**
         * 初始化默认cube纹理
         * @param assetmgr 资源管理
         */
        private static initDefaultCubeTexture(assetmgr: assetMgr){
            let whiteTex = assetmgr.mapDefaultTexture[this.white];
            var t = new texture(this.white);
            t.glTexture = new m4m.render.glTextureCube(assetmgr.app.webgl);
            (t.glTexture as m4m.render.glTextureCube).uploadImages(whiteTex,whiteTex,whiteTex,whiteTex,whiteTex,whiteTex);
            t.defaultAsset = true;
            assetmgr.mapDefaultCubeTexture[this.white] = t;
        }
    }
}