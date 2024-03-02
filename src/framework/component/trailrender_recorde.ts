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
     /**
     * @private
     * @language zh_CN
     * @classdesc
     * 拖尾组件，废弃
     * @version m4m 1.0
     */
    @reflect.nodeRender
    @reflect.nodeComponent
    export class trailRender_recorde implements IRenderer
    {
        static readonly ClassName:string="trailRender_recorde";

        //記錄軌跡
        layer: RenderLayerEnum = RenderLayerEnum.Common;
        //renderLayer: m4m.framework.CullingMask = CullingMask.default;
        get renderLayer() {return this.gameObject.layer;}
        set renderLayer(layer:number){
            this.gameObject.layer = layer;
        }
        queue: number = 0;

        //width:number=1;
        private _startWidth: number = 1;
        private _endWidth: number = 0;

        lifetime: number = 0.35;
        minStickDistance: number = 0.1;
        maxStickCout: number = 12;
        private _material: m4m.framework.material;
        private _startColor: m4m.math.color;
        private _endColor: m4m.math.color;

        private trailTrans: m4m.framework.transform;
        private nodes: trailNode[] = [];
        private mesh: m4m.framework.mesh;

        private dataForVbo: Float32Array;
        private dataForEbo: Uint16Array;

        interpolate: boolean = false;//是否中间插点完成平滑
        interpNumber: number = 3;
        interpPath: trailNode[] = [];

        private targetPath: trailNode[];
        //-----------------------------------------------------------------------------------------------
        public set material(material: m4m.framework.material)
        {
            this._material = material;
            this.layer = this._material.getLayer();
        }
        public get material()
        {
            if (this._material != undefined)
            {
                return this._material;
            }
            else
            {
                var mat = new m4m.framework.material();
                mat.setShader(this.app.getAssetMgr().getShader("shader/def"));
                this._material = mat;
                return this._material;
            }
        }

        public get startColor()
        {
            if (this._startColor == undefined)
            {
                this._startColor = new m4m.math.color(1, 1, 1, 1);
            }
            return this._startColor;
        }
        public set startColor(color: m4m.math.color)
        {
            this._startColor = color;
        }
        public set endColor(color: m4m.math.color)
        {
            this._endColor = color;
        }
        public get endColor()
        {
            if (this._endColor == undefined)
            {
                this._endColor = new m4m.math.color(this.startColor.r, this.startColor.g, this.startColor.b, 0);
            }
            return this._endColor;
        }
        /**
         * 设置宽度
         * @param startWidth 开始的宽度
         * @param endWidth 结束的宽度
         */
        public setWidth(startWidth: number, endWidth: number = 0)
        {
            this._startWidth = startWidth;
            this._endWidth = endWidth;
        }
        private activeMaxpointlimit: boolean = false;
        /**
         * 设置最大点限制值
         * @param value 最大点限制值
         */
        setMaxpointcontroll(value: boolean = false)
        {
            this.activeMaxpointlimit = value;
        }

        //------------------------------------------------------------------------------------------------------
        start()
        {

            this.app = this.gameObject.getScene().app;
            this.webgl = this.app.webgl;
            this.mesh = new m4m.framework.mesh();
            this.mesh.data = new m4m.render.meshData();
            this.mesh.glMesh = new m4m.render.glMesh();

            this.dataForVbo = new Float32Array(128);
            this.dataForEbo = new Uint16Array(128);

            var vf = m4m.render.VertexFormatMask.Position | m4m.render.VertexFormatMask.Color | m4m.render.VertexFormatMask.UV0;
            this.mesh.glMesh.initBuffer(this.webgl, vf, 128, render.MeshTypeEnum.Dynamic);

            this.mesh.glMesh.addIndex(this.webgl, this.dataForEbo.length);
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

            if (this.interpolate)
            {
                this.maxStickCout *= this.interpNumber;
                this.targetPath = this.interpPath;
            }
            else
            {
                this.targetPath = this.nodes;
            }
        }

        onPlay()
        {

        }

        private app: application;
        private webgl: WebGL2RenderingContext;
        update(delta: number)
        {
            var _time = this.app.getTotalTime();
            this.refreshTrailNode(_time);
            this.updateTrailData(_time);
        }
        gameObject: gameObject;
         /**
         * @private
         */
        remove()
        {

        }
        /**
         * 刷新拖尾节点
         * @param curTime 时间
         */
        private refreshTrailNode(curTime: number)
        {


            //移除死掉的粒子
            while (this.targetPath.length > 0 && curTime > this.targetPath[this.targetPath.length - 1].time + this.lifetime)
            {
                this.targetPath.pop();
            }

            //插入新粒子
            var pos = new m4m.math.vector3();
            m4m.math.vec3Clone(this.gameObject.transform.getWorldTranslate(), pos);

            var length = this.targetPath.length;
            if (length != 0)
            {
                if (m4m.math.vec3Distance(pos, this.targetPath[0].location) < this.minStickDistance) return;
            }

            var updir = new m4m.math.vector3();
            this.gameObject.transform.getUpInWorld(updir);

            var newNode = new trailNode(pos, updir, curTime);
            this.nodes.unshift(newNode);

            if (this.interpolate)
            {
                if (this.nodes.length > 2)
                {
                    var handle1 = new m4m.math.vector3();
                    m4m.math.vec3Subtract(this.nodes[2].location, this.nodes[0].location, handle1);
                    m4m.math.vec3Normalize(handle1, handle1);
                    this.nodes[1].handle = handle1;
                    if (this.nodes[2].handle == undefined)
                    {
                        var handdle = new m4m.math.vector3();
                        m4m.math.vec3Subtract(this.nodes[2].location, this.nodes[1].location, handdle);
                        m4m.math.vec3Normalize(handdle, handdle);
                        this.nodes[2].handle = handdle;
                    }
                    var vec3Distance = m4m.math.vec3Distance(this.nodes[2].location, this.nodes[1].location);
                    //this.nodes[1].trailNodes = [];
                    for (var i = 0; i < this.interpNumber; i++)
                    {
                        var lerp = (i + 1) / (this.interpNumber + 1);
                        var inter_pos = new m4m.math.vector3();

                        var tempRhandle = m4m.math.pool.new_vector3();
                        var tempLhandle = m4m.math.pool.new_vector3();
                        // m4m.math.vec3Subtract(m4m.math.pool.vector3_one, this.nodes[2].handle, tempLhandle);
                        tempLhandle.x = -this.nodes[2].handle.x;
                        tempLhandle.y = -this.nodes[2].handle.y;
                        tempLhandle.z = -this.nodes[2].handle.z;

                        m4m.math.vec3ScaleByNum(tempLhandle, vec3Distance / 2, tempLhandle);
                        m4m.math.vec3Add(tempLhandle, this.nodes[2].location, tempLhandle);

                        m4m.math.vec3ScaleByNum(this.nodes[1].handle, vec3Distance / 2, tempRhandle);
                        m4m.math.vec3Add(tempRhandle, this.nodes[1].location, tempRhandle);
                        m4m.math.GetPointAlongCurve(this.nodes[2].location, tempLhandle, this.nodes[1].location, tempRhandle, (i + 1) / (this.interpNumber + 1), inter_pos);
                        var inter_updir = new m4m.math.vector3();
                        m4m.math.vec3SLerp(this.nodes[1].updir, this.nodes[2].updir, lerp, inter_updir);
                        var inter_node = new trailNode(inter_pos, inter_updir, curTime);
                        // this.interpPath.unshift(inter_node);
                        this.interpPath.splice(1, 0, inter_node);
                        m4m.math.pool.delete_vector3(tempRhandle);
                        m4m.math.pool.delete_vector3(tempLhandle);
                    }

                    this.interpPath.unshift(newNode);
                }
            }

            // while (this.nodes.length > 0 && curTime > this.nodes[this.nodes.length - 1].time + this.lifetime) {
            //     this.nodes.pop();
            // }
            //控制粒子数量
            if (this.activeMaxpointlimit)
            {
                while (this.targetPath.length > this.maxStickCout)
                {
                    this.targetPath.pop();
                }
            }

        }


        private notRender: boolean = false;

        /**
         * 更新拖尾数据
         * @param curTime 时间
         * @returns 
         */
        private updateTrailData(curTime: number)
        {

            if (this.nodes.length < 2)
            {
                this.notRender = true;
                return;
            }
            else
            {
                this.notRender = false;
            }

            this.checkBufferSize();
            for (var i = 0; i < this.targetPath.length; i++)
            {
                var curNode = this.targetPath[i];
                var u = i / this.targetPath.length;

                var timeAlong = (curTime - curNode.time) / this.lifetime;

                var _updir = new m4m.math.vector3();
                m4m.math.vec3Clone(curNode.updir, _updir);
                var _width: number = this._startWidth + (this._endWidth - this._startWidth) * timeAlong;
                m4m.math.vec3ScaleByNum(_updir, _width, _updir);


                var tempPos = m4m.math.pool.new_vector3();
                m4m.math.vec3Add(curNode.location, _updir, tempPos);
                this.dataForVbo[2 * i * 9 + 0] = tempPos.x;
                this.dataForVbo[2 * i * 9 + 1] = tempPos.y;
                this.dataForVbo[2 * i * 9 + 2] = tempPos.z;

                var tempColor = m4m.math.pool.new_color();
                m4m.math.colorLerp(this.startColor, this.endColor, timeAlong, tempColor);
                this.dataForVbo[2 * i * 9 + 3] = tempColor.r;
                this.dataForVbo[2 * i * 9 + 4] = tempColor.g;
                this.dataForVbo[2 * i * 9 + 5] = tempColor.b;
                this.dataForVbo[2 * i * 9 + 6] = tempColor.a;

                this.dataForVbo[2 * i * 9 + 7] = u;
                //this.dataForVbo[2 * i * 9 + 7] = timeAlong;
                this.dataForVbo[2 * i * 9 + 8] = 1.0;

                //m4m.math.vec3Subtract(curNode.location, _updir, tempPos);
                this.dataForVbo[(2 * i + 1) * 9 + 0] = curNode.location.x;
                this.dataForVbo[(2 * i + 1) * 9 + 1] = curNode.location.y;
                this.dataForVbo[(2 * i + 1) * 9 + 2] = curNode.location.z;

                this.dataForVbo[(2 * i + 1) * 9 + 3] = tempColor.r;
                this.dataForVbo[(2 * i + 1) * 9 + 4] = tempColor.g;
                this.dataForVbo[(2 * i + 1) * 9 + 5] = tempColor.b;
                this.dataForVbo[(2 * i + 1) * 9 + 6] = tempColor.a;

                var u = i / this.nodes.length;
                this.dataForVbo[(2 * i + 1) * 9 + 7] = u;
                //this.dataForVbo[(2 * i + 1) * 9 + 7] = timeAlong;
                this.dataForVbo[(2 * i + 1) * 9 + 8] = 0;

                m4m.math.pool.delete_vector3(tempPos);
                m4m.math.pool.delete_color(tempColor);
            }
            for (var k = 0; k < this.nodes.length - 1; k++)
            {
                this.dataForEbo[k * 6 + 0] = k * 2;
                this.dataForEbo[k * 6 + 1] = (k + 1) * 2;
                this.dataForEbo[k * 6 + 2] = k * 2 + 1;

                this.dataForEbo[k * 6 + 3] = k * 2 + 1;
                this.dataForEbo[k * 6 + 4] = (k + 1) * 2;
                this.dataForEbo[k * 6 + 5] = (k + 1) * 2 + 1;
            }
        }

        /**
         * 检查缓冲区大小（小了扩容）
         */
        private checkBufferSize()
        {
            var stickNumber = this.targetPath.length;

            if (stickNumber * 2 * 9 > this.dataForVbo.length)
            {
                var length = this.dataForVbo.length;
                this.mesh.glMesh.resetVboSize(this.webgl, length * 2);
                this.dataForVbo = new Float32Array(length * 2);
            }
            if ((stickNumber - 1) * 6 > this.dataForEbo.length)
            {
                var length = this.dataForEbo.length;
                this.mesh.glMesh.resetEboSize(this.webgl, 0, length * 2);
                this.dataForEbo = new Uint16Array(length * 2);
            }
        }
        render(context: renderContext, assetmgr: assetMgr, camera: camera)
        {
            if (this.notRender) return;

            context.updateModeTrail();
            this.mesh.glMesh.uploadVertexData(context.webgl, this.dataForVbo);
            this.mesh.glMesh.uploadIndexData(context.webgl, 0, this.dataForEbo);

            this.mesh.submesh[0].size = (this.targetPath.length - 1) * 6;

            //--------------------------render-------------------------------------------
            if (this.gameObject.getScene().fog)
            {
                // context.fog = this.gameObject.getScene().fog;
                this.material.draw(context, this.mesh, this.mesh.submesh[0], "base_fog");
            } else
            {
                this.material.draw(context, this.mesh, this.mesh.submesh[0], "base");
            }
        }
         /**
         * @private
         */
        clone()
        {

        }

    }
    export class trailNode
    {
        location: m4m.math.vector3;
        updir: m4m.math.vector3;
        time: number;
        handle: m4m.math.vector3;

        trailNodes: trailNode[];
        /**
         * 拖尾节点
         * @param p 点
         * @param updir 方向 
         * @param t 值
         */
        constructor(p: m4m.math.vector3, updir: m4m.math.vector3, t: number)
        {
            this.location = p;
            this.updir = updir;
            this.time = t;
        }
    }
}