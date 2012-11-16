<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    
<%@ page contentType="text/html; charset=UTF-8" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">


<%@page import="java.util.Properties"%>
<%@page import="com.nttuyen.web.core.SystemLoader"%><html xmlns="http://www.w3.org/1999/xhtml">

<%!
final Properties cfg = SystemLoader.systemConfig();
final String SITE_URL = cfg.getProperty("site.url");
%>
<%
request.setAttribute("SYSTEM_CONFIG", cfg);
%>

<head>
<title>fun-ring</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> 
<script language="javascript" type="text/javascript" src="<%=SITE_URL%>/public/js/adv_global.js"></script>
<script type="text/javascript" src="<%=SITE_URL%>/public/js/ScriptHandler.js"></script>
<script type="text/javascript" src="<%=SITE_URL%>/public/js/jquery-ui-1.js"></script>
<link type="text/css" rel="stylesheet" href="<%=SITE_URL%>/public/css/CssHandler.css">
<!--[if lte IE 6]>
	<style type="text/css">
		.libtsearchfooter
		{
			width:100px;height:25px;padding-top:1px;padding-left:4px;
		} 
	</style>    
<![endif]-->
<!--[if gte IE 7.0]
	<style type="text/css">
		.clearfix {	display: inline-block;clear:both;}
	</style>
<![endif]-->

<script src="http://www.google.com/jsapi"></script>
<script type="text/javascript">
google.load("jquery", "1.3.2");
</script>

<script type="text/javascript" src="<%=SITE_URL%>/public/js/jquery-1.3.2.js"></script>
<script type="text/javascript" src="<%=SITE_URL%>/public/js/AC_RunActiveContent.js"></script>
<script type="text/javascript" src="<%=SITE_URL%>/public/js/ScriptHandler.js"></script>
<script type="text/javascript" src="<%=SITE_URL%>/public/star_rating/jquery.rating.js"></script>
<script type="text/javascript" src="<%=SITE_URL%>/public/audio_player/audio-player.js"></script>
<script type="text/javascript" src="<%=SITE_URL%>/public/js/ajaxupload.js"></script>
<script type="text/javascript" src="<%=SITE_URL%>/public/js/home.js"></script>
<link type="text/css" rel="stylesheet" href="<%=SITE_URL%>/public/star_rating/rating.css">

<script type="text/javascript">
AudioPlayer.setup("<%=SITE_URL%>/public/audio_player/player.swf", {  
	width: 330,
	loop: "yes"
});
google.setOnLoadCallback(onLoad);
</script>

</head>
<body onload="onLoad();loadimagesEV('btnVietkey3','btnVietkey4');">
<!-- <form name="aspnetForm" method="post" action="#" id="aspnetForm"> -->
<div>
	
</div>
<div id="content-wrapper" class="clearfix">
<div id="main-wrapper-left">
<div id="main-wrapper-right">
<div id="wrapper">

<div id="header">                                
	<ul id="ulHeader">
    	<li id="logo">
        	<div id="divlogo">
	        </div>
    	</li>
    	<li id="boxsearch">
        	<div style="width: 750px;">
			<script type="text/javascript">
                setMethod(-1);
            </script>
				<div id="divBoxSearch" style="position: absolute;" class="clearfix">
    				<div id="divTab" class="clearfix">
                        <ul id="uldivtab">
                            <li><a id="ctl00_UcHeader1_UcBoxSearchHeader1_hplMp3Tab" class="tabActived" href="#">MP3</a></li>
                            <li><a id="ctl00_UcHeader1_UcBoxSearchHeader1_hplVideoTab" class="tabNotActive" href="#">VIDEO</a></li>
                        </ul>
    				</div>
    				<div id="divTextSearch" class="clearfix">
    					<form action="<%=cfg.getProperty("site.url")%>/a/search" method="get">
	                        <ul class="clearfix">
	                            <li>
	                                <div style="padding-top: 4px;">
	                                        <img id="btnVietkey1" src="<%=SITE_URL%>/public/img/E.gif" language="javascript" style="cursor: pointer;" align="absMiddle" border="0" height="24" width="32">
	                                </div>
	                            </li>
	                            <li>
	                                <div style="vertical-align: bottom; padding-top: 8px;">
	                                <input name="key" value="" id="search"  style="border: 0px none Transparent; width: 250px; height: 20px; font-weight: bold; font-size: 11px; font-family: Arial; color: Black;" type="text">
	                                </div>
	                            </li>
	                            <li style="vertical-align: bottom; padding-top: 6px; padding-right: 3px;">
	                                <select name="type" id="search_type" class="testdropdown" style="width: 84px;">
										<option selected="selected" value="name">Tên bài hát</option>
									<option value="author">Tác giả</option>
									<option value="singer">Ca sĩ</option>
									<option value="type">Thể loại</option>
									</select>                
	                            </li>
	                            <li style="width: 77px; height: 27px; padding-top: 4px;">
	                                <input id="ctl00_UcHeader1_UcBoxSearchHeader1_btnSearch" title="Search Nhạc Việt Nam" class="btnSearchBaambooControl" type="submit" value=" ">
	                            </li>
	                        </ul>
                        </form>
                    </div>
    				<div id="divExamples" class="clearfix">
        				<ul style="list-style-type: none;" class="clearfix">
            				<li style="float: left;">
                 				<table id="ctl00_UcHeader1_UcBoxSearchHeader1_ralMp3" class="search_choice" style="width: 215px;" border="0">
									<tbody>
                                    	<tr>
											<td>
                                            	<input id="ctl00_UcHeader1_UcBoxSearchHeader1_ralMp3_0" name="ctl00$UcHeader1$UcBoxSearchHeader1$ralMp3" value="1" checked="checked" onclick="builtEx('mp3',this.value);" type="radio">
                                            	<label for="ctl00_UcHeader1_UcBoxSearchHeader1_ralMp3_0">&nbsp;Việt Nam</label>
                                            </td>
                                            <td>
                                            	<input id="ctl00_UcHeader1_UcBoxSearchHeader1_ralMp3_1" name="ctl00$UcHeader1$UcBoxSearchHeader1$ralMp3" value="3" onclick="builtEx('mp3',this.value);" type="radio">
                                                <label for="ctl00_UcHeader1_UcBoxSearchHeader1_ralMp3_1">&nbsp;Lời bài hát</label>
                                            </td>
										</tr>
									</tbody>
								</table>
							</li>
            				<li style="float: left; padding-left: 140px; height: 20px;">
                				<div id="ctl00_UcHeader1_UcBoxSearchHeader1_pnlAdvandce">
	
                					<center>
                                        <div id="divShowSearchAdvance" class="ExampleTitle" style="margin-top: 5px; cursor: pointer; width: 95px; text-align: center;">
                                            Nâng cao
                                        </div>
                                    </center>
								</div>
            				</li>
						</ul>
         				<ul class="clearfix">
            				<li class="ExampleTitle" id="liExample">
                				Ví dụ:
            				</li>
            				<li id="li1">
                				<div id="divEx1" class="divExActive">
        							<a href="#" class="Example">Thùy Chi</a>,
    
        							<a href="#" class="Example">M4U</a>,
    
        							<a href="#" class="Example">Gió đông ấm áp</a>,
    
        							<a href="#" class="Example">Tình yêu chắp cánh</a>,
    
        							<a href="#" class="Example">Try to up</a>,
    
                                    <a href="#" class="Example">Vì ta cần nhau</a>,
                                
                                    <a href="#" class="Example">Em không thể quên</a>,
                                
                                    <a href="#" class="Example">Vụt mất</a>,
                                
                                    <a href="#" class="Example">Chiếc lá cô đơn</a>,
								</div>
            				</li>
         				</ul>
    				</div>
    				<script>builtEx('mp3', 1);</script>
				</div>
        	</div>
        </li>
	</ul>
</div>
<div id="content">
	<div id="content-topright">
		<div id="content-bottomleft">
			<div id="content-bottomright" class="clearfix">                           
				<div id="divTopMp3">
    				<ul id="ulContent" class="clearfix">
        				<li style="width: 25%;">
                			<a id="ctl00_ucLinkTop1_hplTop1" title="Top 20 ca khúc trong ngày" class="linkTop" href="<%=SITE_URL%>/a/search/newest">Nhạc chuông mới nhất</a>
        				</li>
        				<li style="width: 25%;">
                			<a id="ctl00_ucLinkTop1_hpTopCateMp3Text" title="Top thể loại" class="linkTop" href="<%=SITE_URL%>/a/search/hottest">Nhạc chuông hot nhất</a>
        				</li>
        				<li style="width: 25%; text-align: right;">
                			<a id="ctl00_ucLinkTop1_hplTop3" title="Nghệ sỹ tìm nhiều nhất" class="linkTop" href="<%=SITE_URL%>/a/search/recommended">Có thể bạn thích</a>
        				</li>
        				<li style="width: 25%; text-align: right;">
                			<a id="ctl00_ucLinkTop1_hplTop4" title="Top karaoke" class="linkTop" href="#" ></a>
        				</li>
    				</ul>
 				</div>
 				<ul id="contentresultmp3">
    				<li id="liLeftContent">
        				<ul id="ulcontentmp3">
            				<li class="search_title_results" style="padding-top: 10px; padding-bottom: 10px;">
                				<center>
                                	<p style="padding: 8px;"></p>
                                </center>
            				</li>
            				<li>
                    			<div id="ulItemSongMp3">
                        			<div id="li1" class="clearfix">