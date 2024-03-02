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
     * layer mask 
     * @version m4m 1.0
     */
    export enum CullingMask
    {
        //--------- 系统定义区段 ----------
        nothing = 0x00000000,

        default = 0x00000001,
        transparentFx = 0x00000002,
        IgnoreRaycast = 0x00000004,
        editor = 0x00000008,    //系统 编辑层
        water = 0x00000010,
        ui = 0x00000020,
        preview = 0x00000040,  //系统 预览层

        builtin_0 = 0x00000001,
        builtin_1 = 0x00000002,
        builtin_2 = 0x00000004,
        builtin_3 = 0x00000008,
        builtin_4 = 0x00000010,
        builtin_5 = 0x00000020,
        builtin_6 = 0x00000040,
        builtin_7 = 0x00000080,
        //--------- 用户自定义区段 ----------
        modelbeforeui = 0x00000100,

        user_8  = 0x00000100,
        user_9  = 0x00000200,
        user_10 = 0x00000400,
        user_11 = 0x00000800,
        user_12 = 0x00001000,
        user_13 = 0x00002000,
        user_14 = 0x00004000,
        user_15 = 0x00008000,
        user_16 = 0x00010000,
        user_17 = 0x00020000,
        user_18 = 0x00040000,
        user_19 = 0x00080000,
        user_20 = 0x00100000,
        user_21 = 0x00200000,
        user_22 = 0x00400000,
        user_23 = 0x00800000,
        user_24 = 0x01000000,
        user_25 = 0x02000000,
        user_26 = 0x04000000,
        user_27 = 0x08000000,
        user_28 = 0x10000000,
        user_29 = 0x20000000,
        user_30 = 0x40000000,
        user_31 = 0x80000000,
        everything = 0xffffffff
    }

    /**
     * @private
     * @language zh_CN
     * @classdesc
     * 剔除mask工具类
     * @version m4m 1.0
     */
    export class cullingmaskutil
    {
        /**
         * mask值转 层级ID
         * @param mask mask值转（二进制位 标记层级的值）
         * @returns 层级ID
         */
        static maskTolayer(mask:number){
            return Math.log(mask) / Math.log(2);
        }
        
        /**
         * 层级ID 转 mask（二进制位 标记层级的值）
         * @param layer 层级ID
         * @returns mask值
         */
        static layerToMask(layer:number){
            return 1 << layer;
        }
    }
}