exec(open('fitsg.py').read().split("res=[]")[0])
res=[]
for a in [-.45,-.4,-.35,-.3,-.25,.25,.3,.35,.4,.45]:
  for b2 in [-.1,-.05,0,.05,.1]:
    P=seam_pts(a,b2,n=250000,w=.004)
    c1,M1=pose_fit(P,'a3',(965,893));c2,M2=pose_fit(P,'a1',(898,960))
    print(a,b2,round(math.degrees(c1),2),round(math.degrees(c2),2),flush=True);res.append((c1+c2,a,b2,M1,M2))
res.sort(key=lambda t:t[0]);c,a,b2,M1,M2=res[0];print('best',a,b2,math.degrees(c/2))
np.save('Ms_a3.npy',M1);np.save('Ms_a1.npy',M2);json.dump({'a':a,'b2':b2},open('sg_params.json','w'))
