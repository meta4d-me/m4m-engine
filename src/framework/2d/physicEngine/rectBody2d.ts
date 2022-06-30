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
     /**
     * @public  
     * @language zh_CN
     * @classdesc
     * 矩形 2d刚体
     * @version m4m 1.0
     */
    @reflect.node2DComponent
    @reflect.node2DPhysicsBody
    export class rectBody2d extends physics2DBody
    {
        static readonly ClassName:string="rectBody2d";
        transform: transform2D;

        start() {
            this.options.angle = this.transform.localRotate;
            let body = this.physicsEngine.createRectByPBody(this);
            this.physicsEngine.addBody(this);
            super.start();
        }
        onPlay(){

        }
    }
}