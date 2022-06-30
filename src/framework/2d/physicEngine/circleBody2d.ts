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
     * 圆形 2d刚体
     * @version m4m 1.0
     */
    @reflect.node2DComponent
    @reflect.node2DPhysicsBody
    export class circleBody2d extends physics2DBody 
    {
        static readonly ClassName:string="circleBody2d";

        transform: transform2D;
        /** 圆形的半径（取 宽和高两者之间最大的值为半径） */
        get radius () {
            return (this.transform.width > this.transform.height ? this.transform.width: this.transform.height) * 0.5;
        };

        @reflect.Field("number")
        maxSides : number = 25;
        start() {
            this.options.angle = this.transform.localRotate;
            let body = this.physicsEngine.createCircleByPBody(this,this.maxSides);
            this.physicsEngine.addBody(this);
            super.start();
        }
        onPlay(){

        }
    }
}