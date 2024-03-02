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
    /**
     * S3TC 压缩纹理解析
     * .dds格式文件
     * 参考 
     * https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_compressed_texture_s3tc
     * https://docs.microsoft.com/zh-cn/windows/win32/direct3ddds/dx-graphics-dds-pguide
     * https://docs.microsoft.com/zh-cn/windows/win32/direct3ddds/dds-header
     */
    export class S3TCParse {
        private static readonly headerLengthInt = 31;

        /**
         * 
         * @param gl 
         * @param arrayBuffer 
         */
        static parse(gl: WebGL2RenderingContext, arrayBuffer: ArrayBuffer): render.glTexture2D {
            let ext = gl.extensions.WEBGL_compressed_texture_s3tc;
            if (!ext) {
                console.error(`当前环境 不支持 S3TC 压缩纹理`);
                return;
            }

            let buf = new Uint8Array(arrayBuffer);
            let info = this.getS3TCInfo(buf, ext);

            // 初始化纹理
            let result: m4m.render.glTexture2D;
            let t2d = result = new m4m.render.glTexture2D(gl);
            t2d.width = info.width;
            t2d.height = info.height;
            t2d.format = info.textureType;
            let target = gl.TEXTURE_2D;
            // //纹理 Y 翻转
            // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);   //压缩纹理不受 pixelStorei 影响
            gl.bindTexture(target, t2d.texture);

            //当前框架下 ，这里无法处理 mipmap
            let mipmapCount = Math.max(1, info.mipmapCount);

            if (info.isCompressed) {
                let dataLength = (((Math.max(4, t2d.width) / 4) * Math.max(4, t2d.height)) / 4) * info.blockBytes;
                let texBuf = new Uint8Array(arrayBuffer, info.dataOffset, dataLength);
                //当前框架下 ，这里无法处理 mipmap
                gl.compressedTexImage2D(target, 0, info.internalformat, t2d.width, t2d.height, 0, texBuf);
                gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }

            //结束
            gl.bindTexture(target, null);

            return result;
        }

        /**
         * 获取S3TC 信息
         * @param data 纹理的buffer数据对象
         */
        public static getS3TCInfo(data: ArrayBufferView, ext: WEBGL_compressed_texture_s3tc): S3TCInfo {
            const off_size = 1;
            const off_flags = 2;
            const off_height = 3;
            const off_width = 4;
            const off_mipmapCount = 7;
            const off_pfFlags = 20;
            const off_caps2 = 28;
            const off_pfFourCC = 21;
            const off_dxgiFormat = 32;

            const DDSD_MIPMAPCOUNT = 0x20000;
            const DDPF_FOURCC = 0x4;
            const DDPF_RGB = 0x40;
            const DDPF_LUMINANCE = 0x20000;
            const DDSCAPS2_CUBEMAP = 0x200;

            const FOURCC_D3DFMT_R16G16B16A16F = 113;
            const FOURCC_D3DFMT_R32G32B32A32F = 116;
            const DXGI_FORMAT_R32G32B32A32_FLOAT = 2;
            const DXGI_FORMAT_R16G16B16A16_FLOAT = 10;
            const DXGI_FORMAT_B8G8R8X8_UNORM = 88;

            const FOURCC_DX10 = this.FourCCToInt32("DX10");
            const FOURCC_DXT1 = this.FourCCToInt32("DXT1");
            const FOURCC_DXT3 = this.FourCCToInt32("DXT3");
            const FOURCC_DXT5 = this.FourCCToInt32("DXT5");

            let info = new S3TCInfo();
            const header = new Int32Array(data.buffer, data.byteOffset, this.headerLengthInt);
            const extendedHeader = new Int32Array(data.buffer, data.byteOffset, this.headerLengthInt + 4);
            let mipmapCount = 1;
            if (header[off_flags] & DDSD_MIPMAPCOUNT) {
                mipmapCount = Math.max(1, header[off_mipmapCount]);
            }

            const fourCC = header[off_pfFourCC];
            const dxgiFormat = fourCC === FOURCC_DX10 ? extendedHeader[off_dxgiFormat] : 0;


            //
            info.width = header[off_width];
            info.height = header[off_height];
            info.mipmapCount = mipmapCount;
            info.isFourCC = (header[off_pfFlags] & DDPF_FOURCC) === DDPF_FOURCC;
            info.isRGB = (header[off_pfFlags] & DDPF_RGB) === DDPF_RGB;
            info.isLuminance = (header[off_pfFlags] & DDPF_LUMINANCE) === DDPF_LUMINANCE;
            info.isCube = (header[off_caps2] & DDSCAPS2_CUBEMAP) === DDSCAPS2_CUBEMAP;
            info.isCompressed = fourCC === FOURCC_DXT1 || fourCC === FOURCC_DXT3 || fourCC === FOURCC_DXT5;
            info.dxgiFormat = dxgiFormat;

            //
            let textureType = render.TextureFormatEnum.RGBA;
            let internalformat = 0;
            let blockBytes = 1;
            let dataOffset = header[off_size] + 4;

            switch (fourCC) {
                case FOURCC_DXT1:
                    blockBytes = 8;
                    if (info.isRGB) textureType = render.TextureFormatEnum.RGB;
                    internalformat = info.isRGB ? ext.COMPRESSED_RGB_S3TC_DXT1_EXT : ext.COMPRESSED_RGBA_S3TC_DXT1_EXT;
                    break;
                case FOURCC_DXT3:
                    blockBytes = 16;
                    internalformat = ext.COMPRESSED_RGBA_S3TC_DXT3_EXT;
                    break;
                case FOURCC_DXT5:
                    blockBytes = 16;
                    internalformat = ext.COMPRESSED_RGBA_S3TC_DXT5_EXT;
                    break;
                case FOURCC_D3DFMT_R16G16B16A16F:
                    textureType = render.TextureFormatEnum.FLOAT16;
                    internalformat = WebGL2RenderingContext.HALF_FLOAT;
                    break;
                case FOURCC_D3DFMT_R32G32B32A32F:
                    textureType = render.TextureFormatEnum.FLOAT32;
                    internalformat = WebGL2RenderingContext.FLOAT;
                    break;
                case FOURCC_DX10:
                    dataOffset += 5 * 4; // 5 uints
                    switch (dxgiFormat) {
                        case DXGI_FORMAT_R16G16B16A16_FLOAT:
                            textureType = render.TextureFormatEnum.FLOAT16;
                            internalformat = WebGL2RenderingContext.HALF_FLOAT;
                            break;
                        case DXGI_FORMAT_R32G32B32A32_FLOAT:
                            textureType = render.TextureFormatEnum.FLOAT32;
                            internalformat = WebGL2RenderingContext.FLOAT;
                            break;
                    }
                    break;

            }

            info.textureType = textureType;
            info.internalformat = internalformat;
            info.blockBytes = blockBytes;
            info.dataOffset = dataOffset;

            return info;
        }

        private static FourCCToInt32(value: string) {
            return value.charCodeAt(0) + (value.charCodeAt(1) << 8) + (value.charCodeAt(2) << 16) + (value.charCodeAt(3) << 24);
        }
    }

    /** S3TC 信息 */
    class S3TCInfo {
        /**
         * 纹理宽度
         */
        width: number;
        /**
         * 纹理高度
         */
        height: number;
        /**
         * 纹理的mipmap数
         * @see https://en.wikipedia.org/wiki/Mipmap
         */
        mipmapCount: number;
        /**
         * 纹理格式是否是已知的fourCC格式
         * @see https://www.fourcc.org/
         */
        isFourCC: boolean;
        /**
         * 是否纹理是RGB格式. 例如 DXGI_FORMAT_B8G8R8X8_UNORM 格式
         */
        isRGB: boolean;
        /**
         * 是否是亮度格式
         */
        isLuminance: boolean;
        /**
         * 是否是cube 纹理
         * @see https://docs.microsoft.com/en-us/windows/desktop/direct3ddds/dds-file-layout-for-cubic-environment-maps
         */
        isCube: boolean;
        /**
         * 是否是压缩格式.例如 FOURCC_DXT1
         */
        isCompressed: boolean;
        /**
         * 纹理的 dxgi格式
         * @see https://docs.microsoft.com/en-us/windows/desktop/api/dxgiformat/ne-dxgiformat-dxgi_format
         */
        dxgiFormat: number;
        /**
         * 纹理格式 例如 UNSIGNED_INT, FLOAT
         */
        textureType: number;
        /** compressedTexImage2D 时 传入 内部格式 */
        internalformat: number;
        /**
         * blockBytes
         */
        blockBytes: number;
        /**
         * dataOffset
         */
        dataOffset: number;
    }
}