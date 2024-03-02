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
    /**
     * 顶点格式类型
     */
    export enum VertexFormatMask {
        Position = 0x00000001,
        Normal = 0x00000002,
        Tangent = 0x00000004,
        Color = 0x00000008,
        UV0 = 0x00000010,
        UV1 = 0x00000020,
        BlendIndex4 = 0x00000040,
        BlendWeight4 = 0x00000080,
        ColorEX = 0x00000100,
    }

    /**
     * 顶点作色器中的地址 (最大 0 - 15)
     */
    export enum VertexLocation {
        /** 顶点位置坐标地址 */
        Position_L = 0,
        /** 顶点法线坐标地址 */
        Normal_L = 1,
        /** 顶点切线坐标地址 */
        Tangent_L = 2,
        /** 顶点颜色地址 */
        Color_L = 3,
        /** 顶点第一个纹理坐标地址 */
        UV0_L = 4,
        /** 顶点第二个纹理坐标地址 */
        UV1_L = 5,
        /** 顶点蒙皮索引 */
        BlendIndex4_L = 6,
        /** 顶点蒙皮权重 */
        BlendWeight4_L = 7,
        /** 顶点第二个颜色地址 */
        ColorEX_L = 8,

        //mesh 拓展预览位置 ....

        /** GPUInstance 内建开始地址 */
        GPUInstanceStart = 12,
        /** GPUInstance 偏移(toWorld)矩阵  */
        InstanceOffsetMatrix_L = 12,
    }

    /**
     * @private
     */
    export class number4 {
        v0: number;
        v1: number;
        v2: number;
        v3: number;
        /**
         * 设置 数据
         * @param data  数据 
         * @param _v0   值0
         * @param _v1   值1
         * @param _v2   值2
         * @param _v3   值3
         */
        public static set(data: number4, _v0: number, _v1: number, _v2: number, _v3: number) {
            data.v0 = _v0;
            data.v1 = _v1;
            data.v2 = _v2;
            data.v3 = _v3;
        }
    }
    /**
     * @private
     */
    export enum MeshTypeEnum {
        Static,
        Dynamic,
        Stream,
    }
    /**
     * @private
     */
    export class drawInfo {
        private static _ins: drawInfo;
        public static get ins(): drawInfo {
            if (drawInfo._ins == null)
                drawInfo._ins = new drawInfo();
            return drawInfo._ins;
        }
        triCount: number = 0;
        vboCount: number = 0;
        renderCount: number = 0;
    }
    /**
     * @private
     */
    export class glMesh {
        private static AttributeLocationMap: { [vf: number]: number };
        private vao: WebGLVertexArrayObject;
        private mode: number;
        private vbo: WebGLBuffer;
        private vertexCount: number;
        private eboDataType:number = WebGL2RenderingContext.UNSIGNED_SHORT;
        private eboElementSize = 2;
        private webgl: WebGL2RenderingContext;
        vertexByteSize: number;
        ebo: WebGLBuffer;
        indexCount: number = 0;
        vertexFormat: VertexFormatMask = VertexFormatMask.Position;
        /**
         * 引擎 mesh
         * @param webgl webgl上下文
         */
        constructor(webgl?: WebGL2RenderingContext) {
            this.webgl = webgl != null ? webgl : framework.sceneMgr.app.webgl;
        }

        /**
         * 获取 顶点着色器中 Attribute (in) 的地址
         * @param vf 顶点格式标记
         * @returns Attribute (in) 的地址
         */
        public static getAttributeLocation(vf: VertexFormatMask): number {
            let map = this.AttributeLocationMap;
            if (!map) {
                map = {};
                map[VertexFormatMask.Position] = VertexLocation.Position_L;
                map[VertexFormatMask.Normal] = VertexLocation.Normal_L;
                map[VertexFormatMask.Tangent] = VertexLocation.Tangent_L;
                map[VertexFormatMask.Color] = VertexLocation.Color_L;
                map[VertexFormatMask.UV0] = VertexLocation.UV0_L;
                map[VertexFormatMask.UV1] = VertexLocation.UV1_L;
                map[VertexFormatMask.BlendIndex4] = VertexLocation.BlendIndex4_L;
                map[VertexFormatMask.BlendWeight4] = VertexLocation.BlendWeight4_L;
                map[VertexFormatMask.ColorEX] = VertexLocation.ColorEX_L;
            }
            return map[vf];
        }
        /**
         * 初始化 webgl 缓冲区
         * @param webgl webgl上下文
         * @param vf 顶点格式
         * @param vertexCount 顶点数量
         * @param mode 模式
         */
        initBuffer(webgl: WebGL2RenderingContext, vf: VertexFormatMask, vertexCount: number, mode: MeshTypeEnum = MeshTypeEnum.Static) {
            if (this.vbo != null)
                throw new Error("you can only initbuffer once.");
            if (mode == MeshTypeEnum.Static)
                this.mode = webgl.STATIC_DRAW;
            else if (mode == MeshTypeEnum.Dynamic)
                this.mode = webgl.DYNAMIC_DRAW;
            else if (mode == MeshTypeEnum.Stream)
                this.mode = webgl.STREAM_DRAW;

            this.vertexFormat = vf;

            this.vertexCount = vertexCount;
            if (vertexCount > 0) {
                this.vertexByteSize = meshData.calcByteSize(vf);

                this.vbo = webgl.createBuffer();
                webgl.bindBuffer(webgl.ARRAY_BUFFER, this.vbo);
                webgl.bufferData(webgl.ARRAY_BUFFER, vertexCount * this.vertexByteSize, this.mode);
            }
            // this.indexCounts = []
            // this.ebos = [];
        }
        /**
         * 通过长度初始化 EBO
         * @param webgl webgl上下文
         * @param indexcount 索引数
         * @returns 
         */
        addIndex(webgl: WebGL2RenderingContext, indexcount: number): number {
            // let index = this.ebos.length;
            let index = 0;
            let _ebo = webgl.createBuffer();
            webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, _ebo);
            webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, indexcount * 2, this.mode);
            // this.ebos.push(_ebo);
            this.ebo = _ebo;
            // this.indexCounts.push(indexcount);
            this.indexCount = indexcount;
            return index;
        }

        /**
         * 重置VBO 尺寸
         * @param webgl webgl上下文
         * @param vertexCount 顶点数
         */
        resetVboSize(webgl: WebGL2RenderingContext, vertexCount: number) {
            this.vertexCount = vertexCount;
            webgl.bindBuffer(webgl.ARRAY_BUFFER, this.vbo);
            webgl.bufferData(webgl.ARRAY_BUFFER, vertexCount * this.vertexByteSize, this.mode);
        }
        /**
         * 重置EBO 尺寸
         * @param webgl webgl上下文
         * @param eboindex [已弃用]
         * @param indexcount 索引数
         */
        resetEboSize(webgl: WebGL2RenderingContext, eboindex: number, indexcount: number) {
            if (!this.ebo) return;
            // this.indexCounts[eboindex] = indexcount;
            this.indexCount = indexcount;
            // webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, this.ebos[eboindex]);
            webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, this.ebo);
            webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, indexcount * 2, this.mode);
        }
        /**
         * 销毁
         */
        dispose() {
            // if (this.ebos) {
            //     for (var i = 0; i < this.ebos.length; i++)
            //         webgl.deleteBuffer(this.ebos[i]);
            //     this.ebos.length = 0;
            // }
            this.webgl.deleteBuffer(this.vbo);
            this.webgl.deleteBuffer(this.ebo);
            this.webgl.deleteVertexArray(this.vao);
            this.ebo = null;
            this.vbo = null;
            this.vao = null;
        }

        /**
         * 计算内存占用长度
         * @returns 内存占用长度
         */
        caclByteLength(): number {
            let total = 0;
            total += this.vertexByteSize * this.vertexCount;
            // for (let k in this.indexCounts) {
            //     total += this.indexCounts[k] * 2;
            // }
            total += this.indexCount * 2;
            return total;
        }

        // bindVboBuffer(webgl: WebGL2RenderingContext) {
        //     webgl.bindBuffer(webgl.ARRAY_BUFFER, this.vbo);
        // }

        // bind(webgl: WebGL2RenderingContext, shadercode: glProgram, bindEbo: number = 0) {
        //     // this.bindIndex = bindEbo;
        //     // if (bindEbo >= 0) {
        //     //     webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, this.ebos[bindEbo]);
        //     // }
        //     if (this.ebo) {
        //         webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, this.ebo);
        //     }

        //     var total = this.vertexByteSize;

        //     //绑定vbo和shader顶点格式，这部分应该要区分材质改变与参数改变，可以少切换一些状态
        //     var seek = 0;
        //     // var channel = 0;
        //     {//pos
        //         if (shadercode.posPos >= 0) {
        //             webgl.enableVertexAttribArray(shadercode.posPos);
        //             webgl.vertexAttribPointer(shadercode.posPos, 3, webgl.FLOAT, false, total, seek);
        //             // channel++;
        //         }
        //         seek += 12;
        //     }
        //     if (this.vertexFormat & VertexFormatMask.Normal) {
        //         if (shadercode.posNormal >= 0) {
        //             webgl.enableVertexAttribArray(shadercode.posNormal);
        //             webgl.vertexAttribPointer(shadercode.posNormal, 3, webgl.FLOAT, true, total, seek);
        //             // channel++;
        //         }
        //         seek += 12;
        //     }
        //     else if (shadercode.posNormal >= 0)//需要处理mesh里没有这个通道，但是shader里有的情况
        //     {
        //         webgl.disableVertexAttribArray(shadercode.posNormal);
        //         // channel++;
        //     }
        //     if (this.vertexFormat & VertexFormatMask.Tangent) {
        //         if (shadercode.posTangent >= 0) {
        //             webgl.enableVertexAttribArray(shadercode.posTangent);
        //             webgl.vertexAttribPointer(shadercode.posTangent, 3, webgl.FLOAT, true, total, seek);
        //             // channel++;
        //         }
        //         seek += 12;
        //     }
        //     else if (shadercode.posTangent >= 0)//需要处理mesh里没有这个通道，但是shader里有的情况
        //     {
        //         webgl.disableVertexAttribArray(shadercode.posTangent);
        //         // channel++;
        //     }
        //     if (this.vertexFormat & VertexFormatMask.Color) {
        //         if (shadercode.posColor >= 0) {
        //             webgl.enableVertexAttribArray(shadercode.posColor);
        //             webgl.vertexAttribPointer(shadercode.posColor, 4, webgl.FLOAT, false, total, seek);
        //             // channel++;
        //         }
        //         seek += 16;
        //     }
        //     else if (shadercode.posColor >= 0) {
        //         webgl.disableVertexAttribArray(shadercode.posColor);
        //         // channel++;
        //     }
        //     if (this.vertexFormat & VertexFormatMask.UV0) {
        //         if (shadercode.posUV0 >= 0) {
        //             webgl.enableVertexAttribArray(shadercode.posUV0);
        //             webgl.vertexAttribPointer(shadercode.posUV0, 2, webgl.FLOAT, false, total, seek);
        //             // channel++;
        //         }
        //         seek += 8;

        //     }
        //     else if (shadercode.posUV0 >= 0) {
        //         webgl.disableVertexAttribArray(shadercode.posUV0);
        //         // channel++;
        //     }
        //     if (this.vertexFormat & VertexFormatMask.UV1) {
        //         if (shadercode.posUV2 >= 0) {
        //             webgl.enableVertexAttribArray(shadercode.posUV2);
        //             webgl.vertexAttribPointer(shadercode.posUV2, 2, webgl.FLOAT, false, total, seek);
        //             // channel++;
        //         }
        //         seek += 8;
        //     }
        //     else if (shadercode.posUV2 >= 0) {
        //         webgl.disableVertexAttribArray(shadercode.posUV2);
        //         // channel++;
        //     }
        //     if (this.vertexFormat & VertexFormatMask.BlendIndex4) {
        //         if (shadercode.posBlendIndex4 >= 0) {
        //             webgl.enableVertexAttribArray(shadercode.posBlendIndex4);
        //             webgl.vertexAttribPointer(shadercode.posBlendIndex4, 4, webgl.FLOAT, false, total, seek);
        //             // channel++;
        //         }
        //         seek += 16;
        //     }
        //     else if (shadercode.posBlendIndex4 >= 0) {
        //         webgl.disableVertexAttribArray(shadercode.posBlendIndex4);
        //         // channel++;
        //     }
        //     if (this.vertexFormat & VertexFormatMask.BlendWeight4) {
        //         if (shadercode.posBlendWeight4 >= 0) {
        //             webgl.enableVertexAttribArray(shadercode.posBlendWeight4);
        //             webgl.vertexAttribPointer(shadercode.posBlendWeight4, 4, webgl.FLOAT, false, total, seek);
        //             // channel++;
        //         }
        //         seek += 16;
        //     }
        //     else if (shadercode.posBlendWeight4 >= 0) {
        //         webgl.disableVertexAttribArray(shadercode.posBlendWeight4);
        //         // channel++;
        //     }
        //     if (this.vertexFormat & VertexFormatMask.ColorEX) {
        //         if (shadercode.posColorEx >= 0) {
        //             webgl.enableVertexAttribArray(shadercode.posColorEx);
        //             webgl.vertexAttribPointer(shadercode.posColorEx, 4, webgl.FLOAT, false, total, seek);
        //             // channel++;
        //         }
        //         seek += 16;
        //     }
        //     else if (shadercode.posColorEx >= 0) {
        //         webgl.disableVertexAttribArray(shadercode.posColorEx);
        //         // channel++;
        //     }
        //     // webglkit.SetMaxVertexAttribArray(webgl, channel);
        // }

        /**
         * 上载顶点子数据 到 webgl API
         * @param webgl webgl上下文
         * @param varray 数据
         * @param offset 偏移
         */
        uploadVertexSubData(webgl: WebGL2RenderingContext, varray: Float32Array, offset: number = 0) {
            webgl.bindBuffer(webgl.ARRAY_BUFFER, this.vbo);
            webgl.bufferSubData(webgl.ARRAY_BUFFER, offset, varray);
        }

        /**
         * 上载顶点数据 到 webgl API
         * @param webgl webgl上下文
         * @param varray 数据
         */
        uploadVertexData(webgl: WebGL2RenderingContext, varray: Float32Array) {
            webgl.bindBuffer(webgl.ARRAY_BUFFER, this.vbo);
            webgl.bufferData(webgl.ARRAY_BUFFER, varray, this.mode);
        }

        /**
         * 上载顶点索引 子数据 到 webgl API
         * @param webgl webgl上下文
         * @param eboindex [已弃用]
         * @param data 数据
         * @param offset 偏移
         */
        uploadIndexSubData(webgl: WebGL2RenderingContext, eboindex: number, data: TriIndexTypeArray, offset: number = 0) {
            if (!this.ebo) return;
            // webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, this.ebos[eboindex]);
            webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, this.ebo);
            webgl.bufferSubData(webgl.ELEMENT_ARRAY_BUFFER, offset, data);
        }

        /**
         * 上载顶点索引 数据 到 webgl API
         * @param webgl webgl上下文
         * @param eboindex [已弃用]
         * @param data 数据
         * @param dataType 数据类型
         */
        uploadIndexData(webgl: WebGL2RenderingContext, eboindex: number, data: TriIndexTypeArray, dataType = WebGL2RenderingContext.UNSIGNED_SHORT) {
            if (!this.ebo) return;
            // this.eboDataType = dataType;
            let _dType:number = WebGL2RenderingContext.UNSIGNED_SHORT;
            this.eboElementSize =2;
            //webgl2 支持 32模式了, 通过类型判断是否为uint32
            if (data && data instanceof Uint32Array) {
                _dType = WebGL2RenderingContext.UNSIGNED_INT;
                this.eboElementSize =4;
            }
            this.eboDataType = _dType;
          
            // this.eboDataType = dataType;
            // webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, this.ebos[eboindex]);
            webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, this.ebo);
            webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, data, this.mode);
        }

        /**
         * 顶点数组绘制三角面
         * @param webgl webgl上下文
         * @param start buffer中开始位置
         * @param count 数量
         * @param instanceCount gpuInstance数量
         */
        drawArrayTris(webgl: WebGL2RenderingContext, start: number = 0, count: number = -1, instanceCount = 1) {
            if (count < 0)
                count = ((this.vertexCount / 3) | 0) * 3;
            drawInfo.ins.triCount += count / 3;
            drawInfo.ins.renderCount++;
            //model
            if (instanceCount > 1 && webgl.drawArraysInstanced != null) {
                webgl.drawArraysInstanced(webgl.TRIANGLES, start, count, instanceCount);
            } else {
                webgl.drawArrays(webgl.TRIANGLES, start, count);
            }
        }
        
        /**
         * 顶点数组绘制线段
         * @param webgl webgl上下文
         * @param start buffer中开始位置
         * @param count 数量
         * @param instanceCount gpuInstance数量
         */
        drawArrayLines(webgl: WebGL2RenderingContext, start: number = 0, count: number = -1, instanceCount = 1) {
            if (count < 0)
                count = ((this.vertexCount / 2) | 0) * 2;
            drawInfo.ins.renderCount++;
            //model
            if (instanceCount > 1 && webgl.drawArraysInstanced != null) {
                webgl.drawArraysInstanced(webgl.LINES, start, count, instanceCount);
            } else {
                webgl.drawArrays(webgl.LINES, start, count);
            }
        }

        /**
         * EBO 绘制三角面
         * @param webgl webgl上下文
         * @param start buffer中开始位置
         * @param count 数量
         * @param instanceCount gpuInstance数量
         */
        drawElementTris(webgl: WebGL2RenderingContext, start: number = 0, count: number = -1, instanceCount = 1) {
            // if (count < 0) count = ((this.indexCounts[this.bindIndex] / 3) | 0) * 3;
            if (count < 0) count = ((this.indexCount / 3) | 0) * 3;
            drawInfo.ins.triCount += count / 3;
            drawInfo.ins.renderCount++;
            //下面的*2 是 写死 16bit的地址
            if (instanceCount > 1 && webgl.drawElementsInstanced != null) {
                webgl.drawElementsInstanced(webgl.TRIANGLES, count, this.eboDataType, start * this.eboElementSize, instanceCount);
            } else {
                webgl.drawElements(webgl.TRIANGLES, count, this.eboDataType, start * this.eboElementSize);
            }
        }

        /**
         * EBO 绘制线段
         * @param webgl webgl上下文
         * @param start buffer中开始位置
         * @param count 数量
         * @param instanceCount gpuInstance数量
         */
        drawElementLines(webgl: WebGL2RenderingContext, start: number = 0, count: number = -1, instanceCount = 1) {
            // if (count < 0) count = ((this.indexCounts[this.bindIndex] / 2) | 0) * 2;
            if (count < 0) count = ((this.indexCount / 2) | 0) * 2;
            drawInfo.ins.renderCount++;
            if (instanceCount > 1 && webgl.drawElementsInstanced != null) {
                webgl.drawElementsInstanced(webgl.LINES, count, this.eboDataType, start * this.eboElementSize, instanceCount);
            } else {
                webgl.drawElements(webgl.LINES, count, this.eboDataType, start * this.eboElementSize);
            }
        }

        /** 初始化VAO */
        initVAO() {
            let webgl = this.webgl;
            if (this.vao) webgl.deleteVertexArray(this.vao);    //给一个新的vao
            this.vao = webgl.createVertexArray();
            let vf = this.vertexFormat;
            //bind
            this.onVAO();

            //in
            webgl.bindBuffer(webgl.ARRAY_BUFFER, this.vbo);

            let total = this.vertexByteSize;
            let seek = 0;
            let posLocation = glMesh.getAttributeLocation(vf & VertexFormatMask.Position);
            if (posLocation != null) {
                webgl.enableVertexAttribArray(posLocation);
                webgl.vertexAttribPointer(posLocation, 3, webgl.FLOAT, false, total, seek);
                seek += 12;
            }
            let normalLocation = glMesh.getAttributeLocation(vf & VertexFormatMask.Normal);
            if (normalLocation != null) {
                webgl.enableVertexAttribArray(normalLocation);
                webgl.vertexAttribPointer(normalLocation, 3, webgl.FLOAT, true, total, seek);
                seek += 12;
            }
            let tangentLocation = glMesh.getAttributeLocation(vf & VertexFormatMask.Tangent);
            if (tangentLocation != null) {
                webgl.enableVertexAttribArray(tangentLocation);
                webgl.vertexAttribPointer(tangentLocation, 3, webgl.FLOAT, true, total, seek);
                seek += 12;
            }
            let colorLocation = glMesh.getAttributeLocation(vf & VertexFormatMask.Color);
            if (colorLocation != null) {
                webgl.enableVertexAttribArray(colorLocation);
                webgl.vertexAttribPointer(colorLocation, 4, webgl.FLOAT, false, total, seek);
                seek += 16;
            }
            let uv0Location = glMesh.getAttributeLocation(vf & VertexFormatMask.UV0);
            if (uv0Location != null) {
                webgl.enableVertexAttribArray(uv0Location);
                webgl.vertexAttribPointer(uv0Location, 2, webgl.FLOAT, false, total, seek);
                seek += 8;
            }
            let uv1Location = glMesh.getAttributeLocation(vf & VertexFormatMask.UV1);
            if (uv1Location != null) {
                webgl.enableVertexAttribArray(uv1Location);
                webgl.vertexAttribPointer(uv1Location, 2, webgl.FLOAT, false, total, seek);
                seek += 8;
            }
            let blendIndex4Location = glMesh.getAttributeLocation(vf & VertexFormatMask.BlendIndex4);
            if (blendIndex4Location != null) {
                webgl.enableVertexAttribArray(blendIndex4Location);
                webgl.vertexAttribPointer(blendIndex4Location, 4, webgl.FLOAT, false, total, seek);
                seek += 16;
            }
            let blendWeight4Location = glMesh.getAttributeLocation(vf & VertexFormatMask.BlendWeight4);
            if (blendWeight4Location != null) {
                webgl.enableVertexAttribArray(blendWeight4Location);
                webgl.vertexAttribPointer(blendWeight4Location, 4, webgl.FLOAT, false, total, seek);
                seek += 16;
            }
            let colorEXLocation = glMesh.getAttributeLocation(vf & VertexFormatMask.ColorEX);
            if (colorEXLocation != null) {
                webgl.enableVertexAttribArray(colorEXLocation);
                webgl.vertexAttribPointer(colorEXLocation, 4, webgl.FLOAT, false, total, seek);
                seek += 16;
            }

            //ebo
            if (this.ebo) {
                webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, this.ebo);
            }

            this.offVAO();
        }

        /** 打开 VAO */
        onVAO() {
            if (!this.vao) return;
            this.webgl.bindVertexArray(this.vao);
        }

        /** 关闭 VAO */
        offVAO() {
            this.webgl.bindVertexArray(null);
        }

    }

}