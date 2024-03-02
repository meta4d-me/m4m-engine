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
﻿namespace m4m.framework
{
     /**
     * @public
     * @language zh_CN
     * @classdesc
     * 碰撞组件
     * @version m4m 1.0
     */
    @reflect.nodeComponent
    @reflect.nodeMeshCollider
    export class meshcollider implements INodeComponent, ICollider
    {
        static readonly ClassName:string="meshcollider";

         /**
         * @public
         * @language zh_CN
         * @classdesc
         * 挂载的gameobject
         * @version m4m 1.0
         */
        gameObject: gameObject;
         /**
         * @private
         */
        subTran: transform;
         /**
         * @private
         */
        private _mesh: mesh;

        private _filter : meshFilter;
         /**
         * @private
         */
        getBound()
        {
            return this._mesh;
        }
        start()
        {
            this._filter = this.gameObject.getComponent("meshFilter") as meshFilter;
            this.ckbuildMesh();
        }

        onPlay()
        {

        }

        update(delta: number)
        {

        }
         /**
         * @private
         */
        @m4m.reflect.Field("boolean")
        private _colliderVisible: boolean = false;
         /**
         * @public
         * @language zh_CN
         * @classdesc
         * 碰撞体的可见性
         * @version m4m 1.0
         */
        get colliderVisible(): boolean
        {
            return this._colliderVisible;
        }
         /**
         * @public
         * @language zh_CN
         * @param value boolbean
         * @classdesc
         * 碰撞体的可见性
         * @version m4m 1.0
         */
        set colliderVisible(value: boolean)
        {
            this._colliderVisible = value;
            if (this.subTran)
            {
                this.subTran.gameObject.visible = this._colliderVisible;
            }
        }
       
        intersectsTransform(tran: transform): boolean
        {
            //obb-mesh  obb-obb  mesh-mesh
            return false;
        }
        private _builded = false;
        /**
         * 检查构建mesh
         */
        private ckbuildMesh()
        {
            if(this._builded || !this._filter) return;
            this._mesh = this._filter.getMeshOutput();
            if(!this._mesh) return;
            this.subTran = new m4m.framework.transform();
            this.subTran.gameObject.hideFlags = HideFlags.DontSave | HideFlags.HideInHierarchy;
            this.subTran.name = `${this.gameObject.getName()}_meshcollider`;
            var mesh = this.subTran.gameObject.addComponent("meshFilter") as m4m.framework.meshFilter;
            mesh.mesh = this.getColliderMesh();
            this.subTran.gameObject.visible = this._colliderVisible;
            this.gameObject.transform.addChild(this.subTran);
            this.gameObject.transform.markDirty();
            this.subTran.markDirty();
            this.gameObject.transform.updateWorldTran();
            this._builded = true;
        }

        /**
         * 获取 碰撞mesh
         * @returns 碰撞mesh
         */
        private getColliderMesh(): mesh
        {
            var _mesh: mesh = new mesh();
            _mesh.data = this._mesh.data;
            var vf = m4m.render.VertexFormatMask.Position | m4m.render.VertexFormatMask.Normal;
            var v32 = _mesh.data.genVertexDataArray(vf);
            var i16 = _mesh.data.genIndexDataArrayTri2Line();
            var webgl = this.gameObject.getScene().webgl;

            _mesh.glMesh = new m4m.render.glMesh();
            _mesh.glMesh.initBuffer(webgl, vf, _mesh.data.getVertexCount());
            _mesh.glMesh.uploadVertexData(webgl, v32);

            _mesh.glMesh.addIndex(webgl, i16.length);
            _mesh.glMesh.uploadIndexData(webgl, 0, i16);
            _mesh.glMesh.initVAO();

            _mesh.submesh = [];
            {
                var sm = new subMeshInfo();
                sm.matIndex = 0;
                sm.start = 0;
                sm.size = i16.length;
                sm.line = true;
                _mesh.submesh.push(sm);
            }
            return _mesh;
        }
         /**
         * @private
         */
        remove()
        {
            if(this.subTran)
            {
                this.subTran.dispose();
            }
            this._mesh = null;
            this._filter = null;
        }
         /**
         * @private
         */
        clone()
        {

        }
    }
}