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
namespace m4m.render {
    export class shaderUniform {
        static texindex: number = 0;
        static applyuniformFunc: { [type: number]: (location, value) => void } = {};
        static webgl: WebGL2RenderingContext;
        static initApplyUnifmFunc() {
            this.applyuniformFunc[UniformTypeEnum.Float] = (location, value) => {//float
                this.webgl.uniform1f(location, value);
            };
            this.applyuniformFunc[UniformTypeEnum.Int] = (location, value) => {//int
                this.webgl.uniform1i(location, value);
            };
            this.applyuniformFunc[UniformTypeEnum.Floatv] = (location, value) => {//Float32Array
                this.webgl.uniform1fv(location, value);
            };
            this.applyuniformFunc[UniformTypeEnum.Float4] = (location, value) => {//vector4
                this.webgl.uniform4f(location, value.x, value.y, value.z, value.w);
            };

            this.applyuniformFunc[UniformTypeEnum.Float4v] = (location, value) => {//Float32Array
                this.webgl.uniform4fv(location, value);
            };

            this.applyuniformFunc[UniformTypeEnum.Float4x4] = (location, value) => {//matrix
                this.webgl.uniformMatrix4fv(location, false, value.rawData);
            };

            this.applyuniformFunc[UniformTypeEnum.Float4x4v] = (location, value) => {//Float32Array
                this.webgl.uniformMatrix4fv(location, false, value);
            };
            this.applyuniformFunc[UniformTypeEnum.Texture] = (location, value) => {//texture

                var tex = value.glTexture.texture;
                this.webgl.activeTexture(render.webglkit.GetTextureNumber(this.texindex));
                this.webgl.bindTexture(this.webgl.TEXTURE_2D, tex);
                this.webgl.uniform1i(location, this.texindex);
                this.texindex++;
            };
            this.applyuniformFunc[UniformTypeEnum.CubeTexture] = (location, value) => {//cubetexture
                var tex = value.glTexture.texture;
                this.webgl.activeTexture(render.webglkit.GetTextureNumber(this.texindex));
                this.webgl.bindTexture(this.webgl.TEXTURE_CUBE_MAP, tex);
                this.webgl.uniform1i(location, this.texindex);
                this.texindex++;
            };
        }
    }
}