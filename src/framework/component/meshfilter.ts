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
/// <reference path="../../io/reflect.ts" />

namespace m4m.framework
{
     /**
     * @public
     * @language zh_CN
     * @classdesc
     * mesh组件
     * @version m4m 1.0
     */
    @reflect.nodeComponent
    export class meshFilter implements INodeComponent
    {
        static readonly ClassName:string="meshFilter";

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 挂载的gameobject
         * @version m4m 1.0
         */
        gameObject: gameObject;
        start()
        {
            
        }

        onPlay()
        {

        }


        update(delta: number)
        {

        }

        private _mesh: mesh;

        //本意mesh filter 可以弄一点 模型处理，比如lod
        //先直进直出吧
        /**
         * @private
         */
        @m4m.reflect.Field("mesh")
        @m4m.reflect.UIStyle("WidgetDragSelect")
        get mesh()
        {
            return this._mesh;
        }
         /**
         * @public
         * @language zh_CN
         * @param mesh 此组件的mesh
         * @classdesc
         * 设置mesh数据
         * @version m4m 1.0
         */
        set mesh(mesh: mesh)
        {
            if (this._mesh != null)
            {
                this._mesh.unuse();
            }
            this._mesh = mesh;
            if (this._mesh != null)
            {
                this._mesh.use();
            }
        }
         /**
         * @public
         * @language zh_CN
         * @classdesc
         * 返回mesh数据
         * @version m4m 1.0
         */
        getMeshOutput()
        {
            return this._mesh;
        }
        /**
         * @private
         */
        remove()
        {
            if(this.mesh)
                this.mesh.unuse();
        }
        /**
         * @private
         */
        clone()
        {

        }
    }

}