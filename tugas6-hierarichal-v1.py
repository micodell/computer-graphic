import numpy as np
import math
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from matplotlib.patches import Rectangle
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

# --- Parameter Robot ---
Hb = 2.0  # base height
Rb = 1.0  # base radius
Ll = 6.0  # lower arm length
Lu = 4.0  # upper arm length
theta = 30.0  # base rotation (deg)
phi = -30.0   # lower arm rotation (deg)
psi = 120.0   # upper arm rotation (deg)

# --- Helper matrices ---
def T(tx, ty, tz):
    M = np.eye(4)
    M[0,3], M[1,3], M[2,3] = tx, ty, tz
    return M

def Rx(deg):
    th = math.radians(deg)
    c, s = math.cos(th), math.sin(th)
    return np.array([
        [1,0,0,0],
        [0,c,-s,0],
        [0,s,c,0],
        [0,0,0,1]
    ])

def Ry(deg):
    th = math.radians(deg)
    c, s = math.cos(th), math.sin(th)
    return np.array([
        [c,0,s,0],
        [0,1,0,0],
        [-s,0,c,0],
        [0,0,0,1]
    ])

# --- Transformation setup ---
T_base_pos = T(0, Hb/2, 0)
R_base = Ry(theta)
M_base = T_base_pos @ R_base

T_pos_lower = T(0, Ll/2, 0)
R_lower = Rx(phi)
T_attach_lower = T(0, Hb/2, 0)
M_lower_local = T_attach_lower @ R_lower @ T_pos_lower
M_lower_global = M_base @ M_lower_local

T_pos_upper = T(0, Lu/2, 0)
R_upper = Rx(psi)
T_attach_upper = T(0, Ll, 0)
M_upper_local = T_attach_upper @ R_upper @ T_pos_upper
M_upper_global = M_lower_global @ M_upper_local

# --- Helper to transform points ---
def transform(M, pts):
    pts_h = np.c_[pts, np.ones(len(pts))]
    return (M @ pts_h.T).T[:, :3]

# --- Geometry generation ---
def cylinder(radius, height, segs=24):
    theta = np.linspace(0, 2*np.pi, segs)
    x = radius*np.cos(theta)
    z = radius*np.sin(theta)
    y0 = np.zeros_like(theta)
    y1 = np.ones_like(theta)*height
    verts = []
    for i in range(segs-1):
        verts.append([
            [x[i], y0[i], z[i]],
            [x[i+1], y0[i+1], z[i+1]],
            [x[i+1], y1[i+1], z[i+1]],
            [x[i], y1[i], z[i]]
        ])
    return verts

def block(length, width=1.0, depth=1.0):
    l, w, d = length/2, width/2, depth/2
    v = np.array([
        [-w,-l,-d],[w,-l,-d],[w,l,-d],[-w,l,-d],
        [-w,-l,d],[w,-l,d],[w,l,d],[-w,l,d]
    ])
    faces = [
        [v[0],v[1],v[2],v[3]],
        [v[4],v[5],v[6],v[7]],
        [v[0],v[1],v[5],v[4]],
        [v[2],v[3],v[7],v[6]],
        [v[1],v[2],v[6],v[5]],
        [v[4],v[7],v[3],v[0]]
    ]
    return faces

# --- Plot 3D ---
fig = plt.figure(figsize=(8,7))
ax = fig.add_subplot(111, projection='3d')
ax.set_box_aspect([1,1,1])

# Base cylinder
base_faces = cylinder(Rb, Hb)
for f in base_faces:
    f_t = transform(M_base, np.array(f))
    ax.add_collection3d(Poly3DCollection([f_t], color='skyblue', alpha=0.8))

# Lower arm
lower_faces = block(Ll)
for f in lower_faces:
    f_t = transform(M_lower_global, np.array(f))
    ax.add_collection3d(Poly3DCollection([f_t], color='orange', alpha=0.8))

# Upper arm
upper_faces = block(Lu)
for f in upper_faces:
    f_t = transform(M_upper_global, np.array(f))
    ax.add_collection3d(Poly3DCollection([f_t], color='green', alpha=0.8))

ax.set_xlabel('X')
ax.set_ylabel('Y')
ax.set_zlabel('Z')
ax.set_title('Hierarchical Robot Arm')
ax.set_xlim(-10, 10)
ax.set_ylim(0, 15)
ax.set_zlim(-10, 10)
ax.view_init(elev=25, azim=45)
plt.tight_layout()
plt.savefig("./media/robot_arm_3d.png", dpi=150)
plt.show()

print("✅ Saved robot_arm_3d.png and finished rendering.")
