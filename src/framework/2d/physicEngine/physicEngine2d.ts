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
    // export declare let physic: PhysicsEngine;
    //export declare let physic2D: physicEngine2D;

    export interface Itiming {
        /** 默认值 ： 0 */
        timeScale?: number;  
        /** 默认值 ： 1  */
        timestamp?: number;
    }
    export interface IEngine2DOP {
        /** 默认值 ： 6 */
        positionIterations?:number;
        /** 默认值 ： 4 */
        velocityIterations?:number;
        /** 默认值 ： 2  */
        constraintIterations?: number;
        /** 默认值 : fales */
        enableSleeping?:boolean;
        timing?: Itiming; 
        /** 默认值 : {bucketWidth: 48, bucketHeight: 48} */
        broadphase? : {bucketWidth:number,bucketHeight:number};
        /** 循环器的设定帧率 , 默认值 : 60 */
        runnerFps?;
        /** 循环器是否应使用固定的timestep（deltaTime），默认值：false   */
        runnerIsFixed?;
    }
    export interface IWorld{
        gravity:{
            x: number,
            y: number,
            scale: number
        }
        bounds:{
            min:math.Ivec2,
            max:math.Ivec2
        }
    }

    export interface IRunner{
        /**
         * 循环周期执行函数
         * @param delta 上一周期执行时间（s）
         */
        tick (delta:number);
    }
    declare var Matter: any;
    export class physicEngine2D {
        private _Matter: any;
        get Matter() { return this._Matter };
        matterEngine: any;
        engineWorld: IWorld;
        engineRunner: IRunner;
        private eventer: event.Physic2dEvent = new event.Physic2dEvent();
        private _bodysObjMap: { [id: number]: I2DPhysicsBody } = {};
        /**
         * 物理2D引擎
         * @param op 引擎2D选项
         * @returns 物理2D引擎
         */
        public constructor(op: IEngine2DOP = null) {
            op = op || {};
            if (Matter == undefined) {
                console.error(" Matter not found , create physicEngine2D fail");
                return;
            }
            this._Matter = Matter;
            this.matterEngine = Matter.Engine.create(op);

            this.engineWorld = this.matterEngine.world;
            let engine = this.matterEngine; 
            let runnerOp = {fps:op.runnerFps || 60, isFixed : op.runnerIsFixed == true };
            let runner = Matter.Runner.create(runnerOp);

            //---------run the engine
            let modeSceneCtr = true;
            if(modeSceneCtr){
                this.engineRunner = runner;
                let nowTime = 0;
                let frameCounter =0;
                let counterTimestamp =0;
                let dt = 1 / runner.fps;
                runner.delta = dt;
                runner.deltaMin =  dt * 0.5;
                runner.deltaMax =  dt * 4;
                this.engineRunner.tick = (delta:number)=>{
                    //beforeStep
                    this.beforeStep();
                    // Matter.Runner.tick(runner , engine , nowTime);
                    this.RunnerTick(runner,engine,delta);
                    //aftereStep
                    this.afterStep();
                    
                    if(!runnerOp.isFixed){
                        // fps counter
                        nowTime += delta;
                        frameCounter += 1;
                        if (nowTime - counterTimestamp >= 1) {
                            runner.fps = frameCounter * ((nowTime - counterTimestamp));
                            // console.log(`fps : ${runner.fps} , delta: ${runner.delta}`);
                            counterTimestamp = nowTime;
                            frameCounter = 0;
                        }
                    }
                }
            }else{
                // Matter.Engine.run(this.matterEngine);
                Matter.Runner.run(runner, engine);
            }

            //Event
            Matter.Events.on(this.matterEngine, "beforeUpdate", this.beforeUpdate.bind(this));
            Matter.Events.on(this.matterEngine, "afterUpdate", this.afterUpdate.bind(this));
            Matter.Events.on(this.matterEngine, "collisionStart", this.collisionStart.bind(this));
            Matter.Events.on(this.matterEngine, "collisionActive", this.collisionActive.bind(this));
            Matter.Events.on(this.matterEngine, "collisionEnd", this.collisionEnd.bind(this));
        }

        /**
         * 执行循环周期
         * @param runner 执行主体对象
         * @param engine 物理引擎实例对象
         * @param delta 上一周期执行时间（s）
         */
        private RunnerTick(runner , engine , delta:number){
            var Events = Matter.Events;
            var Engine = Matter.Engine;
            var timing = engine.timing;
            var correction = 1;

            // create an event object
            var event = {
                timestamp: timing.timestamp
            };

            Events.trigger(runner, 'beforeTick', event);
            Events.trigger(engine, 'beforeTick', event); // @deprecated

            if (runner.isFixed) {
                // fixed timestep
                delta = runner.delta;
            } else {
                // optimistically filter delta over a few frames, to improve stability
                runner.deltaHistory.push(delta);
                runner.deltaHistory = runner.deltaHistory.slice(-runner.deltaSampleSize);
                delta = Math.min.apply(null, runner.deltaHistory);
                
                // limit delta
                delta = delta < runner.deltaMin ? runner.deltaMin : delta;
                delta = delta > runner.deltaMax ? runner.deltaMax : delta;

                // correction for delta
                correction = delta / runner.delta;

                // update engine timing object
                runner.delta = delta;
            }

            // time correction for time scaling
            if (runner.timeScalePrev !== 0)
                correction *= timing.timeScale / runner.timeScalePrev;

            if (timing.timeScale === 0)
                correction = 0;

            runner.timeScalePrev = timing.timeScale;
            runner.correction = correction;

            // fps counter
            Events.trigger(runner, 'tick', event);
            Events.trigger(engine, 'tick', event); // @deprecated

            // update
            Events.trigger(runner, 'beforeUpdate', event);
            Engine.update(engine, delta * 1000, correction);
            Events.trigger(runner, 'afterUpdate', event);
            //afterTick
            Events.trigger(runner, 'afterTick', event);
            Events.trigger(engine, 'afterTick', event); // @deprecated
        }

        /**
         * 物理一次计算执行前调用
         */
        private beforeStep(){
            let omap = this._bodysObjMap;
            for(var key in omap){
                let phyBody = omap[key];
                if(phyBody){
                    phyBody.beforeStep();
                }
            }
        }

        /**
         * 物理一次计算执行后调用
         */
        private afterStep(){
            let omap = this._bodysObjMap;
            for(var key in omap){
                let phyBody = omap[key];
                if(phyBody){
                    phyBody.afterStep();
                }
            }
        }

        update(delta: number) {
            Matter.Engine.update(this.matterEngine, delta);
        }


        /** Matter.Engine update 调用前 */
        private beforeUpdate(ev) {
            this.eventer.EmitEnum(event.Physic2dEventEnum.BeforeUpdate, ev);
        }

        /** Matter.Engine update 调用之后 */
        private afterUpdate(ev) {
            this.eventer.EmitEnum(event.Physic2dEventEnum.afterUpdate, ev);
        }

        /** 开始碰撞 ， Matter.Engine update 调用之后 */
        private collisionStart(ev) {
            this.eventer.EmitEnum(event.Physic2dEventEnum.collisionStart, ev);
        }

        /** 碰撞持续中， Matter.Engine update 调用之后 */
        private collisionActive(ev) {
            this.eventer.EmitEnum(event.Physic2dEventEnum.collisionActive, ev);
        }

        /** 碰撞结束 ， Matter.Engine update 调用之后 */
        private collisionEnd(ev) {
            this.eventer.EmitEnum(event.Physic2dEventEnum.collisionEnd, ev);
        }

        /**
         * 添加事件监听
         * @param eventEnum 事件类型
         * @param func 事件回调函数
         * @param thisArg 函数持有对象
         */
        addEventListener(eventEnum: event.Physic2dEventEnum, func: (...args: Array<any>) => void, thisArg: any) {
            this.eventer.OnEnum(eventEnum, func, thisArg);
        }

        /**
         * 移除事件监听
         * @param eventEnum 事件类型
         * @param func 事件回调函数
         * @param thisArg 函数持有对象
         */
        removeEventListener(eventEnum: event.Physic2dEventEnum, func: (...args: Array<any>) => void, thisArg: any) {
            this.eventer.RemoveListener(event.Physic2dEventEnum[eventEnum], func, thisArg);
        }

        /**
         * 创建一个新的矩形Body
         * @param pBody I2DPhysicsBody 实例
         */
        createRectByPBody(pBody: I2DPhysicsBody): Ibody {
            if (!pBody || !pBody.transform) return;
            let tran = pBody.transform;
            let pos = tran.getWorldTranslate();
            // let body = Matter.Bodies.rectangle(pos.x, pos.y, tran.width, tran.height, pBody.options);
            if(!pBody.options.label)    pBody.options.label = 'Rect Body';
            let body = this.createRectangle(pos.x, pos.y, tran.width, tran.height, pBody.options);
            pBody.body = body;
            // this.addBody(pBody);
            return body;
        }

        /**
         * 创建一个新的圆形Body
         * @param pBody I2DPhysicsBody 实例
         * @param radius 半径
         * @param maxSides 最大边
         */
        createCircleByPBody(pBody: I2DPhysicsBody , maxSides: number = 25): Ibody {
            if (!pBody || !pBody.transform) return;
            let tran = pBody.transform;
            let pos = tran.getWorldTranslate();
            let r = tran.width > tran.height ? tran.width: tran.height;
            r *= 0.5;
            if(!pBody.options.label)    pBody.options.label = 'Circle Body';
            let body = this.createCircle(pos.x, pos.y, r, pBody.options, maxSides);
            pBody.body = body;
            return body;
        }
        /**
         * 使用提供的顶点（或包含多组顶点的数组）创建一个新的物理实体
         * 详细参考： createFromVertices（）
         * @param pBody I2DPhysicsBody 实例
         * @param vertexSets 顶点集合
         * @param flagInternal 内部模式标记
         * @param removeCollinear 共线移除参考值
         * @param minimumArea 最小面积
         */
        ConvexHullByPBody(pBody: I2DPhysicsBody, vertexSets, flagInternal = false, removeCollinear = 0.01, minimumArea = 10): Ibody {
            if (!pBody || !pBody.transform) return;
            let tran = pBody.transform;
            let pos = tran.getWorldTranslate();
            // let body = Matter.Bodies.fromVertices(pos.x, pos.y, vertexSets, pBody.options , flagInternal , removeCollinear , minimumArea);
            if(!pBody.options.label)    pBody.options.label = 'ConvexHull Body';
            let body = this.createFromVertices(pos.x, pos.y, vertexSets, pBody.options, flagInternal, removeCollinear, minimumArea);
            pBody.body = body;
            // this.addBody(pBody,);
            return body;
        }

        /**
         * 创建一个新的胶囊体Body
         * @param pBody 
         * @param maxSides 
         */
        createCapsuleByPBody(pBody: I2DPhysicsBody , maxSides:number = 25){
            if (!pBody || !pBody.transform) return;
            let tran = pBody.transform;
            let pos = tran.getWorldTranslate();
            let y_Axis = tran.height > tran.width ;
            let r = y_Axis ? tran.width : tran.height;
            r *= 0.5;
            let h = y_Axis ? tran.height : tran.width ;
            let angle = y_Axis ? 0 : Math.PI * 0.5;
            if(!pBody.options.label)    pBody.options.label = 'Capsule Body';
            let body = this.createCapsule(pos.x, pos.y, r, h, pBody.options,angle, maxSides);
            pBody.body = body;
            return body;
        }

        /**
         * Creates a new rigid body model. The options parameter is an object that specifies any properties you wish to override the defaults.
         * All properties have default values, and many are pre-calculated automatically based on other properties.
         * Vertices must be specified in clockwise order.
         * See the properties section below for detailed information on what you can pass via the `options` object.
         * @param options 
         */
        createBody(options: I2dPhyBodyData): Ibody {
            return Matter.Body.create(options);
        }

        /**
         * Creates a new rigid body model with a circle hull. 
         * The options parameter is an object that specifies any properties you wish to override the defaults.
         * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
         * @method circle
         * @param {number} x
         * @param {number} y
         * @param {number} radius
         * @param {object} [options]
         * @param {number} [maxSides]
         * @return {body} A new circle body
         */
        createCircle(x: number, y: number, radius: number, options: I2dPhyBodyData, maxSides: number): Ibody {
            return Matter.Bodies.circle(x, y, radius, options, maxSides);
        }

        /**
         * Creates a new rigid body model with a rectangle hull. 
         * The options parameter is an object that specifies any properties you wish to override the defaults.
         * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
         * @method rectangle
         * @param {number} x
         * @param {number} y
         * @param {number} width
         * @param {number} height
         * @param {object} [options]
         * @return {body} A new rectangle body
         */
        createRectangle(x: number, y: number, width: number, height: number, options: I2dPhyBodyData): Ibody {
            return Matter.Bodies.rectangle(x, y, width, height, options);
        }

        /**
         * Creates a new rigid body model with a trapezoid hull. 
         * The options parameter is an object that specifies any properties you wish to override the defaults.
         * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
         * @method trapezoid
         * @param {number} x
         * @param {number} y
         * @param {number} width
         * @param {number} height
         * @param {number} slope
         * @param {object} [options]
         * @return {body} A new trapezoid body
         */
        createTrapezoid(x: number, y: number, width: number, height: number, slope: number, options: I2dPhyBodyData): Ibody {
            return Matter.Bodies.trapezoid(x, y, width, height, slope, options);
        }

        /**
         * Creates a new rigid body model with a regular polygon hull with the given number of sides. 
         * The options parameter is an object that specifies any properties you wish to override the defaults.
         * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
         * @method polygon
         * @param {number} x
         * @param {number} y
         * @param {number} sides
         * @param {number} radius
         * @param {object} [options]
         * @return {body} A new regular polygon body
         */
        createPolygon(x: number, y: number, sides: number, radius: number, options: I2dPhyBodyData): Ibody {
            return Matter.Bodies.polygon(x, y, sides, radius, options);
        }

        /**
         * Creates a body using the supplied vertices (or an array containing multiple sets of vertices).
         * If the vertices are convex, they will pass through as supplied.
         * Otherwise if the vertices are concave, they will be decomposed if [poly-decomp.js](https://github.com/schteppe/poly-decomp.js) is available.
         * Note that this process is not guaranteed to support complex sets of vertices (e.g. those with holes may fail).
         * By default the decomposition will discard collinear edges (to improve performance).
         * It can also optionally discard any parts that have an area less than `minimumArea`.
         * If the vertices can not be decomposed, the result will fall back to using the convex hull.
         * The options parameter is an object that specifies any `Matter.Body` properties you wish to override the defaults.
         * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
         * @method fromVertices
         * @param {number} x
         * @param {number} y
         * @param [Ivec2] vertexSets
         * @param {object} [options]
         * @param {bool} [flagInternal=false]
         * @param {number} [removeCollinear=0.01]
         * @param {number} [minimumArea=10]
         * @return {body}
         */
        createFromVertices(x: number, y: number, vertexSets: math.Ivec2[], options: I2dPhyBodyData, flagInternal = false, removeCollinear = 0.01, minimumArea = 10): Ibody {
            return Matter.Bodies.fromVertices(x, y, vertexSets, options, flagInternal, removeCollinear, minimumArea);
        }

        /**
         * Creates a new rigid body model with a capsule hull. 
         * The options parameter is an object that specifies any properties you wish to override the defaults.
         * See the properties section of the `Matter.Body` module for detailed information on what you can pass via the `options` object.
         * @method createCapsule
         * @param {number} x
         * @param {number} y
         * @param {number} radius
         * @param {number} height
         * @param {object} [options]
         * @param {number} rotation vertices roate of angle
         * @param {number} [maxSides]
         * @return {body} A new capsule body
         */
        createCapsule(x: number, y: number, radius: number, height: number, options: I2dPhyBodyData, rotation: number = 0, maxSides: number = 25) {
            options = options || {};

            maxSides = maxSides || 25;
            let sides = Math.ceil(Math.max(6, Math.min(maxSides, radius)));
            // optimisation: always use even number of sides (half the number of unique axes)
            sides = sides % 2 === 1 ? sides++ : sides;

            let halfSides = sides / 2,
                halfDiff = (height - radius) / 2,
                theta = 2 * Math.PI / sides,
                path = '',
                angOffset = Math.PI + theta * 0.5,
                angle,
                xx,
                yy,
                yOffset;

            // Always greater than 0 of halfDiff
            halfDiff = halfDiff < 0 ? 0 : halfDiff;

            for (var i = 0; i < sides; i++) {
                yOffset = i > halfSides ? halfDiff : -halfDiff;
                angle = angOffset + (i * theta);
                xx = Math.cos(angle) * radius;
                yy = Math.sin(angle) * radius + yOffset;
                if (i == 0) {
                    path += 'L ' + xx.toFixed(3) + ' ' + (yy - yOffset * 2).toFixed(3) + ' ';
                }
                path += 'L ' + xx.toFixed(3) + ' ' + yy.toFixed(3) + ' ';
                if (i == halfSides) {
                    path += 'L ' + xx.toFixed(3) + ' ' + (yy - yOffset * 2).toFixed(3) + ' ';
                }
            }
            let createCapsule = {
                label: 'Capsule Body',
                position: { x: x, y: y },
                vertices: Matter.Vertices.fromPath(path)
            };

            if (rotation != null || rotation % (Math.PI * 2) == 0) {
                Matter.Vertices.rotate(createCapsule.vertices, rotation, { x: x, y: y });
            }

            return Matter.Body.create(Matter.Common.extend({}, createCapsule, options));
        }

        /** 添加 I2DPhysicsBody 实例到 2d物理世界*/
        addBody(_Pbody: I2DPhysicsBody) {
            if (!_Pbody || !_Pbody.body) return;
            this._bodysObjMap[_Pbody.body.id] = _Pbody;
            Matter.World.add(this.engineWorld, _Pbody.body);
        }

        /** 移除 指定 I2DPhysicsBody 实例 */
        removeBody(_Pbody: I2DPhysicsBody) {
            if (!_Pbody || !_Pbody.body) return;
            delete this._bodysObjMap[_Pbody.body.id];
            Matter.World.remove(this.engineWorld, _Pbody.body);
        }

        /** 获取 I2DPhysicsBody 对象通过 Ibody.id */
        getBody(bodyId: number): I2DPhysicsBody {
            return this._bodysObjMap[bodyId];
        }

        /** 清理世界 */
        clearWorld(keepStatic: boolean = false) {
            Matter.World.clear(this.engineWorld, keepStatic);
        }

        /**
         * 给2d物理体 应用一个力
         * @param body 2d物理体
         * @param positon 应用一个力的位置
         * @param force 应用的力
         */
        public applyForce(body: Ibody, positon: math.Ivec2, force: math.Ivec2): void {
            Matter.Body.applyForce(body, positon, force);
        }

        /**
         * 给2d物理体 在中心位置 应用一个力
         * @param body 2d物理体
         * @param force  应用的力
         */
        public applyForceAtCenter(body: Ibody, force: math.Ivec2): void {
            Matter.Body.applyForce(body, body.position, force);
        }
    
        /**
         * 设置重力
         * @param x 重力矢量x的值
         * @param y 重力矢量y的值
         */
        public setGravity(x: number, y: number) {
            this.engineWorld.gravity.x = x;
            this.engineWorld.gravity.y = y;
        }

        set enableSleeping(val: boolean) {
            this.matterEngine.enableSleeping = val;
        }

        get enableSleeping() {
            return this.matterEngine.enableSleeping;
        }

        //-----------------body设置-------------------------
        /** 设置速度
         * Sets the linear velocity of the body instantly. Position, angle, force etc. are unchanged. See also `Body.applyForce`.
         */
        public setVelocity(body: Ibody, velocity: math.Ivec2) {
            Matter.Body.setVelocity(body, velocity);
        }
        /** 设置位置 
         * Moves a body by a given vector relative to its current position, without imparting any velocity.
        */
        public setPosition(body: Ibody, pos: math.Ivec2) {
            Matter.Body.setPosition(body, pos);
        }

        /**
         * Sets the angle of the body instantly. Angular velocity, position, force etc. are unchanged.
         * @param body body
         * @param angle 旋转角度
         */
        public setAngle(body: Ibody, angle : number){
            Matter.Body.setAngle(body, angle);
        }
        /** 设置质量 
         * Sets the mass of the body. Inverse mass, density and inertia are automatically updated to reflect the change.
        */
        public setMass(body: Ibody, mass: number) {
            Matter.Body.setMass(body, mass);
        }

        /** 设置密度
         * Sets the density of the body. Mass and inertia are automatically updated to reflect the change.
         */
        public setDensity(body: Ibody, Desity: number) {
            Matter.Body.setDensity(body, Desity);
        }

        /**
         * 设置角速度
         * Sets the angular velocity of the body instantly. Position, angle, force etc. are unchanged. See also `Body.applyForce`.
         */
        public setAngularVelocity(body: Ibody, angularVelocity: number) {
            Matter.Body.setAngularVelocity(body, angularVelocity);
        }

        /** 设置静态状态
         * Sets the body as static, including isStatic flag and setting mass and inertia to Infinity.
         */
        public setStatic(body: Ibody, isStatic: boolean) {
            Matter.Body.setStatic(body, isStatic);
        }

        /** 设置休眠状态
         */
        public setSleeping(body: Ibody, isSleeping: boolean) {
            Matter.Sleeping.set(body, isSleeping);
        }

        /** 设置惯性值
         * Sets the moment of inertia (i.e. second moment of area) of the body. 
         * Inverse inertia is automatically updated to reflect the change. Mass is not changed.
         */
        public setInertia(body: Ibody, Inertia: number) {
            Matter.Body.setInertia(body, Inertia);
        }

        /** 设置顶点
        * Sets the body's vertices and updates body properties accordingly, including inertia, area and mass (with respect to `body.density`).
        * Vertices will be automatically transformed to be orientated around their centre of mass as the origin.
        * They are then automatically translated to world space based on `body.position`.
        *
        * The `vertices` argument should be passed as an array of `Matter.Vector` points (or a `Matter.Vertices` array).
        * Vertices must form a convex hull, concave hulls are not supported.
        */
        public setVertices(body: Ibody, vertices: math.Ivec2[]) {
            Matter.Body.setVertices(body, vertices);
        }

        /** 设置成员 
        * Sets the parts of the `body` and updates mass, inertia and centroid.
        * Each part will have its parent set to `body`.
        * By default the convex hull will be automatically computed and set on `body`, unless `autoHull` is set to `false.`
        * Note that this method will ensure that the first part in `body.parts` will always be the `body`.
        */
        public setParts(body: Ibody, parts: Ibody[], autoHull = true) {
            Matter.Body.setParts(body, parts, autoHull);
        }

        /** 设置中心点 
        * Set the centre of mass of the body. 
        * The `centre` is a vector in world-space unless `relative` is set, in which case it is a translation.
        * The centre of mass is the point the body rotates about and can be used to simulate non-uniform density.
        * This is equal to moving `body.position` but not the `body.vertices`.
        * Invalid if the `centre` falls outside the body's convex hull.
        */
        public setCentre(body: Ibody, centre: math.Ivec2, relative = false) {
            Matter.Body.setCentre(body, centre, relative);
        }

        /**
         * 设置缩放
         * Scales the body, including updating physical properties (mass, area, axes, inertia), from a world-space point (default is body centre).
         */
        public setScale(body : Ibody, scaleX : number , scaleY : number, point : math.Ivec2 = null ){
            Matter.Body.scale(body , scaleX, scaleY, point);
        }

        /**
         * 复合体缩放
         * Scales all children in the composite, including updating physical properties (mass, area, axes, inertia), from a world-space point.
         */
        public compositeScale(composite : any, scaleX : number, scaleY : number, point : math.Ivec2, recursive = false){
            Matter.Composite.scale(composite,scaleX,scaleY,point,recursive);
        }

    }

    export interface Ibody {
        bounds: { max: { x: number, y: number }, min: { x: number, y: number } };
        /** 成员 */
        parts: Ibody[];
        /** 顶点集合 */
        vertices:math.Ivec2[];
        /** 睡眠状态 */
        isSleeping: boolean;
        /** 传感器的标志 , 开启时触发碰撞事件*/
        isSensor: boolean;
        /** 静态 */
        isStatic: boolean;
        /** 重心点位置 */
        position: math.Ivec2;
        /** 速率向量 , 想要改变它 需要通过给它施加力*/
        velocity: math.Ivec2;
        /** 力*/
        force: math.Ivec2;
        /** 碰撞筛选属性对象 */
        collisionFilter: collisionFilter;
        type: string;
        tag: string;
        name: string;
        /** 旋转角度 */
        angle: number;
        /** 位移速度值 */
        speed: number;
        /** 角速度值 */
        angularSpeed: number;
        /** 空气摩擦力 */
        frictionAir: number;
        /** 摩擦力 */
        friction: number;
        /** 静态摩擦力 */
        frictionStatic: number;
        /** 弹性值 */
        restitution: number;
        /** 角速度向量 */
        angularVelocity: number;
        /** 身份ID */
        id: number;
        motion: number;
        /** 扭矩  */
        torque: number;
        /** 睡眠阈值  */
        sleepThreshold: number;
        /** 密度 */
        density: number;
        /** 质量 */
        mass: number;
        inverseMass: number;
        /** 惯性值 */
        inertia: number;
        inverseInertia: number;
        slop: number;
        /** 时间缩放 */
        timeScale: number;
    }

    /**
     * 碰撞筛选属性对象
     * 两个物体之间的碰撞将遵守以下规则：
     * 1.两个物体的group相同且大于0时会执行碰撞，如果负数将永远不会碰撞。
     * 2.当两个物体group不相同或等于0时将执行 类别/位掩码 的规则。
     */
    export interface collisionFilter {
        /** 组号*/
        group?: number;
        /** 类别 (32位 , 范围[1,2^31])*/
        category?: number;
        /** 位掩码（指定此主体可能碰撞的碰撞类别）*/
        mask?: number;
    }
}