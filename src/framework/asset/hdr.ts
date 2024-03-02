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
class HdrParser
{
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 解析hdr图片
     * @param raw 图片二进制数据
     * @version m4m 1.0
     */
    public textDecoder = new TextDecoder();
    /**
     * hdr 纹理解析器
     * @param gl webgl上下文
     */
    constructor(private gl: WebGL2RenderingContext) {
    }

    /**
     * 解析 RGBE
     * @param raw 二进制数据
     * @returns 
     */
    public parseRGBE(raw: ArrayBuffer)
    {
        const data = new Uint8Array(raw);
        let p = 0;
        while(!(data[p] === 0x0A && data[p+1] === 0x0A))
            p++;

        const info = this.textDecoder.decode(data.subarray(0, p)).split('\n');
        if (info[0] !== '#?RADIANCE') {
            console.warn('unexpected magic number');
        }

        const size_base = p += 2;

        while(data[++p] !== 0x0A);

        const [, height, , width] = this.textDecoder.decode(data.subarray(size_base, p)).split(' ').map(e => Number(e));
        const total = height * width;
        const rgbeData = data.subarray(p + 1);

        // allocate memory for uncompressed data
        const buffer = new Uint8Array(total * 4);

        let ptr = 0;
        if (total * 4 !== rgbeData.length) {
            // RLE
            for(let y = 0; y < height; y++) {
                const flag = rgbeData.subarray(ptr, ptr += 4);
                if (flag.slice(0, 2).every(e => e === 0x02)) {
                    const scanline_buf = new Array(4).fill(0)
                        .map(() => new Uint8Array(width))
                        .map(line => {
                            let lp = 0;
                            while (lp < width)
                            {
                                let count = 0;
                                let data = rgbeData.subarray(ptr, ptr += 2);
                                if (data[0] > 128)
                                {
                                    count = data[0] - 128;
                                    while (count--)
                                    {
                                        line[lp++] = data[1];
                                    }
                                } else
                                {
                                    count = data[0] - 1;
                                    line[lp++] = data[1];
                                    while (count--)
                                    {
                                        line[lp++] = rgbeData.subarray(ptr, ++ptr)[0];
                                    }
                                }
                            }
                            return line;
                        });

                    for (let x = 0; x < width; x++)
                    {
                        const pixel = buffer.subarray((y * width + x) * 4, (y * width + (x + 1)) * 4);
                        pixel.forEach((_, i) => pixel[i] = scanline_buf[i][x]);
                    }
                }
            }
        } else {
            for (let x = 0; x < total; x++)
            {
                const rgbe = rgbeData.subarray(x * 4, (x + 1) * 4);
                const pixel = buffer.subarray(x * 4, (x + 1) * 4);
                pixel.forEach((_, i) => pixel[i] = rgbe[i]);
            }
        }

        return {
            width, height, buffer,
        }
    }

    /**
     * 获取纹理对象
     * @param raw 二进制数据
     * @returns 纹理对象
     */
    get2DTexture(raw: ArrayBuffer) {
        const { width, height, buffer } = this.parseRGBE(raw);
        var t2d = new m4m.render.glTexture2D(this.gl);
        t2d.width = width;
        t2d.height = height;
        t2d.format = m4m.render.TextureFormatEnum.RGBA;

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, t2d.texture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 0);//不对Y翻转
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);//对齐方式
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, buffer);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        return t2d;
    }

}
