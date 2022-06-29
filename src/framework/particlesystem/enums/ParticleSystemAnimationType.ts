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
     * The animation type.
     * 
     * 动画类型。
     * 
     * @author feng3d
     */
    export enum ParticleSystemAnimationType
    {
        /**
         * Animate over the whole texture sheet from left to right, top to bottom.
         * 
         * 从左到右，从上到下动画整个纹理表。
         */
        WholeSheet = 0,
        /**
         * Animate a single row in the sheet from left to right.
         * 
         * 从左到右移动工作表中的一行。
         */
        SingleRow = 1,
    }
}