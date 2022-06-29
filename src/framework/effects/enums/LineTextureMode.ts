/**
@license
Copyright 2022 meta4d.me Authors

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
     * Choose how textures are applied to Lines and Trails.
     * 
     * 选择如何将纹理应用于线和迹线。
     */
    export enum LineTextureMode
    {
        /**
         * Map the texture once along the entire length of the line.
         * 
         * 沿线的整个长度映射一次纹理。
         */
        Stretch,

        /**
         * Repeat the texture along the line, based on its length in world units. To set the tiling rate, use Material.SetTextureScale.
         * 
         * 根据纹理的长度（以世界单位为单位），沿线重复纹理。要设置平铺率，请使用Material.SetTextureScale。
         */
        Tile,

        /**
         * Map the texture once along the entire length of the line, assuming all vertices are evenly spaced.
         * 
         * 假设所有顶点均等分布，则沿着线的整个长度映射一次纹理。
         */
        DistributePerSegment,

        /**
         * Repeat the texture along the line, repeating at a rate of once per line segment. To adjust the tiling rate, use Material.SetTextureScale.
         * 
         * 沿线重复纹理，每个线段重复一次。要调整平铺率，请使用Material.SetTextureScale。
         */
        RepeatPerSegment,
    }

}