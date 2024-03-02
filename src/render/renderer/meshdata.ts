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
﻿namespace m4m.render {

    type vertexData = {
        pos: math.vector3, color: math.color, colorex: math.color,
        uv: math.vector2, uv2: math.vector2, normal: math.vector3, tangent: math.vector3,
        blendIndex: number4, blendWeight: number4
    };

    /** 三角形索引类型数组 */
    export type TriIndexTypeArray = Uint16Array | Uint32Array;
    /**
     * @private
     */
    export class meshData {
        /** 顶点数据格式 */
        originVF: number;

        /** 顶点位置数组 */
        pos: m4m.math.vector3[];//use pos.length 作为定点数量
        /** 顶点色数组 */
        color: m4m.math.color[];
        /** 顶点色2数组 */
        colorex: m4m.math.color[];
        /** 顶点UV1数组 */
        uv: m4m.math.vector2[];
        /** 顶点UV2数组 */
        uv2: m4m.math.vector2[];//lightmap
        /** 顶点法线数组 */
        normal: m4m.math.vector3[];//法线
        /** 顶点切线数组 */
        tangent: m4m.math.vector3[];//切线
        /** 顶点骨骼索引数组 */
        blendIndex: number4[];
        /** 顶点骨骼权重数组 */
        blendWeight: number4[];
        /** 三角形索引数组 */
        trisindex: number[];
        /** 三角形索引使用 uint32 模式，默认 false */
        triIndexUint32Mode = true;

        /** 数据是缓冲区模式 */
        public get isBufferDataMode() { return this.vertexBufferData != null; }

        private _vertexBufferData: Float32Array;
        private _segmentSize: number = 0;

        /** 顶点数据buffer */
        public get vertexBufferData() { return this._vertexBufferData; };
        public set vertexBufferData(val) {
            this._vertexBufferData = val;
            this._segmentSize = this.getSegmentSize();
        };

        /** 三角形索引数据buffer */
        public triIndexBufferData: TriIndexTypeArray;
        /**
         * 执行生成mesh所有三角形的顶点法线数据
         */
        public AutoGenNormal(): void {
            if (this.normal != undefined)
                throw new Error("first set normal to undefined.");


            //计算面法线
            let faceNormal: math.vector3[] = [];
            let p2face: { [id: number]: number[] } = {};
            for (var i = 0; i < this.trisindex.length / 3; i++) {
                let f0 = this.trisindex[i * 3 + 0];
                let f1 = this.trisindex[i * 3 + 1];
                let f2 = this.trisindex[i * 3 + 2];

                //收集顶点经过的面
                if (p2face[f0] == undefined)
                    p2face[f0] = [i];
                else
                    p2face[f0].push(i);
                if (p2face[f1] == undefined)
                    p2face[f1] = [i];
                else
                    p2face[f1].push(i);
                if (p2face[f2] == undefined)
                    p2face[f2] = [i];
                else
                    p2face[f2].push(i);


                let p0 = this.pos[f0];
                let p1 = this.pos[f1];
                let p2 = this.pos[f2];

                let v1 = new math.vector3();
                let v2 = new math.vector3();
                math.vec3Subtract(p1, p0, v1);
                math.vec3Subtract(p2, p0, v2);
                math.vec3Normalize(v1, v1);
                math.vec3Normalize(v2, v2);

                let facevec = new math.vector3();
                math.vec3Cross(v2, v1, facevec);
                faceNormal.push(facevec);
            }


            this.normal = [];
            for (var i = 0; i < this.pos.length; i++) {
                if (p2face[i] == undefined) continue;
                var ncount = p2face[i].length;
                let _normal = new math.vector3(0, 0, 0);
                for (var j = 0; j < ncount; j++) {
                    let facenor = faceNormal[p2face[i][j]];
                    math.vec3Add(_normal, facenor, _normal);
                }
                _normal.x /= ncount;
                _normal.y /= ncount;
                _normal.z /= ncount;
                math.vec3Normalize(_normal, _normal);

                this.normal.push(_normal);
            }
        }
        // private tmpVArr: Float32Array;
        // private tmpInxArr: Uint16Array;

        /**
         * 请使用 vertexBufferData ,为了兼容工具链暂时保留
         * @deprecated 遗弃的接口 
         */
        private get tmpVArr() { return this.vertexBufferData; }
        private set tmpVArr(val) { this.vertexBufferData = val; }

        /**
         * 请使用 triIndexBufferData ,为了兼容工具链暂时保留
         * @deprecated 遗弃的接口 
         */
        private get tmpInxArr() { return this.triIndexBufferData; }
        private set tmpInxArr(val) { this.triIndexBufferData = val; }
        /**
         * 添加 四边形
         * @param data mesh数据
         * @param quad 四边形所有顶点
         */
        static addQuadPos(data: meshData, quad: m4m.math.vector3[]): void {
            var istart = data.pos.length;
            meshData.addQuadVec3(data.pos, quad);
            data.trisindex.push(istart + 0);
            data.trisindex.push(istart + 1);
            data.trisindex.push(istart + 2);
            data.trisindex.push(istart + 2);
            data.trisindex.push(istart + 1);
            data.trisindex.push(istart + 3);
        }
        /**
         * 添加 四边形 (顶点复用模式)
         * @param data mesh数据
         * @param quad 四边形所有顶点
         */
        static addQuadPos_Quad(data: meshData, quad: m4m.math.vector3[]): void {
            var istart = data.pos.length;
            meshData.addQuadVec3(data.pos, quad);
            data.trisindex.push(istart + 0);
            data.trisindex.push(istart + 1);
            data.trisindex.push(istart + 3);
            data.trisindex.push(istart + 2);
        }
        /**
         * 添加 四边形 顶点数到数组 ，通过统一v3填充
         * @param array 顶点数到数组
         * @param value v3
         */
        static addQuadVec3ByValue(array: m4m.math.vector3[], value: m4m.math.vector3): void {
            for (var i = 0; i < 4; i++) {
                var v = math.pool.clone_vector3(value);
                array.push(v);
            }
        }
        /**
         * 添加 四边形 顶点数到数组 ，通过 v3 数组
         * @param array 顶点数到数组
         * @param quad v3数组
         */
        static addQuadVec3(array: m4m.math.vector3[], quad: m4m.math.vector3[]): void {
            array.push(quad[0]);
            array.push(quad[1]);
            array.push(quad[2]);
            array.push(quad[3]);
        }

        /**
         * 添加 四边形 顶点数到数组 ，通过 v2数组
         * @param array 顶点数到数组
         * @param quad v2数组
         */
        static addQuadVec2(array: m4m.math.vector2[], quad: m4m.math.vector2[]): void {
            array.push(quad[0]);
            array.push(quad[1]);
            array.push(quad[2]);
            array.push(quad[3]);
        }

        /**
         * 生成 四边形 mesh数据
         * @param size 尺寸
         * @returns mesh数据
         */
        static genQuad(size: number): meshData {
            var half = size * 0.5;
            var data = new meshData();
            data.pos = [];
            data.trisindex = [];
            data.normal = [];
            data.tangent = [];
            data.uv = [];

            meshData.addQuadVec3ByValue(data.normal, new math.vector3(0, 0, 1));
            meshData.addQuadPos(data, [
                new math.vector3(-half, half, 0),
                new math.vector3(-half, -half, 0),
                new math.vector3(half, half, 0),
                new math.vector3(half, -half, 0)
            ]);
            meshData.addQuadVec2(data.uv, [
                new math.vector2(0, 1),
                new math.vector2(0, 0),
                new math.vector2(1, 1),
                new math.vector2(1, 0)
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(1, 0, 0));
            return data;
        }

        /**
         * 生成 粒子用 四边形 mesh数据
         * @param size 尺寸
         * @returns mesh数据
         */
        static genQuad_forparticle(size: number): meshData {
            var half = size * 0.5;
            var data = new meshData();
            data.pos = [];
            data.trisindex = [];
            data.normal = [];
            data.tangent = [];
            data.uv = [];

            meshData.addQuadVec3ByValue(data.normal, new math.vector3(0, 0, 1));
            meshData.addQuadPos(data, [
                new math.vector3(0, half, 0),
                new math.vector3(0, -half, 0),
                new math.vector3(2 * half, half, 0),
                new math.vector3(2 * half, -half, 0)
            ]);
            meshData.addQuadVec2(data.uv, [
                new math.vector2(0, 0),
                new math.vector2(0, 1),
                new math.vector2(1, 0),
                new math.vector2(1, 1)
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(1, 0, 0));
            return data;
        }

        /**
         * 生成 地板 mesh数据
         * @param size 尺寸
         * @returns mesh数据
         */
        static genPlaneCCW(size: number): meshData {
            var half = size * 0.5;
            var data = new meshData();
            data.pos = [];
            data.trisindex = [];
            data.normal = [];
            data.tangent = [];
            data.uv = [];

            meshData.addQuadVec3ByValue(data.normal, new math.vector3(0, 1, 0));
            meshData.addQuadPos(data, [
                new math.vector3(-half, 0, half),
                new math.vector3(-half, 0, -half),
                new math.vector3(half, 0, half),
                new math.vector3(half, 0, -half)
            ]);
            meshData.addQuadVec2(data.uv, [
                new math.vector2(0, 0),
                new math.vector2(0, 1),
                new math.vector2(1, 0),
                new math.vector2(1, 1)
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(1, 0, 0));
            return data;
        }

        /**
         * 生成 圆柱体 mesh数据
         * @param height 高 
         * @param radius 半径
         * @param segment 分段
         * @returns mesh数据
         */
        static genCylinderCCW(height: number, radius: number, segment = 20): meshData {
            var data = new meshData();
            data.pos = [];
            data.trisindex = [];
            data.normal = [];
            data.uv = [];
            var normal = new math.vector3(0, 1, 0);
            for (var s = 0; s < 4; s++) {
                var y = (s < 2 ? 0.5 : -0.5) * height;
                if (s == 0)
                    normal = new math.vector3(0, 1, 0);
                else if (s == 3)
                    normal = new math.vector3(0, -1, 0);
                for (var i = 0; i < segment; i++) {
                    var r = i / segment * Math.PI * 2;
                    var x = Math.sin(r);
                    var z = Math.cos(r);
                    if (s == 1 || s == 2)
                        normal = new math.vector3(x, 0, z);
                    data.pos.push(new math.vector3(x * radius, y, z * radius));
                    var vn = math.pool.clone_vector3(normal);
                    data.normal.push(vn);
                    if (s == 0 || s == 3) {
                        data.uv.push(new math.vector2(x / 2 + 0.5, z / 2 + 0.5));
                    }
                    else {
                        data.uv.push(new math.vector2(i / segment, y < 0 ? 0 : 1));
                    }
                }
            }

            var itop = data.pos.length;
            data.pos.push(new math.vector3(0, 0.5 * height, 0));
            data.normal.push(new math.vector3(0, 1, 0));
            data.uv.push(new math.vector2(0.5, 0.5));
            var ibottom = data.pos.length;
            data.pos.push(new math.vector3(0, -0.5 * height, 0));
            data.normal.push(new math.vector3(0, -1, 0));
            data.uv.push(new math.vector2(0.5, 0.5));

            for (var i = 0; i < segment; i++) {
                //top
                data.trisindex.push(itop);
                data.trisindex.push(i == segment - 1 ? segment * 0 + 0 : segment * 0 + i + 1);
                data.trisindex.push(segment * 0 + i + 0);

                //bottom
                data.trisindex.push(ibottom);
                data.trisindex.push(segment * 3 + i + 0);
                data.trisindex.push(i == segment - 1 ? segment * 3 + 0 : segment * 3 + i + 1);

                //side
                var t = segment * 1 + i;
                var t2 = i == segment - 1 ? segment * 1 + 0 : segment * 1 + i + 1;
                var b = segment * 2 + i;
                var b2 = i == segment - 1 ? segment * 2 + 0 : segment * 2 + i + 1;
                data.trisindex.push(t);
                data.trisindex.push(t2);
                data.trisindex.push(b);
                data.trisindex.push(t2);
                data.trisindex.push(b2);
                data.trisindex.push(b);
            }
            return data;
        }
        /**
         * 生成 椎体 mesh数据
         * @param height 高
         * @param halfsize 半尺寸
         * @returns mesh数据
         */
        static genPyramid(height: number, halfsize: number): meshData {
            var data = new meshData();
            data.pos = [];
            data.trisindex = [];
            data.normal = [];
            data.uv = [];

            var vec1 = new m4m.math.vector3();
            var vec2 = new m4m.math.vector3();
            var vec3 = new m4m.math.vector3();
            var vec4 = new m4m.math.vector3();
            var vec5 = new m4m.math.vector3(0, -1, 0);

            var uvxx = new m4m.math.vector2(0.5, 0.5);
            var uv00 = new m4m.math.vector2(0, 0);
            var uv01 = new m4m.math.vector2(0, 1);
            var uv10 = new m4m.math.vector2(1, 0);
            var uv11 = new m4m.math.vector2(1, 1);


            var ipos = 0;
            data.pos.push(new m4m.math.vector3(-halfsize, -height * 0.5, -halfsize));
            data.pos.push(new m4m.math.vector3(0, height * 0.5, 0));
            data.pos.push(new m4m.math.vector3(halfsize, -height * 0.5, -halfsize));
            m4m.math.vec3Cross(new m4m.math.vector3(halfsize, height, halfsize), new m4m.math.vector3(halfsize, -height, -halfsize), vec1);
            data.normal.push(vec1);
            data.normal.push(vec1);
            data.normal.push(vec1);
            data.uv.push(uv00);
            data.uv.push(uvxx);
            data.uv.push(uv01);
            data.trisindex.push(ipos);
            data.trisindex.push(ipos + 2);
            data.trisindex.push(ipos + 1);
            ipos += 3;

            data.pos.push(new m4m.math.vector3(halfsize, -height * 0.5, -halfsize));
            data.pos.push(new m4m.math.vector3(0, height * 0.5, 0));
            data.pos.push(new m4m.math.vector3(halfsize, -height * 0.5, halfsize));
            m4m.math.vec3Cross(new m4m.math.vector3(-halfsize, height, halfsize), new m4m.math.vector3(halfsize, -height, halfsize), vec2);
            data.normal.push(vec2);
            data.normal.push(vec2);
            data.normal.push(vec2);
            data.uv.push(uv01);
            data.uv.push(uvxx);
            data.uv.push(uv11);
            data.trisindex.push(ipos);
            data.trisindex.push(ipos + 2);
            data.trisindex.push(ipos + 1);
            ipos += 3;

            data.pos.push(new m4m.math.vector3(halfsize, -height * 0.5, halfsize));
            data.pos.push(new m4m.math.vector3(0, height * 0.5, 0));
            data.pos.push(new m4m.math.vector3(-halfsize, -height * 0.5, halfsize));
            m4m.math.vec3Cross(new m4m.math.vector3(-halfsize, height, -halfsize), new m4m.math.vector3(-halfsize, -height, halfsize), vec3);
            data.normal.push(vec3);
            data.normal.push(vec3);
            data.normal.push(vec3);
            data.uv.push(uv11);
            data.uv.push(uvxx);
            data.uv.push(uv10);
            data.trisindex.push(ipos);
            data.trisindex.push(ipos + 2);
            data.trisindex.push(ipos + 1);
            ipos += 3;

            data.pos.push(new m4m.math.vector3(-halfsize, -height * 0.5, halfsize));
            data.pos.push(new m4m.math.vector3(0, height * 0.5, 0));
            data.pos.push(new m4m.math.vector3(-halfsize, -height * 0.5, -halfsize));
            m4m.math.vec3Cross(new m4m.math.vector3(halfsize, height, -halfsize), new m4m.math.vector3(-halfsize, -height, -halfsize), vec4);
            data.normal.push(vec4);
            data.normal.push(vec4);
            data.normal.push(vec4);
            data.uv.push(uv10);
            data.uv.push(uvxx);
            data.uv.push(uv00);
            data.trisindex.push(ipos);
            data.trisindex.push(ipos + 2);
            data.trisindex.push(ipos + 1);
            ipos += 3;

            data.pos.push(new m4m.math.vector3(-halfsize, -height * 0.5, -halfsize));
            data.pos.push(new m4m.math.vector3(halfsize, -height * 0.5, -halfsize));
            data.pos.push(new m4m.math.vector3(halfsize, -height * 0.5, halfsize));
            data.pos.push(new m4m.math.vector3(-halfsize, -height * 0.5, halfsize));
            data.normal.push(vec5);
            data.normal.push(vec5);
            data.normal.push(vec5);
            data.normal.push(vec5);
            data.uv.push(uv00);
            data.uv.push(uv10);
            data.uv.push(uv11);
            data.uv.push(uv01);
            data.trisindex.push(ipos);
            data.trisindex.push(ipos + 2);
            data.trisindex.push(ipos + 1);

            data.trisindex.push(ipos + 3);
            data.trisindex.push(ipos + 2);
            data.trisindex.push(ipos);

            ipos += 4;

            return data;
        }

        /**
         * 生成 球体 mesh数据
         * @param radius 半径
         * @param widthSegments 横向分段数 
         * @param heightSegments 纵向分段数
         * @returns mesh数据
         */
        static genSphereCCW(radius: number = 1, widthSegments: number = 24, heightSegments: number = 12): meshData {
            var data = new meshData();
            data.pos = [];
            data.trisindex = [];
            data.normal = [];
            data.tangent = [];
            data.uv = [];

            widthSegments = Math.max(3, Math.floor(widthSegments));
            heightSegments = Math.max(2, Math.floor(heightSegments));

            var ix, iy;

            var index = 0;
            var grid = [];

            var vertex = new math.vector3();
            var normal = new math.vector3();

            // generate vertices, normals and uvs
            for (iy = 0; iy <= heightSegments; iy++) {
                var verticesRow = [];
                var v = iy / heightSegments;
                for (ix = 0; ix <= widthSegments; ix++) {
                    var u = ix / widthSegments;

                    // vertex
                    vertex.x = - radius * Math.cos(u * Math.PI * 2) * Math.sin(v * Math.PI);
                    vertex.y = radius * Math.cos(v * Math.PI);
                    vertex.z = radius * Math.sin(u * Math.PI * 2) * Math.sin(v * Math.PI);

                    data.pos.push(math.pool.clone_vector3(vertex));

                    // normal
                    normal = math.pool.clone_vector3(vertex);
                    var num: number = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
                    if (num > Number.MIN_VALUE) {
                        normal.x = normal.x / num;
                        normal.y = normal.y / num;
                        normal.z = normal.z / num;
                    }
                    else {
                        normal.x = 0;
                        normal.y = 0;
                        normal.z = 0;
                    }
                    data.normal.push(normal);

                    // uv
                    var uv = new math.vector2(1 - u, v);
                    data.uv.push(uv);
                    verticesRow.push(index++);
                }
                grid.push(verticesRow);
            }

            // indices
            for (iy = 0; iy < heightSegments; iy++) {
                for (ix = 0; ix < widthSegments; ix++) {
                    var a = grid[iy][ix + 1];
                    var b = grid[iy][ix];
                    var c = grid[iy + 1][ix];
                    var d = grid[iy + 1][ix + 1];

                    if (iy !== 0) data.trisindex.push(a, d, b);
                    if (iy !== heightSegments - 1) data.trisindex.push(b, d, c);
                }
            }

            return data;
        }

        /**
         * 生成 正方体 mesh数据
         * @param size 尺寸
         * @returns mesh数据
         */
        static genBoxCCW(size: number): meshData {
            var half = size * 0.5;
            var data = new meshData();
            data.pos = [];
            data.trisindex = [];
            data.normal = [];
            data.tangent = [];
            data.uv = [];
            //bottom
            meshData.addQuadVec3ByValue(data.normal, new m4m.math.vector3(0, -1, 0));
            meshData.addQuadPos(data, [
                new m4m.math.vector3(-half, -half, -half),
                new m4m.math.vector3(-half, -half, half),
                new m4m.math.vector3(half, -half, -half),
                new m4m.math.vector3(half, -half, half)
            ]);
            meshData.addQuadVec2(data.uv, [
                new math.vector2(0, 0),
                new m4m.math.vector2(0, 1),
                new m4m.math.vector2(1, 0),
                new m4m.math.vector2(1, 1),
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(-1, 0, 0));

            //top
            meshData.addQuadVec3ByValue(data.normal, new m4m.math.vector3(0, 1, 0));
            meshData.addQuadPos(data, [
                new m4m.math.vector3(-half, half, half),
                new m4m.math.vector3(-half, half, -half),
                new m4m.math.vector3(half, half, half),
                new m4m.math.vector3(half, half, -half)
            ]);
            meshData.addQuadVec2(data.uv, [
                new math.vector2(0, 0),
                new math.vector2(0, 1),
                new math.vector2(1, 0),
                new math.vector2(1, 1),
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(1, 0, 0));

            //back
            meshData.addQuadVec3ByValue(data.normal, new math.vector3(0, 0, 1));
            meshData.addQuadPos(data, [
                new math.vector3(-half, -half, half),
                new math.vector3(-half, half, half),
                new math.vector3(half, -half, half),
                new math.vector3(half, half, half)
            ]);
            meshData.addQuadVec2(data.uv, [
                new math.vector2(1, 1),
                new math.vector2(1, 0),
                new math.vector2(0, 1),
                new math.vector2(0, 0),
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(-1, 0, 0));

            //front
            meshData.addQuadVec3ByValue(data.normal, new math.vector3(0, 0, -1));
            meshData.addQuadPos(data, [
                new math.vector3(-half, half, -half),
                new math.vector3(-half, -half, -half),
                new math.vector3(half, half, -half),
                new math.vector3(half, -half, -half)
            ]);
            meshData.addQuadVec2(data.uv, [
                new math.vector2(0, 0),
                new math.vector2(0, 1),
                new math.vector2(1, 0),
                new math.vector2(1, 1),
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(1, 0, 0));

            //right
            meshData.addQuadVec3ByValue(data.normal, new math.vector3(1, 0, 0));
            meshData.addQuadPos(data, [
                new math.vector3(half, -half, -half),
                new math.vector3(half, -half, half),
                new math.vector3(half, half, -half),
                new math.vector3(half, half, half)
            ]);
            meshData.addQuadVec2(data.uv, [
                new math.vector2(0, 1),
                new math.vector2(1, 1),
                new math.vector2(0, 0),
                new math.vector2(1, 0),
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(0, 0, 1));

            //left
            meshData.addQuadVec3ByValue(data.normal, new math.vector3(-1, 0, 0));
            meshData.addQuadPos(data, [
                new math.vector3(-half, -half, half),
                new math.vector3(-half, -half, -half),
                new math.vector3(-half, half, half),
                new math.vector3(-half, half, -half)
            ]);
            meshData.addQuadVec2(data.uv, [
                new math.vector2(0, 1),
                new math.vector2(1, 1),
                new math.vector2(0, 0),
                new math.vector2(1, 0),
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(0, 0, -1));

            return data;
        }

        /**
         * 生成 长方体 mesh数据
         * @param array 长方体顶点数组
         * @param outData 输出mesh数据
         */
        static genBoxByArray(array: m4m.math.vector3[], outData: meshData) {
            if (!outData) return;
            // var data = new meshData();
            outData.pos = [];
            outData.trisindex = [];
            outData.normal = [];
            outData.tangent = [];
            outData.uv = [];
            //bottom
            meshData.addQuadVec3ByValue(outData.normal, new m4m.math.vector3(0, -1, 0));
            meshData.addQuadPos(outData, [
                array[0],
                array[1],
                array[2],
                array[3]
            ]);
            meshData.addQuadVec3ByValue(outData.tangent, new math.vector3(-1, 0, 0));
            //top
            meshData.addQuadVec3ByValue(outData.normal, new m4m.math.vector3(0, 1, 0));
            meshData.addQuadPos(outData, [
                array[4],
                array[5],
                array[6],
                array[7]
            ]);
            meshData.addQuadVec3ByValue(outData.tangent, new math.vector3(1, 0, 0));

            //back
            meshData.addQuadVec3ByValue(outData.normal, new math.vector3(0, 0, 1));
            meshData.addQuadPos(outData, [
                array[1],
                array[3],
                array[5],
                array[7]
            ]);
            meshData.addQuadVec3ByValue(outData.tangent, new math.vector3(1, 0, 0));

            //front
            meshData.addQuadVec3ByValue(outData.normal, new math.vector3(0, 0, -1));
            meshData.addQuadPos(outData, [
                array[0],
                array[2],
                array[4],
                array[6]
            ]);
            meshData.addQuadVec3ByValue(outData.tangent, new math.vector3(-1, 0, 0));

            //right
            meshData.addQuadVec3ByValue(outData.normal, new math.vector3(1, 0, 0));
            meshData.addQuadPos(outData, [
                array[6],
                array[2],
                array[7],
                array[3]
            ]);
            meshData.addQuadVec3ByValue(outData.tangent, new math.vector3(0, 0, -1));

            //left
            meshData.addQuadVec3ByValue(outData.normal, new math.vector3(-1, 0, 0));
            meshData.addQuadPos(outData, [
                array[0],
                array[4],
                array[1],
                array[5]
            ]);
            meshData.addQuadVec3ByValue(outData.tangent, new math.vector3(0, 0, 1));

            // return data;
        }

        /**
         * 生成 长方体 mesh数据
         * @param array 长方体顶点数组
         * @returns 输出mesh数据
         */
        static genBoxByArray_Quad(array: m4m.math.vector3[]): meshData {
            var data = new meshData();
            data.pos = [];
            data.trisindex = [];
            data.normal = [];
            data.tangent = [];
            data.uv = [];
            //bottom
            meshData.addQuadVec3ByValue(data.normal, new m4m.math.vector3(0, -1, 0));
            meshData.addQuadPos_Quad(data, [
                array[0],
                array[1],
                array[2],
                array[3]
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(-1, 0, 0));

            //top
            meshData.addQuadVec3ByValue(data.normal, new m4m.math.vector3(0, 1, 0));
            meshData.addQuadPos_Quad(data, [
                array[4],
                array[5],
                array[6],
                array[7]
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(1, 0, 0));

            //back
            meshData.addQuadVec3ByValue(data.normal, new math.vector3(0, 0, 1));
            meshData.addQuadPos_Quad(data, [
                array[1],
                array[3],
                array[5],
                array[7]
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(1, 0, 0));

            //front
            meshData.addQuadVec3ByValue(data.normal, new math.vector3(0, 0, -1));
            meshData.addQuadPos_Quad(data, [
                array[0],
                array[2],
                array[4],
                array[6]
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(-1, 0, 0));

            //right
            meshData.addQuadVec3ByValue(data.normal, new math.vector3(1, 0, 0));
            meshData.addQuadPos_Quad(data, [
                array[6],
                array[2],
                array[7],
                array[3]
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(0, 0, -1));

            //left
            meshData.addQuadVec3ByValue(data.normal, new math.vector3(-1, 0, 0));
            meshData.addQuadPos_Quad(data, [
                array[0],
                array[4],
                array[1],
                array[5]
            ]);
            meshData.addQuadVec3ByValue(data.tangent, new math.vector3(0, 0, 1));

            return data;
        }

        /**
         * 生成圆环
         * @param radius 半径
         * @param segment 分段
         * @param wide 宽度
         * @returns 输出mesh数据
         */
        static genCircleLineCCW(radius: number, segment: number = 64, wide: number = 0.05): meshData {
            var data = new meshData();
            data.pos = [];
            data.trisindex = [];
            data.normal = [];
            data.uv = [];

            for (var i = 0; i < segment; i++) {
                var r1 = Math.PI * 2 * i / segment;
                var x1 = Math.sin(r1) * radius;
                var z1 = Math.cos(r1) * radius;

                var r2 = Math.PI * 2 * (i + 1) / segment;
                var x2 = Math.sin(r2) * radius;
                var z2 = Math.cos(r2) * radius;

                meshData.addQuadPos(data,
                    [
                        new math.vector3(x2, wide, z2),
                        new math.vector3(x1, wide, z1),
                        new math.vector3(x2, -wide, z2),
                        new math.vector3(x1, -wide, z1)
                    ]);
            }
            return data;
        }

        /**
         * 计算内存占用长度
         * @returns 内存占用长度
         */
        caclByteLength(): number {
            let len = 0;
            if (this.pos != undefined) len += 12;

            if (this.color != undefined) len += 16;
            if (this.normal != undefined) len += 12;
            if (this.tangent != undefined) len += 12;
            if (this.uv != undefined) len += 8;
            if (this.uv2 != undefined) len += 8;
            if (this.blendIndex != undefined) len += 16;
            if (this.blendWeight != undefined) len += 16;
            if (this.colorex != undefined) len += 16;
            if (this.trisindex != undefined) len += 12;

            len *= this.pos.length;
            return len;
        }

        /**
         * 计算字节大小
         * @param vf 顶点格式
         * @returns 字节大小
         */
        static calcByteSize(vf: VertexFormatMask): number {
            var total = 0;//nothing
            if (vf & VertexFormatMask.Position) total += 12;
            if (vf & VertexFormatMask.Normal) total += 12;
            if (vf & VertexFormatMask.Tangent) total += 12;
            if (vf & VertexFormatMask.Color) total += 16;
            if (vf & VertexFormatMask.UV0) total += 8;
            if (vf & VertexFormatMask.UV1) total += 8;
            if (vf & VertexFormatMask.BlendIndex4) total += 16;
            if (vf & VertexFormatMask.BlendWeight4) total += 16;
            if (vf & VertexFormatMask.ColorEX) total += 16;
            return total;
        }

        /**
         * 获取顶点段落长度
         * @returns 段落长度
         */
        private getSegmentSize() {
            const vf = this.originVF;
            return 3 +
                (vf & VertexFormatMask.Normal ? 3 : 0) +
                (vf & VertexFormatMask.Tangent ? 3 : 0) +
                (vf & VertexFormatMask.UV0 ? 2 : 0) +
                (vf & VertexFormatMask.UV1 ? 2 : 0) +
                (vf & VertexFormatMask.Color ? 4 : 0) +
                (vf & VertexFormatMask.ColorEX ? 4 : 0) +
                (vf & VertexFormatMask.BlendIndex4 ? 4 : 0) +
                (vf & VertexFormatMask.BlendWeight4 ? 4 : 0)
                ;
        }

        /**
         * 获取顶点数量
         * @returns 顶点数量
         */
        public getVertexCount() {
            if (!this.isBufferDataMode) {
                return this.pos.length;
            } else {
                if (!this.vertexBufferData) return 0;
                const segmentSize = this._segmentSize;
                return Math.floor(this.vertexBufferData.length / segmentSize);
            }
        }

        /**
         * 获取三角形索引数量
         * @returns 三角形索引数量
         */
        public getTriIndexCount() {
            if (!this.isBufferDataMode) {
                if (!this.trisindex) return 0;
                return this.trisindex.length;
            } else {
                if (!this.triIndexBufferData) return 0;
                return this.triIndexBufferData.length;
            }
        }

        /**
         * 获取顶点位置
         * @param vertexIndex 顶点索引
         * @param out 输出vector3
         */
        public getPosition(vertexIndex: number, out: math.vector3) {
            if (vertexIndex < 0 || !out) return;
            if (!this.isBufferDataMode) {
                const pos = this.pos[vertexIndex];
                out.x = pos.x;
                out.y = pos.y;
                out.z = pos.z;
            } else {
                const startIdx = vertexIndex * this._segmentSize;
                out.x = this._vertexBufferData[startIdx];
                out.y = this._vertexBufferData[startIdx + 1];
                out.z = this._vertexBufferData[startIdx + 2];
            }
        }

        /**
         * 获取三角形索引
         * @param Index 数组索引
         * @returns 三角形顶点索引
         */
        public getTriIndex(Index: number) {
            if (!this.isBufferDataMode) {
                if (!this.trisindex) return 0;
                return this.trisindex[Index];
            } else {
                if (!this.triIndexBufferData) return 0;
                return this.triIndexBufferData[Index];
            }

        }

        /**
         * 遍历顶点数据
         * @param callbackfn 遍历每个顶点数据时调用的函数
         */
        public foreachVertexData(callbackfn: (value: vertexData, index: number) => any) {
            //
            if (callbackfn == null) return;
            const isBufferM = this.isBufferDataMode;
            if (isBufferM && !this.vertexBufferData) return;
            //
            const vdata: vertexData = {} as any;
            const vf = this.originVF;
            if (!isBufferM) {
                const len = this.pos.length;
                for (let i = 0; i < len; i++) {
                    //pos
                    vdata.pos = this.pos[i];
                    vdata.normal = vf & VertexFormatMask.Normal && this.normal ? this.normal[i] : null;
                    vdata.tangent = vf & VertexFormatMask.Tangent && this.tangent ? this.tangent[i] : null;
                    vdata.uv = vf & VertexFormatMask.UV0 && this.uv ? this.uv[i] : null;
                    vdata.uv2 = vf & VertexFormatMask.UV1 && this.uv2 ? this.uv2[i] : null;
                    vdata.color = vf & VertexFormatMask.Color && this.color ? this.color[i] : null;
                    vdata.colorex = vf & VertexFormatMask.ColorEX && this.colorex ? this.colorex[i] : null;
                    vdata.blendIndex = vf & VertexFormatMask.BlendIndex4 && this.blendIndex ? this.blendIndex[i] : null;
                    vdata.blendWeight = vf & VertexFormatMask.BlendWeight4 && this.blendWeight ? this.blendWeight[i] : null;
                    //callback
                    callbackfn(vdata, i);
                }
            } else {
                const _pos = new math.vector3();
                const _normal = new math.vector3();
                const _tangent = new math.vector3();
                const _uv = new math.vector2();
                const _uv2 = new math.vector2();
                const _color = new math.color();
                const _colorex = new math.color();
                const _blendIndex = new number4();
                const _blendWeight = new number4();

                const vBuffer = this.vertexBufferData;
                const segmentSize = this._segmentSize;

                const len = Math.floor(vBuffer.length / segmentSize);
                vdata.pos = _pos;
                for (let i = 0; i < len; i++) {
                    let idx = i * segmentSize;

                    vdata.normal = (vf & VertexFormatMask.Normal) ? _normal : null;
                    vdata.tangent = (vf & VertexFormatMask.Tangent) ? _tangent : null;
                    vdata.color = (vf & VertexFormatMask.Color) ? _color : null;
                    vdata.uv = (vf & VertexFormatMask.UV0) ? _uv : null;
                    vdata.uv2 = (vf & VertexFormatMask.UV1) ? _uv2 : null;
                    vdata.blendIndex = (vf & VertexFormatMask.BlendIndex4) ? _blendIndex : null;
                    vdata.blendWeight = (vf & VertexFormatMask.BlendWeight4) ? _blendWeight : null;
                    vdata.colorex = (vf & VertexFormatMask.ColorEX) ? _colorex : null;
                    //
                    math.vec3Set(vdata.pos, vBuffer[idx++], vBuffer[idx++], vBuffer[idx++]);
                    if (vdata.normal) math.vec3Set(vdata.normal, vBuffer[idx++], vBuffer[idx++], vBuffer[idx++]);
                    if (vdata.tangent) math.vec3Set(vdata.tangent, vBuffer[idx++], vBuffer[idx++], vBuffer[idx++]);
                    if (vdata.color) math.colorSet(vdata.color, vBuffer[idx++], vBuffer[idx++], vBuffer[idx++], vBuffer[idx++]);
                    if (vdata.uv) math.vec2Set(vdata.uv, vBuffer[idx++], vBuffer[idx++]);
                    if (vdata.uv2) math.vec2Set(vdata.uv2, vBuffer[idx++], vBuffer[idx++]);
                    if (vdata.blendIndex) number4.set(vdata.blendIndex, vBuffer[idx++], vBuffer[idx++], vBuffer[idx++], vBuffer[idx++]);
                    if (vdata.blendWeight) number4.set(vdata.blendWeight, vBuffer[idx++], vBuffer[idx++], vBuffer[idx++], vBuffer[idx++]);
                    if (vdata.colorex) math.colorSet(vdata.colorex, vBuffer[idx++], vBuffer[idx++], vBuffer[idx++], vBuffer[idx++]);
                    //callBack
                    callbackfn(vdata, i);
                }
            }
        }

        /**
         * 遍历三角形索引数据
         * @param callbackfn 遍历每个三角形索引时调用的函数
         */
        public foreachTriIndexData(callbackfn: (value: number, index: number) => any) {
            if (callbackfn == null) return;
            const arr = this.isBufferDataMode ? this.triIndexBufferData : this.trisindex;
            if (arr == null) return;
            for (let i = 0, len = arr.length; i < len; i++) {
                callbackfn(arr[i], i);
            }
        }

        /**
         * 获取 OBJ 格式模型 顶点数据字符串
         * @param face 导出三角形面
         * @param uv 导出顶点纹理坐标
         * @param normal 导出顶点法线
         * @returns OBJ 格式模型 顶点数据字符串
         */
        makeOBJFormatData(face = true, uv = false, normal = false): string {
            let vStr = "";
            let uvStr = "";
            let nStr = "";
            let faceStr = "";
            this.foreachVertexData((val, i) => {
                const pos = val.pos;
                const _uv = val.uv;
                const _n = val.normal;
                vStr += `v ${pos.x} ${pos.y} ${pos.z}\n`;
                if (uv && _uv) uvStr += `vt ${_uv.x} ${_uv.y}\n`;
                if (normal && _n) nStr += `vn ${_n.x} ${_n.y} ${_n.z}\n`;
            });

            if (face) {
                this.foreachTriIndexData((val, i) => {
                    const triCount = i % 3;
                    const _v = val + 1;
                    if (triCount == 0) {
                        faceStr += `f ${_v}`;
                    } else if (triCount == 1) {
                        faceStr += ` ${_v}`;
                    } else if (triCount == 2) {
                        faceStr += ` ${_v}\n`;
                    }
                });
            }

            return vStr + uvStr + nStr + faceStr;
        }

        // static timer = 0;
        /**
         * 生成顶点数据buffer
         * @param vf 顶点数据格式
         * @returns 点数据buffer
         */
        genVertexDataArray(vf: VertexFormatMask): Float32Array {
            const _this = this;
            //buffer 数据模式 ，直接返回
            if (_this.isBufferDataMode) return _this.vertexBufferData;
            // if (_this.tmpVArr)
            //     return _this.tmpVArr;
            var vertexCount = _this.pos.length;
            var total = meshData.calcByteSize(vf) / 4;
            var varray = new Float32Array(total * vertexCount);
            // _this.tmpVArr = varray;
            for (var i = 0; i < vertexCount; i++) {
                var nseek = 0;
                //pos
                varray[i * total + nseek] = _this.pos[i].x; nseek++;
                varray[i * total + nseek] = _this.pos[i].y; nseek++;
                varray[i * total + nseek] = _this.pos[i].z; nseek++;
                if (vf & VertexFormatMask.Normal) {
                    if (_this.normal == undefined || _this.normal.length == 0) {
                        varray[i * total + nseek] = 0; nseek++;
                        varray[i * total + nseek] = 0; nseek++;
                        varray[i * total + nseek] = 0; nseek++;
                    }
                    else {
                        varray[i * total + nseek] = _this.normal[i].x; nseek++;
                        varray[i * total + nseek] = _this.normal[i].y; nseek++;
                        varray[i * total + nseek] = _this.normal[i].z; nseek++;
                    }
                }
                if (vf & VertexFormatMask.Tangent) {
                    if (_this.tangent == undefined || _this.tangent.length == 0) {
                        varray[i * total + nseek] = 0; nseek++;
                        varray[i * total + nseek] = 0; nseek++;
                        varray[i * total + nseek] = 0; nseek++;
                    }
                    else {
                        varray[i * total + nseek] = _this.tangent[i].x; nseek++;
                        varray[i * total + nseek] = _this.tangent[i].y; nseek++;
                        varray[i * total + nseek] = _this.tangent[i].z; nseek++;
                    }
                }
                if (vf & VertexFormatMask.Color) {
                    if (_this.color == undefined || _this.color.length == 0) {
                        varray[i * total + nseek] = 1; nseek++;
                        varray[i * total + nseek] = 1; nseek++;
                        varray[i * total + nseek] = 1; nseek++;
                        varray[i * total + nseek] = 1; nseek++;
                    }
                    else {
                        varray[i * total + nseek] = _this.color[i].r; nseek++;
                        varray[i * total + nseek] = _this.color[i].g; nseek++;
                        varray[i * total + nseek] = _this.color[i].b; nseek++;
                        varray[i * total + nseek] = _this.color[i].a; nseek++;
                    }
                }

                if (vf & VertexFormatMask.UV0) {
                    if (_this.uv == undefined || _this.uv.length == 0) {
                        varray[i * total + nseek] = 0; nseek++;
                        varray[i * total + nseek] = 0; nseek++;
                    }
                    else {
                        varray[i * total + nseek] = _this.uv[i].x; nseek++;
                        varray[i * total + nseek] = _this.uv[i].y; nseek++;
                    }
                }
                if (vf & VertexFormatMask.UV1) {
                    if (_this.uv2 == undefined || _this.uv2.length == 0) {
                        varray[i * total + nseek] = 0; nseek++;
                        varray[i * total + nseek] = 0; nseek++;
                    }
                    else {
                        varray[i * total + nseek] = _this.uv2[i].x; nseek++;
                        varray[i * total + nseek] = _this.uv2[i].y; nseek++;
                    }
                }

                if (vf & VertexFormatMask.BlendIndex4) {
                    if (_this.blendIndex == undefined || _this.blendIndex.length == 0) {
                        varray[i * total + nseek] = 0; nseek++;
                        varray[i * total + nseek] = 0; nseek++;
                        varray[i * total + nseek] = 0; nseek++;
                        varray[i * total + nseek] = 0; nseek++;
                    }
                    else {
                        varray[i * total + nseek] = _this.blendIndex[i].v0; nseek++;
                        varray[i * total + nseek] = _this.blendIndex[i].v1; nseek++;
                        varray[i * total + nseek] = _this.blendIndex[i].v2; nseek++;
                        varray[i * total + nseek] = _this.blendIndex[i].v3; nseek++;
                    }
                }
                if (vf & VertexFormatMask.BlendWeight4) {
                    if (_this.blendWeight == undefined || _this.blendWeight.length == 0) {
                        varray[i * total + nseek] = 1; nseek++;
                        varray[i * total + nseek] = 0; nseek++;
                        varray[i * total + nseek] = 0; nseek++;
                        varray[i * total + nseek] = 0; nseek++;
                    }
                    else {
                        varray[i * total + nseek] = _this.blendWeight[i].v0; nseek++;
                        varray[i * total + nseek] = _this.blendWeight[i].v1; nseek++;
                        varray[i * total + nseek] = _this.blendWeight[i].v2; nseek++;
                        varray[i * total + nseek] = _this.blendWeight[i].v3; nseek++;
                    }
                }
                if (vf & VertexFormatMask.ColorEX) {
                    if (_this.colorex == undefined || _this.colorex.length == 0) {
                        varray[i * total + nseek] = 1; nseek++;
                        varray[i * total + nseek] = 1; nseek++;
                        varray[i * total + nseek] = 1; nseek++;
                        varray[i * total + nseek] = 1; nseek++;
                    }
                    else {
                        varray[i * total + nseek] = _this.colorex[i].r; nseek++;
                        varray[i * total + nseek] = _this.colorex[i].g; nseek++;
                        varray[i * total + nseek] = _this.colorex[i].b; nseek++;
                        varray[i * total + nseek] = _this.colorex[i].a; nseek++;
                    }
                }
            }
            // let tttttt = performance.now() - timeaa;
            // meshData.timer += tttttt;
            // console.error("解析Mesh总耗时：" + meshData.timer);
            return varray;
        }

        /**
         * 生成 三角形面索引buffer数据
         * @returns 三角形面索引buffer数据
         */
        genIndexDataArray(): TriIndexTypeArray {
            if (this.isBufferDataMode) return this.triIndexBufferData;
            return this.triIndexUint32Mode ? new Uint32Array(this.trisindex) : new Uint16Array(this.trisindex);
        }

        /**
         * 生成  三角形线索引buffer数据
         * @returns 三角形线索引buffer数据
         */
        genIndexDataArrayTri2Line(): TriIndexTypeArray {
            var line: number[] = [];
            for (var i = 0; i < ((this.trisindex.length / 3) | 0); i++) {
                line.push(this.trisindex[i * 3 + 0]);
                line.push(this.trisindex[i * 3 + 1]);
                line.push(this.trisindex[i * 3 + 1]);
                line.push(this.trisindex[i * 3 + 2]);
                line.push(this.trisindex[i * 3 + 2]);
                line.push(this.trisindex[i * 3 + 0]);
            }
            // return new Uint16Array(line);
            return this.triIndexUint32Mode ? new Uint32Array(line) : new Uint16Array(line);
        }
        /**
         * 生成  三角形线索引buffer数据
         * @returns 三角形线索引buffer数据
         */
        genIndexDataArrayQuad2Line(): TriIndexTypeArray {
            var line: number[] = [];
            for (var i = 0; i < ((this.trisindex.length / 4) | 0); i++) {
                line.push(this.trisindex[i * 4 + 0]);
                line.push(this.trisindex[i * 4 + 1]);
                line.push(this.trisindex[i * 4 + 1]);
                line.push(this.trisindex[i * 4 + 2]);
                line.push(this.trisindex[i * 4 + 2]);
                line.push(this.trisindex[i * 4 + 3]);
            }
            // return new Uint16Array(line);
            return this.triIndexUint32Mode ? new Uint32Array(line) : new Uint16Array(line);
        }

        /**
         * 克隆
         * @param target 克隆目标
         * @returns 输出数据
         */
        static cloneByObj(target: meshData): meshData {
            let md = new meshData();
            target.originVF = md.originVF;
            if (target.pos) {
                md.pos = [];
                target.pos.forEach((element, idx) => {
                    md.pos[idx] = new math.vector3();
                    md.pos[idx].x = element.x;
                    md.pos[idx].y = element.y;
                    md.pos[idx].z = element.z;
                });
            }
            if (target.color) {
                md.color = [];
                target.color.forEach((element, idx) => {
                    md.color[idx] = new math.color();
                    md.color[idx].r = element.r;
                    md.color[idx].g = element.g;
                    md.color[idx].b = element.b;
                    md.color[idx].a = element.a;
                });
            }
            if (target.colorex) {
                md.colorex = [];
                target.colorex.forEach((element, idx) => {
                    md.colorex[idx] = new math.color();
                    md.colorex[idx].r = element.r;
                    md.colorex[idx].g = element.g;
                    md.colorex[idx].b = element.b;
                    md.colorex[idx].a = element.a;
                });
            }
            if (target.uv) {
                md.uv = [];
                target.uv.forEach((element, idx) => {
                    md.uv[idx] = new math.vector2();
                    md.uv[idx].x = element.x;
                    md.uv[idx].y = element.y;
                });
            }
            if (target.uv2) {
                md.uv2 = [];
                target.uv2.forEach((element, idx) => {
                    md.uv2[idx] = new math.vector2();
                    md.uv2[idx].x = element.x;
                    md.uv2[idx].y = element.y;
                });
            }
            if (target.normal) {
                md.normal = [];
                target.normal.forEach((element, idx) => {
                    md.normal[idx] = new math.vector3();
                    md.normal[idx].x = element.x;
                    md.normal[idx].y = element.y;
                    md.normal[idx].z = element.z;
                });
            }
            if (target.tangent) {
                md.tangent = [];
                target.tangent.forEach((element, idx) => {
                    md.tangent[idx] = new math.vector3();
                    md.tangent[idx].x = element.x;
                    md.tangent[idx].y = element.y;
                    md.tangent[idx].z = element.z;
                });
            }
            if (target.blendIndex) {
                md.blendIndex = [];
                target.blendIndex.forEach((element, idx) => {
                    md.blendIndex[idx] = new render.number4();
                    md.blendIndex[idx].v0 = element.v0;
                    md.blendIndex[idx].v1 = element.v1;
                    md.blendIndex[idx].v2 = element.v2;
                    md.blendIndex[idx].v3 = element.v3;
                });
            }
            if (target.blendWeight) {
                md.blendWeight = [];
                target.blendWeight.forEach((element, idx) => {
                    md.blendWeight[idx] = new render.number4();
                    md.blendWeight[idx].v0 = element.v0;
                    md.blendWeight[idx].v1 = element.v1;
                    md.blendWeight[idx].v2 = element.v2;
                    md.blendWeight[idx].v3 = element.v3;
                });
            }
            if (target.trisindex) {
                md.trisindex = [];
                target.trisindex.forEach(element => {
                    md.trisindex.push(element);
                });
            }

            return md;
        }

        /**
         * 获取AABB
         * @param recalculate 是否重新计算AABB
         */
        getAABB(recalculate = false) {
            if (!this._aabb || recalculate) {
                let minimum = new math.vector3();
                let maximum = new math.vector3();

                math.vec3SetByFloat(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, minimum);
                math.vec3SetByFloat(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE, maximum);
                let len = this.pos.length;
                let pos = this.pos;
                for (var i = 0; i < len; i++) {
                    math.vec3Max(pos[i], maximum, maximum);
                    math.vec3Min(pos[i], minimum, minimum);
                }
                this._aabb = new m4m.framework.aabb(minimum, maximum);
            }

            return this._aabb;
        }
        private _aabb: m4m.framework.aabb;
    }

}