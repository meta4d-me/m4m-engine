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

    export enum RenderModelEnum
    {
        None,
        BillBoard,
        StretchedBillBoard,
        HorizontalBillBoard,
        VerticalBillBoard,
        Mesh
    }

    export class F14EmissionBaseData implements F14ElementData
    {

        public loopenum: LoopEnum = LoopEnum.Restart;


        public mesh: mesh;
        public material: material;

        public rotPosition: math.vector3 = new math.vector3();
        public rotScale: math.vector3 = new math.vector3(1, 1, 1);
        public rotEuler: math.vector3 = new math.vector3();

        //----------------render
        public rendermodel: RenderModelEnum = RenderModelEnum.Mesh;
        //public Material material;  
        //public Mesh mesh;//仅在rendermodel为mesh的时候显示     
        public beloop: boolean = true;
        public lifeTime: NumberData = new NumberData(20);
        public simulateInLocalSpace: boolean = true;//粒子运动运动空间（世界还是本地)
        public startScaleRate: NumberData = new NumberData(1);
        public startScale: Vector3Data = new Vector3Data(1, 1, 1);
        public startEuler: Vector3Data = new Vector3Data();
        //public Vector4 startColor = new Vector4(1, 1, 1, 1);//直接分为color和alpha，不纠结了
        public startColor: Vector3Data = new Vector3Data(1, 1, 1);
        public startAlpha: NumberData = new NumberData(1);
        public colorRate: number = 1;
        public simulationSpeed: NumberData = new NumberData(1);
        //20171018增加的
        public start_tex_st: math.vector4 = new math.vector4(1, 1, 0, 0);
        //----------------emision
        public delayTime: number = 0;
        public duration: number = 10;
        //public NumberData emissionCount = new NumberData(4);
        //20171017增加的
        public rateOverTime: NumberData = new NumberData(1);
        //burst 只在basedata中展示，不在关键帧编辑窗口展示
        public bursts: busrtInfo[] = [];


        //----------------emission shape
        public shapeType: ParticleSystemShape = ParticleSystemShape.NORMAL;
        //box---/width/height/depth
        public width: number;
        public height: number;
        public depth: number;
        //sphere---/radius/
        public radius: number;
        //hemisphere---/radius/
        //cone---/angle/radius/height/emitfrom
        public angle: number;
        public emitFrom: emitfromenum = emitfromenum.base;


        //----------------------------------------可选类型-----------------------------------------------------------
        //-----------------position over lifetime
        public enableVelocityOverLifetime: boolean = false;
        public moveSpeed: Vector3Data = new Vector3Data(0);

        //-----------------scale over lifetime
        public enableSizeOverLifetime: boolean = false;
        public sizeNodes: NumberKey[] = [];

        //-----------------rot over lifetime
        public enableRotOverLifeTime: boolean = false;
        public angleSpeed: NumberData = new NumberData(0);

        //-----------------color & alpha over lifetime
        public enableColorOverLifetime: boolean = false;
        public colorNodes: Vector3Key[] = [];
        public alphaNodes: NumberKey[] = [];

        //-----------------texture animation
        public enableTexAnimation: boolean = false;
        public uvType: UVTypeEnum = UVTypeEnum.NONE;
        //uvroll---/uspeed/vspeed
        public uSpeed: number;
        public vSpeed: number;
        //UVSprite---/row/column/count
        public row: number;
        public column: number;
        public count: number;

        /**
         *  解析
         * @param json json数据
         * @param assetmgr 资源管理器
         * @param assetbundle assetbundle名
         */
        parse(json: any, assetmgr: assetMgr, assetbundle: string)
        {
            switch (json.loopenum)
            {
                case "Restart":
                    this.loopenum = LoopEnum.Restart;
                    break;
                case "TimeContinue":
                    this.loopenum = LoopEnum.TimeContinue;
                    break;
            }
            this.mesh = (assetmgr.getAssetByName(json.mesh, assetbundle) || assetmgr.getAssetByName(json.mesh.replace("mesh.bin", "cmesh.bin"), assetbundle)) as m4m.framework.mesh;

            this.material = assetmgr.getAssetByName(json.material, assetbundle) as m4m.framework.material;
            m4m.math.vec3FormJson(json.rotPosition, this.rotPosition);
            m4m.math.vec3FormJson(json.rotScale, this.rotScale);
            m4m.math.vec3FormJson(json.rotEuler, this.rotEuler);
            switch (json.rendermodel)
            {
                default:
                case "BillBoard":
                    this.rendermodel = RenderModelEnum.BillBoard;
                    break;
                case "HorizontalBillBoard":
                    this.rendermodel = RenderModelEnum.HorizontalBillBoard;
                    break;
                case "Mesh":
                    this.rendermodel = RenderModelEnum.Mesh;
                    break;
                case "StretchedBillBoard":
                    this.rendermodel = RenderModelEnum.StretchedBillBoard;
                    break;
                case "VerticalBillBoard":
                    this.rendermodel = RenderModelEnum.VerticalBillBoard;
                    break;
                case "None":
                    this.rendermodel = RenderModelEnum.None;
                    break;
            }
            this.beloop = json.beloop;
            NumberData.FormJson(json.lifeTime, this.lifeTime);
            this.simulateInLocalSpace = json.simulateInLocalSpace;
            NumberData.FormJson(json.startScaleRate, this.startScaleRate);
            Vector3Data.FormJson(json.startScale, this.startScale);
            Vector3Data.FormJson(json.startEuler, this.startEuler);
            Vector3Data.FormJson(json.startColor, this.startColor);
            NumberData.FormJson(json.startAlpha, this.startAlpha);
            this.colorRate = json.colorRate;
            NumberData.FormJson(json.simulationSpeed, this.simulationSpeed);
            m4m.math.vec4FormJson(json.start_tex_st, this.start_tex_st);
            this.delayTime = json.delayTime;
            this.duration = json.duration;
            NumberData.FormJson(json.rateOverTime, this.rateOverTime);
            for (let i = 0; i < json.bursts.length; i++)
            {
                let item = json.bursts[i];
                let info = busrtInfo.CreatformJson(item);
                this.bursts.push(info);
            }
            switch (json.shapeType)
            {
                case "NORMAL":
                    this.shapeType = ParticleSystemShape.NORMAL;
                    break;
                case "BOX":
                    this.shapeType = ParticleSystemShape.BOX;
                    this.width = json.width;
                    this.height = json.height;
                    this.depth = json.depth;
                    break;
                case "SPHERE":
                    this.shapeType = ParticleSystemShape.SPHERE;
                    this.radius = json.radius;
                    break;
                case "HEMISPHERE":
                    this.shapeType = ParticleSystemShape.HEMISPHERE;
                    this.radius = json.radius;
                    break;
                case "CONE":
                    this.shapeType = ParticleSystemShape.CONE;
                    this.height = json.height;
                    this.angle = json.angle;
                    this.radius = json.radius;
                    switch (json.emitFrom)
                    {
                        case "base_":
                            this.emitFrom = emitfromenum.base;
                            break;
                        case "volume":
                            this.emitFrom = emitfromenum.volume;
                            break;
                    }
                    break;
                case "CIRCLE":
                    this.shapeType = ParticleSystemShape.CIRCLE;
                    break;
                case "EDGE":
                    this.shapeType = ParticleSystemShape.EDGE;
                    break;
            }
            this.enableVelocityOverLifetime = json.enableVelocityOverLifetime;
            if (this.enableVelocityOverLifetime)
            {
                Vector3Data.FormJson(json.moveSpeed, this.moveSpeed);
            }
            this.enableSizeOverLifetime = json.enableSizeOverLifetime;
            if (this.enableSizeOverLifetime)
            {
                for (let i = 0; i < json.sizeNodes.length; i++)
                {
                    let jsonitem = json.sizeNodes[i];
                    let item = new NumberKey(jsonitem.key, jsonitem.value);
                    this.sizeNodes.push(item);
                }
            }
            this.enableRotOverLifeTime = json.enableRotOverLifeTime;
            if (this.enableRotOverLifeTime)
            {
                NumberData.FormJson(json.angleSpeed, this.angleSpeed);
            }
            this.enableColorOverLifetime = json.enableColorOverLifetime;
            if (this.enableColorOverLifetime)
            {
                for (let i = 0; i < json.colorNodes.length; i++)
                {
                    let jsonitem = json.colorNodes[i];
                    let v3 = new math.vector3();
                    m4m.math.vec3FormJson(jsonitem.value, v3);
                    let item = new Vector3Key(jsonitem.key, v3);
                    this.colorNodes.push(item);
                }
                for (let i = 0; i < json.alphaNodes.length; i++)
                {
                    let jsonitem = json.alphaNodes[i];
                    let item = new NumberKey(jsonitem.key, jsonitem.value);
                    this.alphaNodes.push(item);
                }
            }
            this.enableTexAnimation = json.enableTexAnimation;
            if (this.enableTexAnimation)
            {
                switch (json.uvType)
                {
                    case "UVRoll":
                        this.uvType = UVTypeEnum.UVRoll;
                        this.uSpeed = json.uSpeed;
                        this.vSpeed = json.vSpeed;
                        break;
                    case "UVSprite":
                        this.uvType = UVTypeEnum.UVSprite;
                        this.row = json.row;
                        this.column = json.column;
                        this.count = json.count;
                        break;
                    case "NONE":
                        this.uvType = UVTypeEnum.NONE;
                        break;
                }
            }
        }

        /**
         * 获取发射数据的随机方向和位置
         * @param emission 发射数据
         * @param outDir 输出方向
         * @param outPos 输出位置
         */
        public static getRandomDirAndPosByZEmission(emission: F14EmissionBaseData, outDir: m4m.math.vector3, outPos: m4m.math.vector3)
        {
            var o, o1;
            switch (emission.shapeType)
            {
                case ParticleSystemShape.NORMAL:
                    m4m.math.vec3Clone(m4m.math.pool.vector3_zero, outPos);
                    m4m.math.vec3Clone(m4m.math.pool.vector3_up, outDir);
                    break;
                case ParticleSystemShape.SPHERE:
                    o = Math.random() * Math.PI * 2;
                    o1 = Math.random() * Math.PI;
                    outDir.x = Math.sin(o1) * Math.cos(o);
                    outDir.y = Math.cos(o1);
                    outDir.z = Math.sin(o1) * Math.sin(o);
                    var radius = Math.random() * emission.radius;

                    m4m.math.vec3ScaleByNum(outDir, radius, outPos);
                    break;
                case ParticleSystemShape.HEMISPHERE:
                    o = Math.random() * Math.PI * 2;
                    o1 = Math.random() * Math.PI * 0.5;
                    var radius = Math.random() * emission.radius;
                    outDir.x = Math.sin(o1) * Math.cos(o);
                    outDir.y = Math.cos(o1);
                    outDir.z = Math.sin(o1) * Math.sin(o);
                    m4m.math.vec3ScaleByNum(outDir, radius, outPos);
                    break;
                case ParticleSystemShape.BOX:
                    outPos.x = ValueData.RandomRange(-emission.width / 2, emission.width / 2);
                    outPos.y = ValueData.RandomRange(-emission.height / 2, emission.height / 2);
                    outPos.z = ValueData.RandomRange(-emission.depth / 2, emission.depth / 2);
                    m4m.math.vec3Normalize(outPos, outDir);
                    break;
                case ParticleSystemShape.CONE:
                    var randomAngle = Math.random() * Math.PI * 2;//弧度
                    var randomHeight = Math.random() * emission.height;
                    var upradius = randomHeight * Math.tan(emission.angle * Math.PI / 180) + emission.radius;
                    var radomRadius = Math.random() * upradius;

                    var bottompos = m4m.math.pool.new_vector3();
                    bottompos.x = emission.radius * Math.cos(randomAngle);
                    bottompos.y = 0;
                    bottompos.z = emission.radius * Math.sin(randomAngle);

                    if (emission.emitFrom == emitfromenum.base)
                    {
                        m4m.math.vec3Clone(bottompos, outPos);
                    }
                    else if (emission.emitFrom == emitfromenum.volume)
                    {
                        outPos.x = radomRadius * Math.cos(randomAngle);
                        outPos.z = radomRadius * Math.sin(randomAngle);
                        outPos.y = randomHeight;
                    }
                    outDir.x = Math.cos(randomAngle) * Math.sin(emission.angle * Math.PI / 180);
                    outDir.z = Math.sin(randomAngle) * Math.sin(emission.angle * Math.PI / 180);
                    outDir.y = Math.cos(emission.angle * Math.PI / 180);
                    break;
            }
        }

    }
    export class busrtInfo
    {
        public time: number = 0;
        public count: NumberData = new NumberData(10);
        private _beburst: boolean = false;
        /**
         * 是否射出
         * @returns 
         */
        public beburst(): boolean
        {
            return this._beburst;
        }

        /**
         * 设置射出状态
         * @param bebusrt  是否射出
         */
        public burst(bebusrt: boolean = true)
        {
            this._beburst = bebusrt;
        }

        /**
         * 创建通过JSON数据
         * @param json json数据
         * @returns busrtInfo对象
         */
        static CreatformJson(json: any): busrtInfo
        {
            let info = new busrtInfo();
            info.time = json.time;
            NumberData.FormJson(json.count, info.count);
            return info
        }
    }
}