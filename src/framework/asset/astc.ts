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
     *
     * astc 格式概述  https://github.com/ARM-software/astc-encoder/blob/main/Docs/FormatOverview.md
     * Khronos Group  astc格式规范 https://www.khronos.org/registry/DataFormat/specs/1.3/dataformat.1.3.html#ASTC
     */
    export class ASTCParse
    {
        private static readonly HEADER_SIZE_X = 7;
        private static readonly HEADER_SIZE_Y = 10;
        private static readonly HEADER_SIZE_Z = 13;
        private static readonly HEADER_MAX = 16;

        private static gLInternalFormat: GLenum;
        private static pixelWidth: number;
        private static pixelHeight: number;

        /**
         * 解析
         * @param gl WebGL2RenderingContext
         * @param arrayBuffer contents of the ASTC container file
         */
        static parse(gl: WebGL2RenderingContext, arrayBuffer: ArrayBuffer): render.glTexture2D
        {
            let result: render.glTexture2D;

            // let ext = gl.getExtension('WEBGL_compressed_texture_astc');
            let ext = gl.extensions.WEBGL_compressed_texture_astc;
            if (!ext)
            {
                console.error(`当前环境 不支持 ASTC 压缩纹理`);
                return;
            }
            ext.COMPRESSED_RGBA_ASTC_10x10_KHR
            this.decodeBuffer(ext, arrayBuffer);

            // 初始化纹理
            let t2d = result = new m4m.render.glTexture2D(gl);
            t2d.width = this.pixelHeight;
            t2d.height = this.pixelWidth;
            t2d.format = this.getTextureFormat(ext, this.gLInternalFormat);
            let target = gl.TEXTURE_2D;
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(target, t2d.texture);

            //当前框架下 ，这里无法处理 mipmap
            let textureBuf = new Uint8Array(arrayBuffer, this.HEADER_MAX);
            gl.compressedTexImage2D(target, 0, this.gLInternalFormat, t2d.width, t2d.height, 0, textureBuf);

            gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            //clear
            this.gLInternalFormat = null;
            this.pixelWidth = null;
            this.pixelHeight = null;
            return result;
        }

        /**
         * 解码
         * @param ext webgl astc 拓展
         * @param _buf 二进制buffer数据
         */ 
        private static decodeBuffer(ext: WEBGL_compressed_texture_astc, _buf: ArrayBuffer)
        {
            const header = new Uint8Array(_buf, 0, this.HEADER_MAX);

            const astcTag = header[3]  + (header[2] << 8) + (header[1] << 16) + (header[0] << 24);
            if (astcTag !== 0x13ABA15C)
            {
                throw new Error('ASTC 无效的头文件');
            }

            const xdim = header[4];
            const ydim = header[5];
            const zdim = header[6];
            if ((xdim < 3 || xdim > 6 || ydim < 3 || ydim > 6 || zdim < 3 || zdim > 6)
                && (xdim < 4 || xdim === 7 || xdim === 9 || xdim === 11 || xdim > 12
                    || ydim < 4 || ydim === 7 || ydim === 9 || ydim === 11 || ydim > 12 || zdim !== 1))
            {
                throw new Error(' ASTC 无效的头文件');
            }

            this.gLInternalFormat = ext[`COMPRESSED_RGBA_ASTC_${xdim}x${ydim}_KHR`];
            this.pixelWidth = header[this.HEADER_SIZE_X] + (header[this.HEADER_SIZE_X + 1] << 8) + (header[this.HEADER_SIZE_X + 2] << 16);
            this.pixelHeight = header[this.HEADER_SIZE_Y] + (header[this.HEADER_SIZE_Y + 1] << 8) + (header[this.HEADER_SIZE_Y + 2] << 16);
            // let pixeLen = header[this.HEADER_SIZE_Z] + (header[this.HEADER_SIZE_Z + 1] << 8) + (header[this.HEADER_SIZE_Z + 2] << 16);
        }

        private static getTextureFormat(ext: WEBGL_compressed_texture_astc, gLInternalFormat: GLenum)
        {
            ext.COMPRESSED_RGBA_ASTC_4x4_KHR;
            let tfEnum = render.TextureFormatEnum;
            switch (gLInternalFormat)
            {
                case ext.COMPRESSED_RGBA_ASTC_4x4_KHR: return tfEnum.ASTC_RGBA_4x4;
                case ext.COMPRESSED_RGBA_ASTC_5x4_KHR: return tfEnum.ASTC_RGBA_5x4;
                case ext.COMPRESSED_RGBA_ASTC_5x5_KHR: return tfEnum.ASTC_RGBA_5x5;
                case ext.COMPRESSED_RGBA_ASTC_6x5_KHR: return tfEnum.ASTC_RGBA_6x5;
                case ext.COMPRESSED_RGBA_ASTC_6x6_KHR: return tfEnum.ASTC_RGBA_6x6;
                case ext.COMPRESSED_RGBA_ASTC_8x5_KHR: return tfEnum.ASTC_RGBA_8x5;
                case ext.COMPRESSED_RGBA_ASTC_8x6_KHR: return tfEnum.ASTC_RGBA_8x6;
                case ext.COMPRESSED_RGBA_ASTC_8x8_KHR: return tfEnum.ASTC_RGBA_8x8;
                case ext.COMPRESSED_RGBA_ASTC_10x5_KHR: return tfEnum.ASTC_RGBA_10x5;
                case ext.COMPRESSED_RGBA_ASTC_10x6_KHR: return tfEnum.ASTC_RGBA_10x6;
                case ext.COMPRESSED_RGBA_ASTC_10x8_KHR: return tfEnum.ASTC_RGBA_10x8;
                case ext.COMPRESSED_RGBA_ASTC_10x10_KHR: return tfEnum.ASTC_RGBA_10x10;
                case ext.COMPRESSED_RGBA_ASTC_12x10_KHR: return tfEnum.ASTC_RGBA_12x10;
                case ext.COMPRESSED_RGBA_ASTC_12x12_KHR: return tfEnum.ASTC_RGBA_12x12;
                default:
            }
        }
    }
}