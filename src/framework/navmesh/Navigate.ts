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
﻿namespace m4m.framework {
    export class Navigate {
        public navindexmap: { [id: number]: number };
        public navinfo: navMeshInfo
        /**
         * 导航器
         * @param navinfo  导航信息
         * @param navindexmap 导航索引字典
         */
        constructor(navinfo: m4m.framework.navMeshInfo, navindexmap: any) {
            this.navinfo = navinfo;
            this.navindexmap = navindexmap;
        }
        /**
         * 通过指定 开始和结束位置 获取所有的路径点
         * @param start 开始位置
         * @param end 结束位置
         * @param startIndex 开始的三角形面索引 
         * @param endIndex 结束的三角形面索引
         * @returns 所有的路径点
         */
        public pathPoints(start: m4m.math.vector3, end: m4m.math.vector3, startIndex: number, endIndex: number): Array<m4m.math.vector3> {

            var startVec = new navVec3();
            startVec.x = start.x;
            startVec.y = start.y;
            startVec.z = start.z;
            var endVec = new navVec3();
            endVec.x = end.x;
            endVec.y = end.y;
            endVec.z = end.z;

            var startPoly = this.navindexmap[startIndex];
            var endPoly = this.navindexmap[endIndex];
            if (startPoly >= 0 && endPoly >= 0) {
                var polyPath = m4m.framework.pathFinding.calcAStarPolyPath(this.navinfo, startPoly, endPoly, endVec, 0.3);
            }
            if (polyPath) {
                var wayPoints = m4m.framework.pathFinding.calcWayPoints(this.navinfo, startVec, endVec, polyPath);
                var navmeshWayPoints: Array<m4m.math.vector3> = [];
                for (var i: number = 0; i < wayPoints.length; i++) {
                    navmeshWayPoints[i] = new m4m.math.vector3(wayPoints[i].x, wayPoints[i].realy, wayPoints[i].z);
                }
                return navmeshWayPoints;
            } else {
                return null;
            }
        }
        /** 销毁清理 */
        public dispose() {

            this.navinfo = null;
            this.navindexmap = null;

        }
    }
}
