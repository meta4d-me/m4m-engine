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
     * for description see https://www.khronos.org/opengles/sdk/tools/KTX/
     * for file layout see https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/
     *
     * ported from https://github.com/BabylonJS/Babylon.js/blob/master/src/Misc/khronosTextureContainer.ts
     */
    export class KTXParse
    {
        private static HEADER_LEN = 12 + (13 * 4); // identifier + header elements (not including key value meta-data pairs)

        /**
         * 
         * @param gl 
         * @param arrayBuffer contents of the KTX container file
         * @param facesExpected should be either 1 or 6, based whether a cube texture or or
         */
        static parse(gl: WebGL2RenderingContext, arrayBuffer: ArrayBuffer, facesExpected = 1, loadMipmaps = true): m4m.render.glTexture2D
        {
            // Test that it is a ktx formatted file, based on the first 12 bytes, character representation is:
            // '´', 'K', 'T', 'X', ' ', '1', '1', 'ª', '\r', '\n', '\x1A', '\n'
            // 0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A
            var identifier = new Uint8Array(arrayBuffer, 0, 12);
            if (identifier[0] !== 0xAB ||
                identifier[1] !== 0x4B ||
                identifier[2] !== 0x54 ||
                identifier[3] !== 0x58 ||
                identifier[4] !== 0x20 ||
                identifier[5] !== 0x31 ||
                identifier[6] !== 0x31 ||
                identifier[7] !== 0xBB ||
                identifier[8] !== 0x0D ||
                identifier[9] !== 0x0A ||
                identifier[10] !== 0x1A ||
                identifier[11] !== 0x0A)
            {
                console.error('texture missing KTX identifier');
                return;
            }

            // gl.getExtension('WEBGL_compressed_texture_etc1');
            let ext = gl.extensions.WEBGL_compressed_texture_etc1;
            if (!ext) {
                console.error(`当前环境 不支持 ETC 压缩纹理`);
                return;
            }


            // load the reset of the header in native 32 bit uint
            var dataSize = Uint32Array.BYTES_PER_ELEMENT;
            var headerDataView = new DataView(arrayBuffer, 12, 13 * dataSize);
            var endianness = headerDataView.getUint32(0, true);
            var littleEndian = endianness === 0x04030201;

            var glType = headerDataView.getUint32(1 * dataSize, littleEndian); // must be 0 for compressed textures
            var glTypeSize = headerDataView.getUint32(2 * dataSize, littleEndian); // must be 1 for compressed textures
            var glFormat = headerDataView.getUint32(3 * dataSize, littleEndian); // must be 0 for compressed textures
            var glInternalFormat = headerDataView.getUint32(4 * dataSize, littleEndian); // the value of arg passed to gl.compressedTexImage2D(,,x,,,,)
            var glBaseInternalFormat = headerDataView.getUint32(5 * dataSize, littleEndian); // specify GL_RGB, GL_RGBA, GL_ALPHA, etc (un-compressed only)
            var pixelWidth = headerDataView.getUint32(6 * dataSize, littleEndian); // level 0 value of arg passed to gl.compressedTexImage2D(,,,x,,,)
            var pixelHeight = headerDataView.getUint32(7 * dataSize, littleEndian); // level 0 value of arg passed to gl.compressedTexImage2D(,,,,x,,)
            var pixelDepth = headerDataView.getUint32(8 * dataSize, littleEndian); // level 0 value of arg passed to gl.compressedTexImage3D(,,,,,x,,)
            var numberOfArrayElements = headerDataView.getUint32(9 * dataSize, littleEndian); // used for texture arrays
            var numberOfFaces = headerDataView.getUint32(10 * dataSize, littleEndian); // used for cubemap textures, should either be 1 or 6
            var numberOfMipmapLevels = headerDataView.getUint32(11 * dataSize, littleEndian); // number of levels; disregard possibility of 0 for compressed textures
            var bytesOfKeyValueData = headerDataView.getUint32(12 * dataSize, littleEndian); // the amount of space after the header for meta-data

            // Make sure we have a compressed type.  Not only reduces work, but probably better to let dev know they are not compressing.
            if (glType !== 0)
            {
                console.warn('only compressed formats currently supported');
                return null;
            } else
            {
                // value of zero is an indication to generate mipmaps @ runtime.  Not usually allowed for compressed, so disregard.
                numberOfMipmapLevels = Math.max(1, numberOfMipmapLevels);
            }
            if (pixelHeight === 0 || pixelDepth !== 0)
            {
                console.warn('only 2D textures currently supported');
                return null;
            }
            if (numberOfArrayElements !== 0)
            {
                console.warn('texture arrays not currently supported');
                return null;
            }
            if (numberOfFaces !== facesExpected)
            {
                console.warn('number of faces expected' + facesExpected + ', but found ' + numberOfFaces);
                return null;
            }

            // 初始化纹理
            var t2d = new m4m.render.glTexture2D(gl);
            t2d.height = pixelHeight;
            t2d.width = pixelWidth;
            t2d.format = m4m.render.TextureFormatEnum.KTX;

            var target = gl.TEXTURE_2D;

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(target, t2d.texture);

            // initialize width & height for level 1
            var dataOffset = KTXParse.HEADER_LEN + bytesOfKeyValueData;
            var width = pixelWidth;
            var height = pixelHeight;
            var mipmapCount = loadMipmaps ? numberOfMipmapLevels : 1;

            for (var level = 0; level < mipmapCount; level++)
            {
                var imageSize = new Int32Array(arrayBuffer, dataOffset, 1)[0]; // size per face, since not supporting array cubemaps
                dataOffset += 4; // size of the image + 4 for the imageSize field

                for (var face = 0; face < numberOfFaces; face++)
                {
                    var byteArray = new Uint8Array(arrayBuffer, dataOffset, imageSize);

                    gl.compressedTexImage2D(target, level, glInternalFormat, width, height, 0, byteArray);

                    dataOffset += imageSize;
                    dataOffset += 3 - ((imageSize + 3) % 4); // add padding for odd sized image

                }
                width = Math.max(1.0, width * 0.5);
                height = Math.max(1.0, height * 0.5);
            }

            if (mipmapCount > 1)
            {
                gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            } else
            {
                gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
            return t2d;
        }
    }
}