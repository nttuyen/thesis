var arPos = new Array(); 
var newObjFrame = new Array(); 
var arDivPosID = new Array();
var arCenterTimeoutID = new Array(); 
var arTopBanner468TimeoutID = new Array();
var arTopBanner980TimeoutID = new Array();

	function ObjPos(rotateInterval, curFrame, isRotate, objFrame)
	{
		this.rotateInterval = rotateInterval;
		this.curFrame = curFrame;
		this.isRotate = isRotate;
		this.objFrame = objFrame;
	}
	
	function ObjFrame(arZone)
	{
	    this.arZone = arZone;
	}
	
	function ExpandBanner(strDiv, strDivExpand)
	{	
	   switch(strDiv)
	   {
	        case "div_adv_center_banner_1_468x60":
	        case "div_adv_center_banner_2_468x60":
	            var tdCenter1=document.getElementById("tdCenterExBanner1");
		        var tdCenter2=document.getElementById("tdCenterExBanner2");
		        if (tdCenter1.height < 120)
		        {
			        tdCenter1.height = "120px";
			        tdCenter2.height = "120px";
	            }
	            break;
	        case "div_adv_top_banner_1_468x90":
	        case "div_adv_top_banner_2_468x90":
	            var tdExBanner1=document.getElementById("tdExBanner1");
		        var tdExBanner2=document.getElementById("tdExBanner2");
		        if (tdExBanner1.height < 180)
		        {
			        tdExBanner1.height = "180px";
			        tdExBanner2.height = "180px";
	            }
	            break;
	        case "div_adv_top_banner_728x90":
	            var tdExBanner_980=document.getElementById("tdExBanner_980");
	            if(tdExBanner_980.height < 180)
	                tdExBanner_980.height = "180px";
	            break;
	   }
	   
	    var k = 0;
	    
	    var strDiv1 = strDiv;
	    var strDivExpand1 = strDivExpand;
	   
	    /*Truong hop expand cua vi tri Top Banner 1B ma` vi tri top_banner_2_468x9 lai ko co du lieu, thi lay o top_banner_1_468x9 ra*/
        if(strDiv == "div_adv_top_banner_2_468x90" && arPos["div_adv_top_banner_2_468x90"] == null)
        {
            strDiv1 = "div_adv_top_banner_1_468x90";
            strDivExpand1 = "div_adv_top_banner_1_expand_468x180";
            k = 1;
            
            
        }
		
	    var i = arPos[strDiv1].curFrame - 1;
	    if (i == -1)
		   i = arPos[strDiv1].objFrame.length - 1;
		   
	    var AdMode     = arPos[strDivExpand1].objFrame[i].arZone[k][4]; 
        var strLink    = arPos[strDivExpand1].objFrame[i].arZone[k][1]; 
        var strWidth   = arPos[strDivExpand1].objFrame[i].arZone[k][2]; 
        var strHeight  = arPos[strDivExpand1].objFrame[i].arZone[k][3]; 
        var strImgUrl  = arPos[strDivExpand1].objFrame[i].arZone[k][0]; 
        
       
        
        var d = document.getElementById(strDiv);
        WriteBanner(d, AdMode, strLink, strWidth, strHeight, strImgUrl);
	}
	
	function CloseExpandBanner(strDiv)
	{
	     var i = arPos[strDiv].curFrame - 1;
	    if (i == -1)
		   i = arPos[strDiv].objFrame.length - 1;
		   
	    var AdMode     = arPos[strDiv].objFrame[i].arZone[0][4]; 
        var strLink    = arPos[strDiv].objFrame[i].arZone[0][1]; 
        var strWidth   = arPos[strDiv].objFrame[i].arZone[0][2]; 
        var strHeight  = arPos[strDiv].objFrame[i].arZone[0][3]; 
        var strImgUrl  = arPos[strDiv].objFrame[i].arZone[0][0]; 
        
        RestoreHightBanner(strDiv);
        var d = document.getElementById(strDiv);
        WriteBanner(d, AdMode, strLink, strWidth, strHeight, strImgUrl);
	}
	
	function RestoreHightBanner(strDiv)
	{
	   switch(strDiv)
	   {
	        case "div_adv_center_banner_1_468x60":
	        case "div_adv_center_banner_2_468x60":
	            document.getElementById("tdCenterExBanner1").height = "60px";
	            document.getElementById("tdCenterExBanner2").height = "60px";
	            break;
	        case "div_adv_top_banner_1_468x90":
	        case "div_adv_top_banner_2_468x90":
	            document.getElementById("tdExBanner1").height = "60px";
	            document.getElementById("tdExBanner2").height = "60px";
	            break;
	        case "div_adv_top_banner_728x90":
	            document.getElementById("tdExBanner_980").height = "60px";
	            break;
	   }
	}
		
	function findPosX(obj_id)
    {
        var obj = document.getElementById(obj_id);
        var curleft = 0;
        if(obj.offsetParent)
            while(1) 
            {
              curleft += obj.offsetLeft;
              if(!obj.offsetParent)
                break;
              obj = obj.offsetParent;
            }
        else if(obj.x)
            curleft += obj.x;
        return curleft;
    }

    function findPosY(obj_id)
    {
        var obj = document.getElementById(obj_id);
        var curtop = 0;
        if(obj.offsetParent)
            while(1)
            {
              curtop += obj.offsetTop;
              if(!obj.offsetParent)
                break;
              obj = obj.offsetParent;
            }
        else if(obj.y)
            curtop += obj.y;
        return curtop;
    }
    function DisplayBanner(){}