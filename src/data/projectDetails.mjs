export const projectDetails = {
  'electric-go-kart': {
    subtitle: 'A welded steel chassis and rack-and-pinion steering system',
    stack: ['SolidWorks', 'Steel fabrication', 'Mechanical assembly'],
    sections: [
      { id: 'design', title: 'Design', text: 'Designed the chassis in SolidWorks around a full-scale steel frame and rack-and-pinion steering layout. The build brings the CAD geometry into a fabricated structure with installed steering hardware.', image: 'kart-cad.webp', caption: 'Chassis CAD layout.' },
      { id: 'build', title: 'Build', text: 'Fabricated the welded frame and installed the steering rack, shaft, and wheel. The current build is focused on the chassis and steering; the drivetrain is still in progress.', image: 'kart-photo.webp', caption: 'The fabricated frame and installed steering assembly.' },
    ],
  },
  'projector-guided-assembly': {
    title: 'Visionary',
    subtitle: 'A camera and projector for guided assembly',
    timeline: 'Hack the North 2026',
    stack: ['CAD', 'Arduino', 'Servo positioning', '3D printing'],
    sections: [
      { id: 'design', title: 'Design', text: 'My contribution focused on the two-axis camera/projector mechanism: the mechanical design, physical assembly, and Arduino firmware for servo positioning.', image: 'assembly-cad.webp', caption: 'CAD of the pan-tilt mechanism.' },
      { id: 'how-it-works', title: 'How it works', text: 'Visionary combines a camera, projector, and CAD-guided assembly workflow. The pan-tilt mechanism positions the camera/projector assembly, while a marked work surface provides the workspace for visual guidance.', image: 'assembly-photo.webp', caption: 'The physical demo setup with the camera feed and marked work area.' },
    ],
  },
  'oxidizer-tank-tower': {
    subtitle: 'A preliminary support structure for Waterloo Rocketry',
    stack: ['CAD', 'Structural layout', 'Ground support equipment'],
    sections: [
      { id: 'design', title: 'Design', text: 'Developed a preliminary trailer-mounted support tower concept with Waterloo Rocketry. The CAD explores the tower structure and its relationship to the trailer and tank.', image: 'tower-cad.webp', caption: 'Preliminary trailer and tower CAD concept.' },
      { id: 'development', title: 'Development', text: 'This project is at the concept stage. The visual represents a proposed structure rather than a fabricated or qualified tower.' },
    ],
  },
  'iron-man-helmet': {
    subtitle: 'A full-scale wearable prototype with WATbotics',
    stack: ['Mechanical packaging', '3D printing', 'Assembly'],
    sections: [
      { id: 'design', title: 'Design', text: 'Contributed to internal packaging for a full-scale Iron Man helmet prototype with WATbotics. The work focused on fitting the physical components within the helmet shell.', image: 'helmet-cad.webp', caption: 'Helmet CAD.' },
      { id: 'build', title: 'Build', text: 'Contributed to 3D printing and assembly of the red-and-yellow prototype, turning the digital design into a physical helmet.', image: 'helmet-photo.webp', caption: 'The assembled helmet prototype.' },
    ],
  },
  'heart-led-pcb': {
    subtitle: 'A USB-C powered, heart-shaped LED board',
    stack: ['KiCad', 'ATtiny85', 'MOSFETs', 'USB-C', 'PCB assembly'],
    sections: [
      { id: 'design', title: 'Design', text: 'Designed a heart-shaped PCB in KiCad around twelve LEDs, USB-C power, an ATtiny85, and MOSFET switching.', image: 'pcb-layout.webp', caption: 'Board layout in KiCad.' },
      { id: 'how-it-works', title: 'How it works', text: 'USB-C supplies power to the board. The ATtiny85 provides control, with MOSFETs switching the LED load. The assembled board brings the circuit and its heart-shaped layout together.', image: 'pcb-photo.webp', caption: 'The assembled board with its LEDs illuminated.' },
    ],
  },
  'auto-shooting-turret': {
    subtitle: 'A camera-equipped pan-tilt water turret prototype',
    stack: ['3D printing', 'Servo actuation', 'Mechanical integration'],
    sections: [
      { id: 'design', title: 'Design', text: 'The printed structure combines a rotating cylindrical base, two upright supports, and a tilt axle. A central mount holds the webcam and water nozzle together.' },
      { id: 'how-it-works', title: 'How it works', text: 'Servo-driven pan and tilt axes orient the mounted camera and nozzle. The current project is a physical prototype in development; automatic tracking and firing performance are not yet documented here.', image: 'turret-build.jpg', caption: 'The physical turret assembly.' },
    ],
  },
};
