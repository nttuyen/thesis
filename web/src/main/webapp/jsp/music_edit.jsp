<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@include file="include_html_header.jsp" %>
<%@page import="com.nttuyen.thesis.model.Music"%>
<%
Music music = (Music)request.getAttribute(cfg.getProperty("request.music.edit"));
if(music == null) {
	music = new Music();
}
%>
										<div style="margin: 0pt auto; width: 655px; padding-top: 15px;">
											<div class = "register_error">
												<%
												String[] errors = (String[])request.getAttribute(cfg.getProperty("music.add.error"));
												if(errors != null) {
													for(String error : errors) {
														%>
														<p><%=error%></p>
														<%
													}
												}
												%>
											</div>
                                            <div id="divItemMusic" class="divItemMusic_14">
												<form action="<%=SITE_URL%>/a/music/edit" method="post">
														<fieldset style="margin-left: 30pt; padding-left: 10pt;">
															<legend>Thông tin bản nhạc</legend>
															<div style="margin-left: 30pt;">
																<table>
																	<tr>
																		<td class = "register-left-column">
																			Tên bản nhạc:
																		</td>
																		<td>
																			<input type="hidden" name=""/>
																			<input type = "text" name="<%=cfg.getProperty("music.name")%>" value="<%=music.getName()%>" class="input-text"/>
																		</td>
																	</tr>
																	<tr>
																		<td class = "register-left-column">
																			Thể loại:
																		</td>
																		<td>
																			<input type="text" name="<%=cfg.getProperty("music.type")%>" value="<%=music.getType() %>" class="input-text"/>
																		</td>
																	</tr>
																	<tr>
																		<td class = "register-left-column">
																			Tác giả:
																		</td>
																		<td>
																			<input type="text" name="<%=cfg.getProperty("music.author")%>" value="<%=music.getAuthor() %>" class="input-text"/>
																		</td>
																	</tr>
																	<tr>
																		<td class = "register-left-column">
																			Ca sĩ:
																		</td>
																		<td>
																			<input type = "text" name="<%=cfg.getProperty("music.singer")%>" value="<%=music.getSinger() %>" class="input-text"/>
																		</td>
																	</tr>
																	<tr>
																		<td class = "register-left-column">
																			Album:
																		</td>
																		<td>
																			<input type = "text" name="<%=cfg.getProperty("music.album")%>" value="<%=music.getAlbum() %>" class="input-text"/>
																		</td>
																	</tr>
																	<tr>
																		<td class = "register-left-column">
																			File nhạc:
																		</td>
																		<td>
																			<input id="music_media" type = "text" name="<%=cfg.getProperty("music.media")%>" value="<%=music.getMedia() %>" readonly="readonly" class="input-text"/>
																			&nbsp;&nbsp;&nbsp;&nbsp;
																			<input id = "button_upload" type = "button" name="music.upload" value="upload file" style="width: 100px;"/>
																		</td>
																	</tr>
																	<tr>
																		<td colspan="2">
																			&nbsp;
																			<br/>
																		</td>
																	</tr>
																	<tr>
																		<td class = "register-left-column" valign="top">
																			Lời bài hát:
																		</td>
																		<td>
																			<textarea name="lyrics" rows="13" cols="50" class="input-text" style="width: 300pt;">
																				<%=music.getLyrics() %>
																			</textarea>
																		</td>
																	</tr>
																	<tr>
																		<td colspan="2">
																			&nbsp;
																		</td>
																	</tr>
																</table>
															</div>
														</fieldset>
														<br/>
														<br/>
														<div style="text-align: center;">
															<input type="hidden" name="id" value="<%=music.getId()%>" />
															<input type="submit" />
															<input type="reset"/>
														</div>
														<br/>
														<br/>
												</form>
											</div>
										</div>
									</div>
									<div id="li2">
										<div style="margin: 0pt auto; width: 450px; padding-top: 7px; padding-bottom: 2px;" class="clearfix">
											<div id="ctl00_ContentPlaceHolder1_pnlPaging">
												<center>
													<div id="ctl00_ContentPlaceHolder1_ucPaging1_pnlPaging">		
														&nbsp;&nbsp;
														
													</div>
												</center>
											</div>
										</div>
									</div>
								</div>
								<div style="margin: 0pt auto; width: 640px; padding-top: 10px; padding-bottom: 40px;" class="clearfix">
									   
								</div>
								
<%@include file="include_html_footer.jsp" %>