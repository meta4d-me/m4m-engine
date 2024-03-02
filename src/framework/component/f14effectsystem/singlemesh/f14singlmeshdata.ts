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

    export enum LoopEnum
    {
        Restart=0,
        TimeContinue=1
    }
    // export enum UVTypeEnum
    // {
    //     NONE,
    //     UVRoll,
    //     UVSprite
    // }
    export enum BindAxis
    {
        X=0,
        Y=1,
        NONE=2
    }
    export class F14SingleMeshBaseData implements F14ElementData 
    {

        public loopenum:LoopEnum= LoopEnum.Restart;
    
        public mesh:mesh;
        public material:material;
    
        //public bool beloop = false;
    
        public position:m4m.math.vector3 = new m4m.math.vector3();
        public scale:m4m.math.vector3 = new m4m.math.vector3(1,1,1);
        public euler:m4m.math.vector3 = new m4m.math.vector3();
        public color:m4m.math.color = new m4m.math.color(1,1,1,1);
        public tex_ST:m4m.math.vector4 = new m4m.math.vector4();
    
        //-----------------texture animation
        public enableTexAnimation:boolean = false;
        public uvType: UVTypeEnum= UVTypeEnum.NONE;
        //uvroll---/uspeed/vspeed
        public uSpeed:number;
        public vSpeed:number;
        //UVSprite---/row/column/count
        public row:number;
        public column:number;
        public count:number;

            //-------------billboard
        public beBillboard:boolean=false;
        public bindAxis:BindAxis=BindAxis.NONE;


        //-----------------attline 计算插值
        firtstFrame:number=0;
        /**
         * f14 单mesh数据
         * @param firstFrame 名
         */
        public constructor(firstFrame:number)
        {
            this.firtstFrame=firstFrame;
            this.mesh = m4m.framework.sceneMgr.app.getAssetMgr().getDefaultMesh("quad");
            this.material = m4m.framework.sceneMgr.app.getAssetMgr().getDefParticleMat();
        }
        parse(json: any, assetmgr: assetMgr, assetbundle: string) {
            switch(json.loopenum)
            {
                case "Restart":
                    this.loopenum=LoopEnum.Restart;
                    break;
                case "TimeContinue":
                    this.loopenum=LoopEnum.TimeContinue;
                    break;
            }
            this.mesh=(assetmgr.getAssetByName(json.mesh,assetbundle)||assetmgr.getAssetByName(json.mesh.replace(".mesh.bin",".cmesh.bin"),assetbundle) ) as m4m.framework.mesh;
            this.material=assetmgr.getAssetByName(json.material,assetbundle) as m4m.framework.material;
            m4m.math.vec3FormJson(json.position,this.position);
            m4m.math.vec3FormJson(json.scale,this.scale);
            m4m.math.vec3FormJson(json.euler,this.euler);
            m4m.math.colorFormJson(json.color,this.color);
            m4m.math.vec4FormJson(json.tex_ST,this.tex_ST);
            this.enableTexAnimation=json.enableTexAnimation;
            if(this.enableTexAnimation)
            {
                switch(json.uvType)
                {
                    case "UVRoll":
                        this.uvType=UVTypeEnum.UVRoll;
                        this.uSpeed=json.uSpeed;
                        this.vSpeed=json.vSpeed;
                        break;
                    case "UVSprite":
                        this.uvType=UVTypeEnum.UVSprite;
                        this.row=json.row;
                        this.column=json.column;
                        this.count=json.count;
                        break;
                    case "NONE":
                        this.uvType=UVTypeEnum.NONE;
                        break;
                }
            }
            if(json.beBillboard!=null)
            {
                this.beBillboard=json.beBillboard;
                switch(json.bindAxis)
                {
                    case "NONE":
                        this.bindAxis=BindAxis.NONE;
                        break;
                    case "X":
                        this.bindAxis=BindAxis.X;
                        break;
                    case "Y":
                        this.bindAxis=BindAxis.Y;
                        break;
                }
            }
        }
    
    }
    
}