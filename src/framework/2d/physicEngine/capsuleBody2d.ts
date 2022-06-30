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
     * 胶囊体 2d刚体 （图形的朝向会根据 transform 的宽和高来适配）
     * @version m4m 1.0
     */
    @reflect.node2DComponent
    @reflect.node2DPhysicsBody
    export class capsuleBody2d extends physics2DBody 
    {
        static readonly ClassName:string="capsuleBody2d";
        
        transform: transform2D;
        /** 胶囊体朝向为 Y 轴 */
        get y_Axis (){return this.transform.height > this.transform.width ;};
        @reflect.Field("number")
        maxSides : number = 25;

        start() {
            this.options.angle = this.transform.localRotate;
            let body = this.physicsEngine.createCapsuleByPBody(this,this.maxSides);
            this.physicsEngine.addBody(this);

            super.start();
        }
        onPlay(){

        }

    }
}