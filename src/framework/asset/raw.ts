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
namespace m4m.framework {

    export class RAWParse {
        private static readonly HEADER_SIZE_X = 7;
        private static readonly HEADER_SIZE_Y = 10;
        private static readonly HEADER_SIZE_Z = 13;
        private static readonly HEADER_MAX = 16;

        private static gLInternalFormat: GLenum;
        private static pixelWidth: number;
        private static pixelHeight: number;

        /**
         * 
         * @param gl WebGL2RenderingContext
         * @param arrayBuffer contents of the ASTC container file
         */
        static parse(gl: WebGL2RenderingContext, arrayBuffer: ArrayBuffer): render.glTexture2D {
            return this.parseByAtt(gl, arrayBuffer);
        }

        /**
         * 解析纹理 通过参数
         * @param gl 
         * @param arrayBuffer 
         * @param _mipmap 
         * @param _linear 
         * @param _premultiplyAlpha 
         * @param _repeat 
         * @returns 
         */
        public static parseByAtt(gl: WebGL2RenderingContext, arrayBuffer: ArrayBuffer, _mipmap = true, _linear = true, _premultiplyAlpha = false, _repeat = false) {
            var reader = new io.binReader(arrayBuffer);
            var w = reader.readUInt16();
            var h = reader.readUInt16();
            var data = new ArrayBuffer(w * h * 8);
            var bts = new Uint8Array(data);
            var f16 = new Uint16Array(data);
            reader.readBytes(bts, 0, bts.length);
            let result: render.glTexture2D;

            //webgl2 默认支持
            // let ext = gl.getExtension("OES_texture_half_float");
            // if (!ext) {
            //     console.error(`当前环境 不支持 float 16 texture 纹理`);
            //     return;
            // }

            // 初始化纹理
            let t2d = result = new m4m.render.glTexture2D(gl);
            t2d.width = this.pixelHeight;
            t2d.height = this.pixelWidth;
            t2d.format = render.TextureFormatEnum.FLOAT16;
            t2d.mipmap = false;
            //额外处理
            let webgl = sceneMgr.app.webgl;
            webgl.bindTexture(webgl.TEXTURE_2D, t2d.texture);
            //纹理 Y 翻转
            webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, 0);
            t2d.uploadByteArray(_mipmap, _linear, w, h, f16, _repeat, false, false, _premultiplyAlpha, true, webgl.HALF_FLOAT);
            //结束
            webgl.bindTexture(webgl.TEXTURE_2D, null);


            return result;
        }
    }
}