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
    export class defShader {

        static vscode: string = `#version 300 es
            precision mediump float;

            layout(location = 0) in vec3 _glesVertex;
            layout(location = 3) in vec4 _glesColor;
            layout(location = 4) in vec4 _glesMultiTexCoord0;
            uniform highp mat4 glstate_matrix_mvp;
            out lowp vec4 xlv_COLOR;
            out highp vec2 xlv_TEXCOORD0;
            void main()
            {
                highp vec4 tmpvar_1;
                tmpvar_1.w = 1.0;
                tmpvar_1.xyz = _glesVertex.xyz;
                xlv_COLOR = _glesColor;
                xlv_TEXCOORD0 = _glesMultiTexCoord0.xy;
                gl_Position = (glstate_matrix_mvp * tmpvar_1);
            }
        `;

        static fscode: string = `#version 300 es
            precision mediump float;

            uniform sampler2D _MainTex;
            in lowp vec4 xlv_COLOR;
            in highp vec2 xlv_TEXCOORD0;
            out vec4 color;
            void main()
            {
                lowp vec4 col_1;
                mediump vec4 prev_2;
                lowp vec4 tmpvar_3;
                tmpvar_3 = (xlv_COLOR * texture(_MainTex, xlv_TEXCOORD0));
                prev_2 = tmpvar_3;
                mediump vec4 tmpvar_4;
                tmpvar_4 = mix(vec4(1.0, 1.0, 1.0, 1.0), prev_2, prev_2.wwww);
                col_1 = tmpvar_4;
                col_1.x =xlv_TEXCOORD0.x;
                col_1.y =xlv_TEXCOORD0.y;
                color = col_1;
            }
        `;

        static fscode2: string = `#version 300 es
            precision mediump float;

            out vec4 color;
            void main()
            {
                color = vec4(1.0, 1.0, 1.0, 1.0);
            }
        `;
        //----------------------------------------UI-------------------------
        static uishader: string = `{
                "properties": [
                "_MainTex('MainTex',Texture)='white'{}",
                "_MaskTex('MaskTex',Texture)='white'{}"
                ]
            }
        `;

        static fscodeUI: string = `#version 300 es
            precision mediump float;

            uniform sampler2D _MainTex;
            in lowp vec4 xlv_COLOR;
            in highp vec2 xlv_TEXCOORD0;
            out vec4 color;
            void main()
            {
                lowp vec4 tmpvar_3;
                tmpvar_3 = (xlv_COLOR * texture(_MainTex, xlv_TEXCOORD0));
                color = tmpvar_3;
            }
            `;
        static vscodeUI: string = `#version 300 es
            precision mediump float;

            layout(location = 0) in vec3 _glesVertex;    
            layout(location = 3) in vec4 _glesColor;                   
            layout(location = 4) in vec4 _glesMultiTexCoord0;          
            uniform highp mat4 glstate_matrix_mvp;       
            out lowp vec4 xlv_COLOR;                 
            out highp vec2 xlv_TEXCOORD0;            
            void main()                                      
            {                                                
                highp vec4 tmpvar_1;                         
                tmpvar_1.w = 1.0;                            
                tmpvar_1.xyz = _glesVertex.xyz;              
                xlv_COLOR = _glesColor;                      
                xlv_TEXCOORD0 = vec2(_glesMultiTexCoord0.x,1.0-_glesMultiTexCoord0.y);      
                gl_Position = (glstate_matrix_mvp * tmpvar_1);   
            }
        `;
        static vscodeMaskUI: string = `#version 300 es
            precision mediump float;

            layout(location = 0) in vec3 _glesVertex;    
            layout(location = 3) in vec4 _glesColor;                   
            layout(location = 4) in vec4 _glesMultiTexCoord0;          
            uniform highp mat4 glstate_matrix_mvp;       
            out lowp vec4 xlv_COLOR;                 
            out highp vec2 xlv_TEXCOORD0;            
            out highp vec2 mask_TEXCOORD;            
            void main()                                      
            {                                                
                highp vec4 tmpvar_1;                         
                tmpvar_1.w = 1.0;                            
                tmpvar_1.xyz = _glesVertex.xyz;              
                xlv_COLOR = _glesColor;                      
                xlv_TEXCOORD0 = vec2(_glesMultiTexCoord0.x,1.0-_glesMultiTexCoord0.y);      
                mask_TEXCOORD.x = (_glesVertex.x - 1.0)/-2.0; 
                mask_TEXCOORD.y = (_glesVertex.y - 1.0)/-2.0; 
                gl_Position = (glstate_matrix_mvp * tmpvar_1);   
            }
        `;

        static fscodeMaskUI: string = `#version 300 es
            precision mediump float;

            uniform sampler2D _MainTex;                                                  
            uniform highp vec4 _maskRect;                                                  
            in lowp vec4 xlv_COLOR;                                                  
            in highp vec2 xlv_TEXCOORD0;    
            in highp vec2 mask_TEXCOORD;            
            bool CalcuCut(){    
                highp float l; 
                highp float t; 
                highp float r; 
                highp float b; 
                highp vec2 texc1; 
                bool beCut; 
                l = _maskRect.x; 
                t = _maskRect.y; 
                r = _maskRect.z + l; 
                b = _maskRect.w + t; 
                texc1 = mask_TEXCOORD; 
                if(texc1.x >(1.0 - l) || texc1.x <(1.0 - r) || texc1.y <t || texc1.y>b){  
                    beCut = true;  
                }else{ 
                    beCut = false; 
                } 
                return beCut; 
            } 
                
            out vec4 color;
            void main()  
            { 
                if(CalcuCut()) discard; 
                lowp vec4 tmpvar_3; 
                tmpvar_3 = (xlv_COLOR * texture(_MainTex, xlv_TEXCOORD0)); 
                color = tmpvar_3 ; 
            } 
        `;
        static shaderuifront: string = `{
                "properties": [
                "_MainTex('MainTex',Texture)='white'{}"
                ]
            }`;

        static vscodefontUI: string = `#version 300 es
            precision mediump float;

            layout(location = 0) in vec3 _glesVertex;    
            layout(location = 3) in vec4 _glesColor;                   
            layout(location = 8) in vec4 _glesColorEx;                   
            layout(location = 4) in vec4 _glesMultiTexCoord0;          
            uniform highp mat4 glstate_matrix_mvp;       
            out lowp vec4 xlv_COLOR;                 
            out lowp vec4 xlv_COLOREx;                                                  
            out highp vec2 xlv_TEXCOORD0;            
            void main()                                      
            {                                                
                highp vec4 tmpvar_1;                         
                tmpvar_1.w = 1.0;                            
                tmpvar_1.xyz = _glesVertex.xyz;              
                xlv_COLOR = _glesColor;                      
                xlv_COLOREx = _glesColorEx;                      
                xlv_TEXCOORD0 = vec2(_glesMultiTexCoord0.x,1.0-_glesMultiTexCoord0.y);      
                gl_Position = (glstate_matrix_mvp * tmpvar_1);   
            }
        `;

        // 根据 https://zhuanlan.zhihu.com/p/26217154 文章进行修改的shader
        static fscodefontUI: string = `#version 300 es
            precision mediump float ; 
            uniform sampler2D _MainTex; 

            uniform highp float _outlineWidth; // 描边宽度

            in lowp vec4 xlv_COLOR; // 字体颜色
            in lowp vec4 xlv_COLOREx; // 描边颜色
            in highp vec2 xlv_TEXCOORD0;     
            out vec4 color;
            void main()   
            {  
                // 在m4m中使用的sdf字体做了最大值为2像素的有向距离运算且保存到位图上。
                // 颜色值[0,255]对于区间[-2,2]。
                // 颜色值v表示距离字符边缘有 (v/255*4-2) 单位距离。单位距离为正表示在字符内，否则在字符外。
                
                float _DistanceMark = 0.0; // 距离为 0 处是字符边缘
                float _SmoothDelta = 0.5; // 在字符边缘 0.5 像素进行插值 

                float _OutlineDistanceMark = -_outlineWidth; // 描边位置

                vec4 col = texture(_MainTex, xlv_TEXCOORD0);
                float distance = col.r * 4.0 - 2.0;

                // 平滑字体边缘
                col.a = smoothstep(_DistanceMark - _SmoothDelta, _DistanceMark + _SmoothDelta, distance);
                // 不平滑 相当于 _SmoothDelta = 0
                // if (distance < _DistanceMark)
                //     col.a = 0.0;
                // else
                //     col.a = 1.0;

                col.rgb = xlv_COLOR.rgb;
            
                // Outlining 描边
                vec4 outlineCol = vec4(1.0,1.0,1.0,1.0);

                outlineCol.a = smoothstep(_OutlineDistanceMark - _outlineWidth, _OutlineDistanceMark + _outlineWidth, distance);
                outlineCol.rgb = xlv_COLOREx.rgb;
                outlineCol.a = outlineCol.a * xlv_COLOREx.a;
                
                // 混合字体与描边颜色
                col = mix(outlineCol, col, col.a);

                col.a = col.a * xlv_COLOR.a;
                
                // 设置最终值
                color = col;
        }`;

        static vscodeuifontmask: string = `#version 300 es
            precision mediump float;

            layout(location = 0) in vec3 _glesVertex;    
            layout(location = 3) in vec4 _glesColor;                   
            layout(location = 8) in vec4 _glesColorEx;                   
            layout(location = 4) in vec4 _glesMultiTexCoord0;          
            uniform highp mat4 glstate_matrix_mvp;       
            out lowp vec4 xlv_COLOR;                 
            out lowp vec4 xlv_COLOREx;                                                  
            out highp vec2 xlv_TEXCOORD0;            
            out highp vec2 mask_TEXCOORD;            
            void main()                                      
            {                                                
                highp vec4 tmpvar_1;                         
                tmpvar_1.w = 1.0;                            
                tmpvar_1.xyz = _glesVertex.xyz;              
                xlv_COLOR = _glesColor;                      
                xlv_COLOREx = _glesColorEx;                      
                xlv_TEXCOORD0 = vec2(_glesMultiTexCoord0.x,1.0-_glesMultiTexCoord0.y);      
                mask_TEXCOORD.x = (_glesVertex.x - 1.0)/-2.0; 
                mask_TEXCOORD.y = (_glesVertex.y - 1.0)/-2.0; 
                gl_Position = (glstate_matrix_mvp * tmpvar_1);   
            }`;

        static fscodeuifontmask: string = `#version 300 es
            precision mediump float; 
            uniform sampler2D _MainTex;   
            uniform highp vec4 _maskRect;        
            in lowp vec4 xlv_COLOR;  
            in lowp vec4 xlv_COLOREx;  
            in highp vec2 xlv_TEXCOORD0;     
            in highp vec2 mask_TEXCOORD;      
            bool CalcuCut(){    
                highp float l; 
                highp float t; 
                highp float r; 
                highp float b; 
                highp vec2 texc1; 
                bool beCut; 
                l = _maskRect.x; 
                t = _maskRect.y; 
                r = _maskRect.z + l; 
                b = _maskRect.w + t; 
                texc1 = mask_TEXCOORD; 
                if(texc1.x >(1.0 - l) || texc1.x <(1.0 - r) || texc1.y <t || texc1.y>b){  
                    beCut = true;  
                }else{ 
                    beCut = false; 
                } 
                return beCut; 
            } 
             
            out vec4 color;
            void main()   
            {  
                if(CalcuCut())  discard; 
                float scale = 10.0;    
                float d = (texture(_MainTex, xlv_TEXCOORD0).r - 0.47)*scale;   
                float bd = (texture(_MainTex, xlv_TEXCOORD0).r - 0.4)*scale;   
                
                float c=xlv_COLOR.a * clamp ( d,0.0,1.0);   
                float bc=xlv_COLOREx.a * clamp ( bd,0.0,1.0);   
                bc =min(1.0-c,bc);  
                lowp vec4 final =  xlv_COLOR*c + xlv_COLOREx*bc ; 
                color = final ; 
            }`;

        static vsdiffuse: string = `#version 300 es
            precision mediump float;

            layout(location = 0) in vec3 _glesVertex;
            layout(location = 4) in vec4 _glesMultiTexCoord0;
            uniform highp mat4 glstate_matrix_mvp;
            out highp vec2 xlv_TEXCOORD0;
            void main()
            {
                highp vec4 tmpvar_1;
                tmpvar_1.w = 1.0;
                tmpvar_1.xyz = _glesVertex.xyz;
                xlv_TEXCOORD0 = _glesMultiTexCoord0.xy;
                gl_Position = (glstate_matrix_mvp * tmpvar_1);
            }
        `;

        static fsdiffuse: string = `#version 300 es
            precision mediump float;

            uniform sampler2D _MainTex;
            uniform vec4 _MainColor;
            uniform lowp float _AlphaCut;
            in highp vec2 xlv_TEXCOORD0;
            out vec4 color;
            void main()
            {
                lowp vec4 _color = texture(_MainTex, xlv_TEXCOORD0) * _MainColor;
                if(_color.a < _AlphaCut)
                    discard;
                color = _color;
            }
        `;


        //editor
        static vsline: string = `#version 300 es
            precision mediump float;

            layout(location = 0) in vec3 _glesVertex;
            layout(location = 3) in vec4 _glesColor;
            uniform highp mat4 glstate_matrix_mvp;
            out lowp vec4 xlv_COLOR;
            void main()
            {
                highp vec4 tmpvar_1;
                tmpvar_1.w = 1.0;
                tmpvar_1.xyz = _glesVertex.xyz;
                xlv_COLOR = _glesColor;
                gl_Position = (glstate_matrix_mvp * tmpvar_1);
            }
        `;

        static fsline: string = `#version 300 es
            precision mediump float;

            in lowp vec4 xlv_COLOR;
            out vec4 color;
            void main()
            {
                color = xlv_COLOR;
            }
        `;

        static vsmaterialcolor: string = `#version 300 es
            precision mediump float;

            layout(location = 0) in vec3 _glesVertex;
            uniform vec4 _Color;
            uniform float _Alpha;
            uniform highp mat4 glstate_matrix_mvp;
            out lowp vec4 xlv_COLOR;
            void main()
            {
                highp vec4 tmpvar_1;
                tmpvar_1.w = 1.0;
                tmpvar_1.xyz = _glesVertex.xyz;
                xlv_COLOR = _Color;
                xlv_COLOR.a = xlv_COLOR.a * _Alpha;
                gl_Position = (glstate_matrix_mvp * tmpvar_1);
            }
        `;

        static vslinetrail = `#version 300 es
            precision mediump float;
            layout(location = 0) in vec3 _glesVertex;
            layout(location = 4) in vec4 _glesMultiTexCoord0;
            layout(location = 3) in vec4 _glesColor;
            
            uniform mat4 glstate_matrix_mvp;
            
            out vec2 xlv_TEXCOORD0;
            out vec4 xlv_COLOR;
            
            void main() 
            {
                gl_Position = glstate_matrix_mvp * vec4(_glesVertex , 1.0);
                xlv_TEXCOORD0 = _glesMultiTexCoord0.xy;
                xlv_COLOR = _glesColor;
            }
        `;

        static linetrailShader: string = `{
                "properties": [
                "_MainTex('MainTex',Texture)='white'{}"
                ]
            }
            `;

        static fslinetrail = `#version 300 es
            precision mediump float;

            uniform sampler2D _MainTex; 
            
            in vec2 xlv_TEXCOORD0;
            in vec4 xlv_COLOR;
            
            out vec4 color;
            void main() 
            {
                vec4 color = texture(_MainTex, xlv_TEXCOORD0);
                color = color * xlv_COLOR;
            }
        `;

        /**
         * 初始化默认着色器
         * @param assetmgr 资源管理
         */
        static initDefaultShader(assetmgr: assetMgr) {
            var pool = assetmgr.shaderPool;
            //鍙戠幇鏄簳灞備竴涓紩鐢ㄤ贡浜嗭紝鍘熺粨鏋勬病闂

            // pool.compileVS(assetmgr.webgl, "test", defShader.vscode_test);
            // pool.compileFS(assetmgr.webgl, "test", defShader.fscode_test);

            pool.compileVS(assetmgr.webgl, "def", defShader.vscode);
            pool.compileFS(assetmgr.webgl, "def", defShader.fscode);

            pool.compileFS(assetmgr.webgl, "def2", defShader.fscode2);

            pool.compileVS(assetmgr.webgl, "defui", defShader.vscodeUI);
            pool.compileFS(assetmgr.webgl, "defui", defShader.fscodeUI);

            pool.compileVS(assetmgr.webgl, "defuifont", defShader.vscodefontUI);
            pool.compileFS(assetmgr.webgl, "defuifont", defShader.fscodefontUI);

            pool.compileVS(assetmgr.webgl, "diffuse", defShader.vsdiffuse);
            pool.compileFS(assetmgr.webgl, "diffuse", defShader.fsdiffuse);

            pool.compileVS(assetmgr.webgl, "line", defShader.vsline);
            pool.compileFS(assetmgr.webgl, "line", defShader.fsline);

            pool.compileVS(assetmgr.webgl, "materialcolor", defShader.vsmaterialcolor);

            pool.compileVS(assetmgr.webgl, "defUIMaskVS", defShader.vscodeMaskUI);
            pool.compileFS(assetmgr.webgl, "defUIMaskFS", defShader.fscodeMaskUI);

            pool.compileVS(assetmgr.webgl, "defuifontMaskVS", defShader.vscodeuifontmask);
            pool.compileFS(assetmgr.webgl, "defuifontMaskFS", defShader.fscodeuifontmask);

            pool.compileVS(assetmgr.webgl, "deflinetrailVS", defShader.vslinetrail);
            pool.compileFS(assetmgr.webgl, "deflinetrailFS", defShader.fslinetrail);

            // var program_test = pool.linkProgram(assetmgr.webgl, "test", "test");

            var program = pool.linkProgram(assetmgr.webgl, "def", "def");
            var program2 = pool.linkProgram(assetmgr.webgl, "defui", "defui");
            var programuifont = pool.linkProgram(assetmgr.webgl, "defuifont", "defuifont");
            var programdiffuse = pool.linkProgram(assetmgr.webgl, "diffuse", "diffuse");
            var programline = pool.linkProgram(assetmgr.webgl, "line", "line");
            var programmaterialcolor = pool.linkProgram(assetmgr.webgl, "materialcolor", "line");
            var programMaskUI = pool.linkProgram(assetmgr.webgl, "defUIMaskVS", "defUIMaskFS");
            var programMaskfont = pool.linkProgram(assetmgr.webgl, "defuifontMaskVS", "defuifontMaskFS");
            var programlinetrail = pool.linkProgram(assetmgr.webgl, "deflinetrailVS", "deflinetrailFS");
            // {
            //     var sh = new shader("shader/test");
            //     sh.defaultAsset = true;
            //     sh.passes["base"] = [];
            //     var p = new render.glDrawPass();
            //     p.setProgram(program_test);
            //     sh.passes["base"].push(p);
            //     sh.fillUnDefUniform(p);
            //     //sh._parseProperties(assetmgr,JSON.parse(this.shader0).properties);
            //     p.state_ztest = true;
            //     p.state_ztest_method = render.webglkit.LEQUAL;
            //     p.state_zwrite = false;
            //     p.state_showface = render.ShowFaceStateEnum.ALL;
            //     p.setAlphaBlend(render.BlendModeEnum.Close);
            //     //p.uniformTexture("_MainTex", null);
            //     assetmgr.mapShader[sh.getName()] = sh;
            // }

            {
                var sh = new shader("shader/def");
                sh.defaultAsset = true;
                sh.passes["base"] = [];
                var p = new render.glDrawPass();
                p.setProgram(program);
                sh.passes["base"].push(p);
                sh.fillUnDefUniform(p);
                //sh._parseProperties(assetmgr,JSON.parse(this.shader0).properties);
                p.state_ztest = true;
                p.state_ztest_method = render.webglkit.LEQUAL;
                p.state_zwrite = true;
                p.state_showface = render.ShowFaceStateEnum.CCW;
                p.setAlphaBlend(render.BlendModeEnum.Close);
                //p.uniformTexture("_MainTex", null);
                assetmgr.mapShader[sh.getName()] = sh;
            }
            {
                var sh = new shader("shader/def3dbeforeui");
                sh.defaultAsset = true;
                sh.passes["base"] = [];
                var p = new render.glDrawPass();
                p.setProgram(programdiffuse);
                sh.passes["base"].push(p);
                sh.fillUnDefUniform(p);
                //sh._parseProperties(assetmgr,JSON.parse(this.diffuseShader).properties);
                p.state_ztest = false;
                p.state_ztest_method = render.webglkit.LEQUAL;
                p.state_zwrite = false;
                p.state_showface = render.ShowFaceStateEnum.CCW;
                p.setAlphaBlend(render.BlendModeEnum.Close);
                //p.uniformTexture("_MainTex", null);
                assetmgr.mapShader[sh.getName()] = sh;
            }
            {
                var sh = new shader("shader/def2");
                sh.defaultAsset = true;
                sh.passes["base"] = [];
                var p = new render.glDrawPass();
                p.setProgram(program2);
                sh.passes["base"].push(p);
                sh.fillUnDefUniform(p);
                //sh._parseProperties(assetmgr,JSON.parse(this.uishader).properties);
                p.state_showface = render.ShowFaceStateEnum.ALL;
                p.state_ztest = false;
                p.state_ztest_method = render.webglkit.LEQUAL;
                p.setAlphaBlend(render.BlendModeEnum.Close);
                assetmgr.mapShader[sh.getName()] = sh;
            }
            {
                var sh = new shader("shader/defui");
                sh.defaultAsset = true;
                sh.passes["base"] = [];
                var p = new render.glDrawPass();
                p.setProgram(program2);
                sh.passes["base"].push(p);
                sh.fillUnDefUniform(p);
                sh._parseProperties(assetmgr, JSON.parse(this.uishader).properties);
                p.state_showface = render.ShowFaceStateEnum.ALL;
                p.state_ztest = false;
                p.state_zwrite = false;
                p.state_ztest_method = render.webglkit.LEQUAL;
                p.setAlphaBlend(render.BlendModeEnum.Blend);
                assetmgr.mapShader[sh.getName()] = sh;
            }
            {
                var sh = new shader("shader/defuifont");
                sh.defaultAsset = true;
                sh.passes["base"] = [];
                var p = new render.glDrawPass();
                p.setProgram(programuifont);
                sh.passes["base"].push(p);
                sh.fillUnDefUniform(p);
                // sh._parseProperties(assetmgr, JSON.parse(this.shaderuifront).properties);
                p.state_showface = render.ShowFaceStateEnum.ALL;
                p.state_ztest = false;
                p.state_zwrite = false;
                p.state_ztest_method = render.webglkit.LEQUAL;
                p.setAlphaBlend(render.BlendModeEnum.Blend);
                assetmgr.mapShader[sh.getName()] = sh;
            }
            {
                var sh = new shader("shader/line");
                sh.defaultAsset = true;
                sh.passes["base"] = [];
                var p = new render.glDrawPass();
                sh.passes["base"].push(p);
                p.setProgram(programline);
                sh.fillUnDefUniform(p);
                p.state_ztest = true;
                p.state_ztest_method = render.webglkit.LEQUAL;
                p.state_zwrite = true;
                p.state_showface = render.ShowFaceStateEnum.ALL;
                p.setAlphaBlend(render.BlendModeEnum.Close);
                assetmgr.mapShader[sh.getName()] = sh;
            }
            {
                var sh = new shader("shader/materialcolor");
                sh.defaultAsset = true;
                sh.passes["base"] = [];
                var p = new render.glDrawPass();
                sh.passes["base"].push(p);
                //sh._parseProperties(assetmgr,JSON.parse(this.materialShader).properties);
                p.setProgram(programmaterialcolor);
                sh.fillUnDefUniform(p);
                p.state_ztest = false;
                //p.state_ztest_method = render.webglkit.LEQUAL;
                //p.state_zwrite = true;
                p.state_showface = render.ShowFaceStateEnum.ALL;
                p.setAlphaBlend(render.BlendModeEnum.Blend);
                sh.layer = RenderLayerEnum.Overlay;
                assetmgr.mapShader[sh.getName()] = sh;
            }
            {
                var sh = new shader("shader/defmaskui");
                sh.defaultAsset = true;
                sh.passes["base"] = [];
                var p = new render.glDrawPass();
                sh.passes["base"].push(p);
                sh._parseProperties(assetmgr, JSON.parse(this.uishader).properties);
                p.setProgram(programMaskUI);
                sh.fillUnDefUniform(p);
                p.state_showface = render.ShowFaceStateEnum.ALL;
                p.state_ztest = false;
                p.state_zwrite = false;
                p.state_ztest_method = render.webglkit.LEQUAL;
                p.setAlphaBlend(render.BlendModeEnum.Blend);
                assetmgr.mapShader[sh.getName()] = sh;
            }
            {
                var sh = new shader("shader/defmaskfont");
                sh.defaultAsset = true;
                sh.passes["base"] = [];
                var p = new render.glDrawPass();
                sh.passes["base"].push(p);
                sh._parseProperties(assetmgr, JSON.parse(this.shaderuifront).properties);
                p.setProgram(programMaskfont);
                sh.fillUnDefUniform(p);

                p.state_showface = render.ShowFaceStateEnum.ALL;
                p.state_ztest = false;
                p.state_zwrite = false;
                p.state_ztest_method = render.webglkit.LEQUAL;
                p.setAlphaBlend(render.BlendModeEnum.Blend);
                assetmgr.mapShader[sh.getName()] = sh;
            }
            {
                var sh = new shader("shader/deflinetrail");
                sh.defaultAsset = true;
                sh.passes["base"] = [];
                var p = new render.glDrawPass();
                sh.passes["base"].push(p);
                sh._parseProperties(assetmgr, JSON.parse(this.linetrailShader).properties);
                p.setProgram(programlinetrail);
                sh.fillUnDefUniform(p);

                p.state_showface = render.ShowFaceStateEnum.ALL;
                p.state_ztest = false;
                p.state_zwrite = false;
                p.state_ztest_method = render.webglkit.LEQUAL;
                p.setAlphaBlend(render.BlendModeEnum.Blend);
                assetmgr.mapShader[sh.getName()] = sh;
            }
            {
                var sh = new shader("shader/ulit");
                sh.defaultAsset = true;
                sh.passes["base"] = [];
                var p = new render.glDrawPass();
                sh.passes["base"].push(p);
                p.setProgram(programdiffuse);
                sh.fillUnDefUniform(p);
                p.state_ztest = true;
                p.state_zwrite = true;
                p.state_showface = render.ShowFaceStateEnum.ALL;
                sh.layer = RenderLayerEnum.Common;
                assetmgr.mapShader[sh.getName()] = sh;
            }
        }
    }

}