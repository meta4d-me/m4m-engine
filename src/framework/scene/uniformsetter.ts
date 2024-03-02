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
    export class uniformSetter
    {
        static autoUniformDic:{[name:string]:(context: renderContext)=>any}={};
        /**
         * 初始化自动 默认 uniform 数据
         */
        static initAutouniform()
        {
            this.autoUniformDic["glstate_matrix_model"]=(context: renderContext)=>{
                return context.matrixModel;
            };
            this.autoUniformDic["glstate_matrix_world2object"]=(context: renderContext)=>{
                return context.matrixWorld2Object;
            };
            this.autoUniformDic["glstate_matrix_view"]=(context: renderContext)=>{
                return context.matrixView;
            };
            this.autoUniformDic["glstate_matrix_project"]=(context: renderContext)=>{
                return context.matrixProject;
            };
            this.autoUniformDic["glstate_matrix_modelview"]=(context: renderContext)=>{
                return context.matrixModelView;
            };
            this.autoUniformDic["glstate_matrix_it_modelview"]=(context: renderContext)=>{
                return context.matrixInverseModelView;
            };
            this.autoUniformDic["glstate_matrix_viewproject"]=(context: renderContext)=>{
                return context.matrixViewProject;
            };
            this.autoUniformDic["glstate_matrix_mvp"]=(context: renderContext)=>{
                return context.matrixModelViewProject;
            };
            this.autoUniformDic["glstate_timer"]=(context: renderContext)=>{
                return context.floatTimer;
            };
            this.autoUniformDic["glstate_lightcount"]=(context: renderContext)=>{
                return context.intLightCount;
            };
            this.autoUniformDic["glstate_vec4_lightposs"]=(context: renderContext)=>{
                return context.vec4LightPos;
            };
            this.autoUniformDic["glstate_vec4_lightdirs"]=(context: renderContext)=>{
                return context.vec4LightDir;
            };
            this.autoUniformDic["glstate_vec4_lightcolors"]=(context: renderContext)=>{
                return context.vec4LightColor;
            };
            this.autoUniformDic["glstate_float_lightrange"]=(context: renderContext)=>{
                return context.floatLightRange;
            };
            this.autoUniformDic["glstate_float_lightintensity"]=(context: renderContext)=>{
                return context.floatLightIntensity;
            };
            this.autoUniformDic["glstate_float_spotangelcoss"]=(context: renderContext)=>{
                return context.floatLightSpotAngleCos;
            };
            this.autoUniformDic["glstate_eyepos"]=(context: renderContext)=>{
                return context.eyePos;
            };
            this.autoUniformDic["_LightmapTex"]=(context: renderContext)=>{
                return context.lightmap;
            };
            this.autoUniformDic["_LightmapTex_01"]=(context: renderContext)=>{
                return context.lightmap_01;
            };
            this.autoUniformDic["glstate_lightmapOffset"]=(context: renderContext)=>{
                return context.lightmapOffset;
            };
            this.autoUniformDic["glstate_lightmapUV"]=(context: renderContext)=>{
                return context.lightmapUV;
            };
            this.autoUniformDic["glstate_lightmapRGBAF16"]=(context: renderContext)=>{
                return context.lightmapRGBAF16;
            };
            this.autoUniformDic["glstate_fog_start"]=(context: renderContext)=>{
                return context.fog._Start;
            };
            this.autoUniformDic["glstate_fog_end"]=(context: renderContext)=>{
                return context.fog._End;
            };
            this.autoUniformDic["glstate_fog_color"]=(context: renderContext)=>{
                return context.fog._Color;
            };
            this.autoUniformDic["glstate_vec4_bones"]=(context: renderContext)=>{
                return context.vec4_bones;
            };
            this.autoUniformDic["glstate_matrix_bones"]=(context: renderContext)=>{
                return context.matrix_bones;
            };
        }
    }
}