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
//找不到归属的放这里
namespace m4m.math {
    /**
     * row：图片行数//column:图片列数//index：第几张图片（index从0开始计数）
     * @param row 行
     * @param column    列 
     * @param index 索引
     * @param out 输出的向量
     */
    export function spriteAnimation(row: number, column: number, index: number, out: vector4) {
        var width = 1.0 / column;
        var height = 1.0 / row;
        var offsetx = width * (index % column);
        var offsety = height *row-height*(Math.floor(index / column) + 1) ;
        
        out.x = width;
        out.y = height;
        out.z = offsetx;
        out.w = offsety;
        // var uvOffset=new m4m.math.vector4(width,height,offsetx,offsety);
        // return  uvOffset;
    }
    // int index = Mathf.FloorToInt(this.life01 * data.count);

    // float width = 1.0f / data.column;//width
    // float height = 1.0f / data.row;//height
    // float offsetx = width * (index % data.column);//offsetx
    // float offsety =height * data.row-height * (Mathf.FloorToInt(index / data.column)+1);//offsety

    // this.tex_ST.x = width;
    // this.tex_ST.y = height;
    // this.tex_ST.z = offsetx;
    // this.tex_ST.w = offsety;
    /**
     * 沿曲线取点
     * @param curveStart 曲线开始
     * @param curveStartHandle 曲线开始控制
     * @param curveEnd 曲线结束
     * @param curveEndHandle 曲线结束控制
     * @param t 进度值
     * @param out 输出的点
     * @param crease 
     */
    export function GetPointAlongCurve(curveStart:vector3,curveStartHandle:vector3,curveEnd:vector3,curveEndHandle:vector3,t:number, out:vector3,crease:number=0.3)
    {
        var oneMinT = 1 - t;
        var oneMinTPow3 =Math.pow(oneMinT, 3);
        var oneMinTPow2 = Math.pow(oneMinT, 2);

        var oneMinCrease = 1 - crease;

        var tempt1=m4m.math.pool.new_vector3();
        m4m.math.vec3ScaleByNum(curveStart,oneMinTPow3*oneMinCrease,tempt1);
        var tempt2=m4m.math.pool.new_vector3();
        m4m.math.vec3ScaleByNum(curveStartHandle,3*oneMinTPow2*t*crease,tempt2);
        var tempt3=m4m.math.pool.new_vector3();
        m4m.math.vec3ScaleByNum(curveEndHandle,3*oneMinT*Math.pow(t,2)*crease,tempt3);
        var tempt4=m4m.math.pool.new_vector3();
        m4m.math.vec3ScaleByNum(curveEnd,Math.pow(t,3)*oneMinCrease,tempt4);

        var tempt5=m4m.math.pool.new_vector3();
        m4m.math.vec3Add(tempt1,tempt2,tempt5);
        m4m.math.vec3Add(tempt5,tempt3,tempt5);
        m4m.math.vec3Add(tempt5,tempt4,tempt5);
        
        m4m.math.vec3ScaleByNum(tempt5,1/(oneMinTPow3*oneMinCrease+3*oneMinTPow2*t*crease+3*oneMinT*Math.pow(t,2)*crease+Math.pow(t,3)*oneMinCrease),out);

        m4m.math.pool.delete_vector3(tempt1);
        m4m.math.pool.delete_vector3(tempt2);
        m4m.math.pool.delete_vector3(tempt3);
        m4m.math.pool.delete_vector3(tempt4);
        m4m.math.pool.delete_vector3(tempt5);
    }
    // export function GetPointAlongCurve2(curveStart:vector3,curveStartHandle:vector3,curveEnd:vector3,curveEndHandle:vector3,t:number, out:vector3,crease:number=0.3)
    // {
    //     var oneMinT = 1 - t;
    //     var oneMinTPow3 =Math.pow(oneMinT, 3);
    //     var oneMinTPow2 = Math.pow(oneMinT, 2);

    //     var tempt1=m4m.math.pool.new_vector3();
    //     m4m.math.vec3ScaleByNum(curveStart,oneMinTPow3,tempt1);
    //     var tempt2=m4m.math.pool.new_vector3();
    //     m4m.math.vec3ScaleByNum(curveStartHandle,3*oneMinTPow2*t,tempt2);
    //     var tempt3=m4m.math.pool.new_vector3();
    //     m4m.math.vec3ScaleByNum(curveEndHandle,3*oneMinT*Math.pow(t,2),tempt3);
    //     var tempt4=m4m.math.pool.new_vector3();
    //     m4m.math.vec3ScaleByNum(curveEnd,Math.pow(t,3),tempt4);

    //     var tempt5=m4m.math.pool.new_vector3();
    //     m4m.math.vec3Add(tempt1,tempt2,tempt5);
    //     m4m.math.vec3Add(tempt5,tempt3,tempt5);
    //     m4m.math.vec3Add(tempt5,tempt4,tempt5);
       
    //     m4m.math.pool.delete_vector3(tempt1);
    //     m4m.math.pool.delete_vector3(tempt2);
    //     m4m.math.pool.delete_vector3(tempt3);
    //     m4m.math.pool.delete_vector3(tempt4);
    //     m4m.math.pool.delete_vector3(tempt5);
    // }
}