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
//引擎的接口列表
namespace m4m.framework {
    export interface IEnabled {
        /** 是否启用 */
        enabled: boolean;
    }
    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 组件实例接口
     * @version m4m 1.0
     */
    export interface INodeComponent {
        /** 初始化时调用  在start 之后*/
        onPlay();
        /** 初始化时调用 */
        start();
         /**
         * 每帧调用一次
         * @param delta 上一帧的消耗时间(单位s)
         */
        update(delta: number);
        /** 节点对象 */
        gameObject: gameObject;
        /** 销毁时调用 */
        remove();
        // clone();         //没有实际使用过 的接口
        // jsonToAttribute(json: any, assetmgr: assetMgr);
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 2d组件的接口
     * @version m4m 1.0
     */
    export interface I2DComponent {
        /** 初始化时调用  在start 之后*/
        onPlay();
        /** 初始化时调用 */
        start();
        /**
         * 每帧调用一次
         * @param delta 上一帧的消耗时间(单位s)
         */
        update(delta: number);
        /** 节点变换对象 */
        transform: transform2D;
        /** 销毁时调用 */
        remove();
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 2d碰撞器接口
     * @version m4m 1.0
     */
    export interface ICollider2d {
        transform: transform2D;
        /** 获取包围边界 */
        getBound(): obb2d;
        /**
         * 交叉检测
         * @param tran 检测的节点 
         */
        intersectsTransform(tran: transform2D): boolean;
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 2D渲染组件的接口
     * @version m4m 1.0
     */
    export interface IRectRenderer extends I2DComponent {
        /**
         * 执行渲染
         * @param canvas 引擎 canvas 对象
         */
        render(canvas: canvas);
        /**
         * 刷新顶点信息
         */
        updateTran();
        /**
         * 获取渲染材质
         */
        getMaterial(): material;
        /**
         * 获取渲染边界(合并渲染深度排序会使用到)
         */
        getDrawBounds(): m4m.math.rect;
    }

    /**
     * @public
     * @language zh_CN
     * @classdesc
     * 渲染器接口 继承自组件接口
     * @version m4m 1.0
     */
    export interface IRenderer extends INodeComponent {
        layer: RenderLayerEnum;
        renderLayer: number;  //后期发现 和 gameObject.layer 概念冲突 ，实现时 对接处理
        queue: number;
        /**
         * 执行渲染
         * @param context 引擎渲染上下文对象
         * @param assetmgr 引擎资源管理
         * @param camera 相机对象
         */
        render(context: renderContext, assetmgr: assetMgr, camera: camera);
    }

    /**
     * 
     */
    export interface IRendererGpuIns extends IRenderer{
        // /**
        //  * 执行GPU Instancing 绘制
        //  * @param context 
        //  * @param assetmgr 
        //  * @param camera 
        //  */
        // GpuInstancingRender(context: renderContext, assetmgr: assetMgr, camera: m4m.framework.camera);
        /** 是否开启 GPU Instancing 绘制 */
        isGpuInstancing () : boolean;
    }
}