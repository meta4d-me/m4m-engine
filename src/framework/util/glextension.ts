/**
@license
Copyright 2022 meta4d.me Authors

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
interface WebGLRenderingContext
{
    /**
     * 扩展
     */
    extensions: m4m.framework.GLExtension;

    /**
     * The WebGL2RenderingContext.vertexAttribDivisor() method of the WebGL 2 API modifies the rate at which generic vertex attributes advance when rendering multiple instances of primitives with gl.drawArraysInstanced() and gl.drawElementsInstanced().
     * 
     * WebGL2 API的WebGL2RenderingContext.vertexAttribDivisor()方法在使用gl. drawarraysinstated()和gl. drawelementsinstated()呈现多个原语实例时，修改了通用顶点属性的提升速度。
     * 
     * @param index A GLuint specifying the index of the generic vertex attributes. 指定一般顶点属性的索引的GLuint。
     * @param divisor 指定将在通用属性的更新之间传递的实例数的GLuint。
     * 
     * @see WebGL2RenderingContextBase.vertexAttribDivisor
     * @see ANGLE_instanced_arrays.vertexAttribDivisorANGLE
     * @see https://developer.mozilla.org/zh-CN/docs/Web/API/WebGL2RenderingContext/vertexAttribDivisor
     */
    vertexAttribDivisor(index: GLuint, divisor: GLuint): void;

    /**
     * The WebGL2RenderingContext.drawElementsInstanced() method of the WebGL 2 API renders primitives from array data like the gl.drawElements() method. In addition, it can execute multiple instances of a set of elements.
     * 
     * WebGL2 API的webgl2renderingcontext . drawelementsinstance()方法呈现来自数组数据的原语，如gl.drawElements()方法。此外，它可以执行一组元素的多个实例。
     * 
     * @param mode A GLenum specifying the type primitive to render. 指定要呈现的类型基元的GLenum。
     * @param count A GLsizei specifying the number of elements to be rendered. 指定要呈现的元素数量的GLsizei。
     * @param type A GLenum specifying the type of the values in the element array buffer. 指定元素数组缓冲区中值的类型的GLenum。 
     * @param offset A GLintptr specifying an offset in the element array buffer. Must be a valid multiple of the size of the given type. 指定元素数组缓冲区中的偏移量的GLintptr。必须是给定类型大小的有效倍数。
     * @param instanceCount A GLsizei specifying the number of instances of the set of elements to execute. 指定要执行的元素集的实例数的GLsizei。
     * 
     * @see WebGL2RenderingContextBase.drawElementsInstanced
     */
    drawElementsInstanced(mode: GLenum, count: GLsizei, type: GLenum, offset: GLintptr, instanceCount: GLsizei): void;

    /**
     * The WebGL2RenderingContext.drawArraysInstanced() method of the WebGL 2 API renders primitives from array data like the gl.drawArrays() method. In addition, it can execute multiple instances of the range of elements.
     * 
     * WebGL2 API的webgl2renderingcontext . drawarraysinstance()方法呈现来自数组数据的原语，比如gl.drawArrays()方法。此外，它可以执行元素范围的多个实例。
     * 
     * @param mode A GLenum specifying the type primitive to render. 指定要呈现的类型基元的GLenum。
     * @param first A GLint specifying the starting index in the array of vector points. 在向量点数组中指定起始索引的位置。
     * @param count A GLsizei specifying the number of indices to be rendered. 指定要呈现的索引数量的GLsizei。
     * @param instanceCount A GLsizei specifying the number of instances of the range of elements to execute. 指定要执行的元素集的实例数的GLsizei。
     */
    drawArraysInstanced(mode: GLenum, first: GLint, count: GLsizei, instanceCount: GLsizei): void;
}

namespace m4m.framework
{
    /**
     * GL扩展
     * 
     * @author feng3d
     */
    export class GLExtension
    {
        ANGLE_instanced_arrays: ANGLE_instanced_arrays;
        EXT_blend_minmax: EXT_blend_minmax;
        EXT_color_buffer_half_float: any;
        EXT_frag_depth: EXT_frag_depth;
        EXT_sRGB: EXT_sRGB;
        EXT_shader_texture_lod: EXT_shader_texture_lod;
        EXT_texture_filter_anisotropic: EXT_texture_filter_anisotropic;
        OES_element_index_uint: OES_element_index_uint;
        OES_standard_derivatives: OES_standard_derivatives;
        OES_texture_float: OES_texture_float;
        OES_texture_float_linear: OES_texture_float_linear;
        OES_texture_half_float: OES_texture_half_float;
        OES_texture_half_float_linear: OES_texture_half_float_linear;
        OES_vertex_array_object: OES_vertex_array_object;
        WEBGL_color_buffer_float: WEBGL_color_buffer_float;
        WEBGL_compressed_texture_atc: any;
        WEBGL_compressed_texture_etc1: any;
        WEBGL_compressed_texture_pvrtc: any;
        WEBGL_compressed_texture_s3tc: WEBGL_compressed_texture_s3tc;
        WEBGL_debug_renderer_info: WEBGL_debug_renderer_info;
        WEBGL_debug_shaders: WEBGL_debug_shaders;
        WEBGL_depth_texture: WEBGL_depth_texture;
        WEBGL_draw_buffers: WEBGL_draw_buffers;
        WEBGL_lose_context: any;

        constructor(gl: WebGLRenderingContext)
        {
            gl.extensions = this;

            this.initExtensions(gl);
            this.cacheGLQuery(gl);
            this.wrap(gl);

            //webgl拓展兼容,加宏标记
            if (this.EXT_shader_texture_lod != null)
            {
                sceneMgr.app.globalMacros.push('TEXTURE_LOD');
            }
        }

        private initExtensions(gl: WebGLRenderingContext)
        {
            this.ANGLE_instanced_arrays = gl.getExtension("ANGLE_instanced_arrays");
            this.EXT_blend_minmax = gl.getExtension("EXT_blend_minmax");
            this.EXT_color_buffer_half_float = gl.getExtension("EXT_color_buffer_half_float");
            this.EXT_frag_depth = gl.getExtension("EXT_frag_depth");
            this.EXT_sRGB = gl.getExtension("EXT_sRGB");
            this.EXT_shader_texture_lod = gl.getExtension("EXT_shader_texture_lod");
            this.EXT_texture_filter_anisotropic = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('MOZ_EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
            this.OES_element_index_uint = gl.getExtension("OES_element_index_uint");
            this.OES_standard_derivatives = gl.getExtension("OES_standard_derivatives");
            this.OES_texture_float = gl.getExtension("OES_texture_float");
            this.OES_texture_float_linear = gl.getExtension("OES_texture_float_linear");
            this.OES_texture_half_float = gl.getExtension("OES_texture_half_float");
            this.OES_texture_half_float_linear = gl.getExtension("OES_texture_half_float_linear");
            this.OES_vertex_array_object = gl.getExtension("OES_vertex_array_object");
            this.WEBGL_color_buffer_float = gl.getExtension("WEBGL_color_buffer_float");
            this.WEBGL_compressed_texture_atc = gl.getExtension("WEBGL_compressed_texture_atc") || gl.getExtension("WEBKIT_WEBGL_compressed_texture_atc");
            this.WEBGL_compressed_texture_etc1 = gl.getExtension("WEBGL_compressed_texture_etc1");
            this.WEBGL_compressed_texture_pvrtc = gl.getExtension('WEBGL_compressed_texture_pvrtc') || gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
            this.WEBGL_compressed_texture_s3tc = gl.getExtension('WEBGL_compressed_texture_s3tc') || gl.getExtension('MOZ_WEBGL_compressed_texture_s3tc') || gl.getExtension('WEBKIT_WEBGL_compressed_texture_s3tc');
            this.WEBGL_debug_renderer_info = gl.getExtension("WEBGL_debug_renderer_info");
            this.WEBGL_debug_shaders = gl.getExtension("WEBGL_debug_shaders");
            this.WEBGL_depth_texture = gl.getExtension('WEBGL_depth_texture') || gl.getExtension('MOZ_WEBGL_depth_texture') || gl.getExtension('WEBKIT_WEBGL_depth_texture');
            this.WEBGL_draw_buffers = gl.getExtension("WEBGL_draw_buffers");
            this.WEBGL_lose_context = gl.getExtension("WEBGL_lose_context") || gl.getExtension("WEBKIT_WEBGL_lose_context") || gl.getExtension("MOZ_WEBGL_lose_context");
        }

        /**
         * 缓存GL查询
         * @param gl GL实例
         */
        private cacheGLQuery(gl: WebGLRenderingContext)
        {
            var oldGetExtension = gl.getExtension;
            gl.getExtension = function (name: string)
            {
                gl.extensions[name] = gl.extensions[name] || oldGetExtension.apply(gl, arguments);
                return gl.extensions[name];
            }
        }

        private wrap(gl: WebGLRenderingContext)
        {
            //
            if (!gl.vertexAttribDivisor)
            {
                gl.vertexAttribDivisor = (index, divisor) =>
                {
                    if (gl.extensions.ANGLE_instanced_arrays)
                    {
                        gl.extensions.ANGLE_instanced_arrays.vertexAttribDivisorANGLE(index, divisor);
                    } else
                    {
                        console.warn(`浏览器 不支持 drawElementsInstanced ！`);
                    }
                }
            }
            if (!gl.drawElementsInstanced)
            {
                gl.drawElementsInstanced = (mode, count, type, offset, instanceCount) =>
                {
                    if (gl.extensions.ANGLE_instanced_arrays)
                    {
                        gl.extensions.ANGLE_instanced_arrays.drawElementsInstancedANGLE(mode, count, type, offset, instanceCount);
                    } else
                    {
                        console.warn(`浏览器 不支持 drawElementsInstanced ！`);
                    }
                }
            }
            if (!gl.drawArraysInstanced)
            {
                gl.drawArraysInstanced = (mode, first, count, instanceCount) =>
                {
                    if (gl.extensions.ANGLE_instanced_arrays)
                    {
                        gl.extensions.ANGLE_instanced_arrays.drawArraysInstancedANGLE(mode, first, count, instanceCount);
                    } else
                    {
                        console.warn(`浏览器 不支持 drawArraysInstanced ！`);
                    }
                }
            }
        }
    }
}