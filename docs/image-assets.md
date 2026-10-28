# Project image cutouts

Created using the built-in ImageGen tool from the existing portfolio images. Original source images remain in public/assets/projects.

Shared prompt: Remove only the entire background and unrelated objects or software UI. Preserve the main hardware subject, geometry, proportions, materials, colors, details, and viewpoint. Preserve holes with transparency. Center the subject with genuine alpha transparency and uncropped margins. Add no parts, text, backdrop, or floor.

| Source | Saved output | Subject instruction |
| --- | --- | --- |
| kart-cad.webp | public/assets/projects/kart-cutout.png | Isolate the complete CAD chassis assembly. |
| assembly-cad.webp | public/assets/projects/assembly-cutout.png | Isolate the complete CAD pan-tilt mechanism. |
| tower-cad.webp | public/assets/projects/tower-cutout.png | Isolate the complete CAD trailer/tower assembly. |
| helmet-photo.webp | public/assets/projects/helmet-cutout.png | Isolate the red-and-yellow printed helmet; remove shelf, boxes, wires, and bags. |
| pcb-photo.webp | public/assets/projects/pcb-cutout.png | Isolate the illuminated PCB and white USB connector; remove tabletop and long trailing cable. |

All five outputs were visually inspected and verified to have RGBA alpha spanning 0 to 255.

## Go-kart website render v3

The previous go-kart card used `public/assets/projects/kart-render-v3.png`, rendered from a reconstructed CAD reference with CadQuery and VTK. The original SolidWorks screenshot and previous cutout are retained. This version follows the later tapered Chassis Frame v2 drawing and uses the build and steering-component photos for visual details. Small mounting interfaces and unmeasured component positions are approximate; the rear axle is a CAD layout, not a claim of installed hardware.

The local reconstruction and rendering scripts are in `cad/go-kart-v3/`.

## Real build photo preference — October 28, 2026

Project cards and detail pages prefer background-removed photographs of the physical builds.

- Go-kart: `kart-photo.webp` → `public/assets/projects/kart-photo-cutout.png`. Preserve the photographed chassis and attached steering hardware; remove chairs, seats, chair legs, floor, people, and shoes. Make openings between tubes transparent. Preserve source cropping and do not invent unseen tubing, wheels, axle, seat, or motor.
- Projector assembly: `assembly-photo.webp` → `public/assets/projects/assembly-photo-cutout.png`. Preserve the actual projector, camera mechanism, brackets, servos, cylindrical base, controller, and attached local wires. Remove laptops, people, floor, bags, cardboard, and trailing cables. Preserve the projector's original crop and real textures; do not reconstruct missing parts.
- Helmet and LED PCB: retain the existing real-photo cutouts.
- Oxidizer tank tower: retain the existing CAD cutout because the source project is a concept, not a photographed physical tower.

Built-in ImageGen was used for background extraction, requesting genuine alpha transparency and unchanged photographed hardware, with no replacement backdrop, text, ground plane, reinterpretation, or added objects.

Follow-up go-kart cleanup prompt: remove only the thin diagonal chair-back tube at the upper-right edge behind the steering wheel; retain the photographed kart, existing crop, textures, geometry, lighting, and alpha transparency.

## Auto Shooting Turret — October 28, 2026

Source: `/Users/kevinshen/Downloads/IMG_2397.JPG` (user-supplied real build photo).
Output: `public/assets/projects/turret-photo-cutout.png`.
Built-in ImageGen mode; background-extraction edit. Prompt: isolate the complete photographed turret, preserving frame, axle, webcam, nozzle, rotating base, feet, printed textures and perspective; remove room, desk, reflections and unrelated objects; make frame openings transparent; retain short attached wires/tubing; modestly improve exposure; add no hardware, backdrop, haze or shadow. Visually inspected before use. This is an AI-assisted photographic cutout, not an engineering render or evidence of automatic operation.
