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
     * 动画片段资源
     * @version m4m 1.0
     */
    @m4m.reflect.SerializeType
    export class animationClip implements IAsset
    {
        static readonly ClassName: string = "animationClip";

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
         * 动画片段
         * @param assetName 资源名 
         */
        constructor(assetName: string = null)
        {
            if (!assetName)
            {
                assetName = "animationClip_" + this.getGUID();
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
        unuse(disposeNow: boolean = false)
        {
            sceneMgr.app.getAssetMgr().unuse(this, disposeNow);
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
            this.bones.length = 0;
            this.subclips.length = 0;
            delete this.frames;
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
            let total = 0;
            for (let k in this.bones)
            {
                total += math.caclStringByteLength(this.bones[k]);
            }

            for (let k in this.frames)
            {
                total += this.frames[k].byteLength;

                total += math.caclStringByteLength(k);
            }

            total += subClip.caclByteLength() * this.subclips.length;

            return total;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 解析资源
         * @param buf buffer数组
         * @version m4m 1.0
         */
        Parse(buf: ArrayBuffer): Promise<animationClip>
        {
            return new Promise((resolve, reject) =>
            {
                try
                {
                    var read: m4m.io.binReader = new m4m.io.binReader(buf);
                    if (read.readByte() == 0xFD)
                    {
                        //版本3，当前版本
                        read.readStringUtf8();
                        this.fps = read.readFloat();
                        let optimizeSize = read.readBoolean();
                        this.hasScaled = read.readBoolean();
                        this.loop = read.readBoolean();
                        this.boneCount = read.readInt();
                        this.bones = [];
                        for (let i = 0; i < this.boneCount; i++)
                        {
                            let bonename = read.readStringUtf8();
                            this.bones.push(bonename);
                            this.indexDic[bonename] = i;
                        }
                        this.indexDic["len"] = this.boneCount;

                        this.subclipCount = read.readInt();
                        this.subclips = [];
                        for (let i = 0; i < this.subclipCount; i++)
                        {
                            let _subClip = new subClip();
                            _subClip.name = read.readStringUtf8();
                            _subClip.loop = read.readBoolean();
                            this.subclips.push(_subClip);
                        }

                        this.frameCount = read.readInt();
                        this.frames = {};
                        // byte stride
                        const bs = this.hasScaled ? 8 : 7;
                        let minVals = [];
                        let maxVals = [];
                        if (optimizeSize)
                        {
                            for (let i = 0; i < bs; i++)
                            {
                                minVals.push(read.readFloat());
                                maxVals.push(read.readFloat());
                            }
                        }

                        for (let i = 0; i < this.frameCount; i++)
                        {
                            let _fid = read.readInt().toString();
                            let _key = read.readBoolean();
                            let _frame = new Float32Array(this.boneCount * bs + 1);
                            _frame[0] = _key ? 1 : 0;

                            let _boneInfo = new PoseBoneMatrix();
                            for (let i = 0; i < this.boneCount; i++)
                            {
                                _boneInfo.load(read, this.hasScaled, optimizeSize ? { maxVals, minVals } : null);
                                _frame[i * bs + 1] = _boneInfo.r.x;
                                _frame[i * bs + 2] = _boneInfo.r.y;
                                _frame[i * bs + 3] = _boneInfo.r.z;
                                _frame[i * bs + 4] = _boneInfo.r.w;
                                _frame[i * bs + 5] = _boneInfo.t.x;
                                _frame[i * bs + 6] = _boneInfo.t.y;
                                _frame[i * bs + 7] = _boneInfo.t.z;
                                if (this.hasScaled)
                                {
                                    _frame[i * bs + 8] = _boneInfo.s;
                                }
                            }
                            this.frames[_fid] = _frame;
                        }

                    } else
                    {
                        //重新开始读
                        read.seek(0)
                        // var _name =
                        read.readStringUtf8();
                        this.fps = read.readFloat();
                        const magic = read.readByte();

                        let optimizeSize = false;

                        if (magic == 0) //版本1
                        {
                            this.hasScaled = false;
                            this.loop = false;
                        } else if (magic == 1) //版本1
                        {
                            this.hasScaled = false;
                            this.loop = true;
                        } else if (magic == 0xFA) //版本1
                        {
                            this.hasScaled = true;
                            this.loop = read.readBoolean();
                        } else if (magic == 0xFB) //版本2
                        {
                            optimizeSize = true;
                            this.hasScaled = false;
                            this.loop = read.readBoolean();
                        } else if (magic == 0xFC) //版本2
                        {
                            optimizeSize = true;
                            this.hasScaled = true;
                            this.loop = read.readBoolean();
                        }

                        this.boneCount = read.readInt();
                        this.bones = [];
                        for (let i = 0; i < this.boneCount; i++)
                        {
                            let bonename = read.readStringUtf8();
                            this.bones.push(bonename);
                            this.indexDic[bonename] = i;
                        }
                        this.indexDic["len"] = this.boneCount;

                        this.subclipCount = read.readInt();
                        this.subclips = [];
                        for (let i = 0; i < this.subclipCount; i++)
                        {
                            let _subClip = new subClip();
                            _subClip.name = read.readStringUtf8();
                            _subClip.loop = read.readBoolean();
                            this.subclips.push(_subClip);
                        }

                        this.frameCount = read.readInt();
                        this.frames = {};
                        // byte stride
                        const bs = this.hasScaled ? 8 : 7;
                        let minVals = [];
                        let maxVals = [];
                        if (optimizeSize)
                        {
                            for (let i = 0; i < 8; i++)
                            {
                                minVals.push(read.readFloat());
                                maxVals.push(read.readFloat());
                            }
                        }

                        for (let i = 0; i < this.frameCount; i++)
                        {
                            let _fid = read.readInt().toString();
                            let _key = read.readBoolean();
                            let _frame = new Float32Array(this.boneCount * bs + 1);
                            _frame[0] = _key ? 1 : 0;

                            let _boneInfo = new PoseBoneMatrix();
                            for (let i = 0; i < this.boneCount; i++)
                            {
                                _boneInfo.load(read, this.hasScaled, optimizeSize ? { maxVals, minVals } : null);
                                _frame[i * bs + 1] = _boneInfo.r.x;
                                _frame[i * bs + 2] = _boneInfo.r.y;
                                _frame[i * bs + 3] = _boneInfo.r.z;
                                _frame[i * bs + 4] = _boneInfo.r.w;
                                _frame[i * bs + 5] = _boneInfo.t.x;
                                _frame[i * bs + 6] = _boneInfo.t.y;
                                _frame[i * bs + 7] = _boneInfo.t.z;
                                if (this.hasScaled)
                                {
                                    _frame[i * bs + 8] = _boneInfo.s;
                                }
                            }
                            this.frames[_fid] = _frame;
                        }
                    }
                } catch (error)
                {
                    reject(error.stack);
                    return;
                }
                resolve(this);
            });
        }

        /**
         * @public
         * @language zh_CN
         * 动画片段的帧率
         * @version m4m 1.0
         */
        fps: number;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 是否循环
         * @version m4m 1.0
         */
        loop: boolean;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 是否含有缩放
         * @version m4m 1.0
         */
        hasScaled: boolean;

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 播放时长
         * @version m4m 1.0
         */
        get time()
        {
            if (!this.frameCount || !this.fps) return 0;
            return this.frameCount / this.fps;
        }

        /**
         * @public
         * @language zh_CN
         * @classdesc
         * 骨骼数量
         * @version m4m 1.0
         */
        boneCount: number;
        /**
         * @private
         */
        bones: string[];

        indexDic: { [boneName: string]: number } = {};
        /**
         * @private
         */
        frameCount: number;
        /**
         * @private
         */
        frames: { [fid: string]: Float32Array } = {};

        /**
         * @private
         */
        subclipCount: number;
        /**
         * @private
         */
        subclips: subClip[];

    }

    /**
     * 姿势的 骨骼+矩阵
     */
    @reflect.SerializeType
    export class PoseBoneMatrix
    {
        static readonly ClassName: string = "PoseBoneMatrix";

        @reflect.Field("vector3")
        t: math.vector3;
        @reflect.Field("quaternion")
        r: math.quaternion;
        @reflect.Field("scale")
        s: math.float;
        /**
         * 计算内存占用数据长度
         * @returns 数据长度
         */
        static caclByteLength(): number
        {
            let total = 12 + 16;
            return total;
        }
        /**
         * 拷贝一个实例
         * @returns 骨骼+矩阵对象
         */
        Clone(): PoseBoneMatrix
        {
            var p = new PoseBoneMatrix();
            p.t = new math.vector3();
            p.r = new math.quaternion();
            math.vec3Clone(this.t, p.t);
            math.quatClone(this.r, p.r);
            return p;
        }

        /**
         * 加载
         * @param read 二进制读对象
         * @param hasScaled 是否有缩放
         * @param optimizeSize 优化尺寸
         */
        load(read: io.binReader, hasScaled = false, optimizeSize: { minVals: number[], maxVals: number[] } = null)
        {
            if (!optimizeSize)
            {
                {
                    var x = read.readSingle();
                    var y = read.readSingle();
                    var z = read.readSingle();
                    var w = read.readSingle();
                    this.r = new math.quaternion(x, y, z, w);
                }
                {
                    var x = read.readSingle();
                    var y = read.readSingle();
                    var z = read.readSingle();
                    this.t = new math.vector3(x, y, z);
                }
                {
                    if (hasScaled)
                    {
                        this.s = read.readSingle();
                    }
                }
            } else
            {
                let { minVals, maxVals } = optimizeSize;
                {
                    //原始16byte优化为=》quat存储4 *（1.5 byte）12个位= 6 byte
                    let byte1 = read.readByte();
                    let byte2 = read.readByte();
                    let byte3 = read.readByte();
                    let byte4 = read.readByte();
                    let byte5 = read.readByte();
                    let byte6 = read.readByte();

                    let x = minVals[0] + (byte1 + ((byte5 & 0x0f) << 8)) * (maxVals[0] - minVals[0]) / 0xfff;
                    let y = minVals[1] + (byte2 + ((byte5 & 0xf0) << 4)) * (maxVals[1] - minVals[1]) / 0xfff;
                    let z = minVals[2] + (byte3 + ((byte6 & 0x0f) << 8)) * (maxVals[2] - minVals[2]) / 0xfff;
                    let w = minVals[3] + (byte4 + ((byte6 & 0xf0) << 4)) * (maxVals[3] - minVals[3]) / 0xfff;
                    this.r = new math.quaternion(x, y, z, w);
                }
                {
                    //原始12byte优化为=》translate存储3 *（1.5 byte）12个位 = 4.5 byte = 5 byte
                    let byte1 = read.readByte();
                    let byte2 = read.readByte();
                    let byte3 = read.readByte();
                    let byte4 = read.readByte();
                    let byte5 = read.readByte();

                    let x = minVals[4] + (byte1 + ((byte4 & 0x0f) << 8)) * (maxVals[4] - minVals[4]) / 0xfff;
                    let y = minVals[5] + (byte2 + ((byte4 & 0xf0) << 4)) * (maxVals[5] - minVals[5]) / 0xfff;
                    let z = minVals[6] + (byte3 + (byte5 << 8)) * (maxVals[6] - minVals[6]) / 0xfff;
                    this.t = new math.vector3(x, y, z);
                }
                {
                    if (hasScaled)
                    {
                        //scale.x 原始4byte优化为=》1byte
                        let byte1 = read.readByte();
                        this.s = minVals[7] + byte1 * (maxVals[7] - minVals[7]) / 0xff;
                    }
                }
            }
        }

        /**
         * 创建一个默认的对象
         */
        static createDefault(): PoseBoneMatrix
        {
            var pt = new PoseBoneMatrix();
            pt.r = new math.quaternion(0, 0, 0, 1);
            pt.t = new math.vector3(0, 0, 0);
            return pt;
        }

        /**
         * 从一个 （骨骼+矩阵）对象复制属性
         * @param src 
         */
        copyFrom(src: PoseBoneMatrix)
        {
            // this.r.rawData.set(src.r.rawData);
            // this.t.rawData.set(src.t.rawData);
            math.quatClone(src.r, this.r);
            math.vec3Clone(src.t, this.t);
        }

        /**
         * 从一个 数据对象复制属性
         * @param src 
         * @param seek 
         */
        copyFromData(src: Float32Array, seek: number)
        {
            this.r.x = src[seek + 0];
            this.r.y = src[seek + 1];
            this.r.z = src[seek + 2];
            this.r.w = src[seek + 3];
            this.t.x = src[seek + 4];
            this.t.y = src[seek + 5];
            this.t.z = src[seek + 6];
            // TODO:
            // this.s = src[seek + 7];
        }

        /**
         * 骨骼+矩阵 逆转置
         */
        invert()
        {
            math.quatInverse(this.r, this.r)
            math.quatTransformVector(this.r, this.t, this.t);
            this.t.x *= -1;
            this.t.y *= -1;
            this.t.z *= -1;
        }

        /**
         * @deprecated [已弃用]
         * 世界空间中差值运算
         */
        lerpInWorld(_tpose: PoseBoneMatrix, from: PoseBoneMatrix, to: PoseBoneMatrix, v: number)
        {
            ////预乘之后，插值奇慢
            // var tpose = new math.matrix();

            // math.matrixMakeTransformRTS(
            //     new math.vector3(_tpose.t.x, _tpose.t.y, _tpose.t.z),
            //     new math.vector3(1, 1, 1),
            //     new math.quaternion(_tpose.r.x, _tpose.r.y, _tpose.r.z, _tpose.r.w),
            //     tpose);

            var t1 = PoseBoneMatrix.sMultiply(from, _tpose);
            var t2 = PoseBoneMatrix.sMultiply(to, _tpose);
            //球插
            var outLerp = PoseBoneMatrix.sLerp(t1, t2, v);

            //再去掉tpose，为了加速这个过程，考虑要存一份 合并tpose的骨骼数据

            var itpose = _tpose.Clone();
            itpose.invert();

            PoseBoneMatrix.sMultiply(outLerp, itpose, this);
        }
        /**
         * 用数据计算 在世界空间中差值
         * @param _tpose tpose
         * @param from 起始值
         * @param todata 结束的数据
         * @param toseek 
         * @param v 差值进度百分比值
         */
        lerpInWorldWithData(_tpose: PoseBoneMatrix, from: PoseBoneMatrix, todata: Float32Array, toseek: number, v: number)
        {
            ////预乘之后，插值奇慢
            // var tpose = new math.matrix();

            // math.matrixMakeTransformRTS(
            //     new math.vector3(_tpose.t.x, _tpose.t.y, _tpose.t.z),
            //     new math.vector3(1, 1, 1),
            //     new math.quaternion(_tpose.r.x, _tpose.r.y, _tpose.r.z, _tpose.r.w),
            //     tpose);

            var t1 = PoseBoneMatrix.sMultiply(from, _tpose);
            var t2 = PoseBoneMatrix.sMultiplyDataAndMatrix(todata, toseek, _tpose);
            //球插
            var outLerp = PoseBoneMatrix.sLerp(t1, t2, v);

            //再去掉tpose，为了加速这个过程，考虑要存一份 合并tpose的骨骼数据

            var itpose = _tpose.Clone();
            itpose.invert();

            PoseBoneMatrix.sMultiply(outLerp, itpose, this);
        }

        /**
         * 相乘计算
         * @param left 左值
         * @param right 右值
         * @param target 结果承接对象
         * @returns 结果对象
         */
        static sMultiply(left: PoseBoneMatrix, right: PoseBoneMatrix, target: PoseBoneMatrix = null): PoseBoneMatrix
        {
            if (target == null)
                target = PoseBoneMatrix.createDefault();
            var dir = math.pool.new_vector3();
            math.vec3Clone(right.t, dir);
            var dirtran = math.pool.new_vector3();
            math.quatTransformVector(left.r, dir, dirtran);

            target.t.x = dirtran.x + left.t.x;
            target.t.y = dirtran.y + left.t.y;
            target.t.z = dirtran.z + left.t.z;
            math.quatMultiply(left.r, right.r, target.r);

            math.pool.delete_vector3(dir);
            math.pool.delete_vector3(dirtran);
            return target;
        }

        /** @deprecated [已弃用] */
        static sMultiplytpose(left: PoseBoneMatrix, right: tPoseInfo, target: PoseBoneMatrix = null): PoseBoneMatrix
        {
            if (target == null)
                target = PoseBoneMatrix.createDefault();
            var dir = math.pool.new_vector3();
            math.vec3Clone(right.tposep, dir);
            var dirtran = math.pool.new_vector3();
            math.quatTransformVector(left.r, dir, dirtran);

            target.t.x = dirtran.x + left.t.x;
            target.t.y = dirtran.y + left.t.y;
            target.t.z = dirtran.z + left.t.z;
            math.quatMultiply(left.r, right.tposeq, target.r);

            math.pool.delete_vector3(dir);
            math.pool.delete_vector3(dirtran);
            return target;
        }

        /**
         * 用数据计算 相乘计算
         * @param leftdata 左值
         * @param leftseek 
         * @param right 右值
         * @param target 结果承接对象
         * @returns 结果对象
         */
        static sMultiplyDataAndMatrix(leftdata: Float32Array, leftseek: number, right: PoseBoneMatrix, target: PoseBoneMatrix = null): PoseBoneMatrix
        {
            if (target == null)
                target = PoseBoneMatrix.createDefault();
            var dir = math.pool.new_vector3();
            math.vec3Clone(right.t, dir);
            var dirtran = math.pool.new_vector3();
            math.quatTransformVectorDataAndQuat(leftdata, leftseek + 0, dir, dirtran);

            target.t.x = dirtran.x + leftdata[leftseek + 4];
            target.t.y = dirtran.y + leftdata[leftseek + 5];
            target.t.z = dirtran.z + leftdata[leftseek + 6];
            math.quatMultiplyDataAndQuat(leftdata, leftseek + 0, right.r, target.r);

            math.pool.delete_vector3(dir);
            math.pool.delete_vector3(dirtran);
            return target;
        }

        /**
         * 球形差值计算
         * @param left 左值
         * @param right 右值
         * @param v 差值进度百分比值
         * @param target 结果承接对象
         * @returns 结果对象
         */
        static sLerp(left: PoseBoneMatrix, right: PoseBoneMatrix, v: number, target: PoseBoneMatrix = null): PoseBoneMatrix
        {
            if (target == null)
                target = PoseBoneMatrix.createDefault();
            target.t.x = left.t.x * (1 - v) + right.t.x * v;
            target.t.y = left.t.y * (1 - v) + right.t.y * v;
            target.t.z = left.t.z * (1 - v) + right.t.z * v;

            math.quatLerp(left.r, right.r, target.r, v);
            return target;
        }

        private static poolmats: PoseBoneMatrix[] = [];
        /**
         * 对象回收到池
         * @param mat 骨骼+矩阵对象
         */
        static recycle(mat: PoseBoneMatrix)
        {
            this.poolmats.push(mat);
        }
        
        /**
         * 从池里面获取一个对象
         * @returns 骨骼+矩阵对象
         */
        static create(): PoseBoneMatrix
        {
            let item = this.poolmats.pop();
            if (item)
            {
                return item;
            } else
            {
                item = PoseBoneMatrix.createDefault();
                return item;
            }
        }
    }

    /**
     * @private
     */
    export class subClip
    {
        name: string;
        loop: boolean;
        startframe: number;
        endframe: number;
        /**
         * 计算内存数据长度
         * @returns 
         */
        static caclByteLength(): number
        {
            let total = 0;
            total += math.caclStringByteLength(this.name);
            total += 1;
            total += 8;
            return total;
        }
    }
}