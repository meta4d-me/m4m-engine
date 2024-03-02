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
/// <reference path="../../../io/reflect.ts" />

namespace m4m.framework
{
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 路径编辑资源
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class pathasset implements IAsset
    {
        static readonly ClassName:string="pathasset";

        @m4m.reflect.Field("constText")
        private name: constText;
        private id: resID = new resID();
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 是否为默认资源
         * @version m4m 1.0
         */
        defaultAsset: boolean = false;
        /**
         * 路径资源
         * @param assetName 资源名
         */
        constructor(assetName: string = null)
        {
            if (!assetName)
            {
                assetName = "path_" + this.getGUID();
            }
            this.name = new constText(assetName);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取资源名称
         * @version m4m 1.0
         */
        getName(): string
        {
            return this.name.getText();
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取资源唯一id
         * @version m4m 1.0
         */
        getGUID(): number
        {
            return this.id.getID();
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 引用计数加一
         * @version m4m 1.0
         */
        use()
        {
            sceneMgr.app.getAssetMgr().use(this);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 引用计数减一
         * @version m4m 1.0
         */
        unuse()
        {
            sceneMgr.app.getAssetMgr().unuse(this);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 释放资源
         * @version m4m 1.0
         */
        dispose()
        {
           this.paths.length=0;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 计算资源字节大小
         * @version m4m 1.0
         */
        caclByteLength(): number
        {
            if (this.paths)
            {
                var length=this.paths.length;
                var value=length*12;
                return value;
            }
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 路径节点数据
         * @version m4m 1.0
         */
        paths:m4m.math.vector3[]=[];
        private type:pathtype;
        private instertPointcount:number;
        private items:pointitem[]=[];
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 解析资源
         * @param json json数据
         * @version m4m 1.0
         */
        Parse(json:JSON)
        {
           var type:string=json["type"];
           switch(type)
           {
               case "once":
               this.type=pathtype.once;
               break;
               case "loop":
               this.type=pathtype.loop;
               break;
               case "pingpong":
               this.type=pathtype.pingpong;
           }
           this.instertPointcount=json["insertPointcount"];
           var paths=json["path"];
           for (var key in paths)
           {
                var item=new pointitem();
                var pointnode=paths[key];
                var pointtype=pointnode["type"];
                switch(pointtype)
                {
                    case "VertexPoint":
                    item.type=epointtype.VertexPoint;
                    break;

                    case "ControlPoint":
                    item.type=epointtype.ControlPoint;
                    break;
                }
                var pointlocation:string=pointnode["point"];
                var arr=pointlocation.split(",");
                item.point=new m4m.math.vector3(parseFloat(arr[0]),parseFloat(arr[1]),parseFloat(arr[2]));
                this.items.push(item);
                return this;
           }
           this.getpaths();
           //------------------------------------------------
           this.items.length=0;
           for(var i=0;i<this.lines.length;i++)
           {
               this.lines[i].length=0;
           }
           this.lines.length=0;
           return  this;
        }
        private lines:Array<m4m.math.vector3>[]=[];
        /**
         * 获取 路径
         */
        private getpaths()
        {
            var line=new Array();
            for(var i=0;i<this.items.length;i++)
            {
                var item=this.items[i];
                if(i==0)
                {
                    line.push(item.point);
                    this.lines.push(line);
                }
                else if(i==this.items.length-1)
                {
                    if(this.type==pathtype.loop)
                    {
                        if(item.type==epointtype.VertexPoint)
                        {
                            line.push(item.point);
                            line=new Array();
                            line.push(item.point);
                            line.push(this.items[0].point);
                            this.lines.push(line);
                        }
                        else
                        {
                            line.push(item.point);
                            line.push(this.items[0].point);
                        }
                    }
                    else
                    {
                        line.push(item.point);
                    }
                }
                else
                {
                    if(item.type==epointtype.VertexPoint)
                    {
                        line.push(item.point);
                        line=new Array();
                        line.push(item.point);
                        this.lines.push(line);
                    }
                    else
                    {
                        line.push(item.point);
                    }
                }
            }
            //-------------------------------------
            var linecount=this.lines.length;
            var pathindex=0;
            for(var i=0;i<linecount;i++)
            {
                if(i==linecount-1)
                {
                    for(var k=0;k<this.instertPointcount;k++)
                    {
                        var rate=k/(this.instertPointcount-1);
                        this.paths[pathindex]=this.getBeisaierPointAlongCurve(this.lines[i],rate);
                        pathindex++;
                    }
                }
                else
                {
                    for(var k=0;k<this.instertPointcount;k++)
                    {
                        var rate=k/this.instertPointcount;
                        this.paths[pathindex]=this.getBeisaierPointAlongCurve(this.lines[i],rate);
                        pathindex++;
                    }
                }

            }
        }

        /**
         * 沿曲线获取贝塞尔点
         * @param points 点列表
         * @param rate 比率
         * @param clearflag 是否清理
         * @returns 点
         */
        private getBeisaierPointAlongCurve(points:any[],rate:number,clearflag:boolean=false):m4m.math.vector3
        {
            var length=points.length;
            if(points.length<2)
            {
                console.log("計算貝塞爾需要超過2個點");
                return;
            }
            if(length==2)
            {
                var out:m4m.math.vector3=new m4m.math.vector3();
                this.vec3Lerp(points[0],points[1],rate,out);
                if(clearflag)
                {
                    points.length=0;
                }
                return out;
            }
            var temptpoints:m4m.math.vector3[]=[];
            for(var i=0;i<length-1;i++)
            {
                var temp=m4m.math.pool.new_vector3();
                this.vec3Lerp(points[i],points[i+1],rate,temp);
                temptpoints[i]=temp;
            }
            if(clearflag)
            {
                points.length=0;
            }
            return this.getBeisaierPointAlongCurve(temptpoints,rate,true);
        }

        /**
         * 3维向量 差值
         * @param start 开始值 
         * @param end 结束值
         * @param lerp 差值度
         * @param out 输出结果
         */
        private vec3Lerp(start:m4m.math.vector3,end:m4m.math.vector3,lerp:number,out:m4m.math.vector3)
        {
            m4m.math.vec3Subtract(end,start,out);
            m4m.math.vec3ScaleByNum(out,lerp,out);
            m4m.math.vec3Add(start,out,out);
        }
    }
    /**
     * @private
     */
    export enum pathtype
    {
        once,
        loop,
        pingpong
    }
    /**
     * @private
     */
    export enum epointtype
    {
        VertexPoint,
	    ControlPoint
    }
    /**
     * @private
     */
    export  class pointitem
    {
        point:m4m.math.vector3;
        type:epointtype;
        // constructor(point:m4m.framework.transform,type:pointtype)
        // {
        //     this.point=point;
        //     this.type=type;
        // }
    }
    
}