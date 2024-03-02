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
//导航RVO_防挤Demo
declare var RVO;
namespace m4m.framework {
    export class RVOManager {

        public sim = new RVO.Simulator(1, 60, 20, 20, 5, 1.0, 0.1, [0, 0]);

        public transforms:m4m.framework.transform[] = [];
        public goals = [];
        public radius: number[] = [];
        public attackRanges: number[] = [];
        public speeds: number[] = [];

        private map: { [key: number]: number } = {};

        private isRunning: boolean = false;
        private currGoal:m4m.math.vector3;
        private lastGoal:m4m.math.vector3;
        private currMoveDir:m4m.math.vector2 = new m4m.math.vector2();

        private _RoadPoints:m4m.math.vector3[] = [];
        /**
         * 设置路点
         * @param goalQueue 目标点队列
         */
        public setRoadPoints(goalQueue:m4m.math.vector3[]){
            if(!goalQueue || goalQueue.length<1) return;
            //clear history
            this._RoadPoints.forEach(sub=>{
                if(sub && sub != this.lastGoal) m4m.math.pool.delete_vector3(sub);
            });
            this._RoadPoints.length = 0;

            for(var i=0 ;i< goalQueue.length ;i++){
                let v3 = m4m.math.pool.new_vector3();
                m4m.math.vec3Clone(goalQueue[i],v3);
                this._RoadPoints.push(v3);
            }
            this.currGoal = this._RoadPoints.pop();
            this.goals[0][0] = this.currGoal.x;
            this.goals[0][1] = this.currGoal.z;
        }

        /** 添加代理 */
        public addAgent(key: number, transform: m4m.framework.transform, radius: number, attackRanges: number, speed: number) {
            let index = this.sim.agents.length;
            let current_position = [transform.localTranslate.x, transform.localTranslate.z];

            this.transforms.push(transform);
            this.attackRanges.push(attackRanges);
            this.radius.push(radius);
            this.speeds.push(speed);
            this.goals.push(current_position);

            this.sim.addAgent(current_position);

            this.sim.agents[index].id = key;
            this.sim.agents[index].radius = radius;
            this.sim.agents[index].maxSpeed = speed;

            this.map[key] = index;  // 添加 key

            if(index == 0) {
                this.sim.agents[0].neighborDist = 0; // 玩家无视小怪
            }
            this.isRunning = true;
        }

        /** 移除代理 */
        public removeAgent(key: number) {
            let offset = this.map[key];

            this.transforms.splice(offset, 1);
            this.attackRanges.splice(offset, 1);
            this.radius.splice(offset, 1);
            this.speeds.splice(offset, 1);
            this.goals.splice(offset, 1);
            this.sim.agents.splice(offset, 1);

            this.reBuildHashMap();
        }

        /** 重编HashMap */
        private reBuildHashMap() {
            for(let i = 0; i < this.sim.agents.length; i++) {
                this.map[this.sim.agents[i].id] = i;
            }

            this.sim.kdTree.agents = [];
            this.sim.kdTree.agentTree = [];
            this.sim.kdTree.obstacleTree = 0;
        }

        /** 通过key获取变换节点 */
        public getTransformByKey(key: number): m4m.framework.transform {
            let offset = this.map[key];
            return this.transforms[offset];
        }
        /** 设置 代理半径 */
        public setRadius(id: number, value: number) {
            let i = this.map[id];
            this.sim.agents[i].radius = value;
        }
        /** 设置代理最大移动速度 */
        public setSpeed(id: number, value: number) {
            let i = this.map[id];
            this.sim.agents[i].maxSpeed = value;
        }
        /** 设置搜索区域 */
        public setAttackRange(id: number, value: number) {
            let i = this.map[id];
            this.attackRanges[i] = value;
        }

        /** 关闭功能 */
        public disable() {
            this.isRunning = false;
        }

        /** 开启功能 */
        public enable() {
            this.isRunning = true;
            // 更新位置
            for(let i in this.transforms) {
                this.sim.agents[i].position = [this.transforms[i].localTranslate.x, this.transforms[i].localTranslate.z];
            }
        }

        /** 更新 */
        public update() {
            if(this.isRunning && (this.transforms.length >= 1)) {
                this.RVO_check(this.sim, this.goals);
                this.RVO_walking(this.sim, this.goals);
                this.updateTransform(this.sim);
            }
        }

        /** 是静态？ */
        private isAlmostStatic():boolean {
            let threshold = 0.1;
            let amount = 0;
            for(let i = 0; i < this.sim.agents.length; i++) {
                if(this.sim.agents[i].prefVelocity != null) {
                    if(this.sim.agents[i].prefVelocity[0] < 0.01 && this.sim.agents[i].prefVelocity[1] < 0.01) {
                        amount++;
                    }
                }
            }
            if(amount/this.sim.agents.length >= threshold) {
                return true;
            }
            return false;
        }

        /** RVO 系统走一步 */
        private RVO_walking(sim, goals) {
            // 据当前目标重新获取目标方向向量
            for (var i = 0, len = sim.agents.length; i < len; i ++) {
                if(sim.agents[i] != null) {
                    var goalVector = RVO.Vector.subtract(goals[i], sim.agents[i].position);
                    if (RVO.Vector.absSq(goalVector) > 1) {
                        goalVector = RVO.Vector.normalize(goalVector);
                    }
                    sim.agents[i].prefVelocity = goalVector; // 更新速度向量
                }
            }
            sim.doStep();   // 移动一帧
        }

        /** 更新引擎变换节点 */
        private updateTransform(sim) {
            for(let i = 0; i < sim.agents.length; i++) {
                this.transforms[i].localTranslate.x = sim.agents[i].position[0];
                this.transforms[i].localTranslate.z = sim.agents[i].position[1];
                // Y轴
                if(i == 0 && this.currGoal && this.lastGoal){
                    let pos = this.transforms[i].localTranslate;
                    let nowDir = m4m.math.pool.new_vector2();
                    this.cal2dDir(this.lastGoal,pos,nowDir);
                    let nowLen = m4m.math.vec2Length(nowDir);
                    let tLen = m4m.math.vec2Length(this.currMoveDir);
                    let y = m4m.math.numberLerp(this.lastGoal.y,this.currGoal.y,nowLen/tLen);
                    if(!isNaN(y)) {
                        pos.y = m4m.math.numberLerp(this.lastGoal.y,this.currGoal.y,nowLen/tLen);
                    }
                    //console.error(`nowLen/tLen :${nowLen}/${tLen}   ,  pos y:${pos.y}  ,this.lastGoal: ${this.lastGoal.x} ,${this.lastGoal.y} ,${this.lastGoal.z} `);
                    m4m.math.pool.delete_vector2(nowDir);
                }

                this.transforms[i].markDirty();
            }
        }
        // subGoal = [];
        // private generateRandomSubGoal(position, velocity) {
        //     let monster_velocity    = new m4m.math.vector2(velocity[0], velocity[1]);
        //     m4m.math.vec2Normalize(monster_velocity, monster_velocity);
        //     let direction_cos       = m4m.math.vec2Dot(monster_velocity, new m4m.math.vector2(1.0, 0.0));
        //     let direction_sin       = Math.sqrt(1 - direction_cos * direction_cos);
        //     // let monster_direction   = Math.acos(direction_cos);
        //     let monster_position    = new m4m.math.vector3(position[0], position[1], 0);
        //     // let monster_Matrix      = new m4m.math.matrix(new Float32Array([
        //     //     direction_cos, direction_sin, 0, 0,
        //     //     -direction_sin, direction_cos, 0, 0,
        //     //     0, 0, 1, 0,
        //     //     0, 0, 0, 1
        //     // ]));
        //
        //     let subGoal_Position = [
        //         [1.0, 0.0],
        //         [-1.0, 0.0],
        //         [0.0, 1.0],
        //         [0.0, -1.0],
        //     ];
        //     let p = subGoal_Position[Math.round(Math.random() * 6)];
        //     // m4m.math.matrixMultiply(monster_Matrix);
        // }

        /** RVO 系统检查目标点 */
        private RVO_check(sim, goals) {
            // 玩家根据 NavMesh 切换目标
            if(this.currGoal){
                let player = this.transforms[0];
                //达到目标点
                let v2_0 = m4m.math.pool.new_vector2();
                v2_0.x = player.localTranslate.x; v2_0.y = player.localTranslate.z;
                let v2_1 = m4m.math.pool.new_vector2();
                v2_1.x = this.currGoal.x; v2_1.y = this.currGoal.z;
                let dis = m4m.math.vec2Distance(v2_0,v2_1);
                if(dis<0.01){
                    if(this.currGoal){
                        if(this.lastGoal) m4m.math.pool.delete_vector3(this.lastGoal);
                        this.lastGoal = this.currGoal;
                        this.currGoal = null;
                        goals[0] = sim.agents[0].position;
                        sim.agents[0].radius = this.radius[0];
                    }
                    if(this._RoadPoints && this._RoadPoints.length >0) {
                        this.currGoal = this._RoadPoints.pop();
                        this.cal2dDir(this.lastGoal, this.currGoal, this.currMoveDir);
                        goals[0] = [this.currGoal.x, this.currGoal.z];
                        sim.agents[0].radius = 0.1;
                    }
                }

            }else if(this._RoadPoints && this._RoadPoints.length >0){
                //切换下一目标
                this.currGoal = this._RoadPoints.pop();
                goals[0] = [this.currGoal.x, this.currGoal.z];
                sim.agents[0].radius = 0.1;

            }

            // 小怪的目标
            for (var i = 1, len = sim.agents.length; i < len; i ++) {
                let range = RVO.Vector.absSq(RVO.Vector.subtract(sim.agents[i].position, sim.agents[0].position));
                if (range < this.attackRanges[i] ) {
                    goals[i] = sim.agents[i].position;  // Stop
                    sim.agents[i].neighborDist = 0;
                } else {
                    goals[i] = sim.agents[0].position;
                    sim.agents[i].neighborDist = sim.agentDefaults.neighborDist;
                }
            }

        }

        /** 计算2d方向 */
        private cal2dDir(oPos:m4m.math.vector3,tPos:m4m.math.vector3,out:m4m.math.vector2){
            if(!oPos || !tPos || !out)  return;
            let ov2 = m4m.math.pool.new_vector2();
            ov2.x = oPos.x; ov2.y = oPos.z;
            let tv2 = m4m.math.pool.new_vector2();
            tv2.x = tPos.x; tv2.y = tPos.z;
            m4m.math.vec2Subtract(tv2,ov2,out);
            m4m.math.pool.delete_vector2(ov2);
            m4m.math.pool.delete_vector2(tv2);
        }

    }
}
