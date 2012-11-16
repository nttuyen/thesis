<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    
<%
Properties cfgFooter = (Properties)request.getAttribute("SYSTEM_CONFIG");
%>
							</li>
						</ul>
					</li>
				 	<li id="liRightContent">
						<div style="margin: 0pt auto; width: 300px; padding-top: 34px;">
							<div style="padding-bottom: 5px;">
								<div class="clearfix" style="z-index: 9999;">
									<div id="divContainerRight">
										<div id="divContainerRightHead" class="clearfix">
											<div style="line-height:28px;color:#ffffff;padding-left:30px;font-weight:900;font-size:12px;">USER
											</div>
											<div class = "user-area">
												<%
												if(Auth.isLogin(request)) {
													%>
													<%@include file="include_html_user_loged.jsp" %>
													<%
												} else {
													%>
													<%@include file="include_html_login_form.jsp" %>
													<%
												}
												%>
											</div>
											<div id="ctl00_ContentPlaceHolder1_ucRelateLyricOnSearch1_repeatLyric_ctl04_divButtonAlbumNext" style="width:270px;text-align:right;margin:0 auto;cursor:pointer;padding-top:4px;font-size:10px;">
												  
											</div>
										</div>
										<div id="divContainerRightFoot"></div>
									</div>
									
									
									<div id="divContainerRight" style="border: none; background-image: none;">
										&nbsp;
									</div>
									
									<div id="divContainerRight">
										<script type="text/javascript">
											AC_FL_RunContent( 'codebase','http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,28,0','width','250','height','350','align','left','src','<%=cfgFooter.getProperty("site.url")%>/public/flash/singerhot','scale','exactfit','quality','high','pluginspage','http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash','bgcolor','#4DAF03','movie','<%=cfgFooter.getProperty("site.url")%>/public/flash/singerhot' ); //end AC code
									    </script>
									    <noscript>
									    <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,28,0" width="300" height="250" align="left">
									      <param name="movie" value="<%=cfgFooter.getProperty("site.url")%>/public/flash/singerhot.swf" />
									      <param name="quality" value="high" />
									      <param name="BGCOLOR" value="#4DAF03" />
									      <param name="SCALE" value="exactfit" />
									      <embed src="<%=cfgFooter.getProperty("site.url")%>/public/flash/singerhot.swf" width="816" height="192" align="left" scale="exactfit" quality="high" pluginspage="http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash" type="application/x-shockwave-flash" bgcolor="#4DAF03"></embed>
									    </object>
									    </noscript>

									</div>
									
									<div id="divContainerRight" style="border: none; background-image: none;">
										&nbsp;
									</div>
									
									<div id="divContainerRight" style="margin: auto;">
										<script type="text/javascript">
											AC_FL_RunContent( 'codebase','http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,28,0','width','250','height','350','align','left','src','<%=cfgFooter.getProperty("site.url")%>/public/flash/hd_dangky','scale','exactfit','quality','high','pluginspage','http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash','bgcolor','#4DAF03','movie','<%=cfgFooter.getProperty("site.url")%>/public/flash/hd_dangky' ); //end AC code
									    </script>
									    <noscript>
									    <object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,28,0" width="300" height="250" align="left">
									      <param name="movie" value="<%=cfgFooter.getProperty("site.url")%>/public/flash/hd_dangky.swf" />
									      <param name="quality" value="high" />
									      <param name="BGCOLOR" value="#4DAF03" />
									      <param name="SCALE" value="exactfit" />
									      <embed src="<%=cfgFooter.getProperty("site.url")%>/public/flash/hd_dangky.swf" width="816" height="192" align="left" scale="exactfit" quality="high" pluginspage="http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash" type="application/x-shockwave-flash" bgcolor="#4DAF03"></embed>
									    </object>
									    </noscript>

									</div>
									
								</div>
							</div>
							
						</div>
					</li>
				</ul>
				<div style="clear: both;">
				</div>             
				<div id="divTextSearchFooter">
					<form action="<%=cfgFooter.getProperty("site.url")%>/a/search" method="get">
						<ul>
							<li style="width: 32px; height: 27px;">
								<div style="vertical-align: bottom; padding-top: 1px; padding-left: 2px;">
									<img src="<%=cfgFooter.getProperty("site.url")%>/public/img/E.gif" id="btnVietkey2" language="javascript" style="cursor: pointer;" align="absMiddle" border="0" height="24" width="32">
								</div>
							</li>
							<li style="width: 245px; text-align: left; height: 27px;">
								<div style="vertical-align: bottom; padding-top: 5px;">
								<input name="key" value="" id="ctl00_ucBoxSearchFooter1_txtSearchB" onkeypress="return clickButton(event,'ctl00_ucBoxSearchFooter1_btnSearchFooter')" style="border: 0px none Transparent; color: Black; font-family: Arial; font-size: 11px; font-weight: bold; width: 245px;" type="text">
								</div>
							</li>
							<li style="vertical-align: bottom; padding-top: 4px; padding-right: 3px;">
								<select name="type" id="ctl00_ucBoxSearchFooter1_dropSelectOptionSearch" class="testdropdown" style="width: 84px;">
									<option selected="selected" value="name">Tên bài hát</option>
									<option value="author">Tác giả</option>
									<option value="singer">Ca sĩ</option>
									<option value="type">Thể loại</option>
								</select>
							</li>
							<li class="libtsearchfooter">
								<input name="ctl00$ucBoxSearchFooter1$btnSearchFooter" value="" id="ctl00_ucBoxSearchFooter1_btnSearchFooter" class="btnSearchBaambooFooter" type="submit">
							</li>
						</ul>
					</form>
					<div id="divOptionsFooter" style="clear: both;"></div>
				</div>
			</div>
		</div>
	</div>
</div>
<div id="footer" style="clear: both;" class="clearfix">           
	<div style="background: transparent url(/styles/images/background_footer.jpg) no-repeat scroll left center; width: 990px; height: 137px; clear: both; -moz-background-clip: border; -moz-background-origin: padding; -moz-background-inline-policy: continuous;">
		<div style="margin: 0pt auto; height: 30px; text-align: center; vertical-align: middle;">
			<a onclick="bb_setHomepage(this);" href="#" class="linkfooter">Đặt làm trang chủ</a>&nbsp;|&nbsp;
			<a class="linkfooter" onclick="javascript:bb_bookmarksite('Baamboo Search', 'http://BaamBoo.com')" href="#">Thêm vào danh sách web site yêu thích</a>&nbsp;|&nbsp;
			<a class="linkfooter" href="http://baamboo.com/ad_baamboo.aspx">Vị trí quảng cáo</a>&nbsp;|&nbsp;
			<a class="linkfooter" href="http://dev.baamboo.com/">Blog của nhóm phát triển</a> &nbsp;|&nbsp;
			<a class="linkfooter" href="http://baamboo.com/terms_of_service.aspx">Điều kiện sử dụng</a>
		</div>
		<div style="background: transparent url(/styles/images/background_footer.jpg) no-repeat scroll left center; width: 990px; height: 137px; clear: both; -moz-background-clip: border; -moz-background-origin: padding; -moz-background-inline-policy: continuous;text-align: right;">
			all copyleft from <a href="http://baamboo.com" target="_blank">baamboo.com</a>
		</div>
	</div>
</div>
</div>
</div>
</div>
</div>
&nbsp;

</body>

<%@page import="java.util.Properties"%>
<%@page import="com.nttuyen.web.core.SystemLoader"%>
<%@page import="com.nttuyen.thesis.util.Auth"%></html>