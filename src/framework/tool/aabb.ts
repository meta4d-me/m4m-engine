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
     * 表示轴对称包围盒
     * @version m4m 1.0
     */
    export class aabb
    {
        /**
        * @public
        * @language zh_CN
        * 最小点
        * @version m4m 1.0
        * @platform Web,Native
        */
        public minimum: m4m.math.vector3;

        /**
        * @public
        * @language zh_CN
        * 最大点
        * @version m4m 1.0
        * @platform Web,Native
        */
        public maximum: m4m.math.vector3;
        private srcmin: m4m.math.vector3;
        private srcmax: m4m.math.vector3;
        private opmin: m4m.math.vector3 = new m4m.math.vector3();
        private opmax: m4m.math.vector3 = new m4m.math.vector3();
        private _center: m4m.math.vector3 = new m4m.math.vector3();

        /**
        * @public
        * @language zh_CN
        * 构建轴对称包围盒
        * @param _minimum 最小点
        * @param _maximum 最大点
        * @version m4m 1.0
        * @platform Web,Native
        */
        constructor(_minimum: m4m.math.vector3, _maximum: m4m.math.vector3)
        {
            this.srcmin = m4m.math.pool.clone_vector3(_minimum);
            this.srcmax = m4m.math.pool.clone_vector3(_maximum);

            this.minimum = m4m.math.pool.clone_vector3(_minimum);
            this.maximum = m4m.math.pool.clone_vector3(_maximum);
        }

        /**
        * @public
        * @language zh_CN
        * 刷新轴对称包围盒
        * @param worldmatrix 物体的世界矩阵
        * @version m4m 1.0
        * @platform Web,Native
        */
        public update(worldmatrix: m4m.math.matrix)
        {
            // m4m.math.matrixGetTranslation(worldmatrix, this.opmin);
            // m4m.math.matrixGetTranslation(worldmatrix, this.opmax);
            // if (worldmatrix.rawData[0] > 0)
            // {
            //     this.opmin.x += worldmatrix.rawData[0] * this.srcmin.x;
            //     this.opmax.x += worldmatrix.rawData[0] * this.srcmax.x;
            // }
            // else
            // {
            //     this.opmin.x += worldmatrix.rawData[0] * this.srcmax.x;
            //     this.opmax.x += worldmatrix.rawData[0] * this.srcmin.x;
            // }
            // if (worldmatrix.rawData[1] > 0)
            // {
            //     this.opmin.y += worldmatrix.rawData[1] * this.srcmin.y;
            //     this.opmax.y += worldmatrix.rawData[1] * this.srcmax.y;
            // }
            // else
            // {
            //     this.opmin.y += worldmatrix.rawData[1] * this.srcmax.y;
            //     this.opmax.y += worldmatrix.rawData[1] * this.srcmin.y;
            // }
            // if (worldmatrix.rawData[2] > 0)
            // {
            //     this.opmin.z += worldmatrix.rawData[2] * this.srcmin.z;
            //     this.opmax.z += worldmatrix.rawData[2] * this.srcmax.z;
            // }
            // else
            // {
            //     this.opmin.z += worldmatrix.rawData[2] * this.srcmax.z;
            //     this.opmax.z += worldmatrix.rawData[2] * this.srcmin.z;
            // }
            // if (worldmatrix.rawData[4] > 0)
            // {
            //     this.opmin.x += worldmatrix.rawData[4] * this.srcmin.x;
            //     this.opmax.x += worldmatrix.rawData[4] * this.srcmax.x;
            // }
            // else
            // {
            //     this.opmin.x += worldmatrix.rawData[4] * this.srcmax.x;
            //     this.opmax.x += worldmatrix.rawData[4] * this.srcmin.x;
            // }
            // if (worldmatrix.rawData[5] > 0)
            // {
            //     this.opmin.y += worldmatrix.rawData[5] * this.srcmin.y;
            //     this.opmax.y += worldmatrix.rawData[5] * this.srcmax.y;
            // }
            // else
            // {
            //     this.opmin.y += worldmatrix.rawData[5] * this.srcmax.y;
            //     this.opmax.y += worldmatrix.rawData[5] * this.srcmin.y;
            // }
            // if (worldmatrix.rawData[6] > 0)
            // {
            //     this.opmin.z += worldmatrix.rawData[6] * this.srcmin.z;
            //     this.opmax.z += worldmatrix.rawData[6] * this.srcmax.z;
            // }
            // else
            // {
            //     this.opmin.z += worldmatrix.rawData[6] * this.srcmax.z;
            //     this.opmax.z += worldmatrix.rawData[6] * this.srcmin.z;
            // }
            // if (worldmatrix.rawData[8] > 0)
            // {
            //     this.opmin.x += worldmatrix.rawData[8] * this.srcmin.x;
            //     this.opmax.x += worldmatrix.rawData[8] * this.srcmax.x;
            // }
            // else
            // {
            //     this.opmin.x += worldmatrix.rawData[8] * this.srcmax.x;
            //     this.opmax.x += worldmatrix.rawData[8] * this.srcmin.x;
            // }
            // if (worldmatrix.rawData[9] > 0)
            // {
            //     this.opmin.y += worldmatrix.rawData[9] * this.srcmin.y;
            //     this.opmax.y += worldmatrix.rawData[9] * this.srcmax.y;
            // }
            // else
            // {
            //     this.opmin.y += worldmatrix.rawData[9] * this.srcmax.y;
            //     this.opmax.y += worldmatrix.rawData[9] * this.srcmin.y;
            // }
            // if (worldmatrix.rawData[10] > 0)
            // {
            //     this.opmin.z += worldmatrix.rawData[10] * this.srcmin.z;
            //     this.opmax.z += worldmatrix.rawData[10] * this.srcmax.z;
            // }
            // else
            // {
            //     this.opmin.z += worldmatrix.rawData[10] * this.srcmax.z;
            //     this.opmax.z += worldmatrix.rawData[10] * this.srcmin.z;
            // }

            m4m.math.matrixTransformVector3(this.srcmax, worldmatrix, this.opmax);
            m4m.math.matrixTransformVector3(this.srcmin, worldmatrix, this.opmin);


            // recalculat max and min
            let temp = m4m.math.pool.new_vector3();
            m4m.math.vec3Max(this.opmax, this.opmin, temp);
            m4m.math.vec3Min(this.opmax, this.opmin, this.opmin);
            m4m.math.vec3Clone(temp, this.opmax);
            m4m.math.pool.delete_vector3(temp);


            // this.minimum = m4m.math.pool.clone_vector3(this.opmin);
            // this.maximum = m4m.math.pool.clone_vector3(this.opmax);
            m4m.math.vec3Clone(this.opmin, this.minimum);
            m4m.math.vec3Clone(this.opmax, this.maximum);
        }

        /**
        * @public
        * @language zh_CN
        * 包含一个点
        * @param vec 世界坐标
        * @version m4m 1.0
        * @platform Web,Native
        */
        public addVector3(vec: m4m.math.vector3)
        {
            m4m.math.vec3Max(this.maximum, vec, this.maximum);
            m4m.math.vec3Max(this.minimum, vec, this.minimum);
        }

        /**
        * @public
        * @language zh_CN
        * 检查是否包含点
        * @param vec 世界坐标
        * @version m4m 1.0
        * @platform Web,Native
        */
        public containsVector3(vec: m4m.math.vector3): boolean
        {
            return (vec.x > this.minimum.x) && (vec.x < this.maximum.x) &&
                (vec.y > this.minimum.y) && (vec.x < this.maximum.y) &&
                (vec.z > this.minimum.z) && (vec.z < this.maximum.z);
        }

        /**
        * @public
        * @language zh_CN
        * 检查是否与aabb相交
        * @param aabb 轴对称包围盒
        * @version m4m 1.0
        * @platform Web,Native
        */
        public intersectAABB(aabb: aabb): boolean
        {
            if (this.minimum.x > aabb.maximum.x) return false;
            if (this.maximum.x < aabb.minimum.x) return false;
            if (this.minimum.x > aabb.maximum.x) return false;
            if (this.maximum.x < aabb.minimum.x) return false;
            if (this.minimum.x > aabb.maximum.x) return false;
            if (this.maximum.x < aabb.minimum.x) return false;
            return true;
        }

        /**
        * @public
        * @language zh_CN
        * 包含一个aabb
        * @param aabb 轴对称包围盒
        * @version m4m 1.0
        * @platform Web,Native
        */
        public addAABB(aabb: m4m.framework.aabb)
        {
            if (aabb != null)
            {
                m4m.math.vec3Max(this.maximum, aabb.maximum, this.maximum);
                m4m.math.vec3Min(this.minimum, aabb.minimum, this.minimum);
            }
        }

        /**
        * @public
        * @language zh_CN
        * 计算包围盒的中心位置
        * @version m4m 1.0
        * @platform Web,Native
        */
        public get center(): m4m.math.vector3
        {
            m4m.math.vec3Add(this.maximum, this.minimum, this._center);
            m4m.math.vec3ScaleByNum(this._center, 0.5, this._center);
            return this._center;
        }

        /**
        * @public
        * @language zh_CN
        * 清空
        * @version m4m 1.0
        * @platform Web,Native
        */
        public clear()
        {
            m4m.math.vec3SetByFloat(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, this.minimum);
            m4m.math.vec3SetByFloat(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE, this.maximum);
        }

        /**
        * @public
        * @language zh_CN
        * 克隆
        * @version m4m 1.0
        * @platform Web,Native
        */
        public clone(): aabb
        {
            var _min = m4m.math.pool.clone_vector3(this.minimum);
            var _max = m4m.math.pool.clone_vector3(this.maximum);
            var aabb: aabb = new m4m.framework.aabb(_min, _max);
            return aabb;
        }

        /**
         * 克隆
         * @param to 输出的aabb
         */
        public cloneTo(to:aabb)
        {
            math.vec3Clone(this.minimum,to.minimum);
            math.vec3Clone(this.minimum,to.srcmin);

            math.vec3Clone(this.maximum,to.maximum);
            math.vec3Clone(this.maximum,to.srcmax);
        }

        /**
        * @public
        * @language zh_CN
        * 获取包围盒顶点数据
        * @param vecs 引用数组
        * @version m4m 1.0
        * @platform Web,Native
        */
        public getVec3(vecs: m4m.math.vector3[])
        {
            vecs[0] = math.pool.clone_vector3(this.minimum);
            vecs[1] = math.pool.clone_vector3(this.minimum);
            vecs[1].z = this.maximum.z;
            vecs[2] = math.pool.clone_vector3(this.minimum);
            vecs[2].x = this.maximum.x;
            vecs[3] = math.pool.clone_vector3(this.maximum);
            vecs[3].y = this.minimum.y;
            vecs[4] = math.pool.clone_vector3(this.minimum);
            vecs[4].y = this.maximum.y;
            vecs[5] = math.pool.clone_vector3(this.maximum);
            vecs[5].x = this.minimum.x;
            vecs[6] = math.pool.clone_vector3(this.maximum);
            vecs[6].z = this.minimum.z;
            vecs[7] = math.pool.clone_vector3(this.maximum);
        }

        /*
        public buildMesh(obj: gameObject)
        {
            var subTran = new m4m.framework.transform();
            subTran.name = "boxcollider";
            var mesh = subTran.gameObject.addComponent("meshFilter") as m4m.framework.meshFilter;

            mesh.setMesh(this.getMesh(obj));
            var renderer = subTran.gameObject.addComponent("meshRenderer") as m4m.framework.meshRenderer;

            obj.transform.addChild(subTran);
            subTran.markDirty();//要标记自己脏了，才会更新
        }

        private getMesh(obj: gameObject): mesh
        {
            var _mesh: mesh = new mesh();
            var vecs: m4m.math.vector3[] = [];
            this.getVec3(vecs);
            _mesh.data = m4m.render.meshData.genBoxByArray_Quad(vecs);
            var vf = m4m.render.VertexFormatMask.Position | m4m.render.VertexFormatMask.Normal;
            var v32 = _mesh.data.genVertexDataArray(vf);
            var i16 = _mesh.data.genIndexDataArrayQuad2Line();
            var webgl = obj.getScene().webgl;

            _mesh.glMesh = new m4m.render.glMesh();
            _mesh.glMesh.initBuffer(webgl, vf, _mesh.data.pos.length);
            _mesh.glMesh.uploadVertexSubData(webgl, v32);

            _mesh.glMesh.addIndex(webgl, i16.length);
            _mesh.glMesh.uploadIndexSubData(webgl, 0, i16);
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
        */
    }
}