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

namespace m4m.framework {
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 蒙皮网格渲染组件
     * @version m4m 1.0
     */
    @reflect.nodeRender
    @reflect.nodeComponent
    export class skinnedMeshRenderer implements IRenderer {
        static readonly ClassName: string = "skinnedMeshRenderer";
        private static readonly help_v3 = new m4m.math.vector3();
        private static readonly help_v3_1 = new m4m.math.vector3();
        private static readonly help_v3_2 = new m4m.math.vector3();
        private static readonly help_v3_3 = new m4m.math.vector3();

        private static readonly help_v4 = new m4m.math.vector4();
        private static readonly help_v4_1 = new m4m.math.vector4();
        private static readonly help_v4_2 = new m4m.math.vector4();
        private static readonly help_v4_3 = new m4m.math.vector4();

        private static readonly help_mtx = new m4m.math.matrix();
        private static readonly help_mtx_1 = new m4m.math.matrix();
        private static readonly help_mtx_2 = new m4m.math.matrix();
        private static readonly help_mtx_3 = new m4m.math.matrix();

        /**
         * 骨骼蒙皮mesh渲染器
         */
        constructor() {
        }
        /**
         * 挂载的gameobject
         */
        gameObject: gameObject;
        /**
         * 场景渲染层级（common、transparent、overlay）
         */
        layer: RenderLayerEnum = RenderLayerEnum.Common;
        /**
         * 渲染mask层级（和相机相对应）
         */
        //renderLayer: CullingMask = CullingMask.default;
        get renderLayer() { return this.gameObject.layer; }
        set renderLayer(layer: number) {
            this.gameObject.layer = layer;
        }
        private issetq = false;
        _queue: number = 0;
        /**
         * 返回此组件的场景渲染层级排序依据queue大小
         */
        get queue(): number {
            return this._queue;
        }
        /**
         * 设置此组件的场景渲染层级排序number大小
         */
        set queue(value: number) {
            this._queue = value;
            this.issetq = true;
        }
        /**
         * 材质数组
         */
        @m4m.reflect.Field("material[]")
        materials: material[];
        /**
         * @private
         */
        _player: aniplayer;
        /**
         * 返回动画播放组件
         */
        get player(): aniplayer {
            if (this._player == null) {
                this._player = this.gameObject.getComponentInParent("aniplayer") as aniplayer;
            }
            return this._player;
        }
        set player(p: aniplayer) {
            this._player = p;
        }
        private _mesh: mesh;
        /**
         * 返回mesh数据
         */
        @m4m.reflect.Field("mesh")
        get mesh() {
            return this._mesh;
        }
        /**
         * 设置mesh数据
         */
        set mesh(mesh: mesh) {
            if (this._mesh != null) {
                this._mesh.unuse();
            }
            this._mesh = mesh;
            if (this._mesh != null) {
                this._mesh.use();
            }
        }
        /**
         * @private
         */
        @m4m.reflect.Field("transform[]")
        bones: transform[];
        /**
         * @private
         */
        @m4m.reflect.Field("transform")
        rootBone: transform;
        /**
         * @private
         */
        @m4m.reflect.Field("vector3")
        center: math.vector3;
        /**
         * @private
         */
        @m4m.reflect.Field("vector3")
        size: math.vector3;
        /**
         * 最大骨骼数量
         * @version m4m 1.0
         */
        maxBoneCount: number = 55;
        //是否高效
        private _efficient: boolean = true;
        //这个数据是扣掉tpose之后的
        private _skeletonMatrixData: Float32Array = new Float32Array(8 * this.maxBoneCount);

        _aabb: aabb;
        get aabb() {
            if (!this._aabb) {
                // calculate aabb from bounds
                const { size, center } = this;
                let max = m4m.math.pool.new_vector3();
                let min = m4m.math.pool.new_vector3();
                let temp = m4m.math.pool.new_vector3();
                m4m.math.vec3ScaleByNum(size, 0.5, min); // temp
                // Ensure extent
                min.x = Math.abs(min.x);
                min.y = Math.abs(min.y);
                min.z = Math.abs(min.z);

                m4m.math.vec3Add(center, min, max);
                m4m.math.vec3Subtract(center, min, min);

                // Apply root bone matrix
                // 骨骼可能有旋转之类的操作, aabb默认只会计算位移
                const rootboneMat = this.rootBone.getWorldMatrix();
                m4m.math.matrixTransformVector3(max, rootboneMat, max);
                m4m.math.matrixTransformVector3(min, rootboneMat, min);

                m4m.math.vec3Max(max, min, temp);
                m4m.math.vec3Min(max, min, min);
                m4m.math.vec3Clone(temp, max);

                this._aabb = new aabb(max, min);
                m4m.math.pool.delete_vector3(max);
                m4m.math.pool.delete_vector3(min);
                m4m.math.pool.delete_vector3(temp);
            }
            return this._aabb;
        }

        start() {
        }

        onPlay() {

        }


        /**
         * 通过索引获取材质
         * @param index 索引
         * @param outMtx 输出矩阵
         */
        getMatByIndex(index: number, outMtx: m4m.math.matrix) {
            let data = this.mesh.data;
            let bIdx = data.blendIndex;
            let skData = this._skeletonMatrixData;
            if (bIdx[index].v0 >= this.maxBoneCount || bIdx[index].v1 >= this.maxBoneCount || bIdx[index].v2 >= this.maxBoneCount || bIdx[index].v3 >= this.maxBoneCount) {
                return null;
            }
            let mat = outMtx;
            m4m.math.matrixMakeIdentity(mat);
            if (this._efficient) {
                let vec40r = skinnedMeshRenderer.help_v4;
                let vec30p = skinnedMeshRenderer.help_v3;
                vec40r.x = skData[8 * bIdx[index].v0 + 0];
                vec40r.y = skData[8 * bIdx[index].v0 + 1];
                vec40r.z = skData[8 * bIdx[index].v0 + 2];
                vec40r.w = skData[8 * bIdx[index].v0 + 3];

                vec30p.x = skData[8 * bIdx[index].v0 + 4];
                vec30p.y = skData[8 * bIdx[index].v0 + 5];
                vec30p.z = skData[8 * bIdx[index].v0 + 6];

                let vec41r = skinnedMeshRenderer.help_v4_1;
                let vec31p = skinnedMeshRenderer.help_v3_1;
                vec41r.x = skData[8 * bIdx[index].v1 + 0];
                vec41r.y = skData[8 * bIdx[index].v1 + 1];
                vec41r.z = skData[8 * bIdx[index].v1 + 2];
                vec41r.w = skData[8 * bIdx[index].v1 + 3];

                vec31p.x = skData[8 * bIdx[index].v1 + 4];
                vec31p.y = skData[8 * bIdx[index].v1 + 5];
                vec31p.z = skData[8 * bIdx[index].v1 + 6];

                let vec42r = skinnedMeshRenderer.help_v4_2;
                let vec32p = skinnedMeshRenderer.help_v3_2;
                vec42r.x = skData[8 * bIdx[index].v2 + 0];
                vec42r.y = skData[8 * bIdx[index].v2 + 1];
                vec42r.z = skData[8 * bIdx[index].v2 + 2];
                vec42r.w = skData[8 * bIdx[index].v2 + 3];

                vec32p.x = skData[8 * bIdx[index].v2 + 4];
                vec32p.y = skData[8 * bIdx[index].v2 + 5];
                vec32p.z = skData[8 * bIdx[index].v2 + 6];

                let vec43r = skinnedMeshRenderer.help_v4_3;
                let vec33p = skinnedMeshRenderer.help_v3_3;
                vec43r.x = skData[8 * bIdx[index].v3 + 0];
                vec43r.y = skData[8 * bIdx[index].v3 + 1];
                vec43r.z = skData[8 * bIdx[index].v3 + 2];
                vec43r.w = skData[8 * bIdx[index].v3 + 3];

                vec33p.x = skData[8 * bIdx[index].v3 + 4];
                vec33p.y = skData[8 * bIdx[index].v3 + 5];
                vec33p.z = skData[8 * bIdx[index].v3 + 6];

                let mat0 = skinnedMeshRenderer.help_mtx;
                let mat1 = skinnedMeshRenderer.help_mtx_1;
                let mat2 = skinnedMeshRenderer.help_mtx_2;
                let mat3 = skinnedMeshRenderer.help_mtx_3;
                m4m.math.matrixMakeTransformRTS(vec30p, math.pool.vector3_one, vec40r, mat0);
                m4m.math.matrixMakeTransformRTS(vec31p, math.pool.vector3_one, vec41r, mat1);
                m4m.math.matrixMakeTransformRTS(vec32p, math.pool.vector3_one, vec42r, mat2);
                m4m.math.matrixMakeTransformRTS(vec33p, math.pool.vector3_one, vec43r, mat3);

                m4m.math.matrixScaleByNum(data.blendWeight[index].v0, mat0);
                m4m.math.matrixScaleByNum(data.blendWeight[index].v1, mat1);
                m4m.math.matrixScaleByNum(data.blendWeight[index].v2, mat2);
                m4m.math.matrixScaleByNum(data.blendWeight[index].v3, mat3);

                m4m.math.matrixAdd(mat0, mat1, mat);
                m4m.math.matrixAdd(mat, mat2, mat);
                m4m.math.matrixAdd(mat, mat3, mat);

            }
            else {
                let mat0 = m4m.math.pool.new_matrix();
                mat0.rawData = skData.slice(16 * bIdx[index].v0, 16 * bIdx[index].v0 + 16) as any;
                let mat1 = m4m.math.pool.new_matrix();
                mat1.rawData = skData.slice(16 * bIdx[index].v1, 16 * bIdx[index].v1 + 16) as any;
                let mat2 = m4m.math.pool.new_matrix();
                mat2.rawData = skData.slice(16 * bIdx[index].v2, 16 * bIdx[index].v2 + 16) as any;
                let mat3 = m4m.math.pool.new_matrix();
                mat3.rawData = skData.slice(16 * bIdx[index].v3, 16 * bIdx[index].v3 + 16) as any;

                m4m.math.matrixScaleByNum(data.blendWeight[index].v0, mat0);
                m4m.math.matrixScaleByNum(data.blendWeight[index].v1, mat1);
                m4m.math.matrixScaleByNum(data.blendWeight[index].v2, mat2);
                m4m.math.matrixScaleByNum(data.blendWeight[index].v3, mat3);

                m4m.math.matrixAdd(mat0, mat1, mat);
                m4m.math.matrixAdd(mat, mat2, mat);
                m4m.math.matrixAdd(mat, mat3, mat);

                m4m.math.pool.delete_matrix(mat0);
                m4m.math.pool.delete_matrix(mat1);
                m4m.math.pool.delete_matrix(mat2);
                m4m.math.pool.delete_matrix(mat3);
            }
        }

        private static VertexHelpMtx = new m4m.math.matrix();
        /**
         * 通过索引计算顶点
         * @param index 索引
         * @param t 
         */
        calActualVertexByIndex(index: number, t: m4m.math.vector3) {
            let data = this.mesh.data;
            let verindex = data.trisindex[index];
            // var p = data.pos[verindex];
            let p = t;
            data.getPosition(verindex, p);

            let mtx = skinnedMeshRenderer.VertexHelpMtx;
            this.getMatByIndex(verindex, mtx);
            // m4m.math.matrixMultiply(this.gameObject.transform.getLocalMatrix(), mat, mat);
            m4m.math.matrixTransformVector3(p, mtx, t);
        }


        private static readonly inteRayHelp_v3 = new m4m.math.vector3();
        private static readonly inteRayHelp_v3_1 = new m4m.math.vector3();
        private static readonly inteRayHelp_v3_2 = new m4m.math.vector3();
        private static readonly inteRayHelp_v3_3 = new m4m.math.vector3();

        private static readonly inteRayHelp_mtx = new m4m.math.matrix();
        private static readonly inteRayHelp_mtx_1 = new m4m.math.matrix();
        private static readonly inteRayHelp_mtx_2 = new m4m.math.matrix();

        /**
         * @public
         * @language zh_CN
         * @param ray 射线
         * @classdesc
         * 射线检测
         * @version m4m 1.0
         */
        intersects(ray: ray, outInfo: pickinfo): boolean {
            let ishided = false;
            let lastDistance = Number.MAX_VALUE;
            if (this.player != null && this.player.gameObject && this.mesh && this.mesh.data) {
                let mvpmat = this.player.gameObject.transform.getWorldMatrix();
                let data = this.mesh.data;
                for (var i = 0; i < this.mesh.submesh.length; i++) {
                    var submesh = this.mesh.submesh[i];
                    var t0 = skinnedMeshRenderer.inteRayHelp_v3;
                    var t1 = skinnedMeshRenderer.inteRayHelp_v3_1;
                    var t2 = skinnedMeshRenderer.inteRayHelp_v3_2;
                    for (var index = submesh.start; index < submesh.size; index += 3) {
                        let verindex0 = data.trisindex[index];
                        let verindex1 = data.trisindex[index + 1];
                        let verindex2 = data.trisindex[index + 2];

                        // var p0 = data.pos[verindex0];
                        // var p1 = data.pos[verindex1];
                        // var p2 = data.pos[verindex2];
                        let p0 = t0;
                        let p1 = t1;
                        let p2 = t2;
                        data.getPosition(verindex0, p0);
                        data.getPosition(verindex1, p1);
                        data.getPosition(verindex2, p2);

                        let mat0 = skinnedMeshRenderer.inteRayHelp_mtx;
                        this.getMatByIndex(verindex0, mat0);
                        let mat1 = skinnedMeshRenderer.inteRayHelp_mtx_1;
                        this.getMatByIndex(verindex1, mat1);
                        let mat2 = skinnedMeshRenderer.inteRayHelp_mtx_2;
                        this.getMatByIndex(verindex2, mat2);
                        if (mat0 == null || mat1 == null || mat2 == null) continue;

                        let mat00 = skinnedMeshRenderer.help_mtx;
                        m4m.math.matrixMultiply(mvpmat, mat0, mat00);
                        let mat11 = skinnedMeshRenderer.help_mtx_1;
                        m4m.math.matrixMultiply(mvpmat, mat1, mat11);
                        let mat22 = skinnedMeshRenderer.help_mtx_2;
                        m4m.math.matrixMultiply(mvpmat, mat2, mat22);

                        m4m.math.matrixTransformVector3(p0, mat00, t0);
                        m4m.math.matrixTransformVector3(p1, mat11, t1);
                        m4m.math.matrixTransformVector3(p2, mat22, t2);

                        let tempinfo = math.pool.new_pickInfo();
                        var bool = ray.intersectsTriangle(t0, t1, t2, tempinfo);
                        if (bool) {
                            if (tempinfo.distance < 0) continue;
                            if (lastDistance > tempinfo.distance) {
                                ishided = true;
                                outInfo.cloneFrom(tempinfo);
                                lastDistance = outInfo.distance;
                                outInfo.faceId = index / 3;
                                outInfo.subMeshId = i;
                                var tdir = skinnedMeshRenderer.inteRayHelp_v3_3;
                                m4m.math.vec3ScaleByNum(ray.direction, outInfo.distance, tdir);
                                m4m.math.vec3Add(ray.origin, tdir, outInfo.hitposition);
                            }
                        }
                        math.pool.delete_pickInfo(tempinfo);
                    }
                }
            }
            return ishided;
        }

        update(delta: number) {
            // if (this._skeletonMatrixData == null)
            // {
            //     this.maxBoneCount = 55;
            //     this._skeletonMatrixData = new Float32Array(8 * this.maxBoneCount);
            //     //this._efficient = true;
            // }

            if (this.materials != null && this.materials.length > 0) {
                let _mat = this.materials[0];
                if (_mat) {
                    this.layer = _mat.getLayer();
                    if (!this.issetq)
                        this._queue = _mat.getQueue();
                }
            }

            if (this.player != null && this.player.gameObject && this.player.frameDirty) {
                this.player.fillPoseData(this._skeletonMatrixData, this.bones);
            }
        }

        render(context: renderContext, assetmgr: assetMgr, camera: m4m.framework.camera) {
            DrawCallInfo.inc.currentState = DrawCallEnum.SKinrender;

            if (this.player != null && this.player.gameObject) {
                context.updateLightMask(this.gameObject.layer);
                context.updateModel(this.player.gameObject.transform);
            }
            context.vec4_bones = this._skeletonMatrixData;
            if (this._mesh && this.mesh.glMesh) {
                // this._mesh.glMesh.bindVboBuffer(context.webgl);
                if (this._mesh.submesh != null) {
                    for (let i = 0; i < this._mesh.submesh.length; i++) {
                        let sm = this._mesh.submesh[i];

                        let mid = this._mesh.submesh[i].matIndex;//根据这个找到使用的具体哪个材质
                        let usemat = this.materials[mid];
                        if (usemat != null) {
                            if (this.gameObject.transform.scene.fog) {
                                // context.fog = this.gameObject.transform.scene.fog;
                                usemat.draw(context, this._mesh, sm, "skin_fog");
                            } else {
                                usemat.draw(context, this._mesh, sm, "skin");
                            }
                        }
                    }
                }
            }
        }
        /**
         * @private
         */
        remove() {
            this.materials.forEach(element => {
                if (element) element.unuse();
            });
            if (this.mesh)
                this.mesh.unuse();
            this.bones.length = 0;
            this._skeletonMatrixData = null;
        }
        /**
         * @private
         */
        clone() {

        }
    }


}