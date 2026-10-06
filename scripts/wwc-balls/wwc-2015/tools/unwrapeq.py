import sys;sys.path.insert(0,__file__.rsplit('/',1)[0]);from sphere import *
# unwrapeq.py out.png W path cx cy R Mfile [D]
out,W,p,cx,cy,R,Mf=sys.argv[1],int(sys.argv[2]),sys.argv[3],*map(float,sys.argv[4:7]),sys.argv[7]
ph=Photo(p,cx,cy,R,float(sys.argv[8]) if len(sys.argv)>8 else None,np.load(Mf))
D=eq_dirs(W,W//2);c,w=ph.sample_ball(D);c[w<.2]=.5
Image.fromarray((c*255).astype(np.uint8)).save(out)
