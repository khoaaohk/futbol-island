import sys;sys.argv=['x','out/dbg','64'];exec(open('build_conext19.py').read().split("if __name__=='__main__':")[0])
for k,F in enumerate(AXES):
  g=g_to((1,0,0),F);P=nrm(F+np.array([.05,.03,.02]))[None]
  print(F,None if g is None else np.round(g@np.array([1,0,0.]),2))
  if g is not None:
    c2,s2=mosaic(P@g,gs=[np.eye(3)],srcs=['chi']);print('  ',np.round(c2,2),s2)
