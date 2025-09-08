# P(t) = (1-t)³ P0 + 3(1-t)²t P1 + 3(1-t)t² P2 + t³ P3
def bezierCubic(t,p0,p1,p2,p3):
   b0 = (1-t)**3
   b1 = 3 * (1-t)**2 * t
   b2 = 3 * (1-t) * t**2
   b3 = t**3


   x = b0 * p0[0] + b1 * p1[0] + b2 * p2[0] + b3 * p3[0]
   y = b0 * p0[1] + b1 * p1[1] + b2 * p2[1] + b3 * p3[1]


   return (x,y)


# p(t)= [ C(d,i)(1-t)^(d-i) t^(i) ] pi
def bSplineCubic(t,p0,p1,p2,p3):
   b0 = (1-t)**3 / 6
   b1 = (3 * t**3 - 6 * t**2 + 4) / 6
   b2 = (-3 * t**3 + 3 * t**2 + 3 * t + 1) / 6
   b3 = t**3 / 6


   x = b0 * p0[0] + b1 * p1[0] + b2 * p2[0] + b3 * p3[0]
   y = b0 * p0[1] + b1 * p1[1] + b2 * p2[1] + b3 * p3[1]


   return (x,y)


## tugas 4 no 2
# P0 = (5,5)
# P1 = (10,15)
# P2 = (20,15)
# P3 = (25,5)
# points_on_curve = []
# t = 0.1
# while t <= 1.0:
#     t_rounded = round(t,2)
#     point = bezierCubic(t_rounded, P0, P1, P2, P3)
#     points_on_curve.append(point)
#     print(f"Point at t={t_rounded} is: {point}")
#     t += 0.1


# tugas 4 no 3
# P = [
#     (18,3),
#     (28.5,14.8),
#     (23,15.5),
#     (13,14.5),
#     (6,19),
#     (15,27)
# ]
P = [
   (6,19),
   (13,14.5),
   (15,27),
   (18,3),
   (23,15.5),
   (28.5,14.8)
]
all_curve_points = []
# loop for each segment kurva (6-3 = 3 segment)
for i in range(len(P) - 3):
   C0 = P[i]
   C1 = P[i+1]
   C2 = P[i+2]
   C3 = P[i+3]
   print(f"\nMenghitung segmen {i+1} with titik kontrol: {C0, C1, C2, C3}")
  
   t = 0.0
   while t < 1.0:
       t_rounded = round(t, 2)
       point3 = bSplineCubic(t_rounded, C0, C1, C2, C3)
       all_curve_points.append(point3)
       print(f"Point at t={t_rounded} is: {point3}")
       t += 0.2 # perbesar jika mau lebih mulus kurvanya


# MENGGAMBAR PLOT
# import matplotlib.pyplot as plt
# import numpy as np

# # Hitung titik-titik untuk garis kurva yang mulus
# smooth_bspline_points = []
# # Hitung titik-titik terpisah untuk digambar sebagai dot
# dot_bspline_points = []

# # all_bspline_points = []
# # Loop untuk setiap segmen kurva (ada 6-3=3 segmen)
# for i in range(len(P) - 3):
#     C0, C1, C2, C3 = P[i], P[i+1], P[i+2], P[i+3]
#     for t in np.linspace(0, 1, 10): # Hitung 50 titik per segmen
#         smooth_bspline_points.append(bSplineCubic(t, C0, C1, C2, C3))
#     # Kalkulasi untuk titik-titik/dot yang terlihat (lebih sedikit titik)
#     for t in np.linspace(0, 1, 6):
#         # Menghasilkan titik untuk t=0.0, 0.2, 0.4, 0.6, 0.8, 1.0
#         dot_bspline_points.append(bSplineCubic(t, C0, C1, C2, C3))

# # Memisahkan koordinat x dan y untuk plotting
# x_bspline_smooth, y_bspline_smooth = zip(*smooth_bspline_points)
# x_bspline_dots, y_bspline_dots = zip(*dot_bspline_points)
# x_bspline_ctrl, y_bspline_ctrl = zip(*P)


# plt.figure(figsize=(8, 6))
# plt.plot(x_bspline_smooth, y_bspline_smooth, 'g-', label='Kurva B-Spline')
# plt.plot(x_bspline_ctrl, y_bspline_ctrl, 'ro--', label='Poligon Kontrol')
# plt.scatter(x_bspline_ctrl, y_bspline_ctrl, color='red', s=50, zorder=5)
# plt.scatter(x_bspline_dots, y_bspline_dots, color='darkgreen', s=30, zorder=5, label='Titik t (interval 0.2)')

# plt.title('Tugas 3: Kurva B-Spline dengan Titik t')
# plt.xlabel('Sumbu X')
# plt.ylabel('Sumbu Y')
# plt.legend()
# plt.grid(True)
# plt.gca().set_aspect('equal', adjustable='box')

# plt.show()