import numpy as np,cv2;from PIL import Image
def seam_obs(path,cx,cy,R,thr=.05):
    rgb=np.asarray(Image.open(path).convert('RGB')).astype(np.float32)/255;L=rgb.mean(-1);sat=rgb.max(-1)-rgb.min(-1)
    g=cv2.GaussianBlur(L,(0,0),2.5);bh=cv2.morphologyEx(g,cv2.MORPH_BLACKHAT,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(15,15)))
    H,W=L.shape;yy,xx=np.mgrid[0:H,0:W];inball=np.hypot(xx-cx,yy-cy)<R*.93
    white=((cv2.GaussianBlur(L,(0,0),3)>.55)&(sat<.22)).astype(np.uint8);white=cv2.morphologyEx(white,cv2.MORPH_CLOSE,np.ones((15,15),np.uint8))
    white=cv2.erode(white,np.ones((13,13),np.uint8)).astype(bool)&inball
    e=(bh>thr)&white
    # drop tiny specks
    n,lab,st,_=cv2.connectedComponentsWithStats(e.astype(np.uint8),8);keep=np.zeros(n,bool);keep[1:]=st[1:,4]>40;e=keep[lab]
    return e,white
