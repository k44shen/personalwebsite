"""Photo-informed reference CAD. mm. Run with CadQuery 2.8+.
Drawing-defined frame; remaining assembly dimensions are visual placeholders.
"""
from pathlib import Path
import math, json
import cadquery as cq

OUT=Path(__file__).parent
I=25.4
P=dict(frame_length=59*I,front_width=20*I,rear_width=27*I,
       taper_start=15.5*I,taper_end=29*I,tube=2*I,
       wall_visual=2.5,steering_wheel_diameter=300,
       shaft_lengths=[5.125*I,12*I,7.25*I],
       axle_length=740,spindle_shaft_diameter=15,
       kingpin_spacing_visual=590,rack_x_visual=130,rack_z_visual=92,
       front_tire_diameter_visual=250,front_tire_width_visual=72,
       rear_axle_x_visual=1400,rear_axle_z_visual=78)
COLORS={'frame':(.36,.40,.44),'black':(.045,.05,.058),'rubber':(.022,.025,.03),
        'steel':(.56,.61,.65),'silver':(.73,.77,.79),'gold':(.54,.40,.16),'rotor':(.44,.47,.50)}
PARTS=[]
def add(name,shape,mat='steel',group='built'):
    shape=shape.val() if isinstance(shape,cq.Workplane) else shape
    if not shape.isValid():raise ValueError('Invalid solid '+name)
    PARTS.append(dict(name=name,shape=shape,mat=mat,group=group))
    return shape

def vec(p):return cq.Vector(*p)
def cylinder(a,b,r):
    d=vec(b)-vec(a)
    return cq.Solid.makeCylinder(r,d.Length,vec(a),d.normalized())
def rod(name,a,b,r,mat='steel',group='built'):
    return add(name,cylinder(a,b,r),mat,group)
def box(name,center,size,mat='steel',group='built',fillet=0):
    q=cq.Workplane('XY').box(*size)
    if fillet:q=q.edges().fillet(fillet)
    return add(name,q.translate(center),mat,group)
def torus(name,center,axis,major,minor,mat='black',group='built'):
    return add(name,cq.Solid.makeTorus(major,minor,vec(center),vec(axis)),mat,group)
def washer(name,center,axis,outer,inner,length,mat='steel',group='built'):
    a=vec(center)-vec(axis).normalized()*(length/2)
    b=a+vec(axis).normalized()*length
    sh=cylinder(a.toTuple(),b.toTuple(),outer).cut(cylinder((a-vec(axis)).toTuple(),(b+vec(axis)).toTuple(),inner))
    return add(name,sh,mat,group)
def bolt(name,point,axis,length=22,r=4,group='built'):
    a=vec(point);d=vec(axis).normalized()
    rod(name+'_shank',a.toTuple(),(a+d*length).toTuple(),r,'steel',group)
    pl=cq.Plane(origin=a.toTuple(),normal=d.toTuple())
    add(name+'_hex',cq.Workplane(pl).polygon(6,13).extrude(5),'silver',group)

# Governing v2 chassis silhouette and crossmember stations.
L=P['frame_length']; t=P['tube']; a=P['taper_start'];b=P['taper_end']
wf=P['front_width']/2;wr=P['rear_width']/2
outline=[(0,-wf),(a,-wf),(b,-wr),(L,-wr),(L,wr),(b,wr),(a,wf),(0,wf)]
frame=cq.Workplane('XY').polyline(outline).close().extrude(t)
def hw(x):return wf if x<=a else wr if x>=b else wf+(wr-wf)*(x-a)/(b-a)
# These stations follow the drawing's four windows, rather than the old constant-width frame.
for start,end in [(t,a-t/2),(a+t/2,b-t/2),(b+t/2,44*I-t/2),(44*I+t/2,L-t)]:
    hole=[(start,-hw(start)+t),(end,-hw(end)+t),(end,hw(end)-t),(start,hw(start)-t)]
    frame=frame.cut(cq.Workplane('XY').polyline(hole).close().extrude(t))
# Subtle edge radii are visual only; no thickness-derived mass claim is made.
try: frame=frame.edges().fillet(1.1)
except Exception: pass
add('01_Chassis_v2_drawing_envelope',frame,'frame')

# Rack housing, bellows, rods, and the upper support seen in the build photo.
rx=P['rack_x_visual'];rz=P['rack_z_visual']; kp=P['kingpin_spacing_visual']/2
box('Rack_housing',(rx,0,rz),(33,190,33),'black',fillet=7)
for side in [-1,1]:
    suffix='L' if side==1 else 'R'
    rod('Rack_end_'+suffix,(rx,side*84,rz),(rx,side*173,rz),11,'black')
    # Bellows corrugations, closed rings along the rack axis.
    for j in range(12):
        torus(f'Rack_boot_{suffix}_{j}',(rx,side*(99+j*5.4),rz),(0,1,0),13.5-j*.18,2.2,'rubber')
    rod('Tie_rod_'+suffix,(rx,side*170,rz),(90,side*(kp-17),78),5,'gold')
    for idx,pt in enumerate([(rx,side*168,rz),(90,side*(kp-17),78)]):
        washer(f'Rod_eye_{suffix}_{idx}',pt,(0,0,1),10,4,8,'gold')
        bolt(f'Rod_end_fastener_{suffix}_{idx}',(pt[0],pt[1],pt[2]-9),(0,0,1),26)
    box('Spindle_mount_back_'+suffix,(43,side*(wf+7),49),(65,10,73),'frame',fillet=1)
    for height in [17,89]:
        plate=cq.Workplane('XY').box(66,70,6).translate((43,side*(wf+32),height))
        plate=plate.cut(cq.Workplane('XY').circle(5).extrude(120).translate((43,side*kp,0)))
        add(f'Clevis_tab_{suffix}_{height}',plate,'frame')
    rod('Kingpin_sleeve_'+suffix,(43,side*kp,25),(43,side*kp,82),12,'black')
    bolt('Kingpin_'+suffix,(43,side*kp,12),(0,0,1),86,5)
    arm=cq.Workplane('XY').polyline([(29,side*(kp-8)),(49,side*(kp+8)),(101,side*(kp-12)),(96,side*(kp-32))]).close().extrude(6).translate((0,0,72))
    add('Steering_arm_'+suffix,arm,'black')
    rod('Spindle_15mm_'+suffix,(43,side*kp,55),(43,side*(kp+99),55),7.5,'steel')
    for yy in [kp+12,kp+76]:
        washer('Spindle_collar_'+suffix+str(yy),(43,side*yy,55),(0,1,0),13,7.5,8,'steel')
    # Visual mounting plates/fasteners are kept separate, not a fabrication hole pattern.
    for xx in [26,60]:
        bolt('Spindle_plate_fixing_'+suffix+str(xx),(xx,side*(wf+13),91),(0,0,-1),22)
    box('Rack_mount_pad_'+suffix,(rx,side*72,58),(44,38,12),'frame',fillet=2)
    for xx in [rx-12,rx+12]:bolt('Rack_mount_bolt_'+suffix+str(xx),(xx,side*72,83),(0,0,-1),30)

# Jointed steering column, with source-recorded shaft section lengths.
start=cq.Vector(rx,0,rz+8)
angles=[55,12,30]
for idx,(length,angle) in enumerate(zip(P['shaft_lengths'],angles)):
    direction=cq.Vector(math.cos(math.radians(angle)),0,math.sin(math.radians(angle)))
    end=start+direction*length
    rod(f'Steering_column_{idx}',start.toTuple(),end.toTuple(),7.5,'silver')
    if idx<2:
        rod(f'U_joint_collar_{idx}',(end-direction*17).toTuple(),(end+direction*17).toTuple(),12,'black')
        rod(f'U_joint_cross_{idx}',(end+cq.Vector(0,-15,0)).toTuple(),(end+cq.Vector(0,15,0)).toTuple(),6,'steel')
        for side in [-1,1]:
            box(f'U_joint_yoke_{idx}_{side}',(end+cq.Vector(0,side*11,0)).toTuple(),(30,7,23),'black',fillet=2)
    start=end
axis=direction
wheel_center=start+axis*16
wheel_r=P['steering_wheel_diameter']/2-11
# Upper mount is a photo-informed envelope, with adjustment slots rather than invented fixed holes.
support_x=P['taper_start']
# Place the support on an existing frame crossmember, not inside an open window.
mid_start=cq.Vector(rx,0,rz+8)+cq.Vector(math.cos(math.radians(55)),0,math.sin(math.radians(55)))*P['shaft_lengths'][0]
mid_dir=cq.Vector(math.cos(math.radians(12)),0,math.sin(math.radians(12)))
clamp_center=mid_start+mid_dir*((support_x-mid_start.x)/mid_dir.x)
support_height=clamp_center.z-50
box('Column_support',(support_x,0,50+support_height/2),(43,42,support_height),'frame',fillet=1)
for side in [-1,1]:
    bolt(f'Upper_bearing_clamp_{side}',(support_x,side*17,clamp_center.z-12),(0,0,1),25)
rod('Upper_column_bearing',(clamp_center-mid_dir*22).toTuple(),(clamp_center+mid_dir*22).toTuple(),16,'black')
torus('Steering_wheel_grip',wheel_center.toTuple(),axis.toTuple(),wheel_r,11,'rubber')
rod('Steering_wheel_hub',(wheel_center-axis*18).toTuple(),(wheel_center+axis*6).toTuple(),28,'black')
u=cq.Vector(0,1,0);v=axis.cross(u).normalized()
for j in range(3):
    theta=math.radians(90+j*120)
    spoke=(u*math.cos(theta)+v*math.sin(theta))
    rod(f'Steering_wheel_spoke_{j}',(wheel_center+spoke*25).toTuple(),(wheel_center+spoke*(wheel_r-5)).toTuple(),5,'black')
    bolt(f'Steering_wheel_screw_{j}',(wheel_center+spoke*20+axis*6).toTuple(),axis.toTuple(),8,2)

# Design-study configuration: wheel and rear-axle envelopes from the CAD image.
# These are not represented as installed in the photo-matched configuration.
for side in [-1,1]:
    suffix='L' if side==1 else 'R';center=(43,side*(kp+55),55)
    torus('Front_tire_'+suffix,center,(0,1,0),98,27,'rubber','layout')
    washer('Front_rim_'+suffix,center,(0,1,0),79,63,54,'silver','layout')
    rod('Front_hub_'+suffix,(43,center[1]-29,55),(43,center[1]+29,55),19,'steel','layout')
    for j in range(8):
        angle=j*math.pi/4
        end=(43+69*math.cos(angle),center[1]+side*23,55+69*math.sin(angle))
        rod(f'Front_spoke_{suffix}_{j}',(43+15*math.cos(angle),center[1]+side*23,55+15*math.sin(angle)),end,4.5,'silver','layout')
    washer('Front_outer_lip_'+suffix,(43,center[1]+side*27,55),(0,1,0),80,75,4,'silver','layout')

ax=P['rear_axle_x_visual'];az=P['rear_axle_z_visual']
rod('Rear_axle_740mm',(ax,-370,az),(ax,370,az),11,'steel','layout')
for side in [-1,1]:
    yy=side*270
    base=cq.Workplane('XY').box(80,47,12).translate((ax,yy,56))
    add('Rear_bearing_base_'+str(side),base,'rotor','layout')
    bearing=cylinder((ax,yy-18,az),(ax,yy+18,az),27).cut(cylinder((ax,yy-19,az),(ax,yy+19,az),11))
    add('Rear_bearing_'+str(side),bearing,'rotor','layout')
    for xx in [ax-27,ax+27]:bolt('Rear_bearing_bolt_'+str(side)+str(xx),(xx,yy,65),(0,0,-1),25,4,'layout')
    washer('Rear_hub_'+str(side),(ax,side*345,az),(0,1,0),33,11,42,'steel','layout')
# Brake disc with ventilation holes, and an abstract tooth profile sprocket.
disc=cylinder((ax,90,az),(ax,94,az),80).cut(cylinder((ax,89,az),(ax,95,az),18))
for radius,count in [(60,12),(37,6)]:
    for j in range(count):
        ang=j*2*math.pi/count
        disc=disc.cut(cylinder((ax+radius*math.cos(ang),89,az+radius*math.sin(ang)),(ax+radius*math.cos(ang),95,az+radius*math.sin(ang)),4))
add('Rear_brake_disc_160mm_envelope',disc,'silver','layout')
washer('Rear_brake_carrier',(ax,87,az),(0,1,0),28,11,13,'steel','layout')
pts=[]
for j in range(120):
    rr=88 if j%4 in [1,2] else 83
    ang=j*2*math.pi/120
    pts.append((rr*math.cos(ang),rr*math.sin(ang)))
sprocket=cq.Workplane(cq.Plane(origin=(ax,-100,az),xDir=(1,0,0),normal=(0,1,0))).polyline(pts).close().extrude(5)
sprocket=sprocket.cut(cylinder((ax,-101,az),(ax,-94,az),12))
for j in range(6):
    ang=j*math.pi/3
    sprocket=sprocket.cut(cylinder((ax+48*math.cos(ang),-101,az+48*math.sin(ang)),(ax+48*math.cos(ang),-94,az+48*math.sin(ang)),12))
add('Rear_sprocket_visual_envelope',sprocket,'rotor','layout')

# Export named solid assembly plus individual parts and a tessellated scene for rendering.
assembly=cq.Assembly(name='Kevin_Shen_Go_Kart_v3_Reference')
as_built=cq.Assembly(name='Photo_Matched_Frame_and_Steering')
scene=[]
for part in PARTS:
    color=COLORS[part['mat']]
    assembly.add(part['shape'],name=part['name'],color=cq.Color(*color))
    if part['group']=='built':as_built.add(part['shape'],name=part['name'],color=cq.Color(*color))
    vertices,triangles=part['shape'].tessellate(.4,.12)
    scene.append(dict(name=part['name'],mat=part['mat'],group=part['group'],color=color,
                      vertices=[v.toTuple() for v in vertices],triangles=triangles))
assembly.export(str(OUT/'go-kart-reference.step'))
as_built.export(str(OUT/'frame-and-steering.step'))
cq.exporters.export(frame,str(OUT/'chassis-v2.step'))
(OUT/'scene.json').write_text(json.dumps(scene,separators=(',',':')))
(OUT/'parameters.json').write_text(json.dumps(P,indent=2)+'\n')
report=dict(parts=len(PARTS),all_shapes_valid=all(p['shape'].isValid() for p in PARTS),
            frame_bounds_mm=[frame.val().BoundingBox().xlen,frame.val().BoundingBox().ylen,frame.val().BoundingBox().zlen],
            frame_basis='Chassis Frame v2 drawing: 59 x 20/27 inches',
            assembly_status='Reference envelopes. Unmeasured mounting interfaces are provisional. No fabrication release.')
(OUT/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2),flush=True)
