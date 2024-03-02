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
    // /**
    //  * @private
    //  */
    // export class NumberData
    // {
    //     public isRandom: boolean = false;
    //     public _value: number = 0;
    //     public _valueLimitMin: number = 0;
    //     public _valueLimitMax: number = 0;
    //     private beInited: boolean = false;
    //     private key:number;//random值（0--1）
    //     setValue(value:number)
    //     {
    //         this._value=value;
    //     }
    //     setRandomValue(max:number,min:number)
    //     {
    //         this._valueLimitMax=max;
    //         this._valueLimitMin=min;
    //         this.isRandom=true;
    //     }
    //     /**
    //      * 针对随机类型，只要随机过一次就返回值不变（rerandom=false），返回新的随机值（rerandom=true）
    //      */
    //     public getValue(reRandom:boolean=false)
    //     {
    //         if (this.isRandom)
    //         {
    //             if(reRandom||!this.beInited)
    //             {
    //                 this.key=Math.random();
    //                 this._value=this.key*(this._valueLimitMax-this._valueLimitMin)+this._valueLimitMin;
    //                 this.beInited = true
    //             }
    //         }
    //         return this._value;
    //     }

    //     constructor(value:number=null)
    //     {
    //         if(value!=null)
    //         {
    //             this._value=value;
    //         }
    //     }

    //     public static RandomRange(min: number, max: number, isInteger: boolean = false)
    //     {
    //         if (isInteger)
    //         {
    //             return Math.floor(Math.random() * (max - min + 1) + min);
    //         }
    //         return Math.random() * (max - min) + min;
    //     }
    // }

    // export class Vector3Data
    // {
    //     x:NumberData=new NumberData();
    //     y:NumberData=new NumberData();
    //     z:NumberData=new NumberData();

    //     constructor(x:number=0,y:number=0,z:number=0)
    //     {
    //         this.x.setValue(x);
    //         this.y.setValue(y);
    //         this.z.setValue(z);
    //     }
    //     getValue():m4m.math.vector3
    //     {
    //         var out:m4m.math.vector3=new m4m.math.vector3();
    //         out.x=this.x.getValue();
    //         out.y=this.y.getValue();
    //         out.z=this.z.getValue();
    //         return out;
    //     }
    // }
    // export class NumberKey
    // {
    //     key:number;
    //     value:number;
    //     constructor(_key:number,_value:number)
    //     {
    //         this.key=_key;
    //         this.value=_value;
    //     }
    // }
    // export class Vector3Key
    // {
    //     key:number;
    //     value:math.vector3;
    //     constructor(_key:number,_value:math.vector3)
    //     {
    //         this.key=_key;
    //         this.value=_value;
    //     }
    // }
    // export class Vector2Key
    // {
    //     key:number;
    //     value:math.vector2;
    //     constructor(_key:number,_value:math.vector2)
    //     {
    //         this.key=_key;
    //         this.value=_value;
    //     }
    // }
    export class effTools
    {
        /**
         * 获取随机方向和位置 通过 粒子发射器
         * @param emission 粒子发射器
         * @param outDir 输出方向
         * @param outPos 输出位置
         */
        public static getRandomDirAndPosByZEmission(emission:EffectElementEmission,outDir:m4m.math.vector3,outPos:m4m.math.vector3)
        {

            switch(emission.shapeType)
            {
                case ParticleSystemShape.NORMAL:
                    m4m.math.vec3Clone(m4m.math.pool.vector3_zero,outPos);
                    m4m.math.vec3Clone(m4m.math.pool.vector3_up,outDir);
                    break;
                case ParticleSystemShape.SPHERE:
                    var o = Math.random()*Math.PI*2;
                    var o1 = Math.random()*Math.PI;
                    outDir.x=Math.sin(o1)*Math.cos(o);
                    outDir.y=Math.cos(o1);         
                    outDir.z=Math.sin(o1)*Math.sin(o);
                    var radius=Math.random()*emission.radius;
                    
                    m4m.math.vec3ScaleByNum(outDir,radius,outPos);
                    break;
                case ParticleSystemShape.HEMISPHERE:
                    var o = Math.random()*Math.PI*2;
                    var o1 = Math.random()*Math.PI*0.5;
                    var radius=Math.random()*emission.radius;
                    outDir.x=Math.sin(o1)*Math.cos(o);
                    outDir.y=Math.cos(o1);         
                    outDir.z=Math.sin(o1)*Math.sin(o);
                    m4m.math.vec3ScaleByNum(outDir,radius,outPos);
                    break;
                case ParticleSystemShape.BOX:
                    outPos.x = ValueData.RandomRange(-emission.width / 2, emission.width / 2);
                    outPos.y = ValueData.RandomRange(-emission.height / 2, emission.height / 2);
                    outPos.z = ValueData.RandomRange(-emission.depth / 2, emission.depth / 2);
                    m4m.math.vec3Normalize(outPos,outDir);
                    break;
                case ParticleSystemShape.CONE:
                    var randomAngle=Math.random()*Math.PI*2;//弧度
                    var randomHeight=Math.random()*emission.height;
                    var upradius=randomHeight*Math.tan(emission.angle*Math.PI/180)+emission.radius;
                    var radomRadius=Math.random()*upradius;

                    var bottompos=m4m.math.pool.new_vector3();
                    bottompos.x=emission.radius*Math.cos(randomAngle);
                    bottompos.y=0;
                    bottompos.z=emission.radius*Math.sin(randomAngle);

                    if(emission.emitFrom==emitfromenum.base)
                    {
                        m4m.math.vec3Clone(bottompos,outPos);
                    }
                    else if(emission.emitFrom==emitfromenum.volume)
                    {
                        outPos.x=radomRadius*Math.cos(randomAngle);
                        outPos.z=radomRadius*Math.sin(randomAngle);
                        outPos.y=randomHeight;
                    }
                    outDir.x=Math.cos(randomAngle)*Math.sin(emission.angle*Math.PI/180);
                    outDir.z=Math.sin(randomAngle)*Math.sin(emission.angle*Math.PI/180);
                    outDir.y=Math.cos(emission.angle*Math.PI/180);
                    break;
            }
        }

        /**
         * 获取纹理的 ST值
         * @param emission 特效元素发射
         * @param out_St 纹理的ST值
         */
        public static getTex_ST(emission:EffectElementEmission,out_St:math.vector4)
        {
            if(emission.uvType!=UVTypeEnum.UVSprite)
            {
                out_St.x=1;
                out_St.y=1;
                out_St.z=0;
                out_St.w=0;
            }else
            {
                m4m.math.spriteAnimation(emission.row,emission.column,0,out_St);
            }
        }
    }
}