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
     * 正则表达式的工具类，提供一些引擎用到的正则表达式
     * @version m4m 1.0
     */
    export class StringUtil
    {
        /** 启用标记 */
        static readonly ENABLED = "enabled";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 内建TAG “Untagged”
         * @version m4m 1.0
         */
        static readonly builtinTag_Untagged = "Untagged";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 内建TAG “Player”
         * @version m4m 1.0
         */
        static readonly builtinTag_Player = "Player";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 内建TAG “EditorOnly”
         * @version m4m 1.0
         */
        static readonly builtinTag_EditorOnly = "EditorOnly";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 内建TAG “MainCamera”
         * @version m4m 1.0
         */
        static readonly builtinTag_MainCamera = "MainCamera";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取camera组件的名字
         * @version m4m 1.0
         */
        public static readonly COMPONENT_CAMERA = "camera";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取boxcollider组件的名字
         * @version m4m 1.0
         */
        public static readonly COMPONENT_BOXCOLLIDER = "boxcollider";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取light组件的名字
         * @version m4m 1.0
         */
        public static readonly COMPONENT_LIGHT = "light";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取meshFilter组件的名字
         * @version m4m 1.0
         */
        public static readonly COMPONENT_MESHFILTER = "meshFilter";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取meshRenderer组件的名字
         * @version m4m 1.0
         */
        public static readonly COMPONENT_MESHRENDER = "meshRenderer";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取effectSystem组件的名字
         * @version m4m 1.0
         */
        public static readonly COMPONENT_EFFECTSYSTEM = "effectSystem";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取label组件的名字
         * @version m4m 1.0
         */
        public static readonly COMPONENT_LABEL = "label";
        public static readonly COMPONENT_uirect = "uirect";
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取image2D组件的名字
         * @version m4m 1.0
         */
        public static readonly COMPONENT_IMAGE = "image2D";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取rawImage2D组件的名字
         * @version m4m 1.0
         */
        public static readonly COMPONENT_RAWIMAGE = "rawImage2D";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取button组件的名字
         * @version m4m 1.0
         */
        public static readonly COMPONENT_BUTTON = "button";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取skinnedMeshRenderer组件的名字
         * @version m4m 1.0
         */
        public static readonly COMPONENT_SKINMESHRENDER = "skinnedMeshRenderer";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取AudioPlayer组件的名字
         * @version m4m 1.0
         */
        public static readonly COMPONENT_AUDIOPLAYER = "AudioPlayer";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取cameraController组件的名字
         * @version m4m 1.0
         */
        public static readonly COMPONENT_CAMERACONTROLLER = "cameraController";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取canvasRenderer组件的名字
         * @version m4m 1.0
         */
        public static readonly COMPONENT_CANVASRENDER = "canvasRenderer";

        /**
         * @private
         */
        public static readonly UIStyle_RangeFloat = "rangeFloat";

        /**
         * @private
         */
        public static readonly UIStyle_Enum = "enum";

        /**
         * @private
         */
        public static readonly RESOURCES_MESH_CUBE = "cube";

        /** 匹配文件后缀 */
        private static suffixPattern = /(\.([a-z|0-9]*)){1,2}$/;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 将一个字符串中的所有指定字符替换为指定字符
         * @param srcStr 要处理的字符串
         * @param fromStr 原字符串中的指定字符串
         * @param toStr 将被替换为的字符串
         * @version m4m 1.0
         */
        static replaceAll(srcStr: string, fromStr: string, toStr: string)
        {
            return srcStr.replace(new RegExp(fromStr, 'gm'), toStr);
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 剔除掉字符串中所有的空格
         * @param str 要处理的字符串
         * @version m4m 1.0
         */
        static trimAll(str: string)
        {
            str += "";//可能传进来number，number没有replace方法
            var result = str.replace(/(^\s+)|(\s+$)/g, "");
            result = result.replace(/\s/g, "");
            return result;
        }

        /**
         * @private
         * @language zh_CN
         * @classdesc
         * 将一个字符串中的第一个字符转为小写
         * @param str 要处理的字符串
         * @version m4m 1.0
         */
        static firstCharToLowerCase(str: string)
        {
            let firstChar = str.substr(0, 1).toLowerCase();
            let other = str.substr(1);
            return firstChar + other;
        }

        /**
         * 判断对象是空或null
         * @param obj 对象
         * @returns 是空或null
         */
        static isNullOrEmptyObject(obj: any): boolean
        {
            if (!obj)
                return true;
            for (var n in obj) {
                return false
            }
            return true;
        }

        /**
         * 获取文件的 后缀
         * @param filePath 文件字符串 
         * @returns 
         */
        static GetSuffix(filePath : string):string
        {
            var _r = this.suffixPattern.exec(filePath);
            if(_r == null) return "";
            return _r[0];
        }

        /**
         * 解码成 文本字符串
         * @param array 数组
         * @returns 文本字符串
         */
        static decodeText( array ) {

            if ( typeof TextDecoder !== 'undefined' ) {
    
                return new TextDecoder().decode( array );
    
            }
    
            // Avoid the String.fromCharCode.apply(null, array) shortcut, which
            // throws a "maximum call stack size exceeded" error for large arrays.
    
            let s = '';
    
            for ( let i = 0, il = array.length; i < il; i ++ ) {
    
                // Implicitly assumes little-endian.
                s += String.fromCharCode( array[ i ] );
    
            }
    
            try {
    
                // merges multi-byte utf-8 characters.
    
                return decodeURIComponent( escape( s ) );
    
            } catch ( e ) { // see #16358
    
                return s;
    
            }
    
        }
    }

}