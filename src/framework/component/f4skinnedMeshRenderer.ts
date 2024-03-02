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
    @reflect.nodeRender
    @reflect.nodeComponent
    export class f4skinnedMeshRenderer implements IRenderer {
        static readonly ClassName: string = "f4skinnedMeshRenderer";
        private static readonly boneSampler = "boneSampler";
        private static readonly boneSamplerTexelSize = "boneSamplerTexelSize";
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
        // _player: aniplayer;


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
            if (!this.ibmContainer)
                return;
            // Handle ibm
            this.ibm = []
            for (let i = 0; i < this.ibmContainer.length / 4; i++) {
                // Column major
                let data = [
                    this.ibmContainer[i * 4 + 0].x,
                    this.ibmContainer[i * 4 + 0].y,
                    this.ibmContainer[i * 4 + 0].z,
                    this.ibmContainer[i * 4 + 0].w,

                    this.ibmContainer[i * 4 + 1].x,
                    this.ibmContainer[i * 4 + 1].y,
                    this.ibmContainer[i * 4 + 1].z,
                    this.ibmContainer[i * 4 + 1].w,

                    this.ibmContainer[i * 4 + 2].x,
                    this.ibmContainer[i * 4 + 2].y,
                    this.ibmContainer[i * 4 + 2].z,
                    this.ibmContainer[i * 4 + 2].w,

                    this.ibmContainer[i * 4 + 3].x,
                    this.ibmContainer[i * 4 + 3].y,
                    this.ibmContainer[i * 4 + 3].z,
                    this.ibmContainer[i * 4 + 3].w,
                ];
                this.ibm[i] = new m4m.math.matrix(data);
            }
            this.initBoneMatrices();
        }

        onPlay() {

        }

        update(delta: number) {
            // this.updateBoneMatrix();

            if (this.materials != null && this.materials.length > 0) {
                let _mat = this.materials[0];
                if (_mat) {
                    this.layer = _mat.getLayer();
                    if (!this.issetq)
                        this._queue = _mat.getQueue();
                }
            }

            // if (this.player != null && this.player.gameObject)
            // {
            //     this.player.fillPoseData(this._skeletonMatrixData, this.bones);
            // }
        }

        render(context: renderContext, assetmgr: assetMgr, camera: m4m.framework.camera) {
            if (!this.ibm)
                return;

            DrawCallInfo.inc.currentState = DrawCallEnum.SKinrender;

            context.updateModel(this.gameObject.transform); // Update MVP
            this.updateBoneMatrix();
            if (this.useBoneTexture) {
                this.updateBoneTexture(context);
            } else {
                context.matrix_bones = this.boneMatrices;
            }
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
            // TODO:
            this.boneMatrices = null;
            this.boneMatrixChunks = null;
            this.boneMatricesTexture.unuse();
        }
        /**
         * @private
         */
        clone() {

        }


        ////////////////////////////////////////////////////////////////////

        useBoneTexture = true;
        // rootBone: transform;

        // Inverse Bindpose Matrices
        @m4m.reflect.Field("vector4[]")
        ibmContainer: m4m.math.vector4[];

        ibm: m4m.math.matrix[];

        // Final Matrices
        // Raw data
        private boneMatrices: Float32Array;
        // Individual bone matrices reference to raw data
        boneMatrixChunks: Float32Array[];
        // Data texture
        boneMatricesTexture: m4m.framework.texture;
        /**
         * 初始化骨骼矩阵
         */
        initBoneMatrices() {
            if (!this.boneMatrices) {
                this.boneMatrices = new Float32Array(16 * (this.bones.length + 0));
            }
            // Assign individual matrix
            this.boneMatrixChunks = [];
            for (let i = 0; i < this.bones.length; i++) {
                this.boneMatrixChunks[i] = this.boneMatrices.subarray(i * 16, (i + 1) * 16);
            }

        }

        /**
         * 初始化静态骨骼姿态矩阵
         */
        initStaticPoseMatrices() {
            this.ibm = [];
            if (this.bones && this.bones.length) {
                if (!this.rootBone) {
                    this.rootBone = this.bones[0];
                }
                // FIXME: correct matrix
                m4m.math.matrixInverse(this.rootBone.getWorldMatrix(), this.tempMatrix);
                for (let i = 0; i < this.bones.length; i++) {
                    const bone = this.bones[i];
                    const mat = new m4m.math.matrix();
                    m4m.math.matrixMultiply(this.tempMatrix, bone.getWorldMatrix(), mat);
                    m4m.math.matrixInverse(mat, mat);
                    this.ibm[i] = mat;
                }
            }
        }

        private boneSamplerTexindex = -1;
        private texID = 0;
        /**
         * 更新骨骼纹理
         * @param context 引擎渲染上下文
         */
        updateBoneTexture(context: renderContext) {
            let ctx: WebGL2RenderingContext = context.webgl;
            if (!this.boneMatricesTexture) {
                this.boneMatricesTexture = new m4m.framework.texture(`bone_matrices_${this.texID++}`);
                this.boneMatricesTexture.glTexture = new m4m.render.glTexture2D(ctx, render.TextureFormatEnum.FLOAT32, false, false) as m4m.render.glTexture2D;
                // Manually assign tex size
                this.boneMatricesTexture.glTexture.width = this.boneMatrices.length / 4;
                this.boneMatricesTexture.glTexture.height = 1;

                this.boneMatricesTexture.use();

            }

            // Ensure boneMatrices is correct, if multiple skinnedMeshRenderer sharing the same material
            // this.materials[0].setTexture("boneSampler", this.boneMatricesTexture);
            let mat = this.materials[0];
            mat.setTexture(f4skinnedMeshRenderer.boneSampler, this.boneMatricesTexture);
            mat.setFloat(f4skinnedMeshRenderer.boneSamplerTexelSize, 4 / this.boneMatrices.length);

            //处理uniform 同材质去重优化,贴图通道被污染
            let basetype = this.gameObject.transform.scene.fog ? "skin_fog" : "skin";
            let drawType = context.drawtype;
            let shader = mat.getShader();
            let drawPasses = shader.passes[basetype + drawType][0];
            if (this.boneSamplerTexindex == -1) {
                this.boneSamplerTexindex = ctx.getUniform(drawPasses.program.program, drawPasses.mapuniforms[f4skinnedMeshRenderer.boneSampler].location);
            }
            ctx.activeTexture(render.webglkit.GetTextureNumber(this.boneSamplerTexindex));

            // update data texture
            (this.boneMatricesTexture.glTexture as m4m.render.glTexture2D).uploadByteArray(
                false,
                false,
                this.boneMatrices.length / 4,
                1,
                this.boneMatrices,
                false,
                false,
                false,
                false,
                false,
                ctx.FLOAT 
            );
        }

        tempMatrix = new m4m.math.matrix();
        inverseRootBone = new m4m.math.matrix();
        /**
         * 更新骨骼矩阵
         */
        updateBoneMatrix() {
            for (let i = 0; i < this.bones.length; i++) {
                const bone = this.bones[i];
                // tempMatrix = render object world inverse matrix ('M'VP)
                // gameobject空间 抵消掉shader里的M
                m4m.math.matrixInverse(this.gameObject.transform.getWorldMatrix(), this.tempMatrix);
                m4m.math.matrixMultiply(this.tempMatrix, bone.getWorldMatrix(), this.tempMatrix);
                // inverse bind pose
                this.matrixMultiplyToArray(this.tempMatrix, this.ibm[i], this.boneMatrixChunks[i]);
            }
        }

        /**
         * 矩阵相乘输出到数组
         * @param lhs 左边矩阵
         * @param rhs 右边矩阵
         * @param out 返回输出
         */
        matrixMultiplyToArray(lhs: m4m.math.matrix, rhs: m4m.math.matrix, out: Float32Array): void {
            var a00 = lhs.rawData[0], a01 = lhs.rawData[1], a02 = lhs.rawData[2], a03 = lhs.rawData[3];
            var a10 = lhs.rawData[4], a11 = lhs.rawData[5], a12 = lhs.rawData[6], a13 = lhs.rawData[7];
            var a20 = lhs.rawData[8], a21 = lhs.rawData[9], a22 = lhs.rawData[10], a23 = lhs.rawData[11];
            var a30 = lhs.rawData[12], a31 = lhs.rawData[13], a32 = lhs.rawData[14], a33 = lhs.rawData[15];

            var b0 = rhs.rawData[0],
                b1 = rhs.rawData[1],
                b2 = rhs.rawData[2],
                b3 = rhs.rawData[3];

            out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = rhs.rawData[4];
            b1 = rhs.rawData[5];
            b2 = rhs.rawData[6];
            b3 = rhs.rawData[7];

            out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = rhs.rawData[8];
            b1 = rhs.rawData[9];
            b2 = rhs.rawData[10];
            b3 = rhs.rawData[11];

            out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = rhs.rawData[12];
            b1 = rhs.rawData[13];
            b2 = rhs.rawData[14];
            b3 = rhs.rawData[15];

            out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
        }


    }
}