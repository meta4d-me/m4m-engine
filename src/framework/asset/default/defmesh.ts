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
    export class defMesh
    {
        static readonly cube = "cube";
        static readonly quad = "quad";
        static readonly quad_particle = "quad_particle";
        static readonly plane = "plane";
        static readonly sphere = "sphere";
        static readonly sphere_quality = "sphere_quality";
        static readonly pyramid = "pyramid";
        static readonly cylinder = "cylinder";
        static readonly circleline = "circleline";
        /**
         * 初始化默认mesh
         * @param assetmgr 材质管理
         */
        static initDefaultMesh(assetmgr: assetMgr)
        {
            assetmgr.mapDefaultMesh[this.cube] = this.createDefaultMesh(this.cube, m4m.render.meshData.genBoxCCW(1.0), assetmgr.webgl);
            assetmgr.mapDefaultMesh[this.quad] = this.createDefaultMesh(this.quad, m4m.render.meshData.genQuad(1.0), assetmgr.webgl);
            assetmgr.mapDefaultMesh[this.quad_particle] = this.createDefaultMesh(this.quad_particle, m4m.render.meshData.genQuad_forparticle(1.0), assetmgr.webgl);
            assetmgr.mapDefaultMesh[this.plane] = this.createDefaultMesh(this.plane, m4m.render.meshData.genPlaneCCW(10), assetmgr.webgl);
            assetmgr.mapDefaultMesh[this.sphere] = this.createDefaultMesh(this.sphere, m4m.render.meshData.genSphereCCW(), assetmgr.webgl);
            assetmgr.mapDefaultMesh[this.sphere_quality] = this.createDefaultMesh(this.sphere_quality, m4m.render.meshData.genSphereCCW(2.58,40,40), assetmgr.webgl);
            assetmgr.mapDefaultMesh[this.pyramid] = this.createDefaultMesh(this.pyramid, m4m.render.meshData.genPyramid(2,0.5), assetmgr.webgl);
            assetmgr.mapDefaultMesh[this.cylinder] = this.createDefaultMesh(this.cylinder, m4m.render.meshData.genCylinderCCW(2, 0.5), assetmgr.webgl);
            assetmgr.mapDefaultMesh[this.circleline] = this.createDefaultMesh(this.circleline, m4m.render.meshData.genCircleLineCCW(1), assetmgr.webgl);
        }

        /**
         * 创建默认mesh
         * @param name mesh名
         * @param meshData mesh数据
         * @param webgl webgl上下文
         * @returns mesh
         */
        private static createDefaultMesh(name: string, meshData: render.meshData, webgl: WebGL2RenderingContext): mesh
        {
            var _mesh: m4m.framework.mesh = new m4m.framework.mesh(name + ".mesh.bin");
            _mesh.defaultAsset = true;
            _mesh.data = meshData;
            var vf = m4m.render.VertexFormatMask.Position | m4m.render.VertexFormatMask.Normal| m4m.render.VertexFormatMask.Tangent | m4m.render.VertexFormatMask.Color | m4m.render.VertexFormatMask.UV0;
            _mesh.data.originVF=vf;
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
                sm.useVertexIndex = 0;
                sm.start = 0;
                sm.size = i16.length;
                sm.line = false;
                _mesh.submesh.push(sm);
            }
            return _mesh;
        }
    }
}