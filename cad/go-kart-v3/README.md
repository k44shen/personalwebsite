# Photo-informed go-kart render

Purpose: a cleaner website illustration based on Kevin's existing CAD image, build photo, annotated steering-kit photo, spindle photos, and Chassis Frame v2 drawing.

The existing SolidWorks files were preserved. This is a reconstructed visual reference, not a direct SolidWorks assembly conversion or fabrication release.

## Outputs

- `kart-reference-isometric.png`: transparent website view, with the front wheels and rear axle shown in the source CAD.
- `frame-and-steering-isometric.png`: transparent view omitting wheels and rear axle to more closely match the build photo.
- `kart-reference-top.png`: top-view reference.
- `go-kart-reference.step`: named reference solids.
- `frame-and-steering.step`: frame/steering reference configuration.
- `chassis-v2.step`: chassis envelope only.

## Evidence boundaries

The frame uses the later drawing's 59-inch length, 20-inch front width, 27-inch rear width, 15.5-inch front straight, 13.5-inch transition, and 30-inch rear straight. The tube outside section is 2 inches. The 300 mm wheel, recorded shaft-section lengths, 740 mm axle, and 15 mm spindle shaft are based on project records.

Joint angles, rack placement, kingpin spacing, supports and mounting plates, small fasteners, wheel dimensions and spoke patterns, bearing placements, rear sprocket, and brake mounting details are visual approximations. The frame is a solid visual envelope; tube wall thickness and manufacturing interfaces are not resolved. These files do not establish structural adequacy, component fit, or a completed vehicle.

The render is generated directly from the CAD tessellation, with no generative image step.

## Regenerate

Requires Python with CadQuery 2.8 and VTK 9.6.2.

```sh
python build_kart.py
python render_kart.py
```

The scripts use millimetres. `parameters.json` records the source dimensions and visual placeholders. `validation.json` records solid validity and the chassis bounding box.
