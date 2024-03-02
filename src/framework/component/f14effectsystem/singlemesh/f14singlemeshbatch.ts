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
    export interface F14Basebatch
    {
        type:F14TypeEnum;
        effect:f14EffectSystem;
        //public F14Layer layer;
        /**
         * 渲染
         * @param context 引擎渲染上下文 
         * @param assetmgr 资源管理器
         * @param camera 相机对象
         * @param Effqueue 特效队列ID
         */
        render(context: renderContext, assetmgr: assetMgr, camera: camera,Effqueue:number);
        /**
         * 取消渲染
         */
        unRender();
        /**
         * 销毁
         */
        dispose();
        /**
         * 获取元素数量
         * @returns 
         */
        getElementCount():number;
    }
    
    export class F14SingleMeshBath implements F14Basebatch
    {

        type: F14TypeEnum;
        effect: f14EffectSystem;

        public ElementMat:m4m.framework.material;
    
        public meshlist:F14SingleMesh[] =[];
        private activemeshlist:F14SingleMesh[] =[];
    
        private mesh:m4m.framework.mesh = new mesh();
        public indices:number[] =[];
        public vertices:math.vector3[] =[];
        public colors:math.color[] =[];
        public uv:math.vector2[] = [];
    
        //----------------------------------------------

        dataForVbo: Float32Array;
        dataForEbo: Uint16Array;
        // private totalVertexCount:number=0;
        // private toltalIndexCount:number=0;

        curRealVboCount:number=0;
        curVertexcount:number=0;
        curIndexCount:number=0;

        vertexLength:number=0;
        /**
         * f14 单mesh 合批
         * @param mat 材质
         * @param effect 特效系统
         */
        public constructor(mat:material, effect:f14EffectSystem)
        {
            this.type=F14TypeEnum.SingleMeshType;
            this.effect = effect;
    
            this.ElementMat = mat;
        }
        private noBatch=false;
        OnEndCollectElement()
        {
            this.vertexLength=m4m.render.meshData.calcByteSize(this.effect.VF)/4;
            if(this.meshlist.length==1)
            {
                this.noBatch=true;
                this.mesh.glMesh = new m4m.render.glMesh();
                //this.dataForVbo=this.meshlist[0].dataforvbo;
                this.dataForVbo=this.meshlist[0].baseddata.mesh.data.genVertexDataArray(this.effect.VF);
                
                //this.dataForEbo=this.meshlist[0].dataforebo;
                this.dataForEbo=this.meshlist[0].baseddata.mesh.data.genIndexDataArray() as Uint16Array;

                this.mesh.glMesh.initBuffer(this.effect.webgl,this.effect.VF,this.meshlist[0].baseddata.mesh.data.getVertexCount(),render.MeshTypeEnum.Static);
                this.mesh.glMesh.uploadVertexData(this.effect.webgl, this.dataForVbo);
                this.mesh.glMesh.addIndex(this.effect.webgl, this.dataForEbo.length);
                this.mesh.glMesh.uploadIndexData(this.effect.webgl, 0, this.dataForEbo);
                this.mesh.glMesh.initVAO();
                
                this.mesh.submesh = [];
                {
                    var sm = new subMeshInfo();
                    sm.matIndex = 0;
                    sm.start = 0;
                    sm.size = this.dataForEbo.length;
                    sm.line = false;
                    this.mesh.submesh.push(sm);
                }
                return;
            }
            let totalVertexCount:number=0;
            let toltalIndexCount:number=0;
            for(let i=0,len=this.meshlist.length;i<len;i++)
            {
                totalVertexCount+=this.meshlist[i].baseddata.mesh.data.getVertexCount();
                toltalIndexCount+=this.meshlist[i].baseddata.mesh.data.getTriIndexCount();
            }
            this.dataForVbo=new Float32Array(totalVertexCount*this.vertexLength);
            this.dataForEbo=new Uint16Array(toltalIndexCount);


            this.mesh.glMesh = new m4m.render.glMesh();
            this.mesh.glMesh.initBuffer(this.effect.webgl,this.effect.VF,totalVertexCount,render.MeshTypeEnum.Dynamic);
            //this.mesh.glMesh.uploadVertexData(webgl, v32);

            this.mesh.glMesh.addIndex(this.effect.webgl, this.dataForEbo.length);
            this.mesh.glMesh.initVAO();

            //this.mesh.glMesh.uploadIndexData(webgl, 0, i16);
            this.mesh.submesh = [];
            {
                var sm = new subMeshInfo();
                sm.matIndex = 0;
                sm.start = 0;
                sm.size = this.dataForEbo.length;
                sm.line = false;
                this.mesh.submesh.push(sm);
            }

        }


        public reInit(mat:material,effect:f14EffectSystem)
        {
            this.effect = effect;
            this.ElementMat = mat;
            this.meshlist.length=0;
        }
    
        public addElement(mesh:F14SingleMesh,insert:boolean = false)
        {
            this.meshlist.push(mesh);
            mesh.layer.batch = this;
        }
        public canBatch(mesh:F14SingleMesh):boolean
        {
            if(this.ElementMat != mesh.baseddata.material)
            {
                return  false;
            }
            if(this.ElementMat.getShader().getName().indexOf("mask")>0)
            {
                return false;
            }
            return  true;
        }
        public getElementCount():number
        {
            return this.meshlist.length;
        }

        private mat:math.matrix=new math.matrix();
        private defST:math.vector4=new math.vector4(1,1,0,0);
        private temptColorv4:math.vector4=new math.vector4();
        private uploadData:boolean=false;
        public render(context: renderContext, assetmgr: assetMgr, camera: camera,Effqueue:number)
        {
            //----------------------------找出draw active 的element----------------------------------
            if (this.meshlist.length == 0) return;
            this.activemeshlist.length=0;
            for (let i = 0,len=this.meshlist.length; i < len; i++)//比如，前后两个singlemesh的element，用了同一个material，则共用这一个batch
            {
                if (this.meshlist[i].drawActive)
                {
                    this.activemeshlist.push(this.meshlist[i]);
                }
            }

            if (this.activemeshlist.length < 1) return;
            
            this.ElementMat.setQueue(Effqueue);
            if(this.noBatch)
            {
                m4m.math.matrixMultiply(this.effect.mvpMat, this.activemeshlist[0].targetMat, context.matrixModelViewProject);
                // if(!this.uploadData)
                // {
                //     this.uploadData=true;
                //     this.dataForVbo=this.activemeshlist[0].baseddata.mesh.data.genVertexDataArray(this.effect.VF);
                //     this.dataForEbo=this.activemeshlist[0].baseddata.mesh.data.genIndexDataArray();
                //     this.mesh.glMesh.uploadVertexData(context.webgl,this.dataForVbo);
                //     this.mesh.glMesh.uploadIndexData(context.webgl, 0, this.dataForEbo);
                //     this.mesh.submesh[0].size=this.dataForEbo.length;
                // }
                let singlemesh=this.activemeshlist[0].baseddata.mesh;
                if(singlemesh.updateByEffect==false)
                {
                    let newglmesh=new m4m.render.glMesh();
                    newglmesh.initBuffer(this.effect.webgl,this.effect.VF,singlemesh.data.getVertexCount(),render.MeshTypeEnum.Static);
                    newglmesh.uploadVertexData(this.effect.webgl, this.activemeshlist[0].dataforvbo);
                    // newglmesh.addIndex(this.effect.webgl, this.activemeshlist[0].dataforebo.length);
                    // newglmesh.uploadIndexData(this.effect.webgl, 0, this.activemeshlist[0].dataforebo);
                    newglmesh.ebo=singlemesh.glMesh.ebo;
                    newglmesh.indexCount=singlemesh.glMesh.indexCount;
                    newglmesh.initVAO();

                    singlemesh.glMesh=newglmesh;
                    singlemesh.submesh[0].size = this.activemeshlist[0].dataforebo.length;
                    singlemesh.updateByEffect=true;
                }

                this.temptColorv4.x=this.activemeshlist[0].color.r;
                this.temptColorv4.y=this.activemeshlist[0].color.g;
                this.temptColorv4.z=this.activemeshlist[0].color.b;
                this.temptColorv4.w=this.activemeshlist[0].color.a*(this.activemeshlist[0].settedAlpha||1.0);
                
                // let basemesh=this.activemeshlist[0].baseddata.mesh;
                this.ElementMat.setVector4("_Main_Color",this.temptColorv4);
                this.ElementMat.setVector4("_Main_Tex_ST", this.activemeshlist[0].tex_ST);
                // singlemesh.glMesh.bindVboBuffer(context.webgl);
                this.ElementMat.draw(context, singlemesh,singlemesh.submesh[0]);

            }
            // if(this.noBatch)
            // {
            //     this.ElementMat.setColor("_Main_Color",this.activemeshlist[0].color);
            //     this.ElementMat.setVector4("_Main_Tex_ST", this.activemeshlist[0].tex_ST);
            //     this.ElementMat.setMatrix("_mat",this.activemeshlist[0].targetMat);
            //     this.ElementMat.draw(context,this.mesh,this.mesh.submesh[0]);
            // }else
            else
            {
                m4m.math.matrixClone(this.effect.mvpMat, context.matrixModelViewProject);
                //---------------------集合数据
                this.curIndexCount=0;
                this.curVertexcount=0;
                this.curRealVboCount=0;
                for(let i=0,len=this.activemeshlist.length;i<len;i++)
                {
                    this.activemeshlist[i].uploadMeshdata();
                }

                //---------------------render
                //this.mesh.glMesh.bindVboBuffer(context.webgl);
                
                this.mesh.glMesh.uploadVertexData(context.webgl,this.dataForVbo);
                this.mesh.glMesh.uploadIndexData(context.webgl, 0, this.dataForEbo);
                this.mesh.submesh[0].size=this.curIndexCount;

                this.ElementMat.setVector4("_Main_Color",new math.vector4(1,1,1,1));
                this.ElementMat.setVector4("_Main_Tex_ST",new math.vector4(1,1,0,0));
                this.ElementMat.draw(context,this.mesh,this.mesh.submesh[0]);
            }

            // if (this.activemeshlist.length == 1)
            // {
            //     let singlemsh=this.activemeshlist[0];

            //     let mesh=singlemsh.baseddata.mesh;
            //     this.ElementMat.setColor("_Main_Color", singlemsh.color);
            //     this.ElementMat.setVector4("_Main_Tex_ST", this.activemeshlist[0].tex_ST);
            //     this.ElementMat.setMatrix("_mat",singlemsh.targetMat);
            //     this.ElementMat.draw(context,mesh,mesh.submesh[0]);
            // }else
            // {
            //     //---------------------集合数据
            //     this.curIndexCount=0;
            //     this.curVertexcount=0;
            //     this.curRealVboCount=0;
            //     for(let i=0,len=this.activemeshlist.length;i<len;i++)
            //     {
            //         this.activemeshlist[i].uploadMeshdata();
            //     }

            //     //---------------------render
            //     this.mesh.glMesh.uploadVertexData(context.webgl,this.dataForVbo);
            //     this.mesh.glMesh.uploadIndexData(context.webgl, 0, this.dataForEbo);
            //     this.mesh.submesh[0].size=this.curIndexCount;
            //     this.ElementMat.draw(context,this.mesh,this.mesh.submesh[0]);
            // }

            //----------------------------按照count分情况处理--------------------------------------
        }
        unRender() {
           
        }
        public dispose()
        {
            this.effect=null;
            this.ElementMat=null;
            delete this.meshlist;
            delete this.activemeshlist;
            this.mesh.dispose();
            delete this.mesh;
            delete this.indices;
            delete this.vertices;
            delete this.colors;
            delete this.uv;

            delete this.dataForEbo;
            delete this.dataForVbo;
        }
    }
    
}