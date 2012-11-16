<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    <%@page import="java.util.Properties"%>
    <%
    final Properties cfgUserLogged = (Properties)request.getAttribute("SYSTEM_CONFIG");
    %>
												
												
<%@page import="com.nttuyen.thesis.util.Auth"%><table width="100%">
													<tr class = "user-area-table">
														<td>
															<label for="username">Xin chào: </label>
														</td>
														<td>
															<a href="<%=cfgUserLogged.getProperty("site.url")%>/a/auth/profile"><span style="color: red;font-weight: bold;"><%=(String)session.getAttribute(cfgUserLogged.getProperty("session.user.username"))%></span></a>&nbsp;&nbsp;&nbsp;<a href="<%=cfgUserLogged.getProperty("site.url")%>/a/auth/logout">[logout]</a>
														</td>
													</tr>
													<tr class = "user-area-table">
														<td colspan="2" align="center">
															<span style="font-size: 8pt;text-align: right;">(Lần đăng nhập cuối 10/12/2009 lúc 9:43 AM)</span>
														</td>
													</tr>
													<tr class = "user-area-table">
														<td colspan="2">
															<p>Bạn có <a href="#" style="text-decoration: none;"><span style="color: red;">0</span></a> tin nhắn mới</p>
															
															<p><a href="<%=cfgUserLogged.getProperty("site.url")%>/a/auth/profile"><span style="font-size: 10pt;">Thông tin tài khoản</span></a></p>
															<p><a href="<%=cfgUserLogged.getProperty("site.url")%>/a/auth/profile"><span style="font-size: 10pt;">Thay đổi mật khẩu</span></a></p>
														</td>
													</tr>
												</table>