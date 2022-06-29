/**
@license
Copyright 2022 meta4d.me Authors

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
     * The mesh emission type.
     * 
     * 网格发射类型。
     * 
     * @author feng3d
     */
    export enum ParticleSystemMeshShapeType
    {
        /**
         * Emit from the vertices of the mesh.
         * 
         * 从网格的顶点发出。
         */
        Vertex,

        /**
         * Emit from the edges of the mesh.
         * 
         * 从网格的边缘发出。
         */
        Edge,

        /**
         * Emit from the surface of the mesh.
         * 
         * 从网格表面发出。
         */
        Triangle,
    }
}