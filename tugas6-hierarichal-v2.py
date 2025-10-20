import numpy as np, math, matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

# === Parameter ===
Hb, Rb = 4.0, 2.0      # tinggi dan radius base
Ll, Lu = 6.0, 4.0      # panjang lower dan upper arm
theta, phi, psi = 30.0, -30.0, 120.0  # sudut rotasi (deg)

# === Matrix helpers ===
def T(tx,ty,tz):
    M = np.eye(4); M[:3,3] = [tx,ty,tz]; return M
def Rx(deg):
    r = math.radians(deg); c,s = math.cos(r), math.sin(r)
    return np.array([[1,0,0,0],[0,c,-s,0],[0,s,c,0],[0,0,0,1]])
def Ry(deg):
    r = math.radians(deg); c,s = math.cos(r), math.sin(r)
    return np.array([[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]])

# === Hierarchical matrices ===
# Base: sits on ground, pivot at (0,0,0)
M_base = Ry(45) @ T(0,0,0)

# Lower arm: attach at top of base, pivot (0,Hb,0)
M_lower_local = T(0,Hb,0) @ Rx(theta) @ T(0,Ll/2,0)
M_lower_global = M_base @ M_lower_local

# Upper arm: attach at top of lower, pivot (0,Ll,0)
M_upper_local = T(0,Lu-0.5,Lu/2-0.5) @ Rx(90)  # changed v1
# M_upper_local = T(0,Ll-2.5,Ll/2+(abs(Ll-Lu)/2-0.5)) @ Rx(90)  # try&error v3
# M_upper_local = T(0, Ll/2, 0) @ Rx(90) @ T(0, Lu/2, 0)  # !!!!!!!!! v2
M_upper_global = M_lower_global @ M_upper_local
print(M_upper_global)

# === Geometry (simple primitives) ===
def cylinder(radius,height,segs=24):
    theta=np.linspace(0,2*np.pi,segs)
    x=radius*np.cos(theta); z=radius*np.sin(theta)
    verts=[]
    for i in range(segs-1):
        verts.append([[x[i],0,z[i]],[x[i+1],0,z[i+1]],
                      [x[i+1],height,z[i+1]],[x[i],height,z[i]]])
    return verts

def block(length,w=1,d=1):
    l,w2,d2=length/2,w/2,d/2
    v=np.array([[-w2,-l,-d2],[w2,-l,-d2],[w2,l,-d2],[-w2,l,-d2],
                [-w2,-l,d2],[w2,-l,d2],[w2,l,d2],[-w2,l,d2]])
    f=[[v[0],v[1],v[2],v[3]],[v[4],v[5],v[6],v[7]],
       [v[0],v[1],v[5],v[4]],[v[2],v[3],v[7],v[6]],
       [v[1],v[2],v[6],v[5]],[v[4],v[7],v[3],v[0]]]
    return f

def transform(M,pts):
    pts_h = np.c_[pts,np.ones(len(pts))]
    return (M@pts_h.T).T[:,:3]

# === Plot ===
fig = plt.figure(figsize=(8,7))
ax = fig.add_subplot(111,projection='3d')
ax.set_box_aspect([1,1,1])

# Base (skyblue)
for f in cylinder(Rb,Hb):
    ax.add_collection3d(Poly3DCollection([transform(M_base,np.array(f))],
                                         color='skyblue',alpha=0.8))
# Lower arm (orange)
for f in block(Ll):
    ax.add_collection3d(Poly3DCollection([transform(M_lower_global,np.array(f))],
                                         color='orange',alpha=0.8))
# Upper arm (green)
for f in block(Lu):
    ax.add_collection3d(Poly3DCollection([transform(M_upper_global,np.array(f))],
                                         color='green',alpha=0.8))

ax.set_xlabel('X'); ax.set_ylabel('Y'); ax.set_zlabel('Z')
ax.set_xlim(-10,10); ax.set_ylim(0,15); ax.set_zlim(-10,10)
ax.view_init(elev=106, azim=-90, roll=0, vertical_axis='z')
ax.set_title("Hierarchical Robot Arm (Base on Ground, Arms Connected)")
plt.tight_layout()
plt.savefig("./media/robot_arm_correct.png",dpi=150)
plt.show()
