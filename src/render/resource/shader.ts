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
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * uniform类型枚举
     * @version m4m 1.0
     */
    export enum UniformTypeEnum {
        Texture = 0,
        Float = 1,
        Floatv = 2,
        Float4 = 3,
        Float4v = 4,
        Float4x4 = 5,
        Float4x4v = 6,
        CubeTexture = 7,
        Int = 8,
    }
    /**
     * @private
     */
    export class uniform {
        name: string;
        type: UniformTypeEnum;
        location: WebGLUniformLocation;
        //默认值跟着类型走即可
    }
    export class attribute {
        name: string;
        // type: number;  //webgl.FLOAT、webgl.FLOAT_VEC2、webgl.FLOAT_VEC3、webgl.FLOAT_VEC4
        size: number;  //只 支持 1~4
        location: number;
    }
    /**
     * @private
     */
    export enum ShaderTypeEnum {
        VS,
        FS,
    }
    /**
     * @private
     */
    export class glShader {
        /**
         * 引擎 着色器
         * @param name 名
         * @param type 类型
         * @param shader webgl 着色器
         * @param code [已弃用]
         */
        constructor(name: string, type: ShaderTypeEnum, shader: WebGLShader, code: string) {
            this.name = name;
            this.type = type;
            this.shader = shader;
            //this._scanUniform(code);
        }
        name: string;
        type: ShaderTypeEnum;
        shader: WebGLShader;
    }
    /**
     * @private
     */
    export class glProgram {
        // /**
        //  * 是否是引擎系统内建的 attrib ID
        //  * @param attribID 
        //  */
        // static isBuildInAttrib(attribID: string) {
        //     return this.buildInAtrribute[attribID] != null;
        // }
        /**
         * 引擎 着色器 Program
         * @param vs 引擎顶点着色器
         * @param fs 引擎片元着色器
         * @param program webgl Program
         */
        constructor(vs: glShader, fs: glShader, program: WebGLProgram) {
            this.vs = vs;
            this.fs = fs;
            this.program = program;
        }

        /** 全部 attribute 地址 map */
        mapAllAttrLoc: { [loc: number]: attribute } = {};
        /** 全部 attributeID map */
        mapAllAttrID: { [id: string]: attribute } = {};
        // /** GPU Instance attribute ID map */
        // mapInstanceAttribID: { [id: string]: attribute } = {};

        // private _strideInsAttrib: number = 0;
        // get strideInsAttrib() { return this._strideInsAttrib; }
        /**
         * 初始化 属性 Attribute
         * @param webgl webgl上下文
         */
        initAttribute(webgl: WebGL2RenderingContext) {
            let attributesLen = webgl.getProgramParameter(this.program, webgl.ACTIVE_ATTRIBUTES);
            // let attMap = glProgram.buildInAtrribute;
            for (let i = 0; i < attributesLen; i++) {
                let attributeInfo = webgl.getActiveAttrib(this.program, i);
                if (!attributeInfo) break;

                let att = new attribute();
                let name = attributeInfo.name;
                att.name = name;
                switch (attributeInfo.type) {
                    case webgl.INT:
                    case webgl.FLOAT: att.size = 1; break;
                    case webgl.INT_VEC2:
                    case webgl.FLOAT_VEC2: att.size = 2; break;
                    case webgl.INT_VEC3:
                    case webgl.FLOAT_VEC3: att.size = 3; break;
                    case webgl.INT_VEC4:
                    case webgl.FLOAT_VEC4:
                    case webgl.FLOAT_MAT2: att.size = 4; break;
                    case webgl.FLOAT_MAT2x3:
                    case webgl.FLOAT_MAT3x2: att.size = 6; break;
                    case webgl.FLOAT_MAT2x4:
                    case webgl.FLOAT_MAT4x2: att.size = 8; break;
                    case webgl.FLOAT_MAT3: att.size = 9; break;
                    case webgl.FLOAT_MAT3x4:
                    case webgl.FLOAT_MAT4x3: att.size = 12; break;
                    case webgl.FLOAT_MAT4: att.size = 16; break;
                    default: att.size = 0; break;
                }
                att.location = webgl.getAttribLocation(this.program, name);
                //加入all map 
                this.mapAllAttrLoc[att.location] = att;
                this.mapAllAttrID[name] = att;
                // //加入instance map
                // if (att.location >= VertexLocation.GPUInstanceStart) {
                //     this.mapInstanceAttribID[name] = att;
                //     // this._strideInsAttrib += att.size * 4;
                // }
            }

            // //设置 引擎内建的attribute 地址
            // for (let key in attMap) {
            //     let val = attMap[key];
            //     this[val] = this.tryGetLocation(key);
            // }

            //使用了 layout 模式，只需要筛选 自定义的attrib

        }

        // private tryGetLocation(id: string) {
        //     let att = this.mapAttrib[id];
        //     if (!att) return -1;
        //     return att.location;
        // }

        vs: glShader;
        fs: glShader;
        program: WebGLProgram;

        // //old 顶点地址-------------------------
        // posPos: number = -1;
        // posNormal: number = -1;
        // posTangent: number = -1;
        // posColor: number = -1;
        // posUV0: number = -1;
        // posUV2: number = -1;
        // posBlendIndex4: number = -1;
        // posBlendWeight4: number = -1;
        // posColorEx: number = -1;
        // //------------------------------------

        mapUniform: { [id: string]: uniform } = {};
        /**
         * 使用当前 webgl program
         * @param webgl webgl上下文
         */
        use(webgl: WebGL2RenderingContext) {
            webgl.useProgram(this.program);
        }

        /**
         * 初始化 program 使用的 Uniform 
         * @param webgl webgl上下文
         */
        initUniforms(webgl: WebGL2RenderingContext) {
            var numUniforms = webgl.getProgramParameter(this.program, webgl.ACTIVE_UNIFORMS);
            for (var i = 0; i < numUniforms; i++) {
                var uniformInfo = webgl.getActiveUniform(this.program, i);
                if (!uniformInfo) break;

                var name = uniformInfo.name;
                // remove the array suffix.
                if (name.substr(-3) === "[0]") {
                    name = name.substr(0, name.length - 3);
                }

                var location = webgl.getUniformLocation(this.program, uniformInfo.name);
                var type = uniformInfo.type;
                var isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]");

                let _uniform = new uniform();
                _uniform.name = name;
                _uniform.location = location;
                this.mapUniform[name] = _uniform;

                if (type === webgl.FLOAT && isArray) {
                    _uniform.type = UniformTypeEnum.Floatv;
                }
                else if (type === webgl.FLOAT) {
                    _uniform.type = UniformTypeEnum.Float;
                }
                else if (type === webgl.INT) {
                    _uniform.type = UniformTypeEnum.Int;
                }
                else if (type === webgl.FLOAT_VEC4 && isArray) {
                    _uniform.type = UniformTypeEnum.Float4v;
                }
                else if (type === webgl.FLOAT_VEC4) {
                    _uniform.type = UniformTypeEnum.Float4;
                }
                else if (type === webgl.FLOAT_MAT4 && isArray) {
                    _uniform.type = UniformTypeEnum.Float4x4v;
                }
                else if (type === webgl.FLOAT_MAT4) {
                    _uniform.type = UniformTypeEnum.Float4x4;
                }
                else if (type === webgl.SAMPLER_2D) {
                    _uniform.type = UniformTypeEnum.Texture;
                }
                else if (type === webgl.SAMPLER_CUBE) {
                    _uniform.type = UniformTypeEnum.CubeTexture;
                } else {
                    console.log("Unifrom parse Erorr : not have this type!");
                }
            }
        }
    }

    /**
     * @private
     */
    export class shaderPool {
        mapVS: { [id: string]: glShader } = {};
        mapFS: { [id: string]: glShader } = {};
        mapProgram: { [id: string]: glProgram } = {};
        /**
         * 销毁 指定 webgl顶点着色器
         * @param webgl webgl上下文
         * @param id 顶点着色器ID
         */
        disposeVS(webgl: WebGL2RenderingContext, id: string) {
            webgl.deleteShader(this.mapVS[id].shader);
        }
        /**
         * 销毁 指定 webgl片元着色器
         * @param webgl webgl上下文
         * @param id 片元着色器ID
         */
        disposeFS(webgl: WebGL2RenderingContext, id: string) {
            webgl.deleteShader(this.mapFS[id].shader);
        }
        /**
         * 销毁指定 webgl Program
         * @param webgl webgl上下文
         * @param id Program ID
         */
        disposeProgram(webgl: WebGL2RenderingContext, id: string) {
            webgl.deleteProgram(this.mapProgram[id].program);
        }

        /**
         * 销毁所有着色器
         * @param webgl webgl上下文
         */
        disposeAll(webgl: WebGL2RenderingContext) {
            for (var key in this.mapVS) {
                this.disposeVS(webgl, key);
            }
            for (var key in this.mapFS) {
                this.disposeFS(webgl, key);
            }
            for (var key in this.mapProgram) {
                this.disposeProgram(webgl, key);
            }
            this.mapVS = {};
            this.mapFS = {};
            this.mapProgram = {};
        }
        /**
         * 编译 顶点着色器 并扫描 attribute 和 uniform
         * @param webgl webgl上下文
         * @param name  名字 
         * @param code  着色器代码
         * @returns webgl 着色器
         */
        compileVS(webgl: WebGL2RenderingContext, name: string, code: string): glShader {
            var vs = webgl.createShader(webgl.VERTEX_SHADER);
            webgl.shaderSource(vs, code);
            webgl.compileShader(vs);
            var r1 = webgl.getShaderParameter(vs, webgl.COMPILE_STATUS);
            if (r1 == false) {
                var error = webgl.getShaderInfoLog(vs);
                webgl.deleteShader(vs);
                console.error(code, 'Failed to compile shader: ' + error);

                return null;
            }
            var s = new glShader(name, ShaderTypeEnum.VS, vs, code);
            this.mapVS[name] = s;
            return s;
        }

        /**
         * 编译 片元着色器 并扫描 attribute 和 uniform
         * @param webgl webgl上下文
         * @param name  名字 
         * @param code  着色器代码
         * @returns webgl 着色器
         */
        compileFS(webgl: WebGL2RenderingContext, name: string, code: string): glShader {
            var fs = webgl.createShader(webgl.FRAGMENT_SHADER);
            webgl.shaderSource(fs, code);
            webgl.compileShader(fs);
            var r1 = webgl.getShaderParameter(fs, webgl.COMPILE_STATUS);
            if (r1 == false) {
                var error = webgl.getShaderInfoLog(fs);
                webgl.deleteShader(fs);
                console.error(code, 'Failed to compile shader: ' + error);
                return null;
            }

            var s = new glShader(name, ShaderTypeEnum.FS, fs, code);
            this.mapFS[name] = s;
            return s;
        }

        /**
         * 链接 一个顶点着色器 、片元着色器 , 为一个webgl Program 
         * @param webgl webgl上下文
         * @param nameVS 顶点着色器名
         * @param nameFS 片元着色器名
         * @returns webgl Program
         */
        linkProgram(webgl: WebGL2RenderingContext, nameVS: string, nameFS: string): glProgram {
            var program = webgl.createProgram();

            webgl.attachShader(program, this.mapVS[nameVS].shader);
            webgl.attachShader(program, this.mapFS[nameFS].shader);

            webgl.linkProgram(program);
            var r3 = webgl.getProgramParameter(program, webgl.LINK_STATUS);
            if (r3 == false) {
                console.error("vs:" + nameVS + "   fs:" + nameFS + "a webgl program error:" + webgl.getProgramInfoLog(program));
                webgl.deleteProgram(program);
                return null;
            }
            var name = nameVS + "_" + nameFS;
            var glp = new glProgram(this.mapVS[nameVS], this.mapFS[nameFS], program);
            //----------
            glp.initUniforms(webgl);
            glp.initAttribute(webgl);
            this.mapProgram[name] = glp;
            return glp;

        }
        //--------------------------------------shader 版本2
        mapVSString: { [id: string]: string } = {};
        mapFSString: { [id: string]: string } = {};
        /**
         * 通过 type 从shader pass 配置中筛选符合条件的 顶点着色器 、片元着色器
         * 链接 一个顶点着色器 、片元着色器 , 为一个webgl Program 
         * @param webgl webgl上下文
         * @param type pass 类型标记
         * @param nameVS 顶点着色器名
         * @param nameFS 片元着色器名
         * @param globalMacros 着色器中 附加全局宏定义
         * @returns webgl Program
         */
        linkProgrambyPassType(webgl: WebGL2RenderingContext, type: string, nameVS: string, nameFS: string, globalMacros: string[]): glProgram {
            let vsStr = this.mapVSString[nameVS];
            let fsStr = this.mapFSString[nameFS];

            const es300Tag = `#version 300 es \n`;
            const es300Reg = /#version +300 +es[\r|\n]+/;
            let vsIsES300 = es300Reg.test(vsStr);
            let fsIsES300 = es300Reg.test(fsStr);
            if (vsIsES300) { vsStr = vsStr.replace(es300Reg, ""); }
            if (fsIsES300) { fsStr = fsStr.replace(es300Reg, ""); }

            // Handle global macros
            for (let i = 0; i < globalMacros.length; i++) {
                vsStr = `#define ${globalMacros[i]}\n${vsStr}`;
                fsStr = `#define ${globalMacros[i]}\n${fsStr}`;
            }

            if (type == "base") {

            } else if (type == "base_fog" || type == "fog") {
                vsStr = "#define FOG \n" + vsStr;
                fsStr = "#define FOG \n" + fsStr;
            } else if (type == "instance") {
                vsStr = "#define INSTANCE \n" + vsStr;
                fsStr = "#define INSTANCE \n" + fsStr;
            }
            else if (type == "instance_fog") {
                vsStr = "#define FOG \n" + "#define INSTANCE \n" + vsStr;
                fsStr = "#define FOG \n" + "#define INSTANCE \n" + fsStr;
            }
            else if (type == "skin") {
                vsStr = "#define SKIN \n" + vsStr;
                fsStr = "#define SKIN \n" + fsStr;
            } else if (type == "skin_fog") {
                vsStr = "#define SKIN \n" + "#define FOG \n" + vsStr;
                fsStr = "#define SKIN \n" + "#define FOG \n" + fsStr;
            } else if (type == "lightmap") {
                vsStr = "#define LIGHTMAP \n" + vsStr;
                fsStr = "#define LIGHTMAP \n" + fsStr;
            } else if (type == "lightmap_fog") {
                vsStr = "#define LIGHTMAP \n" + "#define FOG \n" + vsStr;
                fsStr = "#define LIGHTMAP \n" + "#define FOG \n" + fsStr;
            } else if (type == "quad") {
                vsStr = "#define QUAD \n" + vsStr;
                fsStr = "#define QUAD \n" + fsStr;
            }

            //检查 添加 es300 标记
            if (vsIsES300) { vsStr = es300Tag + vsStr; }
            if (fsIsES300) { fsStr = es300Tag + fsStr; }

            this.compileVS(webgl, nameVS + type, vsStr);
            this.compileFS(webgl, nameFS + type, fsStr);

            let pro = this.linkProgram(webgl, nameVS + type, nameFS + type);
            return pro;
        }

    }

}