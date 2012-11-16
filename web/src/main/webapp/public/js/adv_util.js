        function Shuffle( myArray ) {
          var i = myArray.length;
          if ( i == 0 ) return false;
          while ( --i ) {
             var j = Math.floor( Math.random() * ( i + 1 ) );
             var tempi = myArray[i];
             var tempj = myArray[j];
             myArray[i] = tempj;
             myArray[j] = tempi;
           }
        }
        
        function ShuffleBannerExpand( myArray, myArrayExpand ) {
          var i = myArray.length;
          if ( i == 0 ) return false;
           while ( --i ) {
             var j = Math.floor( Math.random() * ( i + 1 ) );
             var tempi = myArray[i];
             var tempj = myArray[j];
             myArray[i] = tempj;
             myArray[j] = tempi;
             
             if(myArrayExpand != null)
             {
                tempi = myArrayExpand[i];
                tempj = myArrayExpand[j];
                myArrayExpand[i] = tempj;
                myArrayExpand[j] = tempi;
             }
           }
        }
        
		function getIndexRandom(numOfItem)
	    {
		    var arr = new Array();
		    for(var i=0;i<numOfItem;i++)
		    {
		        arr[i] = i;
		    }
		    Shuffle(arr);
		    return 	arr;
	    }
	    
		var iArray = 0;		
		var ArrG13 = null;	
		var iAG13 = 0;
		var ArrHotBaner = null;	
		var iAHotBanner = 0;
		
		var iCountObject = 0;
		/* Mang arRotateInterval dung de luu xem co bao nhieu Timer (= distinct  rotateInterval)*/
        var arRotateInterval = new Array(); 
        var flag = false;
        var IsCreateNewDiv = true;
        var callFunction = new Array();
        var arTimeout = new Array();
         
        function ShowBanner()
        {
            var div_posid = "";
			/* Show banner*/
            for (i = 0;i < arDivPosID.length; i ++)
            {
                div_posid = arDivPosID[i];
                
                /*Ramdom cac frame trong 1 banner*/
                if(arPos[div_posid] != null && arPos[div_posid].objFrame.length > 1)
                {
                    switch(div_posid)
                    {
                        case "div_adv_center_banner_1_468x60":
                            ShuffleBannerExpand(arPos[div_posid].objFrame, arPos["div_adv_center_banner_1_expand_468x120"].objFrame);
                            break;
                        case "div_adv_center_banner_2_468x60":
                            ShuffleBannerExpand(arPos[div_posid].objFrame, arPos["div_adv_center_banner_2_expand_468x120"].objFrame);
                            
                            break;
                        case "div_adv_top_banner_1_468x90":
                            ShuffleBannerExpand(arPos[div_posid].objFrame, arPos["div_adv_top_banner_1_expand_468x180"].objFrame);
                            break;
                        case "div_adv_top_banner_2_468x90":
                            ShuffleBannerExpand(arPos[div_posid].objFrame, arPos["div_adv_top_banner_2_expand_468x180"].objFrame);
                            break;
                         case "div_adv_top_banner_728x90":
                            ShuffleBannerExpand(arPos[div_posid].objFrame, arPos["div_adv_top_banner_expand_728x180"].objFrame);
                            break;
                        default:
                            Shuffle(arPos[div_posid].objFrame);
                    }
			        
			    }
			   
				/* Show banner*/
				if(arPos[div_posid] != null && arPos[div_posid].objFrame.length > 0)
				    ChangeBanner(div_posid);

				/* Neu banner nay co Rotate*/
                if(arPos[div_posid] != null && arPos[div_posid].rotateInterval > 0 && arPos[div_posid].objFrame.length > 0 && arPos[div_posid].isRotate == true)
                {
                    flag = false;
                    for(j=0; j<arRotateInterval.length; j ++)
                    {
                        if(arRotateInterval[j] == arPos[div_posid].rotateInterval)
                        {
                            flag = true;
                            break;    
                        }
                    }
                   
                    if(flag == false)
                    {
                        arRotateInterval[arRotateInterval.length] = arPos[div_posid].rotateInterval;    
                    }   
                }
            }
            
			/* Tao  ra Thread de Rotate banner*/
            ChangeBannerInternal();
        }
        
        function ChangeBannerInternal()
        {
            var div_posid = "";
            for(i=0; i< arRotateInterval.length; i++)
            {
                callFunction[i] = "";
                 
                 for (j = 0;j < arDivPosID.length; j ++)
                 {
                    div_posid = arDivPosID[j];
                     
                    if(arPos[div_posid] != null && arPos[div_posid].rotateInterval == arRotateInterval[i] && arPos[div_posid].isRotate == true && arPos[div_posid].objFrame.length > 1)
                    {
                        callFunction[i] = callFunction[i] + "ChangeBanner('"+div_posid+"');"
                        /*setTimeout("TimeOut('"+div_posid+"')",10000);*/
                        /*callFunction = callFunction + "ChangeBanner('"+div_posid+"');";*/
                    }    
                 }
                
                 if(callFunction != "" )
                 {
                    arTimeout[arTimeout.length] = setTimeout("TimeOut('" + i + "'," + arRotateInterval[i] + ")", arRotateInterval[i]);
                    /*setInterval(callFunction, arRotateInterval[i]);*/
                 }
                    
            }
        }
        
        function TimeOut(i, time)
        {
            clearTimeout(arTimeout.length);
            arTimeout[arTimeout.length] = setTimeout("TimeOut('"+i+"',"+time+")", time);
            eval(callFunction[i]);
        }
        
		
        /*hien thi Parent DIV quang cao*/
        function ShowParentNode(arZone,id)
        {          
            var obj = arZone;  
            var objDiv = document.getElementById(id);
            if (obj != "" && obj.length > 0 && objDiv != null && objDiv.parentNode != null ) 
            {                
                objDiv.parentNode.style.display = ""; 
            }
                        
        } 
        
        function IsExpandBannerID(id)
        {            
            
           var str = ',div_adv_top_banner_2_expand_468x180,div_adv_top_banner_expand_728x180,div_adv_top_banner_1_expand_468x180,div_adv_center_banner_1_expand_468x120,div_adv_center_banner_2_expand_468x120,';           
           if (str.indexOf(',' + id + ',') != -1) return true;
           return false;
        }
        
        function ChangeBanner(strDiv)
        {            
			try
			{			
			   var d = document.getElementById(strDiv); 
			   var i = arPos[strDiv].curFrame;
			   
			   if(d != null)
			   {
				   if (d.parentNode != null && (!IsExpandBannerID(strDiv))) 
				   {				   
				        d.parentNode.style.display = "";
				   }
				   
				   /* Doi voi nhung frame ma` chi co 1 banner, thi khong fai xu ly fuc tap */
				   if(arPos[strDiv].objFrame[i].arZone.length == 1)
				   {
				       var AdMode     = arPos[strDiv].objFrame[i].arZone[0][4]; 
				       var strLink    = arPos[strDiv].objFrame[i].arZone[0][1]; 
				       var strWidth   = arPos[strDiv].objFrame[i].arZone[0][2]; 
				       var strHeight  = arPos[strDiv].objFrame[i].arZone[0][3]; 
				       var strImgUrl  = arPos[strDiv].objFrame[i].arZone[0][0]; 
    				   
				       WriteBanner(d, AdMode, strLink, strWidth, strHeight, strImgUrl);
					    
					    /* hidden the div tao them (neu co) */
					    if(arPos[strDiv].objFrame.length > 1)
					    {
					        d = document.getElementById(strDiv + "_1");
					        if(d != null) d.style.display = "none";
					    }
					    
				        switch(strDiv)
				        {
				            case "div_adv_hot_banner_2_336x140":
				                /* nếu là hot_banner thì cho padding thêm một chút để không bị giật trang */
				                /* Hiển thị thẻ div ẩn để khi rotate banner đỡ bị giật */
				                if(strHeight == 280)
				                {
				                    if(arPos["div_adv_hot_banner_3_336x140"] == null)
				                    {
				                       document.getElementById(strDiv + "_2").parentNode.style.display = "";
				                    }
				                    /*else
				                       d.style.display = "none";*/
				                    
				                }
				                break;
				            case "div_adv_top_banner_1_468x90":
				                if(arPos["div_adv_top_banner_2_468x90"] == null)
				                {
				                    if(strWidth == 980)
				                    {
				                        /* Khi hiện thị banner 980 ra, thì ẩn Top Banner 1B và tăng width của 1A lên */
				                        document.getElementById("tdExBanner1").width = "980px";
				                        document.getElementById("tdExBanner2").style.display = "none";
				                    }
				                    else
				                    {
				                        /*Hiển thị banner mặc định vào vị trí Top Banner 1B*/
				                        ShowDefaultTopBanner("div_adv_top_banner_2_468x90");
				                    }
				                }
				                RestoreHightBanner("div_adv_top_banner_1_468x90");
				                if(arPos["div_adv_top_banner_1_expand_468x180"] != null && arPos["div_adv_top_banner_1_expand_468x180"].objFrame[i].arZone.length > 0)
				                    ShowButtonOpen(strDiv, 'tdExBanner1', 'div_Top_Ex_Close_1A');
				                else
				                    HideButtonOpen('div_Top_Ex_Close_1A');
    				            break;
    				        case "div_adv_top_banner_2_468x90":
    				            RestoreHightBanner("div_adv_top_banner_2_468x90");
    				            if(arPos["div_adv_top_banner_2_expand_468x180"] != null && arPos["div_adv_top_banner_2_expand_468x180"].objFrame[i].arZone.length > 0)
				                    ShowButtonOpen(strDiv, 'tdExBanner2', 'div_Top_Ex_Close_1B');
				                else
				                    HideButtonOpen('div_Top_Ex_Close_1B');
    				            break;
    				        case "div_adv_top_banner_728x90":
    				            RestoreHightBanner("div_adv_top_banner_728x90");
    				            if(arPos["div_adv_top_banner_expand_728x180"] != null && arPos["div_adv_top_banner_expand_728x180"].objFrame[i].arZone.length > 0)
				                    ShowButtonOpen(strDiv, 'tdExBanner_980', 'div_Top_Ex_Close');
				                else
				                    HideButtonOpen('div_Top_Ex_Close');
    				            break;
				            case "div_adv_center_banner_1_468x60":
				                RestoreHightBanner("div_adv_center_banner_1_468x60");
				                if(arPos["div_adv_center_banner_1_expand_468x120"] != null && arPos["div_adv_center_banner_1_expand_468x120"].objFrame[i].arZone.length > 0)
				                    ShowButtonOpen(strDiv, 'tdCenterExBanner1', 'div_Center_Ex_Close_1A');
				                else
				                    HideButtonOpen('div_Center_Ex_Close_1A');
				                break;
				            case "div_adv_center_banner_2_468x60":
				                RestoreHightBanner("div_adv_center_banner_2_468x60");
				                if(arPos["div_adv_center_banner_1_expand_468x120"] != null && arPos["div_adv_center_banner_2_expand_468x120"].objFrame[i].arZone.length > 0)
				                    ShowButtonOpen(strDiv, 'tdCenterExBanner2', 'div_Center_Ex_Close_2A');
				                else
				                    HideButtonOpen('div_Center_Ex_Close_2A');
				                break;
				        }
				   }
				   /* Doi voi trường hợp có 2 banner trong 1 frame */
				   else
				   {
				        /* hot_banner đã thêm thẻ div mới ở trong ascx */
				        /* Hien thi 2 Banner trong 1 Frame */
				        switch(strDiv)
				        {
				            case "div_adv_right_top_banner_2_180x180":
				                RightBanner_CreateNewDiv(d);
				                right_top_banner_2_180x180(i, strDiv, d);
				                break;
				            case "div_adv_hot_banner_2_336x140":
				                document.getElementById(strDiv + "_1").parentNode.style.display = "";
				                document.getElementById(strDiv + "_2").parentNode.style.display = "none";
				                hot_banner_2_336x140(i, strDiv, d);
				                break;
				            case "div_adv_top_banner_1_468x90":
				                RestoreHightBanner("div_adv_top_banner_1_468x90");
				                top_banner_1_468x90(i, strDiv, d);
				                if(arPos["div_adv_top_banner_1_expand_468x180"] != null && arPos["div_adv_top_banner_1_expand_468x180"].objFrame[i].arZone.length > 0)
				                    ShowButtonOpen(strDiv, 'tdExBanner1', 'div_Top_Ex_Close_1A');
				                else
				                    HideButtonOpen('div_Top_Ex_Close_1A');
				                    
				                if(arPos["div_adv_top_banner_1_expand_468x180"] != null && arPos["div_adv_top_banner_1_expand_468x180"].objFrame[i].arZone.length > 1)
				                    ShowButtonOpen(strDiv, 'tdExBanner2', 'div_Top_Ex_Close_1B');
				                else
				                    HideButtonOpen('div_Top_Ex_Close_1B');
				                    
				                break;
				            case "div_adv_top_banner_2_468x90":
				                RestoreHightBanner("div_adv_top_banner_2_468x90");
				                if(arPos["div_adv_top_banner_2_expand_468x180"] != null && arPos["div_adv_top_banner_2_expand_468x180"].objFrame[i].arZone.length > 0)
				                    ShowButtonOpen(strDiv, 'tdExBanner2', 'div_Top_Ex_Close_1B');
				                else
				                    HideButtonOpen('div_Top_Ex_Close_1B');
				                break;
				            case "div_adv_top_banner_728x90":
    				            RestoreHightBanner("div_adv_top_banner_728x90");
    				            if(arPos["div_adv_top_banner_expand_728x180"] != null && arPos["div_adv_top_banner_expand_728x180"].objFrame[i].arZone.length > 0)
				                    ShowButtonOpen(strDiv, 'tdExBanner_980', 'div_Top_Ex_Close');
				                else
				                    HideButtonOpen('div_Top_Ex_Close');
    				            break;
    				        default:
    				            var AdMode     = arPos[strDiv].objFrame[i].arZone[0][4]; 
				                var strLink    = arPos[strDiv].objFrame[i].arZone[0][1]; 
				                var strWidth   = arPos[strDiv].objFrame[i].arZone[0][2]; 
				                var strHeight  = arPos[strDiv].objFrame[i].arZone[0][3]; 
				                var strImgUrl  = arPos[strDiv].objFrame[i].arZone[0][0]; 
            				   
				                WriteBanner(d, AdMode, strLink, strWidth, strHeight, strImgUrl);
    				            break;
				        }
				   }
				}
				
			   arPos[strDiv].curFrame = arPos[strDiv].curFrame + 1;
			   if (arPos[strDiv].curFrame >= arPos[strDiv].objFrame.length)
				   arPos[strDiv].curFrame = 0;
				   
			}
			catch (e)
			{
				/*alert(e.message);*/
			}
           
        }
        
        /* Tao them 1 the div de hien thi 2 banner trong 1 Frame */
        function RightBanner_CreateNewDiv(d)
        {
            if(IsCreateNewDiv == true)
	        {
	            IsCreateNewDiv = false;
	            
	            var newDiv= document.createElement('div');
	            if(document.all)
	                newDiv.style.cssText  = d.parentNode.style.cssText;
	            else
                    newDiv.setAttribute("Style", d.parentNode.getAttribute("Style"));
                
                var childNewDiv = document.createElement('div');
                if(document.all)
                    childNewDiv.style.cssText = d.style.cssText;
                else
                    childNewDiv.setAttribute("Style", d.getAttribute("Style"));
                    
                var childNewDiv_ID = d.getAttribute("id") + "_1";
                childNewDiv.setAttribute("id", childNewDiv_ID);
                    
                newDiv.appendChild(childNewDiv);
                d.parentNode.parentNode.appendChild(newDiv);
	        }
        }
        
        function right_top_banner_2_180x180(frameIndex, strDiv, d)
		{
		    var length = 2;		        
		    var AdMode = "";var strLink = "";var strWidth = "";var strHeight = "";var strImgUrl = ""; var flash = "";var objectID = "";
		    for(var k=0; k<length; k++)
	        {
	           AdMode     = arPos[strDiv].objFrame[frameIndex].arZone[k][4]; 
		       strLink    = arPos[strDiv].objFrame[frameIndex].arZone[k][1]; 
		       strWidth   = arPos[strDiv].objFrame[frameIndex].arZone[k][2]; 
		       strHeight  = arPos[strDiv].objFrame[frameIndex].arZone[k][3]; 
		       strImgUrl  = arPos[strDiv].objFrame[frameIndex].arZone[k][0]; 
		       
		       if(k>0)
		          d = document.getElementById(strDiv + "_" + k); 
		       
		       if(d != null)
		       {
		           WriteBanner(d, AdMode, strLink, strWidth, strHeight, strImgUrl);
		           d = null;
		       }
	        }
		}
        
		function hot_banner_2_336x140(frameIndex, strDiv, d)
		{
		    /* Tam thoi chi xu ly 1 Frame co 2 banner */
		    /*var length = arPos[strDiv].objFrame[frameIndex].arZone.length;*/
		    var length = 2;
		    if(arPos["div_adv_hot_banner_3_336x140"] != null)
		        length = 1;
		        
		    var AdMode = "";var strLink = "";var strWidth = "";var strHeight = "";var strImgUrl = ""; var flash = "";var objectID = "";
		    for(var k=0; k<length; k++)
	        {
	           AdMode     = arPos[strDiv].objFrame[frameIndex].arZone[k][4]; 
		       strLink    = arPos[strDiv].objFrame[frameIndex].arZone[k][1]; 
		       strWidth   = arPos[strDiv].objFrame[frameIndex].arZone[k][2]; 
		       strHeight  = arPos[strDiv].objFrame[frameIndex].arZone[k][3]; 
		       strImgUrl  = arPos[strDiv].objFrame[frameIndex].arZone[k][0]; 
		       
		       if(k>0)
		          d = document.getElementById(strDiv + "_" + k); 
		       
		       if(d != null)
		       {
		           WriteBanner(d, AdMode, strLink, strWidth, strHeight, strImgUrl);
		           d = null;
		       }
	        }
		}
		
		function top_banner_1_468x90(frameIndex, strDiv, d)
		{
		    /* Tam thoi chi xu ly 1 Frame co 2 banner */
		    /*var length = arPos[strDiv].objFrame[frameIndex].arZone.length;*/
		    var length = 2;
		    var AdMode = "";var strLink = "";var strWidth = "";var strHeight = "";var strImgUrl = ""; var flash = "";var objectID = "";
		    for(var k=0; k<length; k++)
	        {
	           AdMode     = arPos[strDiv].objFrame[frameIndex].arZone[k][4]; 
		       strLink    = arPos[strDiv].objFrame[frameIndex].arZone[k][1]; 
		       strWidth   = arPos[strDiv].objFrame[frameIndex].arZone[k][2]; 
		       strHeight  = arPos[strDiv].objFrame[frameIndex].arZone[k][3]; 
		       strImgUrl  = arPos[strDiv].objFrame[frameIndex].arZone[k][0]; 
		       
		       /* Chi xu ly Top Banner 1A voi 2 anh trong Frame khi ma` banner Top Banner 2B khong co du lieu */ 
		       if(k > 0 && arPos["div_adv_top_banner_2_468x90"] == null)
		       {
		          d = document.getElementById("div_adv_top_banner_2_468x90"); 
		          document.getElementById("tdExBanner2").style.display = "";
		          document.getElementById("tdExBanner1").width = "468px";
		       }
		       
		       if(d != null)
		       {
		           WriteBanner(d, AdMode, strLink, strWidth, strHeight, strImgUrl);
		           d = null;
		       }
	        }
		}
		
		function WriteBanner(d, AdMode, strLink, strWidth, strHeight, strImgUrl)
		{
		   d.style.display = "";
           if (AdMode == 0) 
           {
              /* Neu la banner Image*/
              d.innerHTML = "<a href = '" + strLink + "' target='_blank'><img src='" + strImgUrl + "' width='" + strWidth + "' height='" + strHeight + "' border=0></a>";
           }
           else
           if (AdMode == 3) 
           {
	            /* Neu la banner Flash*/
	            flash = strImgUrl.replace('.swf',''); 
	            objectID = 'ob' + iCountObject;
	            iCountObject ++;
	            //d.innerHTML = "<object id='"+ objectID +"'        classid='clsid:d27cdb6e-ae6d-11cf-96b8-444553540000'         codebase='http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=7,0,0,0'         width=" + strWidth + "         height=" + strHeight + "         id="+flash+"          align='middle'>  <PARAM NAME=wmode VALUE=transparent>        <param                 name='allowScriptAccess'                  value='sameDomain' />           <param                  name='movie'                  value='" + strImgUrl + "'/>           <PARAM                  NAME=FlashVars                  VALUE='link=" + strLink +"' >           <param                  name='quality'                  value='high' />           <embed                   src='" + strImgUrl + "'                  quality='high'                   width=" + strWidth + "                  height=" + strHeight + "       wmode='transparent'           name=' helloWorld '                   flashvars='link=" + strLink +"'                   align='middle'                   allowScriptAccess='sameDomain'                   type='application/x-shockwave-flash'                   pluginspage='http://www.macromedia.com/go/getflashplayer' />           </object>  "; fixFlashByID(objectID , strLink); 
				d.innerHTML = "<embed                   src='" + strImgUrl + "'                  quality='high'                   width=" + strWidth + "                  height=" + strHeight + "       wmode='transparent'           name=' helloWorld '                   flashvars='link=" + strLink +"'                   align='middle'                   allowScriptAccess='sameDomain'                   type='application/x-shockwave-flash'                   pluginspage='http://www.macromedia.com/go/getflashplayer' />";
            }
			else if (AdMode == 1)
			{
				d.innerHTML = strImgUrl;				
				CreateScriptElement(strImgUrl);				
			}
		}
		
        function CreateScriptElement(str)
        {
            var ScriptFragment = '<script[^>]*>([\\S\\s]*?)<\/script>';            
            var matchAll = new RegExp(ScriptFragment, 'img');            
            var scriptLink = str.match(matchAll)[0]; 			
            if (scriptLink != "")
            {               
                document.write(scriptLink);
            }
            	
        }      
        
        
        function fixFlashByID(id , strLink)
        {
            if(document.all)
            {
	            var objects = document.getElementById(id);
	            var theParams = objects.getElementsByTagName("param");
	            var theParamsLength = theParams.length;

	            strLink = "link="+ strLink;
	            var theOuterHTML = objects.outerHTML;    
	            var re = '<PARAM NAME="FlashVars" VALUE="">';
	            theOuterHTML = theOuterHTML.replace(re,"<param name='FlashVars' value='" + strLink + "'>");    
 	            objects.outerHTML = theOuterHTML;
 	        }
        }

        function ShowButtonOpen(strDiv, tdBanner, strDiv_OpenClose)
        {
            /* Neu co banner Expand thi moi hien thi 2 nut Mở và Đóng*/
			var d = document.getElementById(strDiv_OpenClose);
            var pos_x = -1; var pos_y = -1;
            if(arPos[strDiv] != null && arPos[strDiv].objFrame.length > 0 && d != null)
            {
                pos_x = findPosX(tdBanner);
			    pos_y = findPosY(tdBanner);
            }
            
            if(pos_x > -1 && pos_y > -1)
            {
                switch(strDiv)
			    {
			        case "div_adv_center_banner_1_468x60":
			            d.style.left = (pos_x-5 + 380) + "px";
			            d.style.top =  pos_y + "px";
			            break;
			        case "div_adv_center_banner_2_468x60":
			             d.style.left = (pos_x + 35 + 380) + "px";
			             d.style.top =  pos_y + "px";
			             break;
			        case "div_adv_top_banner_1_468x90":
			             var td_Banner = document.getElementById(tdBanner);
			             if(tdBanner == "tdExBanner1")
			             {
			                 if(td_Banner.width == "980")
			                    d.style.left = (pos_x + 880) + "px";
			                 else
			                    d.style.left = (pos_x-5 + 380) + "px";
			                 d.style.top =  "85px";
			             }
			             else
			             {
			                d.style.left = (pos_x + 35 + 380) + "px";
			                d.style.top =  "85px";
			             }
			             break;
			        case "div_adv_top_banner_2_468x90":
			             d.style.left = (pos_x + 35 + 380) + "px";
			             d.style.top =  "85px";
			             break;
			        case "div_adv_top_banner_728x90":
			             d.style.left = (pos_x + 880) + "px";
			             d.style.top =  "85px";
			            break;
			    }
            }
        }
        
        function HideButtonOpen(strDiv_OpenClose)
        {
            var d = document.getElementById(strDiv_OpenClose);
            if(d != null)
            {
                d.style.left = "-100px";
                d.style.top = "-100px";
            }
        }
        /*
        function ShowTopBanner428Or980()
        {
            //Ưu tiên 2 top banner 468x90 trước  
            if((arPos["div_adv_top_banner_1_468x90"] != null && arPos["div_adv_top_banner_1_468x90"].objFrame.length > 0) || (arPos["div_adv_top_banner_2_468x90"] != null && arPos["div_adv_top_banner_2_468x90"].objFrame.length > 0))
            {
                document.getElementById("tdExBanner_980").style.display = "none";
            }
            else
            {
                if(arPos["div_adv_top_banner_728x90"] != null && arPos["div_adv_top_banner_728x90"].objFrame.length > 0)
                {
                    document.getElementById("tdExBanner1").style.display = "none";
                    document.getElementById("tdExBanner2").style.display = "none";
                }
                else
                {
                    // Nếu cả Top banner 1A và 1B đều không có banner thì hiển thị banner mặc định  
                    document.getElementById("tdExBanner_980").style.display = "none";
                    ShowDefaultTopBanner("div_adv_top_banner_1_468x90");
                    ShowDefaultTopBanner("div_adv_top_banner_2_468x90");
                }
            }
            
            //Neu banner 1B có banner ma` 1A không có, thì hiển thị mặc định ở 1A
            if(arPos["div_adv_top_banner_1_468x90"] == null && arPos["div_adv_top_banner_2_468x90"] != null && arPos["div_adv_top_banner_2_468x90"].objFrame.length > 0)
                ShowDefaultTopBanner("div_adv_top_banner_1_468x90");
        }
        */
        function ShowDefaultTopBanner(strDiv)
        {
             var d = document.getElementById(strDiv);
             d.style.display = "";
             d.innerHTML = '<embed height="90" width="468" src="/App_Themes/Default/images/admicro_468x90.swf"/>';
             document.getElementById("tdExBanner2").style.display = "";
             document.getElementById("tdExBanner2").width = "512px";
		     document.getElementById("tdExBanner1").width = "468px";
		     
        }
        
        function RandomBanner()
        {
            /* Random Mini Banner 125x125 */
            var arrG7 = getIndexRandom(6);
            var tempArr = new Array();
            var j=0;
            for(var i=1;i<=6;i++)
            {
                if(arPos["div_adv_mini_middle_banner_" + (arrG7[i-1] + 1) + "_125x125"] != null)
                {
                    tempArr[j] = arPos["div_adv_mini_middle_banner_" + (arrG7[i-1] + 1) + "_125x125"].objFrame;
                    j ++;
                }
            }
            
            j = 0;
            for(var i=1;i<=6;i++)
            {
                if(arPos["div_adv_mini_middle_banner_"+i+"_125x125"] != null)
                {
                    arPos["div_adv_mini_middle_banner_"+i+"_125x125"].objFrame = tempArr[j];
                    j ++;
                }   
            }
            
            /* Random Right Hight Banner (2,3) 160x600 */
            if(arPos["div_adv_right_hight_banner_2_160x600"] != null && arPos["div_adv_right_hight_banner_3_160x600"] != null)
            {
                var arrH2 = getIndexRandom(2);
                tempArr = new Array();
                tempArr[0] = arPos["div_adv_right_hight_banner_"+ (arrH2[0] + 2) +"_160x600"].frame;
                tempArr[1] = arPos["div_adv_right_hight_banner_"+ (arrH2[1] + 2) +"_160x600"].frame;
                arPos["div_adv_right_hight_banner_3_160x600"].frame = tempArr[1];
                arPos["div_adv_right_hight_banner_2_160x600"].frame = tempArr[2];
            }
        }
         
        RandomBanner();
        //ShowTopBanner428Or980();
        ShowBanner();