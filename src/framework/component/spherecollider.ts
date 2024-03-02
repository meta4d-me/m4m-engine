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
     * 球形碰撞盒结构体
     * @version m4m 1.0
     */
    export class spherestruct
    {
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 球形碰撞盒中心点
         * @version m4m 1.0
         */
        public center:m4m.math.vector3 = new math.vector3();
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 球形碰撞盒半径（缩放处理过的半径）
         * @version m4m 1.0
         */
        public radius:number;//缩放处理过的半径
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 球形碰撞盒半径（collider定义的源半径）
         * @version m4m 1.0
         */
        public srcradius:number;//collider定义的源半径
        private tempScale:m4m.math.vector3 = new m4m.math.vector3();
        private srcCenter : m4m.math.vector3 = new m4m.math.vector3();
        /**
         * 球形
         * @param _center 中心点
         * @param _r 半径
         */
        constructor(_center:math.vector3, _r:number)
        {
            math.vec3Clone(_center,this.srcCenter);
            math.vec3Clone(_center,this.center);
            this.srcradius = _r;
        }
        /**
         * 更新
         * @param worldmatrix 世界变换矩阵
         */
        public update(worldmatrix:math.matrix)
        {
            m4m.math.matrixTransformVector3(this.srcCenter,worldmatrix,this.center);
            // m4m.math.matrixGetTranslation(worldmatrix, this.center);
            m4m.math.matrixGetScale(worldmatrix, this.tempScale);
            if(this.tempScale.x < this.tempScale.y) this.tempScale.x = this.tempScale.y;
            if(this.tempScale.x < this.tempScale.z) this.tempScale.x = this.tempScale.z;
            this.radius = this.srcradius * this.tempScale.x;
        }
        /**
         * @public
         * @language zh_CN
         * @param bound 碰撞体
         * @classdesc
         * 碰撞体检测碰撞
         * @version m4m 1.0
         */
        public intersects(bound:any)
        {
            if(!bound)  return false;
            if(bound instanceof spherestruct)
            {
                return collision.sphereVsSphere(this,bound);
                // let dis = math.vec3Distance(this.center, bound.center);
                // if(dis > this.radius + bound.radius)    return false;
                // return true;
            }
            else if(bound instanceof obb)
            {
                return collision.obbVsSphere(bound,this);
            }
        }

        /**
         * @public
         * @language zh_CN
         * @param axis 指定轴
         * @param out 长度范围
         * @classdesc
         * 计算到指定轴上投影的长度
         * @version m4m 1.0
         */
        computeExtentsByAxis (axis: math.vector3 , out : math.vector2){
            let p = m4m.math.vec3Dot(this.center, axis);
            out.x = p - this.radius;
            out.y = p + this.radius;
        }
    }
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 球形碰撞盒组件
     * @version m4m 1.0
     */
    @reflect.nodeComponent
    @reflect.nodeSphereCollider
    export class spherecollider implements INodeComponent, ICollider
    {
        static readonly ClassName:string="spherecollider";
        private static helpMat : m4m.framework.material = null;

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
         * 子transform
         * @version m4m 1.0
         */
        subTran: transform;
         /**
         * @private
         */
        filter: meshFilter;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 碰撞球数据
         * @version m4m 1.0
         */
        spherestruct: spherestruct;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 碰撞球中心点
         * @version m4m 1.0
         */
        @m4m.reflect.Field("vector3")
        center: math.vector3 = new math.vector3();
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 碰撞球大小
         * @version m4m 1.0
         */
        @m4m.reflect.Field("number")
        radius: number = 0.5;
        /**
         * @private
         */
        _worldCenter:math.vector3 = new math.vector3();
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 碰撞球中心点
         * @version m4m 1.0
         */
        public get worldCenter():math.vector3
        {
            math.vec3Clone(this.center, this._worldCenter);
            math.matrixTransformVector3(this._worldCenter, this.gameObject.transform.getWorldMatrix(), this._worldCenter);
            return this._worldCenter;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 碰撞球数据
         * @version m4m 1.0
         */
        getBound()
        {
            return this.spherestruct;
        }
        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 获取该碰撞盒物体的世界矩阵
        * @version m4m 1.0
        */
        public get matrix(): m4m.math.matrix
        {
            if (this.gameObject)
                return this.gameObject.transform.getWorldMatrix();
            return new m4m.math.matrix();
        }
        start()
        {
            this.filter = this.gameObject.getComponent("meshFilter") as meshFilter;
            this.build();
        }

        onPlay()
        {

        }

        update(delta: number)
        {
            if (this.spherestruct)
            {
                this.spherestruct.update(this.matrix);
                if(this.subTran && this.subTran.gameObject.components.length >0){
                    let r = this.spherestruct.radius;
                    let sc = m4m.math.pool.new_vector3(r,r,r);
                    this.subTran.setWorldScale(sc);
                    m4m.math.pool.delete_vector3(sc);

                    this.subTran.setWorldPosition(this.spherestruct.center);
                }
            }
        }
         /**
         * @private
         */
        _colliderVisible: boolean = false;
        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 返回碰撞盒可见性
        * @version m4m 1.0
        */
        get colliderVisible(): boolean
        {
            return this._colliderVisible;
        }
        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 设置碰撞盒是否可见
        * @version m4m 1.0
        */
        set colliderVisible(value: boolean)
        {
            this._colliderVisible = value;
            if(this._colliderVisible){
                if(!this.subTran){
                    this.buildMesh();
                }
                // if(this.subTran && this.subTran.gameObject.components.length<1){
                //     this.setMeshRenderer();
                // }
            }
            if(this.subTran){
                this.subTran.gameObject.visible = this._colliderVisible;
            }
        }
        /**
         * 判断一个平面在球内
         * @param v0 面点0
         * @param v1 面点1
         * @param v2 面点2
         * @returns 是在球内？
         */
        caclPlaneInDir(v0: math.vector3, v1:math.vector3, v2: math.vector3)
        {
            let subv0 = math.pool.new_vector3();
            let subv1 = math.pool.new_vector3();
            let cro0 = math.pool.new_vector3();
            let point = math.pool.new_vector3();
            math.vec3Subtract(v1, v0, subv0);
            math.vec3Subtract(v2, v1, subv1);
            math.vec3Cross(subv0, subv1, cro0);

            math.calPlaneLineIntersectPoint(cro0, v0, cro0, this.worldCenter, point);

            let sublp = math.pool.new_vector3();
            math.vec3Subtract(point, this.worldCenter, sublp);
            let val = math.vec3Dot(cro0, sublp);
            math.pool.delete_vector3(subv0);
            math.pool.delete_vector3(subv1);
            math.pool.delete_vector3(cro0);

            if(val <= 0) return true;
            let dis = math.vec3Distance(this.worldCenter, point);
            math.pool.delete_vector3(point);
            if(dis < this.radius)    return true;

            return false;
        }
        /**
        * @public
        * @language zh_CN
        * @param tran 目标transform
        * @classdesc
        * 检测碰撞
        * @version m4m 1.0
        */
        intersectsTransform(tran: transform): boolean
        {
            if (tran.gameObject.collider == null) return false;
            if (this.spherestruct == null || tran.gameObject.collider.getBound() == null) return false;
            var _obb = tran.gameObject.collider.getBound();
            return this.spherestruct.intersects(_obb);
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
            if (this.center && this.radius)
            {
                this.spherestruct = new spherestruct(this.center, this.radius);
            }

            //this.buildMesh();
        }
        /**
        * @private
        * @language zh_CN
        * @classdesc
        * 构建碰撞盒mesh 并显示
        * @version m4m 1.0
        */
        private buildMesh()
        {
            this.subTran = new m4m.framework.transform();
            this.subTran.gameObject.hideFlags = HideFlags.DontSave | HideFlags.HideInHierarchy | HideFlags.NotEditable;
            this.subTran.name = "sphereCollider";
            if(this._colliderVisible){
                this.setMeshRenderer();
            }
        }

        /**
         * 设置mesh 的 渲染器
         */
        private setMeshRenderer(){
            let mesh = this.subTran.gameObject.addComponent("meshFilter") as m4m.framework.meshFilter;
            mesh.mesh = this.gameObject.getScene().app.getAssetMgr().getDefaultMesh("sphere");
            let renderer = this.subTran.gameObject.addComponent("meshRenderer") as m4m.framework.meshRenderer;
            //
            renderer.materials = [];
            if(!spherecollider.helpMat){
                let ass = this.gameObject.getScene().app.getAssetMgr();
                spherecollider.helpMat = new material("sphereCMat");
                spherecollider.helpMat.defaultAsset = true;
                spherecollider.helpMat.setShader(ass.getShader("shader/materialcolor"));
                let color = new m4m.math.vector4(0,1,0,1);
                spherecollider.helpMat.setVector4("_Color",color);
                spherecollider.helpMat.setFloat("_Alpha",0.3);
            }
            renderer.materials[0] = spherecollider.helpMat;

            this.subTran.gameObject.visible = this._colliderVisible;

            this.gameObject.transform.addChild(this.subTran);
            this.gameObject.transform.markDirty();
            this.subTran.markDirty();//要标记自己脏了，才会更新
            this.gameObject.transform.updateWorldTran();
        }

        /**
        * @private
        * @language zh_CN
        * @classdesc
        * 获取碰撞盒mesh
        * @version m4m 1.0
        */
        private getColliderMesh(): mesh
        {
            var _mesh: mesh = new mesh();
            // _mesh.data = m4m.render.meshData.genBoxByArray_Quad(this.obb.vectors);
            // var vf = m4m.render.VertexFormatMask.Position | m4m.render.VertexFormatMask.Normal;
            // var v32 = _mesh.data.genVertexDataArray(vf);
            // var i16 = _mesh.data.genIndexDataArrayQuad2Line();
            // var webgl = this.gameObject.getScene().webgl;

            // _mesh.glMesh = new m4m.render.glMesh();
            // _mesh.glMesh.initBuffer(webgl, vf, _mesh.data.pos.length);
            // _mesh.glMesh.uploadVertexSubData(webgl, v32);

            // _mesh.glMesh.addIndex(webgl, i16.length);
            // _mesh.glMesh.uploadIndexSubData(webgl, 0, i16);
            // _mesh.submesh = [];

            // {
            //     var sm = new subMeshInfo();
            //     sm.matIndex = 0;
            //     sm.start = 0;
            //     sm.size = i16.length;
            //     sm.line = true;
            //     _mesh.submesh.push(sm);
            // }
            return _mesh;
        }
         /**
         * @private
         */
        remove()
        {
            if (this.subTran)
            {
                this.subTran.dispose();
            }
        }
         /**
         * @private
         */
        clone()
        {

        }
    }

}