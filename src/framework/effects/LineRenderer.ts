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
     * The line renderer is used to draw free-floating lines in 3D space.
     * 
     * 线渲染器用于在三维空间中绘制自由浮动的线。
     */
    @reflect.nodeRender
    @reflect.nodeComponent
    export class LineRenderer implements IRenderer
    {
        static readonly ClassName: string = "LineRenderer";

        private mesh = new m4m.framework.mesh("LineRenderer" + ".mesh.bin");

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * mesh的材质数组
         * @version m4m 1.0
         */
        @m4m.reflect.Field("material")
        material: material;

        layer: RenderLayerEnum = RenderLayerEnum.Transparent;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 渲染层级
         * @version m4m 1.0
         */
        //renderLayer: CullingMask = CullingMask.default;
        get renderLayer() { return this.gameObject.layer; }
        set renderLayer(layer: number)
        {
            this.gameObject.layer = layer;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 同场景渲染层级时候先后排序依据
         * @version m4m 1.0
         */
        queue: number = 0;

        get transform()
        {
            return this.gameObject && this.gameObject.transform;
        }

        gameObject: gameObject;

        /**
         * Connect the start and end positions of the line together to form a continuous loop.
         * 
         * 将直线的起点和终点连接在一起，形成一个连续的回路。
         */
        loop = false;

        /**
         * 顶点列表。
         */
        positions: math.vector3[] = [];

        /**
         * 曲线宽度。
         */
        lineWidth = serialization.setValue(new MinMaxCurve(), { between0And1: true, curveMultiplier: 0.1, mode: MinMaxCurveMode.Curve });

        /**
         * 
         * 线条颜色。
         */
        lineColor = serialization.setValue(new MinMaxGradient(), { mode: MinMaxGradientMode.Gradient });

        /**
         * Set this to a value greater than 0, to get rounded corners between each segment of the line.
         * 
         * 将此值设置为大于0的值，以在直线的每个线段之间获取圆角。
         */
        numCornerVertices = 0;

        /**
         * Set this to a value greater than 0, to get rounded corners on each end of the line.
         * 
         * 将此值设置为大于0的值，以在行的两端获得圆角。
         */
        numCapVertices = 0;

        /**
         * Select whether the line will face the camera, or the orientation of the Transform Component.
         * 
         * 选择线是否将面对摄像机，或转换组件的方向。
         */
        // alignment = LineAlignment.View;
        alignment = LineAlignment.TransformZ;

        /**
         * Choose whether the U coordinate of the line texture is tiled or stretched.
         * 
         * 选择是平铺还是拉伸线纹理的U坐标。
         */
        textureMode = LineTextureMode.Stretch;

        /**
         * Apply a shadow bias to prevent self-shadowing artifacts. The specified value is the proportion of the line width at each segment.
         * 
         * 应用阴影偏差以防止自阴影伪影。指定的值是每段线宽的比例。
         */
        shadowBias = 0.5;

        /**
         * Configures a line to generate Normals and Tangents. With this data, Scene lighting can affect the line via Normal Maps and the Unity Standard Shader, or your own custom-built Shaders.
         * 
         * 是否自动生成灯光所需的法线与切线。
         */
        generateLightingData = false;

        /**
         * If enabled, the lines are defined in world space.
         * 
         * 如果启用，则在世界空间中定义线。
         */
        useWorldSpace = false;

        /**
         * Set the curve describing the width of the line at various points along its length.
         * 
         * 设置曲线，以描述沿线长度在各个点处的线宽。
         */
        get widthCurve()
        {
            return this.lineWidth.curve;
        }

        /**
         * Set an overall multiplier that is applied to the LineRenderer.widthCurve to get the final width of the line.
         * 
         * 设置一个应用于LineRenderer.widthCurve的总乘数，以获取线的最终宽度。
         */
        get widthMultiplier()
        {
            return this.lineWidth.curveMultiplier;
        }

        set widthMultiplier(v)
        {
            this.lineWidth.curveMultiplier = v;
        }

        /**
         * Set the color gradient describing the color of the line at various points along its length.
         * 
         * 设置颜色渐变，以描述线条沿其长度的各个点的颜色。
         */
        get colorGradient()
        {
            return this.lineColor.gradient;
        }

        /**
         * Set the color at the end of the line.
         * 
         * 设置线尾颜色。
         */
        get endColor()
        {
            var color4 = new math.color();
            var color3 = this.colorGradient.colorKeys[this.colorGradient.colorKeys.length - 1];
            var alpha = this.colorGradient.alphaKeys[this.colorGradient.alphaKeys.length - 1];

            color4.r = color3.color.r;
            color4.g = color3.color.g;
            color4.b = color3.color.b;
            color4.a = alpha.alpha;
            return color4;
        }

        set endColor(v)
        {
            this.colorGradient.alphaKeys[this.colorGradient.alphaKeys.length - 1].alpha = v.a
            var color = this.colorGradient.colorKeys[this.colorGradient.colorKeys.length - 1].color;

            color.r = v.r;
            color.g = v.g;
            color.b = v.b;
        }

        /**
         * Set the width at the end of the line.
         * 
         * 设置线尾宽度。
         */
        get endWidth()
        {
            return this.widthCurve.keys[this.widthCurve.keys.length - 1].value;
        }

        set endWidth(v)
        {
            this.widthCurve.keys[this.widthCurve.keys.length - 1].value = v;
        }

        /**
         * Set/get the number of vertices.
         * 
         * 设置/获取顶点数。
         */
        get positionCount()
        {
            return this.positions.length;
        }

        set positionCount(v)
        {
            this.positions.length = v;
        }

        /**
         * Set the color at the start of the line.
         * 
         * 设置行线头颜色。
         */
        get startColor()
        {
            var color4 = new math.color();
            var color3 = this.colorGradient.colorKeys[0];
            var alpha = this.colorGradient.alphaKeys[0];
            color4.r = color3.color.r;
            color4.g = color3.color.g;
            color4.b = color3.color.b;
            color4.a = alpha.alpha;
            return color4;
        }

        set startColor(v)
        {
            this.colorGradient.alphaKeys[0].alpha = v.a
            var color = this.colorGradient.colorKeys[0].color;
            color.r = v.r;
            color.g = v.g;
            color.b = v.b;
        }

        /**
         * Set the width at the start of the line.
         * 
         * 设置线头宽度
         */
        get startWidth()
        {
            return this.widthCurve.keys[0].value * this.widthMultiplier;
        }

        set startWidth(v)
        {
            this.widthCurve.keys[0].value = v / this.widthMultiplier;
        }

        render(context: renderContext, assetmgr: assetMgr, camera: camera)
        {
            math.matrixClone(this.transform.getWorldMatrix(), this.localToWorldMatrix);
            math.matrixInverse(this.localToWorldMatrix, this.worldToLocalMatrix);

            if (!this.material)
            {
                this.material = sceneMgr.app.getAssetMgr().getDefLineRendererMat();
            }

            // 清理网格
            LineRenderer.clearMesh(this.mesh);

            // 烘焙网格
            this.BakeMesh(this.mesh, camera, false);

            if (this.positions.length < 2) return;

            // 上传网格数据
            LineRenderer.uploadMesh(this.mesh, assetmgr.webgl);

            // 绘制
            LineRenderer.draw(context, this.gameObject, this.mesh, this.material);
        }

        onPlay()
        {

        }

        start()
        {

        }

        /**
         * 每帧执行
         */
        update(interval?: number)
        {

        }

        remove()
        {
            console.warn(`未实现 LineRenderer  remove`);
            // throw "未实现";
        }

        clone()
        {
            console.warn(`未实现 LineRenderer  clone`);
            // throw "未实现";
        }

        /**
         * Creates a snapshot of LineRenderer and stores it in mesh.
         * 
         * 创建LineRenderer的快照并将其存储在网格中。
         * 
         * @param mesh	A static mesh that will receive the snapshot of the line. 
         * @param camera	The camera used for determining which way camera-space lines will face.
         * @param useTransform	Include the rotation and scale of the Transform in the baked mesh.
         */
        BakeMesh(mesh: mesh, camera: camera, useTransform: boolean)
        {
            var positions = this.positions.concat();
            if (positions.length < 2) return;

            var textureMode = this.textureMode;
            var loop = this.loop;
            var lineWidth = this.lineWidth;
            var alignment = this.alignment;
            var colorGradient = this.colorGradient;

            // 计算摄像机本地坐标
            var cameraPosition = new math.vector3();
            math.vec3Clone(camera.gameObject.transform.getWorldPosition(), cameraPosition);
            math.matrixTransformVector3(cameraPosition, this.worldToLocalMatrix, cameraPosition);

            // 计算线条总长度
            var totalLength = LineRenderer.calcTotalLength(positions, loop);

            // 计算结点所在线段位置
            var rateAtLines = LineRenderer.calcRateAtLines(positions, loop, textureMode);

            // 计算结点的顶点
            var positionVectex = LineRenderer.calcPositionVectex(positions, loop, rateAtLines, lineWidth, alignment, cameraPosition);

            // 计算网格
            LineRenderer.calcMesh(positionVectex, textureMode, colorGradient, totalLength, mesh);
        }

        /**
         * Get the position of a vertex in the line.
         * 
         * 获取直线在顶点的位置。
         * 
         * @param index	The index of the position to retrieve.
         */
        GetPosition(index: number)
        {
            return this.positions[index];
        }

        /**
         * Get the positions of all vertices in the line.
         * 
         * 获取行中所有顶点的位置。
         * 
         * @param positions	The array of positions to retrieve. The array passed should be of at least positionCount in size.
         * 
         * @returns How many positions were actually stored in the output array.
         */
        GetPositions(positions: math.vector3[] = [])
        {
            positions.length = this.positions.length;
            for (let i = 0; i < this.positions.length; i++)
            {
                positions[i] = positions[i] || new math.vector3();
                positions[i].x = this.positions[i].x;
                positions[i].y = this.positions[i].y;
                positions[i].z = this.positions[i].z;
            }
            return positions;
        }

        /**
         * Set the position of a vertex in the line.
         * 
         * 设置顶点在直线中的位置。
         * 
         * @param index	Which position to set.
         * @param position	The new position.
         */
        setPosition(index: number, position: math.vector3)
        {
            this.positions[index].x = position.x;
            this.positions[index].y = position.y;
            this.positions[index].z = position.z;
        }

        /**
         * Set the positions of all vertices in the line.
         * 
         * 设置线中所有顶点的位置。
         * 
         * @param positions	The array of positions to set.
         */
        SetPositions(positions: math.vector3[])
        {
            this.positions.length = positions.length;
            for (let i = 0; i < positions.length; i++)
            {
                this.positions[i] = this.positions[i] || new math.vector3();
                this.positions[i].x = positions[i].x;
                this.positions[i].y = positions[i].y;
                this.positions[i].z = positions[i].z;
            }
        }

        /**
         * Generates a simplified version of the original line by removing points that fall within the specified tolerance.
         * 
         * 通过删除落在指定公差范围内的点，生成原始线的简化版本。
         * 
         * @param tolerance	This value is used to evaluate which points should be removed from the line. A higher value results in a simpler line (less points). A positive value close to zero results in a line with little to no reduction. A value of zero or less has no effect.
         * 
         * @todo
         */
        Simplify(tolerance: number)
        {

        }

        private localToWorldMatrix = new math.matrix();
        private worldToLocalMatrix = new math.matrix();


        /**
         * 绘制
         * 
         * @param context 
         * @param go 游戏对象
         * @param mesh 网格
         * @param material 材质
         */
        static draw(context: renderContext, go: gameObject, mesh: mesh, material: material)
        {
            DrawCallInfo.inc.currentState = DrawCallEnum.EffectSystem;
            let tran = go.transform;

            context.updateLightMask(go.layer);
            context.updateModel(tran);
            if (!material) return;
            if (mesh == null || mesh.glMesh == null || mesh.submesh == null) return;
            let subMeshs = mesh.submesh;
            if (subMeshs == null) return;

            // mesh.glMesh.bindVboBuffer(context.webgl);

            material.draw(context, mesh, subMeshs[0]);
        }

        /**
         * 清理网格
         * 
         * @param mesh 
         */
        static clearMesh(mesh: mesh)
        {
            if (!mesh.data)
            {
                mesh.data = new m4m.render.meshData();
            }
            var data = mesh.data
            data.pos = [];
            data.trisindex = [];
            data.normal = [];
            data.tangent = [];
            data.uv = [];
            data.color = [];
        }

        /**
         * 上传mesh
         * @param _mesh mesh对象 
         * @param webgl webgl上下文
         */
        static uploadMesh(_mesh: mesh, webgl: WebGL2RenderingContext)
        {
            var vf = m4m.render.VertexFormatMask.Position | m4m.render.VertexFormatMask.Normal | m4m.render.VertexFormatMask.Tangent | m4m.render.VertexFormatMask.Color | m4m.render.VertexFormatMask.UV0;
            _mesh.data.originVF = vf;
            var v32 = _mesh.data.genVertexDataArray(vf);
            var i16 = _mesh.data.genIndexDataArray();

            _mesh.glMesh = new m4m.render.glMesh();
            _mesh.glMesh.initBuffer(webgl, vf, _mesh.data.getVertexCount());
            _mesh.glMesh.uploadVertexData(webgl, v32);

            _mesh.glMesh.addIndex(webgl, i16.length);
            _mesh.glMesh.uploadIndexData(webgl, 0, i16);
            _mesh.glMesh.initVAO();

            _mesh.submesh = [];

            {
                var sm = new m4m.framework.subMeshInfo();
                sm.matIndex = 0;
                sm.start = 0;
                sm.size = i16.length;
                sm.line = false;
                _mesh.submesh.push(sm);
            }
        }

        /**
         * 计算网格
         * 
         * @param positionVectex 顶点列表
         * @param rateAtLines 顶点所在线条位置
         * @param textureMode 纹理模式
         * @param totalLength 线条总长度
         * @param mesh 保存网格数据的对象
         */
        static calcMesh(positionVectex: {
            vertexs: math.vector3[];
            tangent: math.vector3; normal: math.vector3;
            rateAtLine: number;
        }[], textureMode: LineTextureMode, colorGradient: Gradient, totalLength: number, mesh: mesh)
        {
            var data = mesh.data;

            var a_positions: number[] = [];
            var a_uvs: number[] = [];
            var a_colors: number[] = [];
            //
            // 摄像机在该对象空间内的坐标
            for (var i = 0, n = positionVectex.length; i < n; i++)
            {
                //
                var vertex = positionVectex[i];
                //
                var offset0 = vertex.vertexs[0];
                var offset1 = vertex.vertexs[1];
                //
                var rateAtLine = vertex.rateAtLine;
                // 颜色
                var currentColor = colorGradient.getValue(rateAtLine);
                //
                a_positions.push(offset0.x, offset0.y, offset0.z, offset1.x, offset1.y, offset1.z);
                a_colors.push(currentColor.r, currentColor.g, currentColor.b, currentColor.a, currentColor.r, currentColor.g, currentColor.b, currentColor.a);
                // 计算UV
                if (textureMode == LineTextureMode.Stretch)
                {
                    a_uvs.push(rateAtLine, 1, rateAtLine, 0);
                }
                else if (textureMode == LineTextureMode.Tile)
                {
                    a_uvs.push(rateAtLine * totalLength, 1, rateAtLine * totalLength, 0);
                }
                else if (textureMode == LineTextureMode.DistributePerSegment)
                {
                    a_uvs.push(rateAtLine, 1, rateAtLine, 0);
                }
                else if (textureMode == LineTextureMode.RepeatPerSegment)
                {
                    a_uvs.push(i, 1, i, 0);
                }

                // 计算索引
                if (i > 0)
                {
                    m4m.render.meshData.addQuadVec3ByValue(data.normal, vertex.normal);
                    m4m.render.meshData.addQuadPos(data, [
                        new math.vector3(a_positions[(i - 1) * 6], a_positions[(i - 1) * 6 + 1], a_positions[(i - 1) * 6 + 2]),
                        new math.vector3(a_positions[(i - 1) * 6 + 3], a_positions[(i - 1) * 6 + 4], a_positions[(i - 1) * 6 + 5]),
                        new math.vector3(a_positions[i * 6], a_positions[i * 6 + 1], a_positions[i * 6 + 2]),
                        new math.vector3(a_positions[i * 6 + 3], a_positions[i * 6 + 4], a_positions[i * 6 + 5]),
                    ]);
                    m4m.render.meshData.addQuadVec2(data.uv, [
                        new math.vector2(a_uvs[(i - 1) * 4], a_uvs[(i - 1) * 4 + 1]),
                        new math.vector2(a_uvs[(i - 1) * 4 + 2], a_uvs[(i - 1) * 4 + 3]),
                        new math.vector2(a_uvs[i * 4], a_uvs[i * 4 + 1]),
                        new math.vector2(a_uvs[i * 4 + 2], a_uvs[i * 4 + 3])
                    ]);
                    m4m.render.meshData.addQuadVec3ByValue(data.tangent, vertex.tangent);

                    data.color.push(
                        new math.color(a_colors[(i - 1) * 8], a_colors[(i - 1) * 8 + 1], a_colors[(i - 1) * 8 + 2], a_colors[(i - 1) * 8 + 3]),
                        new math.color(a_colors[(i - 1) * 8 + 4], a_colors[(i - 1) * 8 + 5], a_colors[(i - 1) * 8 + 6], a_colors[(i - 1) * 8 + 7]),
                        new math.color(a_colors[i * 8], a_colors[i * 8 + 1], a_colors[i * 8 + 2], a_colors[i * 8 + 3]),
                        new math.color(a_colors[i * 8 + 4], a_colors[i * 8 + 5], a_colors[i * 8 + 6], a_colors[i * 8 + 7]),
                    );
                }
            }
        }

        /**
         * 计算结点的三角形顶点列表
         * 
         * @param positions 结点列表
         * @param loop 是否成换线
         * @param rateAtLines 结点所在线条位置
         * @param lineWidth 线条宽度曲线
         * @param alignment 朝向方式
         * @param cameraPosition 摄像机局部坐标
         */
        static calcPositionVectex(positions: math.vector3[], loop: boolean, rateAtLines: number[], lineWidth: MinMaxCurve, alignment: LineAlignment, cameraPosition: math.vector3)
        {
            // 
            var positionVectex: { vertexs: math.vector3[], tangent: math.vector3, normal: math.vector3, rateAtLine: number }[] = [];

            // 处理两端循环情况
            if (loop)
            {
                positions.unshift(positions[positions.length - 1]);
                positions.push(positions[1]);
                positions.push(positions[2]);
            } else
            {
                positions.unshift(positions[0]);
                positions.push(positions[positions.length - 1]);
            }

            //
            var positionCount = positions.length;
            //
            // 摄像机在该对象空间内的坐标
            for (var i = 0; i < positionCount - 2; i++)
            {
                // 顶点索引
                var prePosition = positions[i];
                var currentPosition = positions[i + 1];
                var nextPosition = positions[i + 2];
                //
                // 当前所在线条，0表示起点，1表示终点
                var rateAtLine = rateAtLines[i];
                // 线条宽度
                var currentLineWidth = lineWidth.getValue(rateAtLine);

                // 切线，线条方向
                var tangent0 = new math.vector3(0, 0, 0);
                math.vec3Subtract(currentPosition, prePosition, tangent0);
                math.vec3Normalize(tangent0, tangent0);

                var tangent1 = new math.vector3(0, 0, 0);
                math.vec3Subtract(nextPosition, currentPosition, tangent1);
                math.vec3Normalize(tangent1, tangent1);

                var tangent = new math.vector3(1, 0, 0);
                math.vec2Add(tangent0, tangent1, tangent);
                math.vec3Normalize(tangent, tangent);

                // 处理切线为0的情况
                if (math.vec3SqrLength(tangent) == 0)
                {
                    if (math.vec3SqrLength(tangent0) != 0) math.vec3Clone(tangent0, tangent);
                    else
                    {
                        tangent.x = 1;
                        tangent.y = 0;
                        tangent.y = 0;
                    }
                }
                // 法线，面朝向
                var normal = new math.vector3(0, 0, -1);
                if (alignment == LineAlignment.View)
                {
                    math.vec3Subtract(cameraPosition, currentPosition, normal);
                    math.vec3Normalize(normal, normal);
                } else if (alignment == LineAlignment.TransformZ)
                {
                    normal.x = 0;
                    normal.y = 0;
                    normal.z = -1;
                }
                // 使用强制面向Z轴或者摄像机，会出现 与 线条方向一致的情况
                if (math.vec3IsParallel(tangent, normal))
                {
                    // 强制修改切线方向
                    tangent.x = 1;
                    tangent.y = 0;
                    tangent.z = 0;
                    if (math.vec3IsParallel(tangent, normal))
                    {
                        tangent.x = 0;
                        tangent.y = 1;
                        tangent.z = 0;
                    }
                    // 重新计算与法线垂直的切线
                    var tempTN = new math.vector3();
                    math.vec3Cross(tangent, normal, tempTN);
                    math.vec3Cross(normal, tempTN, tangent);
                    math.vec3Normalize(tangent, tangent);
                }
                // 用于计算线条中点生成两个点的偏移量
                var offset = new math.vector3();
                math.vec3Cross(tangent, normal, offset);
                math.vec3Normalize(offset, offset);
                math.vec3ScaleByNum(offset, currentLineWidth / 2, offset);
                // 保持线条宽度
                var temp = new math.vector3();
                math.vec3Clone(offset, temp);
                math.vec3Normalize(temp, temp);
                var cos = math.vec3Dot(temp, tangent0);
                var sin = Math.sqrt(1 - Math.pow(cos, 2));
                sin = Math.min(Math.max(sin, 0.2), 5);
                math.vec3ScaleByNum(offset, 1 / sin, offset);
                //
                var offset0 = new math.vector3();
                math.vec3Add(currentPosition, offset, offset0);
                var offset1 = new math.vector3();
                math.vec3Subtract(currentPosition, offset, offset1);
                //
                positionVectex[i] = { vertexs: [offset0, offset1], tangent: tangent0, normal: normal, rateAtLine: rateAtLine };
            }
            return positionVectex;
        }

        /**
         * 计算线条总长度
         * 
         * @param positions 顶点列表
         * @param loop 是否循环
         */
        static calcTotalLength(positions: math.vector3[], loop: boolean)
        {
            var total = 0;
            var length = positions.length;
            for (let i = 0, n = length - 1; i < n; i++)
            {
                total += math.vec3Distance(positions[i + 1], positions[i]);
            }
            if (loop && length > 0)
            {
                total += math.vec3Distance(positions[length - 1], positions[0]);
            }
            return total;
        }

        /**
         * 计算结点所在线段位置
         * 
         * @param positions 顶点列表
         * @param loop 是否循环
         */
        static calcRateAtLines(positions: math.vector3[], loop: boolean, textureMode: LineTextureMode)
        {
            // 结点所在线段位置
            var rateAtLines: number[] = [0];
            // 线条总长度
            var totalLength = 0;
            var positionCount = positions.length;
            for (let i = 0, n = positionCount - 1; i < n; i++)
            {
                totalLength += math.vec3Distance(positions[i + 1], positions[i]);
                rateAtLines[i + 1] = totalLength;
            }
            if (loop && positionCount > 0)
            {
                totalLength += math.vec3Distance(positions[positionCount - 1], positions[0])
                rateAtLines[positionCount] = totalLength;
            }
            // 计算结点所在线段位置
            rateAtLines = rateAtLines.map((v, i) =>
            {
                // 计算UV
                if (textureMode == LineTextureMode.Stretch || textureMode == LineTextureMode.Tile)
                {
                    return v / totalLength;
                }
                return i / (loop ? positionCount : (positionCount - 1));
            });
            return rateAtLines;
        }
    }
}