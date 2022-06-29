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
/// <reference path="../../../io/reflect.ts" />

namespace m4m.framework
{
     /**
     * @public
     * @language zh_CN
     * @classdesc
     * 2d矩形碰撞盒
     * @version m4m 1.0
     */
    @reflect.node2DComponent
    @reflect.nodeBoxCollider2d
    export class boxcollider2d implements I2DComponent , ICollider2d
    {
        static readonly ClassName:string="boxcollider2d";
        
        transform: transform2D;

        private _obb: obb2d;

        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 获取obb2d
        * @version m4m 1.0
        */
        getBound()
        {
            return this._obb;
        }

        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 检测碰撞
        * @version m4m 1.0
        */
        intersectsTransform(tran: transform2D): boolean
        {
            if (tran == null) return false;
            if (this._obb == null || tran.collider.getBound() == null) return false;
            var _obb = tran.collider.getBound();
            return this._obb.intersects(_obb);
        }

         /**
        * @private
        * @language zh_CN
        * @classdesc
        * 构建碰撞盒
        * @version m4m 1.0
        */
        private build()
        {
            let t = this.transform;
            this._obb = new obb2d();
            this._obb.buildByCenterSize(t.getWorldTranslate(),t.width,t.height);
            this.refreshTofullOver();
        }

        /**
        * @private
        * @language zh_CN
        * @classdesc
        * 刷新成碰撞框完全覆盖transform
        * @version m4m 1.0
        */
        refreshTofullOver(){
            if(!this._obb || !this._obb.size || !this._obb.offset) return;
            let t = this.transform;
            this._obb.size.x = t.width;            
            this._obb.size.y = t.height;            
            this._obb.offset.x = (0.5-t.pivot.x) * this._obb.size.x;
            this._obb.offset.y = (0.5-t.pivot.y) * this._obb.size.y;
        }

        start() {
            this.build();
        }
        onPlay(){

        }
        update(delta: number) {
            if (this._obb)
            {
                this._obb.update(this.transform.getCanvasWorldMatrix());
            }
        }
        remove() {
            if(this._obb)   this._obb.dispose();
            this._obb = null;
        }
    }
}