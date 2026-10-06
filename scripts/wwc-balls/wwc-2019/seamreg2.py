import sys,json;sys.path.insert(0,'.');from seamreg import *;from bhunwrap import bh_img
name,path,cx,cy,R=sys.argv[1],sys.argv[2],*map(float,sys.argv[3:6]);D=None if sys.argv[6]=='None' else float(sys.argv[6])
ph=Photo(path,cx,cy,R,D);g=1-bh_img(path);g=cv2.GaussianBlur(g.astype(np.float32),(0,0),2)
out=search(ph,g,trials=30000)
print(name,[round(o[0],3) for o in out[:6]])
for i in range(3):
  ph.M=out[i][1];overlay(ph,S,f'ovs2_{name}_{i}.jpg')
np.save(f'Mseam_{name}.npy',np.array([o[1] for o in out[:8]]))
