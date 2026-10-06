import sys;sys.path.insert(0,'tools');from seamreg import *
name,path,cx,cy,R=sys.argv[1],sys.argv[2],*map(float,sys.argv[3:6])
P=np.load('seampts.npy');ph=Photo(path,cx,cy,R,None)
out,bh,white=register_seams(ph,P)
print(name,[round(o[0],4) for o in out[:8]])
np.save(f'Mc_{name}.npy',np.array([o[1] for o in out[:8]]));json.dump([cx,cy,R,None],open(f'C_{name}.json','w'))
Image.fromarray((np.clip(bh*8,0,1)*255*(white>0)).astype(np.uint8)).save(f'bh_{name}.png')
