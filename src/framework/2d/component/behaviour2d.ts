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
    export class behaviour2d implements I2DComponent , IEnabled
    {

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 组件启用
         * @version m4m 1.0
         */
        // @reflect.Field("boolean")  //有问题 ，待处理组件继承后 开启
        enabled : boolean = true;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 挂载的transform
         * @version m4m 1.0
         */
        transform: transform2D;

        /** 初始化使用 */
        start() {

        }

        /** 初始化使用  在start 之后*/
        onPlay(){

        }
        /** 每帧调用一次 */
        update(delta: number) {

        }
        /** 销毁时调用 */
        remove() {
            
        }

    }

}