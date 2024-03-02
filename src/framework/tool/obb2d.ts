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
{    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 2d定向包围盒
     * @version m4m 1.0
     */
    export class obb2d
    {
        private rotate:m4m.math.angelref;
        private scale:m4m.math.vector2;
        private center: m4m.math.vector2;
        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 中心点偏移量
        * @version m4m 1.0
        */
        @reflect.Field("vector2")
        offset:m4m.math.vector2;
        private halfWidth:number;
        private halfHeight:number;
        private directions :m4m.math.vector2 [];
        private _size:m4m.math.vector2;
        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 包围盒大小
        * @version m4m 1.0
        */
        @reflect.Field("vector2")
        get size(){return this._size;}
        set size(size:m4m.math.vector2){
            if(!size || !this._size)return;
            m4m.math.vec2Clone(size,this._size);
            this.halfWidth = this._size.x/2;
            this.halfHeight = this._size.y/2;
        }
        
        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 由最大最小点构建定向包围盒
        * @param center 中心点坐标
        * @param width 包围盒宽度
        * @param height 包围盒高度
        * @version m4m 1.0
        */
        buildByCenterSize(center:m4m.math.vector2,width:number,height:number){
            this.center = m4m.math.pool.clone_vector2(center);
            this.offset = m4m.math.pool.new_vector2();
            this.scale = m4m.math.pool.new_vector2();
            this.rotate = new m4m.math.angelref();
            this._size = new m4m.math.vector2(width,height);
            this.halfWidth = width/2;
            this.halfHeight = height/2;
            this.directions = [new m4m.math.vector2(),new m4m.math.vector2()];
        }
        
        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 刷新定向包围盒
        * @param canvasWorldMtx Canvas世界矩阵
        * @version m4m 1.0
        */
        update(canvasWorldMtx:m4m.math.matrix3x2){
            //getTranslation
            m4m.math.matrix3x2Decompose(canvasWorldMtx,this.scale,this.rotate,this.center);
            let tranOffset = m4m.math.pool.new_vector2();
            let scaleRotateMtx = m4m.math.pool.new_matrix3x2();
            m4m.math.matrix3x2Clone(canvasWorldMtx,scaleRotateMtx);
            scaleRotateMtx.rawData[4] = scaleRotateMtx.rawData[5] =0;  //消除位移
            m4m.math.matrix3x2TransformVector2(scaleRotateMtx,this.offset,tranOffset);
            m4m.math.vec2Add(this.center,tranOffset,this.center);
            
            //dirs
            this.directions[0].x = canvasWorldMtx.rawData[0];
            this.directions[0].y = canvasWorldMtx.rawData[1];
            this.directions[1].x = canvasWorldMtx.rawData[2];
            this.directions[1].y = canvasWorldMtx.rawData[3];
    
            m4m.math.pool.delete_vector2(tranOffset);
            m4m.math.pool.delete_matrix3x2(scaleRotateMtx);
        }
        
        /**
        * @public
        * @language zh_CN
        * @classdesc
        * obb2d的碰撞检测
        * @param _obb 待检测obb2d
        * @version m4m 1.0
        */
        intersects(_obb:obb2d){
            if (_obb == null) return false;
    
                var box0 = this;
                var box1 = _obb;
    
                if (!this.axisOverlap(box0.directions[0], box0, box1)) return false;
                if (!this.axisOverlap(box0.directions[1], box0, box1)) return false;
                if (!this.axisOverlap(box1.directions[0], box0, box1)) return false;
                if (!this.axisOverlap(box1.directions[1], box0, box1)) return false;
    
                return true;
        }
        
        /**
         * 通过给定轴 计算 定向包围盒 在轴垂直平面上的 投影 标量区间范围
         * @param axis 给定轴
         * @param box 定向包围盒
         * @returns 标量区间范围
         */
        private computeBoxExtents(axis: m4m.math.vector2, box: obb2d)
        {
            var p = m4m.math.vec2Dot(box.center, axis);
    
            var r0 = Math.abs(m4m.math.vec2Dot(box.directions[0], axis)) * box.halfWidth;
            var r1 = Math.abs(m4m.math.vec2Dot(box.directions[1], axis)) * box.halfHeight;
            var r = r0 + r1 ;
            
            var result = m4m.math.pool.new_vector2();
            result.x = p - r;
            result.y = p + r;
            return result;
        }
        
        /**
         * 判断 两定向包围盒 在指定轴 垂直平面上投影是否重叠
         * @param axis 指定轴
         * @param box0 定向包围盒a
         * @param box1 定向包围盒b
         * @returns 重叠了？
         */
        private axisOverlap(axis: m4m.math.vector2, box0: obb2d, box1: obb2d): boolean
        {
            let result0 = this.computeBoxExtents(axis, box0);
            let result1 = this.computeBoxExtents(axis, box1);
            return this.extentsOverlap(result0.x, result0.y, result1.x, result1.y);
        }
        
        /**
         * 判断 两标量区间范围 是否重叠
         * @param min0 范围a小值
         * @param max0 范围a大值
         * @param min1 范围b小值
         * @param max1 范围b大值
         * @returns 重叠了？
         */
        private extentsOverlap(min0: number, max0: number, min1: number, max1: number): boolean
        {
            return !(min0 > max1 || min1 > max0);
        }

        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 克隆一个obb
        * @version m4m 1.0
        */
        clone():obb2d
        {
            let _obb = new obb2d();
            _obb.center = math.pool.clone_vector2(this.center);
            _obb._size = math.pool.clone_vector2(this._size);
            _obb.halfWidth = this.halfWidth;
            _obb.halfHeight = this.halfHeight;
            _obb.scale = math.pool.clone_vector2(this.scale);
            _obb.rotate = new math.angelref();
            _obb.rotate.v = this.rotate.v;
            for(let key in this.directions)
            {
                 _obb.directions[key] = math.pool.clone_vector2(this.directions[key]);
            }
            return _obb;
        }
        /**
        * @public
        * @language zh_CN
        * @classdesc
        * 释放
        * @version m4m 1.0
        */
        dispose()
        {
            if(this.center) math.pool.delete_vector2(this.center);
            if(this._size) math.pool.delete_vector2(this._size);
            if(this.scale) math.pool.delete_vector2(this.scale);
            if(this.directions){
                this.directions.forEach(dir=>{
                    if(dir) math.pool.delete_vector2(dir);
                });
                this.directions.length = 0;
            }
        }
    }
}