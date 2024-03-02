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
interface WebGL2RenderingContext {
    /**
     * 扩展
     */
    extensions: m4m.framework.GLExtension;
}

namespace m4m.framework {
    /**
     * GL扩展
     * 
     * @author feng3d
     */
    export class GLExtension {
        EXT_color_buffer_half_float: any;
        EXT_texture_filter_anisotropic: EXT_texture_filter_anisotropic;
        OES_texture_half_float_linear: OES_texture_half_float_linear;
        EXT_color_buffer_float: any;
        WEBGL_compressed_texture_etc: any;
        WEBGL_compressed_texture_etc1: any;
        WEBGL_compressed_texture_pvrtc: any;
        WEBGL_compressed_texture_astc: WEBGL_compressed_texture_astc;
        WEBGL_compressed_texture_s3tc: WEBGL_compressed_texture_s3tc;
        WEBGL_compressed_texture_s3tc_srgb: WEBGL_compressed_texture_s3tc_srgb;
        WEBGL_debug_renderer_info: WEBGL_debug_renderer_info;
        WEBGL_debug_shaders: WEBGL_debug_shaders;
        WEBGL_lose_context: any;
        /**
         * 引擎 webgl 拓展管理 
         * @param gl webgl 上下文
         */
        constructor(gl: WebGL2RenderingContext) {
            gl.extensions = this;

            this.initExtensions(gl);
            this.cacheGLQuery(gl);

            // //webgl拓展兼容,加宏标记
            // if (this.EXT_shader_texture_lod != null)
            // {
            //     sceneMgr.app.globalMacros.push('TEXTURE_LOD');
            // }
        }

        /**
         * 初始化 webgl 拓展绑定
         * @param gl 
         */
        private initExtensions(gl: WebGL2RenderingContext) {
            this.EXT_color_buffer_half_float = gl.getExtension("EXT_color_buffer_half_float");
            this.EXT_texture_filter_anisotropic = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('MOZ_EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
            // this.OES_texture_float_linear = gl.getExtension("OES_texture_float_linear");
            this.OES_texture_half_float_linear = gl.getExtension("OES_texture_half_float_linear");
            this.EXT_color_buffer_float = gl.getExtension("EXT_color_buffer_float");
            this.WEBGL_compressed_texture_etc = gl.getExtension("WEBGL_compressed_texture_etc");
            this.WEBGL_compressed_texture_etc1 = gl.getExtension("WEBGL_compressed_texture_etc1");
            this.WEBGL_compressed_texture_pvrtc = gl.getExtension('WEBGL_compressed_texture_pvrtc') || gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
            this.WEBGL_compressed_texture_s3tc = gl.getExtension('WEBGL_compressed_texture_s3tc') || gl.getExtension('MOZ_WEBGL_compressed_texture_s3tc') || gl.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc');
            this.WEBGL_compressed_texture_s3tc_srgb = gl.getExtension('WEBGL_compressed_texture_s3tc_srgb');
            this.WEBGL_compressed_texture_astc = gl.getExtension('WEBGL_compressed_texture_astc');
            this.WEBGL_debug_renderer_info = gl.getExtension("WEBGL_debug_renderer_info");
            this.WEBGL_debug_shaders = gl.getExtension("WEBGL_debug_shaders");
            this.WEBGL_lose_context = gl.getExtension("WEBGL_lose_context") || gl.getExtension("WEBKIT_WEBGL_lose_context") || gl.getExtension("MOZ_WEBGL_lose_context");
        }

        /**
         * 缓存GL查询
         * @param gl GL实例
         */
        private cacheGLQuery(gl: WebGL2RenderingContext) {
            var oldGetExtension = gl.getExtension;
            gl.getExtension = function (name: string) {
                gl.extensions[name] = gl.extensions[name] || oldGetExtension.apply(gl, arguments);
                return gl.extensions[name];
            }
        }
    }
}