"""Run inside Fusion to export orthographic faces of the existing SmartClassroom.

Exports directly to the report assets; preserves materials and restores the camera.
"""
from pathlib import Path
import json
import adsk.core
import adsk.fusion

PROJECT_ROOT=Path(__file__).resolve().parents[1]
OUTPUT=PROJECT_ROOT/'Docs/images/enclosure'
SOURCE_ID='urn:adsk.wipprod:dm.lineage:T9J_7if9RQCa9Fe9513dOg'

def run(_context: str):
    app=adsk.core.Application.get()
    design=adsk.fusion.Design.cast(app.activeProduct)
    document=app.activeDocument
    if not design or not document.dataFile or document.dataFile.id!=SOURCE_ID:
        print('Activate the original SmartClassroom document.');return
    root=design.rootComponent
    def find(prefix):return next((o for o in root.occurrences if o.component.name.startswith(prefix)),None)
    lid,screws,nuts=find('02 -'),find('06 -'),find('08 -')
    if not lid or not screws or not nuts:
        print('Expected final lid, M3 screws and captive nuts not found.');return
    frames=[(o,list(o.transform2.asArray()),o.isLightBulbOn) for o in [lid,screws,nuts]]
    viewport=app.activeViewport
    original_camera=viewport.camera
    original_style=viewport.visualStyle
    viewport.visualStyle=adsk.core.VisualStyles.ShadedVisualStyle
    identity=list(adsk.core.Matrix3D.create().asArray())
    for occurrence in [lid,screws]:
        if any(abs(a-b)>1e-8 for a,b in zip(occurrence.transform2.asArray(),identity)):
            occurrence.transform2=adsk.core.Matrix3D.create()
        if not occurrence.isLightBulbOn:occurrence.isLightBulbOn=True
    if not nuts.isLightBulbOn:nuts.isLightBulbOn=True
    point=lambda x,y,z:adsk.core.Point3D.create(x/10,y/10,z/10)
    views=[
        ('front.png',(80,-300,30),(80,50,30),(195,85),(2200,1000)),
        ('rear.png',(80,400,30),(80,50,30),(195,85),(2200,1000)),
        ('left.png',(-270,50,30),(80,50,30),(125,85),(1600,1000)),
        ('right.png',(430,50,30),(80,50,30),(125,85),(1600,1000)),
    ]
    OUTPUT.mkdir(parents=True,exist_ok=True)
    exported={}
    for name,eye,target,extent,pixels in views:
        camera=viewport.camera
        camera.cameraType=adsk.core.CameraTypes.OrthographicCameraType
        camera.eye=point(*eye);camera.target=point(*target)
        camera.upVector=adsk.core.Vector3D.create(0,0,1)
        camera.isSmoothTransition=False;camera.isFitView=False
        camera.setExtents(extent[0]/10,extent[1]/10)
        viewport.camera=camera;viewport.refresh();adsk.doEvents()
        options=adsk.core.SaveImageFileOptions.create(str(OUTPUT/name))
        options.width=pixels[0];options.height=pixels[1]
        options.isBackgroundTransparent=False;options.isAntiAliased=True
        exported[name]=viewport.saveAsImageFileWithOptions(options)
    for occurrence,array,on in frames:
        if any(abs(a-b)>1e-8 for a,b in zip(occurrence.transform2.asArray(),array)):
            matrix=adsk.core.Matrix3D.create();matrix.setWithArray(array)
            occurrence.transform2=matrix
        if occurrence.isLightBulbOn!=on:occurrence.isLightBulbOn=on
    viewport.camera=original_camera;viewport.visualStyle=original_style;viewport.refresh()
    report={'source_document':document.name,'source_id':SOURCE_ID,'views':exported,
            'projection':'orthographic, Z up','geometry_or_materials_edited':False,
            'camera_and_lid_frames_restored':True}
    (OUTPUT/'side-views.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(report))
