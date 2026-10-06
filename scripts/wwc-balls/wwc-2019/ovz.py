import sys,json;sys.path.insert(0,'.');sys.path.insert(0,'tools');from sphere import *;import zgeom
def ovz(name,path,out,th=19.84):
    C=json.load(open(f'C_{name}.json'));M=np.load(f'M_{name}.npy');ph=Photo(path,*C,M);im=(ph.img*255).astype(np.uint8).copy()
    SP=zgeom.seam_points(math.radians(th),80);Cc=SP@M.T;X,Y=ph.project(Cc);f=ph.facing(Cc);k=f>.05
    for x,y in zip(X[k],Y[k]): cv2.circle(im,(int(x),int(y)),max(1,int(C[2]/300)),(255,0,255),-1)
    x0,y0=int(C[0]-C[2]*1.05),int(C[1]-C[2]*1.05);Image.fromarray(im).crop((x0,y0,x0+int(C[2]*2.1),y0+int(C[2]*2.1))).resize((600,600)).save(out)
if __name__=='__main__': ovz(sys.argv[1],sys.argv[2],sys.argv[3])
