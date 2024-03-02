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
    export class defsprite
    {
        static readonly white_sprite = "white_sprite";
        static readonly gray_sprite = "gray_sprite";
        static readonly grid_sprite = "grid_sprite";
        /**
         * 初始化默认Sprite
         * @param assetmgr 资源管理
         */
        static initDefaultSprite(assetmgr: assetMgr)
        {
            let spt_white = new sprite(this.white_sprite);
            spt_white.texture = assetmgr.getDefaultTexture("white");
            spt_white.defaultAsset = true;
            spt_white.rect = new math.rect(0,0,spt_white.texture.glTexture.width,spt_white.texture.glTexture.height);
            assetmgr.mapDefaultSprite[this.white_sprite] = spt_white;

            let spt_gray = new sprite(this.gray_sprite);
            spt_gray.texture = assetmgr.getDefaultTexture("gray");
            spt_gray.defaultAsset = true;
            spt_gray.rect = new math.rect(0,0,spt_gray.texture.glTexture.width,spt_gray.texture.glTexture.height);
            assetmgr.mapDefaultSprite[this.gray_sprite] = spt_gray;

            let spt_grid = new sprite(this.grid_sprite);
            spt_grid.texture = assetmgr.getDefaultTexture("grid");
            spt_grid.defaultAsset = true;
            spt_grid.rect = new math.rect(0,0,spt_grid.texture.glTexture.width,spt_grid.texture.glTexture.height);
            assetmgr.mapDefaultSprite[this.grid_sprite] = spt_grid;
        }
    }
}