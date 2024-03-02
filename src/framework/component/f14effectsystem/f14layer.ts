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
    export class F14Layer
    {
        public active:boolean = true;//timeline window 的toggle
        public effect:f14EffectSystem;

        public data:F14LayerData;
        public type:F14TypeEnum;

        public frameList:number[] =[];//记录存在的frame，再排个序  boolcontainframe (关键帧的索引值，从小到大)
        public frames:{[index:number]:F14Frame} = {};//取得对应Frame的信息
    
        public Attlines:{[name:string]:F14AttTimeLine} ={}; //记录了五种数据的（关键帧位置和值）
    
        public element:F14Element;
        public batch:F14Basebatch;
        /**
         * F14 层
         * @param effect F14特效系统 
         * @param data F14 层数据
         */
        constructor(effect:f14EffectSystem,data:F14LayerData)
        {
            this.effect = effect;
            this.data = data;
            this.type = data.type;
            for(var ff in this.data.frames)
            {
                let framedata = this.data.frames[ff];
                this.addFrame(framedata.frameindex, framedata);
            }
        }
        // //改变data的life
        // public OnChangeEffectLife()
        // {
        //     for(let i= this.frameList.length-1; i>=0;i--)
        //     {
        //        if(this.frameList[i]>=this.effect.data.lifeTime)
        //         {
        //             this.removeFrame(this.frameList[i]);
        //         } 
        //     }
        // }
        /**
         * 添加帧
         * @param index 帧索引
         * @param framedata 帧数据
         * @returns F14 帧
         */
        public addFrame(index:number,framedata:F14FrameData):F14Frame
        {
            if (this.frames[index]) return this.frames[index];
            // if(framedata == null)
            // {
            //     framedata = new F14FrameData(index,this.type);
            //     if(this.type==F14TypeEnum.particlesType)
            //     {
            //         F14EmissionBaseData.copyto(this.data.elementdata, framedata.EmissionData);
            //     }
            //     // //scriptableObject
            //     this.data.frames[index]=framedata;
            // }
            let frame = new F14Frame(this, framedata);
            this.frameList.push(index);
            this.frameList.sort((a,b)=>{return a-b;});
            this.frames[index]=frame;
            return frame;
        }

        /**
         * 移除帧
         * @param frame 帧索引
         */
        public removeFrame(frame:number)
        {
            if (this.frames[frame])
            {
                delete this.frames[frame];
                let index=this.frameList.indexOf(frame);
                this.frameList.splice(index,1);

                //scriptableObject
                delete this.data.frames[frame];
            } 
    
            for(var item in this.Attlines)
            {
                this.Attlines[item].remove(frame);
            }
    
        }

        /**
         * 销毁
         */
        public dispose()
        {
            this.data=null;
            this.effect=null;
            this.frameList.length=0;
            this.frames=null;
            this.Attlines=null;
            this.element=null;
            this.batch=null;
        }
    }
    export class F14Frame
    {
        public layer:F14Layer;
        public data:F14FrameData;
        public attDic:{[name:string]:any};//自行设置的data 包含5种关键数据
        /**
         * F14 帧
         * @param layer F14 层
         * @param data F14 帧数据
         */
        constructor(layer:F14Layer,data:F14FrameData)
        {
            this.layer = layer;
            this.data = data;
            this.attDic=this.data.singlemeshAttDic;

            for(let key in this.data.singlemeshAttDic)
            {
                this.setdata(key,this.data.singlemeshAttDic[key]);
            }

        }
        
        /**
         * 设置数据
         * @param name 数据名 
         * @param obj 数据
         */
        public setdata(name:string,obj)
        {
            if(this.layer.Attlines[name]==null)
            {
                if(obj instanceof m4m.math.vector3)
                {
                    this.layer.Attlines[name]=new F14AttTimeLine(name,m4m.math.vec3SLerp,m4m.math.vec3Clone);
                }else if(obj instanceof m4m.math.vector4)
                {
                    this.layer.Attlines[name]=new F14AttTimeLine(name,m4m.math.vec4SLerp,math.vec4Clone);
                }else if(obj instanceof m4m.math.color)
                {
                    this.layer.Attlines[name]=new F14AttTimeLine(name,m4m.math.colorLerp,math.colorClone);                    
                }
            }
            this.layer.Attlines[name].addNode(this.data.frameindex, obj);
            this.attDic[name]=obj;
        }

        /**
         * 移除数据
         * @param name 数据名 
         */
        public removedata(name:string)
        {
            delete this.attDic[name];
            if(this.layer.Attlines[name])
            {
                this.layer.Attlines[name].remove(this.data.frameindex);
            }
        }
    
        /**
         * 获取数据
         * @param name 数据名 
         * @returns 
         */
        public getdata(name:string)
        {
            return this.attDic[name];
        }
    }
    
    export class F14AttTimeLine
    {

        public name:string;
        /**
         * 差值函数
         */
        public lerpFunc:(from,to,lerp,out)=>void;
        /**
         * 克隆函数
         */
        public cloneFunc:(from,to)=>void;
        constructor(name:string,lerpfunc:(from,to,lerp,out)=>void,clonefunc:(from,to)=>void)
        {
            this.name = name;
            this.lerpFunc=lerpfunc;
            this.cloneFunc=clonefunc;
        }
        
        public frameList:number[] =[];    //记录了关键帧的索引值
        public line:{[index:number]:any} ={};//记录了关键帧的帧索引和某一项值
    
        //public Dictionary<int, object> cacheData = new Dictionary<int, object>();
        /**
         * 添加节点
         * @param frame  帧ID
         * @param value 值
         */
        public addNode(frame:number,value:any)
        {
            let index:number=this.frameList.indexOf(frame);
            if(index<0)
            {
                this.frameList.push(frame);   
                this.frameList.sort((a,b)=>{return a-b;});             
            }
            this.line[frame] = value;
        }

        /**
         * 移除
         * @param frame 帧ID
         */
        public remove(frame:number)
        {
            if(this.line[frame])
            {
                delete this.line[frame];
                let index=this.frameList.indexOf(frame);
                this.frameList.splice(index,1);
            }

        }
        
        /**
         * 获取值
         * @param frame 帧ID
         * @param basedate 数据
         * @param out 返回值
         */
        public getValue(frame:number, basedate:F14SingleMeshBaseData,out:any)
        {
            //if (this.frameList.Contains(frame)) return this.line[frame];
            if (this.frameList.length == 0)
            {
                return;
            }
            if(this.line[frame])
            {
                this.cloneFunc(this.line[frame],out);
                return;
            }

            if(frame < this.frameList[0])
            {
                let toindex = this.frameList[0];
                let from=basedate[this.name];
                let to = this.line[toindex];
                let lerp=(frame-basedate.firtstFrame)/toindex;
                this.lerpFunc(from, to,lerp,out);
            }else if(frame>=this.frameList[this.frameList.length-1])
            {
                //out=this.line[this.frameList[this.frameList.length - 1]];
                this.cloneFunc(this.line[this.frameList[this.frameList.length - 1]],out);
            }else
            {
                for (let i=0;i<this.frameList.length;i++)
                {
                    if(this.frameList[i]>frame)
                    {
                        let to = this.frameList[i];
                        let from = this.frameList[i - 1];
                        this.lerpFunc(this.line[from],this.line[to], (frame - from)/(to - from),out);
                        return;
                    }
                }
            }
    

        }
    }
    
    

}