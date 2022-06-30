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
     * 复合 2d 刚体
     * @version m4m 1.0
     */
    @reflect.node2DComponent
    @reflect.node2DPhysicsBody
    export class compoundBody2d extends physics2DBody 
    {
        static readonly ClassName:string="compoundBody2d";
        transform: transform2D;

        private _bodys : Ibody[] = [];

        start() {
            // let body = this.physicsEngine.createCircleBodyByInitData(this,this.radius,this.maxSides);

            let engine = this.physicsEngine;

            //校准位置
            let pos = this.transform.getWorldTranslate();
            let tempv2 = poolv2();
            let len = this._bodys.length;
            for(var i=0;i < len ;i++){
                let body = this._bodys[i];
                tempv2.x = body.position.x + pos.x;
                tempv2.y = body.position.y + pos.y;
                engine.setPosition(body,tempv2);
            }

            this.options.parts = this._bodys;

            //root body
            this.options.angle = this.transform.localRotate;
            this.body  = engine.createBody(this.options);

            engine.addBody(this);
            poolv2_del(tempv2);
            super.start();
        }

        /** 添加部分 body */
        addPart(body:Ibody){
            if(!body) return;
            this._bodys.push(body);
        }

        onPlay(){

        }

    }
}