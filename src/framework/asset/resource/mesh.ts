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
namespace m4m.framework {
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * mesh资源
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class mesh implements IAsset {
        static readonly ClassName: string = "mesh";
        public maximun: math.vector3;
        public minimun: math.vector3;
        private name: constText;
        private id: resID = new resID();
        defaultAsset: boolean = false;
        public szContent: string = "";
        public bObjRes: boolean = false;
        /**
         * mesh 资源
         * @param assetName 资源名 
         * @param isObject 是obj？
         */
        constructor(assetName: string = null, isObject: boolean = false) {
            if (!assetName) {
                assetName = "mesh_" + this.getGUID();
            }
            this.name = new constText(assetName);
            if (isObject)
                this.bObjRes = true;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取资源名称
         * @version m4m 1.0
         */
        getName(): string {
            if (!this.name) {
                return null;
            }
            return this.name.getText();
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 获取资源唯一id
         * @version m4m 1.0
         */
        getGUID(): number {
            return this.id.getID();
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 引用计数加一
         * @version m4m 1.0
         */
        use() {
            sceneMgr.app.getAssetMgr().use(this);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 引用计数减一
         * @version m4m 1.0
         */
        unuse(disposeNow: boolean = false) {
            sceneMgr.app.getAssetMgr().unuse(this, disposeNow);
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 释放资源
         * @version m4m 1.0
         */
        dispose() {
            this.glMesh.dispose();
            this.data = null;
            delete this.submesh;
        }
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 计算资源字节大小
         * @version m4m 1.0
         */
        caclByteLength(): number {
            let total = 0;
            total += this.glMesh.caclByteLength();
            if (this.data) {
                total += this.data.caclByteLength();
            }
            return total;
        }
        /**
         * @private
         */
        glMesh: m4m.render.glMesh;

        updateByEffect: boolean = false;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * mesh数据实例
         * @version m4m 1.0
         */
        data: m4m.render.meshData;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * submesh信息列表
         * @version m4m 1.0
         */
        submesh: subMeshInfo[] = [];

        /**
         * 是否使用多线程解析
         */
        static useThead: boolean = true;
        //加载完成事件
        /** 当读取完毕回调 */
        public onReadFinish: () => void;
        // //分片加载状态变量
        private reading = false;
        /** 分片加载器 */
        private readProcess(read, data, objVF, vcount, vec10tpose, callback) {

            if (this.reading) return;

            var tag = read.readUInt8();
            //end
            if (tag == 255) {
                callback();
                return;
            }
            if (tag == 1)//pos
            {
                if (data.pos == undefined) {
                    data.pos = [];
                    objVF.vf = objVF.vf | m4m.render.VertexFormatMask.Position;
                }
                for (var i = 0; i < vcount; i++) {
                    var _position = new m4m.math.vector3();
                    _position.x = read.readSingle();
                    _position.y = read.readSingle();
                    _position.z = read.readSingle();
                    data.pos.push(_position);
                }
            }
            else if (tag == 2)//color
            {
                if (data.color == undefined) {
                    data.color = [];
                    objVF.vf = objVF.vf | m4m.render.VertexFormatMask.Color;
                }
                for (var i = 0; i < vcount; i++) {
                    var _color = new m4m.math.color();
                    _color.a = math.floatClamp(read.readUInt8() / 255, 0, 1.0);
                    _color.r = math.floatClamp(read.readUInt8() / 255, 0, 1.0);
                    _color.g = math.floatClamp(read.readUInt8() / 255, 0, 1.0);
                    _color.b = math.floatClamp(read.readUInt8() / 255, 0, 1.0);
                    data.color.push(_color);
                }
            }
            else if (tag == 3)//normal
            {
                if (data.normal == undefined) {
                    data.normal = [];
                    objVF.vf = objVF.vf | m4m.render.VertexFormatMask.Normal;
                }
                for (var i = 0; i < vcount; i++) {
                    var _normal = new m4m.math.vector3();
                    _normal.x = read.readSingle();
                    _normal.y = read.readSingle();
                    _normal.z = read.readSingle();
                    data.normal.push(_normal);
                }
            }
            else if (tag == 4)//uv
            {
                if (data.uv == undefined) {
                    data.uv = [];
                    objVF.vf = objVF.vf | m4m.render.VertexFormatMask.UV0;
                }
                for (var i = 0; i < vcount; i++) {
                    var uv = new m4m.math.vector2();
                    uv.x = read.readSingle();
                    uv.y = read.readSingle();
                    data.uv.push(uv);
                }
            }
            else if (tag == 5)//uv1
            {
                if (data.uv2 == undefined) {
                    data.uv2 = [];
                    objVF.vf = objVF.vf | m4m.render.VertexFormatMask.UV1;
                }
                for (var i = 0; i < vcount; i++) {
                    var uv = new m4m.math.vector2();
                    uv.x = read.readSingle();
                    uv.y = read.readSingle();
                    data.uv2.push(uv);

                }
            }
            else if (tag == 6)//uv2
            {
                //meshdata.vec2uvs2 = new Float32Array(vcount * 2);
                for (var i = 0; i < vcount; i++) {
                    //meshdata.vec2uvs2[i * 2 + 0] =
                    read.readSingle();//u
                    //meshdata.vec2uvs2[i * 2 + 1] =
                    read.readSingle();//v

                }
            }
            else if (tag == 7)//tangent
            {
                if (data.tangent == undefined) {
                    data.tangent = [];
                    objVF.vf = objVF.vf | m4m.render.VertexFormatMask.Tangent;
                }
                for (var i = 0; i < vcount; i++) {

                    var tangent = new m4m.math.vector3();
                    var x = read.readSingle();
                    var y = read.readSingle();
                    var z = read.readSingle();
                    var w = read.readSingle();
                    tangent.x = x;
                    tangent.y = y;
                    tangent.z = z;
                    m4m.math.vec3Normalize(tangent, tangent);
                    m4m.math.vec3ScaleByNum(tangent, w + 2, tangent);
                    data.tangent.push(tangent);
                }
            }
            else if (tag == 8)//uv3
            {
                for (var i = 0; i < vcount; i++) {
                    //meshdata.vec2uvs2[i * 2 + 0] =
                    read.readSingle();//u
                    //meshdata.vec2uvs2[i * 2 + 1] =
                    read.readSingle();//v

                }
            }
            else if (tag == 16)//tpose
            {
                var tposelen = read.readUInt8();
                //meshdata.vec10tpose = new Float32Array(tposelen * 10);
                for (var i = 0; i < tposelen; i++) {
                    vec10tpose[i * 10 + 0] = read.readSingle();//posx;
                    vec10tpose[i * 10 + 1] = read.readSingle();//posy;
                    vec10tpose[i * 10 + 2] = read.readSingle();//posz;
                    vec10tpose[i * 10 + 3] = read.readSingle();//scalex;
                    vec10tpose[i * 10 + 4] = read.readSingle();//scaley;
                    vec10tpose[i * 10 + 5] = read.readSingle();//scalez;
                    vec10tpose[i * 10 + 6] = read.readSingle();//quatx;
                    vec10tpose[i * 10 + 7] = read.readSingle();//quaty;
                    vec10tpose[i * 10 + 8] = read.readSingle();//quatz;
                    vec10tpose[i * 10 + 9] = read.readSingle();//quatw;
                }
            }
            else if (tag == 17)//skinwidget;
            {
                if (data.blendIndex == undefined) {
                    data.blendIndex = [];
                    objVF.vf = objVF.vf | m4m.render.VertexFormatMask.BlendIndex4;
                }
                if (data.blendWeight == undefined) {
                    data.blendWeight = [];
                    objVF.vf = objVF.vf | m4m.render.VertexFormatMask.BlendWeight4;
                }
                for (var i = 0; i < vcount; i++) {
                    var _boneIndex = new render.number4();
                    _boneIndex.v0 = read.readUInt32();
                    _boneIndex.v1 = read.readUInt32();
                    _boneIndex.v2 = read.readUInt32();
                    _boneIndex.v3 = read.readUInt32();

                    var _boneWeight = new render.number4();
                    _boneWeight.v0 = read.readSingle();
                    _boneWeight.v1 = read.readSingle();
                    _boneWeight.v2 = read.readSingle();
                    _boneWeight.v3 = read.readSingle();

                    data.blendIndex.push(_boneIndex);
                    data.blendWeight.push(_boneWeight);
                }
            }
            else {
                throw "notwrite" + tag;
            }
            this.reading = false;
            setTimeout(() => {
                this.readProcess(read, data, objVF, vcount, vec10tpose, () => {
                    callback();
                });
            });
        }
        /** 分片加载完成 */
        private readFinish(read, data, buf, objVF, webgl) {
            var subcount = read.readUInt8();
            data.trisindex = [];
            this.submesh = [];
            for (var i = 0; i < subcount; i++) {
                var _submeshinfo: subMeshInfo = new subMeshInfo();

                // var tv = read.readUInt32();//代表之前submesh中的drawstyle
                read.readUInt32();

                var sublen = read.readUInt32();
                _submeshinfo.start = data.trisindex.length;
                _submeshinfo.size = sublen;
                _submeshinfo.matIndex = i;
                this.submesh.push(_submeshinfo);
                for (var j = 0; j < sublen; j++) {
                    var index = read.readUInt32();
                    data.trisindex.push(index);
                }

            }

            buf = null;
            data.originVF = objVF.vf;
            this.data = data;
            this.glMesh = new m4m.render.glMesh();
            var vertexs = this.data.genVertexDataArray(objVF.vf);
            var indices = this.data.genIndexDataArray();

            this.glMesh.initBuffer(webgl, objVF.vf, this.data.pos.length);
            this.glMesh.uploadVertexData(webgl, vertexs);
            this.glMesh.addIndex(webgl, indices.length);
            this.glMesh.uploadIndexData(webgl, 0, indices);
            this.glMesh.initVAO();

            // this.onReadFinish();
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 解析资源
         * @param buf buffer数组
         * @param webgl webgl实例
         * @version m4m 1.0
         */
        Parse(inData: ArrayBuffer | string | any, webgl: WebGL2RenderingContext) {
            return new Promise<IAsset>((reslove, reject) => {
                // console.error(`[解析资源] mesh 00  ${this.name.getText()}`);
                try {
                    if (this.bObjRes) {
                        var data: m4m.render.meshData = new m4m.render.meshData();
                        this.parseObjMesh(inData, webgl, data);
                    }
                    else
                        this.parseCMesh1(inData, webgl);
                } catch (error) {
                    // console.error(`[解析资源] mesh 22  ${this.name.getText()} ${error.message}`);
                    reject(error.stack);
                    return;
                }
                // console.error(`[解析资源] mesh 11  ${this.name.getText()}`);
                reslove(this);
            });
        }

        /**
         * 是否是空字符串
         * @param s 字符串
         * @returns 
         */
        isEmptyStr(s: string) {
            if (s == undefined || s == null || s == '') {
                return true;
            }
            return false;
        }

        /**
         * @deprecated [已弃用]
         * 解析面
         */
        static parseFace(row: string, data: Int32Array, n: number, vcnt: number): number {
            var j: number = 0;
            while (row.charAt(0) != '\0') {
                if (row.charAt(0) == "")
                    break;

                // Skip initial white space
                while (row.charAt(0) != '\0' && (row.charAt(0) == ' ' || row.charAt(0) == '\t'))
                    row = row.substring(1);
                var s: string = row;
                // Find vertex delimiter and terminated the string there for conversion.
                while (row.charAt(0) != '\0' && row.charAt(0) != ' ' && row.charAt(0) != '\t') {
                    if (row.charAt(0) == '/')
                        row = "\0";
                    var tmpArray = row.split(' ');
                    if (tmpArray.length == 0) {
                        break;
                    }
                    if (tmpArray.length == 1 && tmpArray[0] == "") {
                        break;
                    }


                    var firstString = tmpArray[0];
                    var firstLength = firstString.length;
                    row = row.substring(firstLength);
                }
                if (s.charAt(0) == '\0')
                    continue;
                //var vi:number = Number(s);
                //data[j++] = vi < 0 ? vi+vcnt : vi-1;
                var array = s.split(' ');
                if (array.length >= 1) {
                    var vi: number = Number(array[0]);
                    data[j++] = vi < 0 ? vi + vcnt : vi - 1;
                }
                if (j >= n)
                    return j;
            }
            return j;
        }

        parseObjMesh(inData: string, webgl, meshdata_: m4m.render.meshData) {
            var data: m4m.render.meshData = meshdata_;
            data.pos = [];
            data.trisindex = [];

            console.log(data.pos);

            //var dataPosPush:any = data.pos.push();

            var dataString = inData;
            // for (var i = 0; i < array.length; i++) {
            //     dataString += String.fromCharCode(array[i]);
            // }
            var lines = dataString.split('\n');
            var face: Int32Array = new Int32Array(32);
            /// scan every line
            for (var i = 0; i < lines.length; i++) {
                console.log("line:" + i);
                if (i == 669) {
                    console.log("get");
                }

                var content: string = lines[i].trim();
                //if(this.isEmptyStr(content))
                //continue;
                if (content == undefined || content == null || content == '')
                    continue;

                if (content.charAt(0) == '#') {
                    continue;
                }
                if (content.charAt(0) == 'v' && content.charAt(1) != 'n' && content.charAt(1) != 't') {
                    var subLine = content.substring(1);
                    var xyz = subLine.split(' ');
                    var _x = 0.0;
                    var _y = 0.0;
                    var _z = 0.0;
                    if (xyz.length >= 3) {
                        _x = Number(xyz[0]);
                        _y = Number(xyz[1]);
                        _z = Number(xyz[2]);

                        data.pos.push({
                            x: _x,
                            y: _y,
                            z: _z
                        });
                    }
                }
                if (content.charAt(0) == 'f') {
                    // Faces
                    var newRow: string = content.substring(1);

                    var nv: number = mesh.parseFace(newRow, face, 32, data.pos.length);
                    for (var i: number = 2; i < nv; ++i) {
                        const a: number = face[0];
                        const b: number = face[i - 1];
                        const c: number = face[i];
                        if (a < 0 || a >= data.pos.length || b < 0 || b >= data.pos.length || c < 0 || c >= data.pos.length)
                            continue;
                        //addTriangle(a, b, c, tcap);

                        data.trisindex.push(a);
                        data.trisindex.push(b);
                        data.trisindex.push(c);
                    }
                }

            }
            this.data = data;
            this.glMesh = new m4m.render.glMesh();
            let fmt = m4m.render.VertexFormatMask.Position;
            data.originVF = fmt;
            var vertexs = this.data.genVertexDataArray(this.data.originVF);
            var indices = this.data.genIndexDataArray();
            this.glMesh.initBuffer(webgl, this.data.originVF, this.data.pos.length);
            this.glMesh.uploadVertexData(webgl, vertexs);
            this.glMesh.addIndex(webgl, indices.length);
            this.glMesh.uploadIndexData(webgl, 0, indices);
            this.glMesh.initVAO();

        }

        parseCMesh(inData, webgl) {
            // console.log(`parseCMesh:${this.name.getText()}`);
            var data: m4m.render.meshData = new m4m.render.meshData();
            var read: m4m.io.binReader = new m4m.io.binReader(inData);
            data.originVF = read.readUInt16();
            let vertexCount = read.readUInt32();
            let fmt = m4m.render.VertexFormatMask;
            data.pos = [];

            for (let i = 0; i < vertexCount; ++i) {
                data.pos.push({
                    x: read.readSingle(),
                    y: read.readSingle(),
                    z: read.readSingle()
                });
                if (data.originVF & fmt.Normal) {
                    data.normal = data.normal || [];
                    data.normal.push({
                        x: read.readSingle(),
                        y: read.readSingle(),
                        z: read.readSingle()
                    });
                }
                if (data.originVF & fmt.Tangent) {
                    data.tangent = data.tangent || [];
                    data.tangent.push({
                        x: read.readSingle(),
                        y: read.readSingle(),
                        z: read.readSingle()
                    });
                }

                if (data.originVF & fmt.Color) {
                    data.color = data.color || [];
                    data.color.push({
                        r: read.readSingle(),
                        g: read.readSingle(),
                        b: read.readSingle(),
                        a: read.readSingle()
                    });
                }
                if (data.originVF & fmt.UV0) {
                    data.uv = data.uv || [];
                    data.uv.push({
                        x: read.readSingle(),
                        y: read.readSingle()
                    });
                }
                if (data.originVF & fmt.UV1) {
                    data.uv2 = data.uv2 || [];
                    data.uv2.push({
                        x: read.readSingle(),
                        y: read.readSingle()
                    });
                }
                if (data.originVF & fmt.BlendIndex4) {
                    data.blendIndex = data.blendIndex || [];
                    data.blendIndex.push({
                        v0: read.readUInt32(),
                        v1: read.readUInt32(),
                        v2: read.readUInt32(),
                        v3: read.readUInt32()
                    });
                }
                if (data.originVF & fmt.BlendWeight4) {
                    data.blendWeight = data.blendWeight || [];
                    data.blendWeight.push({
                        v0: read.readSingle(),
                        v1: read.readSingle(),
                        v2: read.readSingle(),
                        v3: read.readSingle()
                    });
                }
                if (data.originVF & fmt.ColorEX) {
                    data.colorex = data.colorex || [];
                    data.colorex.push({
                        r: read.readSingle(),
                        g: read.readSingle(),
                        b: read.readSingle(),
                        a: read.readSingle()
                    })
                }
            }

            var len = read.readUInt8();
            data.trisindex = [];
            this.submesh = [];
            for (var i = 0; i < len; ++i) {
                var _submeshinfo: subMeshInfo = new subMeshInfo();
                _submeshinfo.start = read.readUInt16();
                _submeshinfo.size = read.readUInt32();
                _submeshinfo.matIndex = i;//read.readUInt8();
                this.submesh.push(_submeshinfo);
                //console.log("_submeshinfo.size:" + _submeshinfo.size + " _submeshinfo.size/3:" + _submeshinfo.size/3.0 + " _submeshinfo.size/4:" + _submeshinfo.size/4.0);
                var nSum: number = 0;
                for (var j = 0; j < _submeshinfo.size; j++) {
                    let iii: number = read.readUInt32();
                    //data.trisindex.push(read.readUInt32());
                    data.trisindex.push(iii);
                    nSum++;
                }

            }

            this.data = data;
            this.glMesh = new m4m.render.glMesh();
            var vertexs = this.data.genVertexDataArray(this.data.originVF);
            var indices = this.data.genIndexDataArray();
            this.glMesh.initBuffer(webgl, this.data.originVF, this.data.pos.length);
            this.glMesh.uploadVertexData(webgl, vertexs);
            this.glMesh.addIndex(webgl, indices.length);
            this.glMesh.uploadIndexData(webgl, 0, indices);
            this.glMesh.initVAO();
        }


        parseCMesh1(inData, webgl) {
            // console.log(`parseCMesh:${this.name.getText()}`);
            let sz = this.getName();
            console.log(sz);

            var data: m4m.render.meshData = new m4m.render.meshData();
            var read: m4m.io.binReader = new m4m.io.binReader(inData);
            data.originVF = read.readUInt16();
            let vertexCount = read.readUInt32();
            let fmt = m4m.render.VertexFormatMask;
            data.pos = [];

            for (let i = 0; i < vertexCount; ++i) {
                data.pos.push({
                    x: read.readSingle(),
                    y: read.readSingle(),
                    z: read.readSingle()
                });
                if (data.originVF & fmt.Normal) {
                    data.normal = data.normal || [];
                    data.normal.push({
                        x: read.readSingle(),
                        y: read.readSingle(),
                        z: read.readSingle()
                    });
                }
                if (data.originVF & fmt.Tangent) {
                    data.tangent = data.tangent || [];
                    data.tangent.push({
                        x: read.readSingle(),
                        y: read.readSingle(),
                        z: read.readSingle()
                    });
                }

                if (data.originVF & fmt.Color) {
                    data.color = data.color || [];
                    data.color.push({
                        r: read.readSingle(),
                        g: read.readSingle(),
                        b: read.readSingle(),
                        a: read.readSingle()
                    });
                }
                if (data.originVF & fmt.UV0) {
                    data.uv = data.uv || [];
                    data.uv.push({
                        x: read.readSingle(),
                        y: read.readSingle()
                    });
                }
                if (data.originVF & fmt.UV1) {
                    data.uv2 = data.uv2 || [];
                    data.uv2.push({
                        x: read.readSingle(),
                        y: read.readSingle()
                    });
                }
                if (data.originVF & fmt.BlendIndex4) {
                    data.blendIndex = data.blendIndex || [];
                    data.blendIndex.push({
                        v0: read.readUInt32(),
                        v1: read.readUInt32(),
                        v2: read.readUInt32(),
                        v3: read.readUInt32()
                    });
                }
                if (data.originVF & fmt.BlendWeight4) {
                    data.blendWeight = data.blendWeight || [];
                    data.blendWeight.push({
                        v0: read.readSingle(),
                        v1: read.readSingle(),
                        v2: read.readSingle(),
                        v3: read.readSingle()
                    });
                }
                if (data.originVF & fmt.ColorEX) {
                    data.colorex = data.colorex || [];
                    data.colorex.push({
                        r: read.readSingle(),
                        g: read.readSingle(),
                        b: read.readSingle(),
                        a: read.readSingle()
                    })
                }
            }

            for (let i = 0; i < vertexCount; ++i) {
                this.szContent += "v " + data.pos[i].x + " " + data.pos[i].y + " " + data.pos[i].z + "\n";
            }

            var len = read.readUInt8();
            data.trisindex = [];
            this.submesh = [];
            for (var i = 0; i < len; ++i) {
                var _submeshinfo: subMeshInfo = new subMeshInfo();
                //原来这个格式定的不支持32bit index了，
                _submeshinfo.start = read.readUInt16();
                //如果你也碰到这个毛病，有个临时的处理方法
                //read.readUInt16();
                //_submeshinfo.start = data.trisindex.length;
                _submeshinfo.size = read.readUInt32();
                _submeshinfo.matIndex = i;//read.readUInt8();
                this.submesh.push(_submeshinfo);
                //console.log("_submeshinfo.size:" + _submeshinfo.size + " _submeshinfo.size/3:" + _submeshinfo.size/3.0 + " _submeshinfo.size/4:" + _submeshinfo.size/4.0);
                var nSum: number = 0;
                for (var j = 0; j < _submeshinfo.size; j++) {
                    let iii: number = read.readUInt32();
                    //data.trisindex.push(read.readUInt32());
                    data.trisindex.push(iii);
                    // if(nSum%3 == 0)
                    //     this.szContent += "f ";
                    // this.szContent += iii + " ";
                    // if(nSum%3 == 2)
                    //     this.szContent += "\n";
                    nSum++;
                }

            }

            this.data = data;
            this.glMesh = new m4m.render.glMesh();
            var vertexs = this.data.genVertexDataArray(this.data.originVF);


            var indices = this.data.genIndexDataArray();
            var indices1 = data.trisindex;
            const triIndex = data.getTriIndexCount();
            const loopCount = triIndex / 3;
            var count = 0
            //console.log("length:" + indices1.length + " length/3:" + indices1.length/3.0 + " length/4:" + indices1.length/4.0);
            for (var ii = 0; ii < loopCount; ii++) {
                var index0 = indices1[count] + 1;
                var index1 = indices1[count + 1] + 1;
                var index2 = indices1[count + 2] + 1;

                //szContent += "f " + index0 + " " + index1 + " " + index2 + "\n";
                this.szContent += "f " + index0 + " " + index1 + " " + index2 + "\n";
                count += 3;
            }


            this.glMesh.initBuffer(webgl, this.data.originVF, this.data.pos.length);
            this.glMesh.uploadVertexData(webgl, vertexs);
            this.glMesh.addIndex(webgl, indices.length);
            this.glMesh.uploadIndexData(webgl, 0, indices);
            this.glMesh.initVAO();
        }

        // parseTMesh(inData, webgl, reslove)
        // {
        //     threading.thread.Instance.Call("meshDataHandle", inData, (result) =>
        //     {
        //         let objVF = result.objVF;
        //         let data = result.meshData;
        //         data.originVF = objVF.vf;
        //         // this.data = new m4m.render.meshData();
        //         this.data = render.meshData.cloneByObj(data);
        //         // for (let k in data)
        //         //     this.data[k] = data[k];
        //         this.submesh = result.subMesh;

        //         this.glMesh = new m4m.render.glMesh();
        //         var vertexs = this.data.genVertexDataArray(objVF.vf);
        //         var indices = this.data.genIndexDataArray();

        //         // let __webgl = sceneMgr.app.getAssetMgr().webgl;
        //         this.glMesh.initBuffer(webgl, objVF.vf, this.data.pos.length);
        //         this.glMesh.uploadVertexData(webgl, vertexs);
        //         this.glMesh.addIndex(webgl, indices.length);
        //         this.glMesh.uploadIndexData(webgl, 0, indices);
        //         reslove();
        //     });
        // }
        // parseMesh(inData, webgl, reslove)
        // {
        //     var objVF = { vf: 0 };//顶点属性
        //     var data: m4m.render.meshData = new m4m.render.meshData();
        //     var read: m4m.io.binReader = new m4m.io.binReader(inData);
        //     // var meshName = read.readStringAnsi();
        //     read.readStringAnsi();

        //     read.position = read.position + 24;

        //     var vcount = read.readUInt32();

        //     var vec10tpose: number[] = [];

        //     //分片加载 
        //     this.readProcess(read, data, objVF, vcount, vec10tpose, () =>
        //     {
        //         this.readFinish(read, data, inData, objVF, webgl);
        //         reslove();
        //     });
        // }
        // parseCMesh(inData, webgl)
        // {
        //     var data: m4m.render.meshData = new m4m.render.meshData();
        //     var read: m4m.io.binReader = new m4m.io.binReader(inData);
        //     data.originVF = read.readUInt16();
        //     data.pos = [];

        //     let vector3 = math.vector3, color = math.color, vector2 = math.vector2, number4 = render.number4;
        //     var len;

        //     len = read.readUInt32();
        //     for (var i = 0; i < len; ++i)
        //     {
        //         var v3 = new vector3(read.readSingle(), read.readSingle(), read.readSingle());
        //         data.pos.push(v3);
        //     }


        //     len = read.readUInt32();
        //     if (len > 0)
        //     {
        //         data.color = [];
        //         for (var i = 0; i < len; ++i)
        //         {
        //             var c = new color(read.readSingle(), read.readSingle(), read.readSingle(), read.readSingle());
        //             data.color.push(c);
        //         }
        //     }
        //     len = read.readUInt32();
        //     if (len > 0)
        //     {
        //         data.uv = [];
        //         for (var i = 0; i < len; ++i)
        //         {
        //             var uv = new vector2(read.readSingle(), read.readSingle());
        //             data.uv.push(uv);
        //         }
        //     }

        //     len = read.readUInt32();
        //     if (len > 0)
        //     {
        //         data.uv2 = [];
        //         for (var i = 0; i < len; ++i)
        //         {
        //             var uv2 = new vector2(read.readSingle(), read.readSingle());
        //             data.uv2.push(uv2);
        //         }
        //     }

        //     len = read.readUInt32();
        //     if (len > 0)
        //     {
        //         data.normal = [];
        //         for (var i = 0; i < len; ++i)
        //         {
        //             var normal = new vector3(read.readSingle(), read.readSingle(), read.readSingle());
        //             data.normal.push(normal);
        //         }
        //     }

        //     len = read.readUInt32();
        //     if (len > 0)
        //     {
        //         data.tangent = [];
        //         for (var i = 0; i < len; ++i)
        //         {
        //             var tangent = new vector3(read.readSingle(), read.readSingle(), read.readSingle());
        //             data.tangent.push(tangent);
        //         }
        //     }
        //     len = read.readUInt32();
        //     if (len > 0)
        //     {
        //         data.blendIndex = [];
        //         for (var i = 0; i < len; ++i)
        //         {
        //             var bi = new number4();
        //             bi.v0 = read.readUInt32();
        //             bi.v1 = read.readUInt32();
        //             bi.v2 = read.readUInt32();
        //             bi.v3 = read.readUInt32();
        //             data.blendIndex.push(bi);
        //         }
        //     }
        //     len = read.readUInt32();
        //     if (len > 0)
        //     {
        //         data.blendWeight = [];
        //         for (var i = 0; i < len; ++i)
        //         {
        //             var bi = new number4();
        //             bi.v0 = read.readSingle();
        //             bi.v1 = read.readSingle();
        //             bi.v2 = read.readSingle();
        //             bi.v3 = read.readSingle();
        //             data.blendWeight.push(bi);
        //         }
        //     }

        //     data.trisindex = [];
        //     this.submesh = [];
        //     len = read.readUInt8();
        //     for (var i = 0; i < len; ++i)
        //     {
        //         var _submeshinfo: subMeshInfo = new subMeshInfo();
        //         _submeshinfo.start = read.readUInt16();
        //         _submeshinfo.size = read.readUInt32();
        //         _submeshinfo.matIndex = i;//read.readUInt8();
        //         this.submesh.push(_submeshinfo);
        //         for (var j = 0; j < _submeshinfo.size; j++)
        //         {
        //             data.trisindex.push(read.readUInt32());
        //         }

        //     }

        //     this.data = data;
        //     this.glMesh = new m4m.render.glMesh();
        //     var vertexs = this.data.genVertexDataArray(this.data.originVF);
        //     var indices = this.data.genIndexDataArray();

        //     this.glMesh.initBuffer(webgl, this.data.originVF, this.data.pos.length);
        //     this.glMesh.uploadVertexData(webgl, vertexs);
        //     this.glMesh.addIndex(webgl, indices.length);
        //     this.glMesh.uploadIndexData(webgl, 0, indices);

        // }
        /*
        parseJSON(inData, webgl)
        {
            this.data = new m4m.render.meshData();
            this.data.originVF = inData.meshData.originVF;
            this.data.pos = inData.meshData.pos;
            this.data.color = inData.meshData.color;
            this.data.colorex = inData.meshData.colorex;
            this.data.uv = inData.meshData.uv;
            this.data.uv2 = inData.meshData.uv2;
            this.data.normal = inData.meshData.normal;
            this.data.tangent = inData.meshData.tangent;
            this.data.blendIndex = inData.meshData.blendIndex;
            this.data.blendWeight = inData.meshData.blendWeight;
            this.data.trisindex = inData.meshData.trisindex;
            this.submesh = inData.submesh;

            this.glMesh = new m4m.render.glMesh();
            var vertexs = this.data.genVertexDataArray(this.data.originVF);
            var indices = this.data.genIndexDataArray();
            this.glMesh.initBuffer(webgl, this.data.originVF, this.data.pos.length);
            this.glMesh.uploadVertexData(webgl, vertexs);
            this.glMesh.addIndex(webgl, indices.length);
            this.glMesh.uploadIndexData(webgl, 0, indices);
        }*/
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 检测射线碰撞
         * @param ray 射线
         * @param matrix 所在transform的矩阵
         * @version m4m 1.0
         */
        intersects(ray: ray, matrix: m4m.math.matrix, outInfo: pickinfo): boolean {
            let ishided = false;
            if (!this.submesh) return ishided;
            let lastDistance = Number.MAX_VALUE;
            let meshData = this.data;
            for (var i = 0; i < this.submesh.length; i++) {
                var submesh = this.submesh[i];
                if (submesh.line) {

                }
                else {
                    if (submesh.useVertexIndex < 0) {
                        //不使用index
                    }
                    else {
                        var t0 = m4m.math.pool.new_vector3();
                        var t1 = m4m.math.pool.new_vector3();
                        var t2 = m4m.math.pool.new_vector3();
                        for (var index = submesh.start; index < submesh.size; index += 3) {
                            // var p0 = this.data.pos[this.data.trisindex[index]];
                            // var p1 = this.data.pos[this.data.trisindex[index + 1]];
                            // var p2 = this.data.pos[this.data.trisindex[index + 2]];
                            let triIdx0 = meshData.getTriIndex(index);
                            let triIdx1 = meshData.getTriIndex(index + 1);
                            let triIdx2 = meshData.getTriIndex(index + 2);
                            let p0 = t0;
                            let p1 = t1;
                            let p2 = t2;
                            meshData.getPosition(triIdx0, p0);
                            meshData.getPosition(triIdx1, p1);
                            meshData.getPosition(triIdx2, p2);

                            m4m.math.matrixTransformVector3(p0, matrix, t0);
                            m4m.math.matrixTransformVector3(p1, matrix, t1);
                            m4m.math.matrixTransformVector3(p2, matrix, t2);

                            let tempinfo = math.pool.new_pickInfo();
                            var bool = ray.intersectsTriangle(t0, t1, t2, tempinfo);
                            if (bool) {
                                if (tempinfo.distance < 0) continue;
                                if (lastDistance > tempinfo.distance) {
                                    ishided = true;
                                    outInfo.cloneFrom(tempinfo);
                                    lastDistance = outInfo.distance;
                                    outInfo.faceId = index / 3;
                                    outInfo.subMeshId = i;
                                    var tdir = m4m.math.pool.new_vector3();
                                    math.vec3ScaleByNum(ray.direction, outInfo.distance, tdir);
                                    math.vec3Add(ray.origin, tdir, outInfo.hitposition);
                                    math.pool.delete_vector3(tdir);
                                }
                            }
                            math.pool.delete_pickInfo(tempinfo);
                        }
                        math.pool.delete_vector3(t0);
                        math.pool.delete_vector3(t1);
                        math.pool.delete_vector3(t2);
                    }
                }
            }
            return ishided;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 克隆mesh
         * @version m4m 1.0
         */
        clone(): mesh {
            let _result = new mesh(this.getName());
            var vf = this.glMesh.vertexFormat;//顶点属性
            // var data: m4m.render.meshData = new m4m.render.meshData();
            var data: m4m.render.meshData = render.meshData.cloneByObj(this.data);

            _result.data = data;
            _result.glMesh = new m4m.render.glMesh();

            var vertexs = _result.data.genVertexDataArray(vf);
            var indices = _result.data.genIndexDataArray();

            _result.glMesh.initBuffer(sceneMgr.app.getAssetMgr().webgl, vf, this.data.getVertexCount());
            _result.glMesh.uploadVertexData(sceneMgr.app.getAssetMgr().webgl, vertexs);
            _result.glMesh.addIndex(sceneMgr.app.getAssetMgr().webgl, indices.length);
            _result.glMesh.uploadIndexData(sceneMgr.app.getAssetMgr().webgl, 0, indices);
            return _result;
        }

        private _cacheMinP: math.vector3;
        private _cacheMaxP: math.vector3;
        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 计算模型顶点的 最大最小值
         * @param outMin 输出最小
         * @param outMax 输出最大
         * @version m4m 1.0
         */
        calcVectexMinMax(outMin: math.vector3, outMax: math.vector3) {
            if (!outMin || !outMax) return;
            if (!this._cacheMinP || !this._cacheMaxP) {
                this._cacheMinP = new math.vector3();
                this._cacheMaxP = new math.vector3();
                let meshdata = this.data;
                m4m.math.vec3SetByFloat(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, this._cacheMinP);
                m4m.math.vec3SetByFloat(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE, this._cacheMaxP);
                // for (var i = 0; i < meshdata.pos.length; i++) {
                //     m4m.math.vec3Max(meshdata.pos[i], this._cacheMaxP, this._cacheMaxP);
                //     m4m.math.vec3Min(meshdata.pos[i], this._cacheMinP, this._cacheMinP);
                // }
                meshdata.foreachVertexData((v, i) => {
                    const p = v.pos;
                    m4m.math.vec3Max(p, this._cacheMaxP, this._cacheMaxP);
                    m4m.math.vec3Min(p, this._cacheMinP, this._cacheMinP);
                });
            }
            math.vec3Clone(this._cacheMinP, outMin);
            math.vec3Clone(this._cacheMaxP, outMax);
        }
    }
    /**
     * @private
     */
    export class subMeshInfo {
        matIndex: number = 0;
        useVertexIndex: number = 0;//-1 表示不用indexbuffer,>=0 表示第几个，(备注,只会有 >=0 状态相同，调整成 ebo 只会有一个)
        //通常都是用第一个indexbuffer，只有用wireframe显示模式，使用第二个部分
        line: boolean = false;
        start: number = 0;
        size: number = 0;
    }


}