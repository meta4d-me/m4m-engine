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
/// <reference path="../../io/reflect.ts" />

namespace m4m.framework
{
    export enum LightTypeEnum
    {
        Direction,
        Point,
        Spot,
    }
     /**
     * @public
     * @language zh_CN
     * @classdesc
     * 灯光组件
     * @version m4m 1.0
     */
    @reflect.nodeComponent
    @reflect.nodeLight
    export class light implements INodeComponent
    {
        static readonly ClassName:string="light";

         /**
         * @public
         * @language zh_CN
         * @classdesc
         * 挂载的gameobject
         * @version m4m 1.0
         */
        gameObject: gameObject;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 光源类型
         * @version m4m 1.0
         */
        @reflect.Field("number")
        type:LightTypeEnum;
         /**
         * @private
         */
        spotAngelCos:number =0.9;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 光源范围
         * @version m4m 1.0
         */
        @reflect.Field("number")
        range:number = 10;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 光源强度
         * @version m4m 1.0
         */
        @reflect.Field("number")
        intensity:number = 1;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 光源颜色
         * @version m4m 1.0
         */
        @reflect.Field("color")
        color:math.color = new math.color(1.0, 1.0, 1.0, 1.0);
         /**
         * @public
         * @language zh_CN
         * @classdesc
         * 光照剔除mask
         * @version m4m 1.0
         */
        @reflect.Field("number")
        cullingMask:number = CullingMask.everything; //最大 32个layer（32位） 默认everything = 0xffffffff
        start()
        {

        }

        onPlay()
        {

        }

        update(delta: number)
        {
            let _scene = sceneMgr.scene;
            if(_scene.autoCollectlightCamera){
                //收集灯光
                var l = this;
                if (l != null && l.gameObject.visible)
                {
                    _scene.addLight(l);
                }
            }
        }
         /**
         * @private
         */
        remove()
        {

        }
         /**
         * @private
         */
        clone()
        {

        }
    }
}