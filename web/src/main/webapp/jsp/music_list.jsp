<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@include file="include_html_header.jsp" %>
<%@page import="java.util.Iterator"%>
<%@page import="com.nttuyen.thesis.model.Music"%>
<%!
int currentPage = 0;
%>
<%
Iterator<Music> musics = (Iterator<Music>)request.getAttribute(cfg.getProperty("music.list"));
String pages = (String)request.getAttribute(cfg.getProperty("request.page"));
try {
	currentPage = Integer.parseInt(pages);
} catch(Exception e) {
	currentPage = 0;
}
if(currentPage < 1){
	currentPage = 1;
}
%>
										
<%@page import="com.nttuyen.thesis.util.RateUtil"%>
<%@page import="com.nttuyen.recommendation.Recommender"%><div style="margin: 0pt auto; width: 655px; padding-top: 15px;">
											<%
											while(musics.hasNext()) {
												Music music = musics.next();
												%>
												<div id="divItemMusic">
												<ul id="divrow1">
													<li id="divcol1">
														<ul style="list-style-type: none; padding-bottom: 5px;" class="clearfix">
															<li style="float: left; width: 55px;">
																<div id="divImagePlay" class="divbutton_play" alt="14" title="Click vào đây để nghe thử bài này." style="cursor: pointer;"></div>
															</li>
															<li style="float: left; width: 425px; padding-top: 3px;">
																<a class="songtitle" title="<%=music.getName()%>" target="_blank" href="#">
																	<%=music.getName() %>
																</a><br>
																64Kbps,&nbsp;0.95 MB,&nbsp;00:02:01,&nbsp;mp3
															</li>
															<li style="float: left; width: 144px;">
																<ul style="list-style-type: none;">
																	<li class="clearfix">
																		<div style="width: 96px; float: right;" class="clearfix">
																			<ul id="ulactionsearchitem" class="clearfix">
																				<li id="li6"><a title="Lời bài hát liên quan" href="http://mp3.baamboo.com/s/3/1/TWlzcyB5b3UgKERlbW8p/Miss-you-Demo-" target="_blank" class="classli6notactive"><div id="div6"></div></a></li>
																				<li id="li1"><a class="classli1notactive" title="Tìm video liên quan" target="_blank" href="http://video.baamboo.com/search/5/video/1/TWlzcyB5b3UgKERlbW8p/phim-video-clip--Miss-you-Demo-.html"><div id="div1"></div></a></li>
																				
																				<li id="li4"><a href="http://mp3.baamboo.com/modules/FrameMusicMessage.aspx?height=305&amp;width=390&amp;id=2017354" class="thickbox classli4notactive" title="Mã nhúng - Lúc Mới Yêu"><div id="div4"></div></a></li>
																				<li id="li3">
																					<a href="http://mp3.baamboo.com/Modules/ReportFrame.aspx?id=2017354&amp;choice=1&amp;height=445&amp;width=500" class="thickbox classli3notactive" title="Thông báo và góp ý bài hát - Lúc Mới Yêu">
																						<div id="div3" title="Thông báo cho Baamboo về bài hát này, và góp ý."></div>
																					</a>
																				</li>
																			</ul>
																		</div>
																	</li>
																	<li>
																		<div style="float: right;"><a href="<%=SITE_URL%>/file/<%=music.getId()%>_<%=music.getMedia()%>?download=download"><div id="div2linkfile" border="0"></div></a></div>
																	</li>
																</ul>
															</li>
														</ul>
													</li>
													<li id="divcol2">
														<ul style="list-style-type: none; padding-bottom: 5px;" class="clearfix">
															<li style="float: left; width: 45px;">Nghệ sỹ:</li>
															<li style="float: left; width: 110px;">
																 <a href="#" title="tim theo ca si">
																	<%
																	if("".equals(music.getSinger()) || music.getSinger() == null) {
                                                                        //out.print("Đang cập nhật");
                                                                        %>Đang cập nhật<%
																	} else {
																		//out.println(music.getSinger());
                                                                        %><%=music.getSinger()%><%
																	}
																	%>
																</a>
															</li>
															<li style="float: left; width: 40px;">Album:</li>
															<li style="float: left; width: 420px;">
																<a href="" title="Tìm album:">
																	<%
																	if("".equals(music.getAlbum()) || music.getAlbum() == null) {
																		//out.print("Đang cập nhật");
                                                                        %>Đang cập nhật<%
																	} else {
																		//out.println(music.getAlbum());
                                                                        %><%=music.getAlbum()%><%
																	}
																	%>
																</a>
															</li>
														</ul>
													</li>
													<li id="divcol3">
														<ul style="list-style-type: none; padding-bottom: 5px;" class="clearfix">
															<li style="float: left; width: 45px;">Thể loại:</li>
															<li style="float: left; width: 110px;">
																	<span class="NoGennes">
																		<%
																	if("".equals(music.getType()) || music.getType() == null) {
                                                                        //out.print("Đang cập nhật");
                                                                        %>Đang cập nhật<%
																	} else {
																		//out.println(music.getType());
                                                                        %><%=music.getType()%><%
																	}
																	%>
																	</span>
															</li>
															<li style="float: left; width: 355px;">
																	
															</li>
															<li style="float: left; width: 117px;">
																
															</li>
														</ul>
													</li>
													<li id="divcol4">
														<ul style="list-style-type: none; padding-bottom: 5px;" class="clearfix">
															<li style="float: left; width: 380px;vertical-align: bottom;height: 55px;">
																<br/>
																<div id = "music_player_<%=music.getId()%>"></div>
																<script type="text/javascript">
																AudioPlayer.embed("music_player_<%=music.getId()%>", {soundFile: "<%=SITE_URL%>/file/<%=music.getId()%>_<%=music.getMedia()%>"});
																</script>
															</li>
															<li style="float: left; width: 147px;">
																<%
																byte userRate = 0;
																if(Auth.isLogin(request)) {
																	userRate = RateUtil.getRate(Auth.user(request), music.getId());
																}
																float rate = 0;
																if(userRate != 0) {
																	rate = userRate;
																} else {
																	rate = music.getRate();
																}
																%>
																<div id = "rate_<%=music.getId()%>" class="rating"></div>
																<script type="text/javascript">
																jQuery('#rate_<%=music.getId()%>').rating('<%=SITE_URL%>/a/rate/<%=music.getId()%>', {maxvalue:5, increment:.5, curvalue:<%=rate%>});
																</script>
															</li>
															<li style="float: left; width: 90px; padding-top: 18px; padding-right: 0; margin-right: 0;">
																<%
																float ratePredict = 0;
																if(Auth.isLogin(request) && userRate == 0) {
																	ratePredict = Recommender.predictRate(Auth.user(request), music.getId());
																}
																if(ratePredict > 0) {
																%>
																	<span style="color: green;">(predict: <b><%=ratePredict%></b>)</span>
																<%
																}
																%>
															</li>
														</ul>
													</li>
													<li style="width: 640px; text-align: left;">
														<div style="width: 100%;" class="clearfix">
															<div id="divAdvertise_14" class="classadvertise">
															<%
															if(Auth.hasPermission(request, Auth.EDIT_PERMISSION)) {
																%>
																<a href="<%=cfg.getProperty("site.url")%>/a/music/edit?id=<%=music.getId()%>">edit</a>  /  <a href="<%=cfg.getProperty("site.url")%>/a/music/remove?id=<%=music.getId()%>">delete</a>
																<%
															}
															%>
															</div>
															<div id="divplayercontrol_14" style="margin: 0pt auto; display: inline; float: left;"></div>
														</div>
													</li>
												</ul>
											</div>
												<%
											}
											%>
										</div>
									</div>
									<div id="li2">
										<div style="margin: 0pt auto; width: 450px; padding-top: 7px; padding-bottom: 2px;" class="clearfix">
											<div id="ctl00_ContentPlaceHolder1_pnlPaging">
												<center>
													<div id="ctl00_ContentPlaceHolder1_ucPaging1_pnlPaging" style="font-weight: bold;">		
														&nbsp;&nbsp;
														<%if(currentPage > 1){
															%>
															<a id="ctl00_ContentPlaceHolder1_ucPaging1_hplLnkNext" style="font-weight: bold;" class="firstlastpager" href="?<%=cfg.getProperty("request.page")%>=<%=(currentPage - 1)%>"> << Previous</a>
															|
															<%
														}
														%>
														<a id="ctl00_ContentPlaceHolder1_ucPaging1_hplLnkNext" style="font-weight: bold;" class="firstlastpager" href="?<%=cfg.getProperty("request.page")%>=<%=(currentPage + 1)%>">Next >></a>
													</div>
												</center>
											</div>
										</div>
									</div>
								</div>
								<div style="margin: 0pt auto; width: 640px; padding-top: 10px; padding-bottom: 40px;" class="clearfix">
									   
								</div>
<%@include file="include_html_footer.jsp"%>