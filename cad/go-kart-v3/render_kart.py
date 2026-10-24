"""Render the actual exported CAD tessellation, without generated geometry."""
from pathlib import Path
import json, math
import vtk

OUT=Path(__file__).parent
parts=json.loads((OUT/'scene.json').read_text())
renderer=vtk.vtkRenderer();renderer.SetBackground(1,1,1);renderer.SetBackgroundAlpha(0)
renderer.SetUseFXAA(True);renderer.AutomaticLightCreationOff()
actors=[]
for part in parts:
    points=vtk.vtkPoints()
    for v in part['vertices']:points.InsertNextPoint(*v)
    cells=vtk.vtkCellArray()
    for tri in part['triangles']:
        cells.InsertNextCell(3)
        for index in tri:cells.InsertCellPoint(index)
    poly=vtk.vtkPolyData();poly.SetPoints(points);poly.SetPolys(cells)
    normals=vtk.vtkPolyDataNormals();normals.SetInputData(poly);normals.SetFeatureAngle(45);normals.ConsistencyOn();normals.Update()
    mapper=vtk.vtkPolyDataMapper();mapper.SetInputConnection(normals.GetOutputPort())
    actor=vtk.vtkActor();actor.SetMapper(mapper)
    prop=actor.GetProperty();prop.SetColor(*part['color']);prop.SetInterpolationToPhong()
    prop.SetAmbient(.24);prop.SetDiffuse(.78);prop.SetSpecular(.4 if part['mat'] not in ['rubber','black'] else .16);prop.SetSpecularPower(48)
    renderer.AddActor(actor)
    edge=vtk.vtkFeatureEdges();edge.SetInputData(poly);edge.BoundaryEdgesOn();edge.FeatureEdgesOn();edge.ManifoldEdgesOff();edge.NonManifoldEdgesOff();edge.SetFeatureAngle(45);edge.ColoringOff()
    edge_map=vtk.vtkPolyDataMapper();edge_map.SetInputConnection(edge.GetOutputPort())
    edge_actor=vtk.vtkActor();edge_actor.SetMapper(edge_map);edge_actor.GetProperty().SetColor(.085,.10,.12);edge_actor.GetProperty().SetLineWidth(.65);edge_actor.GetProperty().SetOpacity(.55)
    if part['mat']=='rubber':edge_actor.GetProperty().SetOpacity(.1)
    renderer.AddActor(edge_actor)
    actors.append((part['group'],actor,edge_actor))
for pos,intensity in [((-1000,-1300,2400),.8),((600,1600,1300),.62),((2100,-300,1800),.6)]:
    light=vtk.vtkLight();light.SetLightTypeToSceneLight();light.SetPosition(*pos);light.SetFocalPoint(650,0,80);light.SetIntensity(intensity);renderer.AddLight(light)
window=vtk.vtkRenderWindow();window.SetOffScreenRendering(1);window.SetAlphaBitPlanes(1);window.SetMultiSamples(8);window.SetSize(2100,1400);window.AddRenderer(renderer)
cam=renderer.GetActiveCamera();cam.ParallelProjectionOn();cam.SetViewUp(0,0,1)
def output(name,position,focal,scale,as_built=False,transparent=True):
    for group,actor,edges in actors:
        visible=not as_built or group=='built'
        actor.SetVisibility(visible);edges.SetVisibility(visible)
    cam.SetPosition(*position);cam.SetFocalPoint(*focal);cam.SetParallelScale(scale)
    cam.SetViewUp(0,0,1) if position[2]-focal[2]<2500 else cam.SetViewUp(1,0,0)
    renderer.ResetCameraClippingRange();renderer.SetBackgroundAlpha(0 if transparent else 1)
    window.Render()
    capture=vtk.vtkWindowToImageFilter();capture.SetInput(window);capture.SetInputBufferTypeToRGBA();capture.ReadFrontBufferOff();capture.Update()
    writer=vtk.vtkPNGWriter();writer.SetFileName(str(OUT/name));writer.SetInputConnection(capture.GetOutputPort());writer.Write()
    print('Rendered',name,flush=True)
output('kart-reference-isometric.png',(-1400,-1700,1750),(700,0,0),585)
output('frame-and-steering-isometric.png',(-1400,-1700,1750),(700,0,0),585,True)
output('kart-reference-top.png',(750,0,3500),(750,0,80),900,False,False)
window.Finalize()
