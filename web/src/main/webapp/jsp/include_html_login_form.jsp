<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    <%@page import="java.util.Properties"%>
    <%@page import="com.nttuyen.web.core.SystemLoader"%>
    <%
    final Properties cfgLoginForm = SystemLoader.systemConfig();
    %>
												<form action="<%=cfgLoginForm.getProperty("site.url")%>/a/auth/login" method="post">
													<table>
														<tr class = "user-area-table">
															<td>
																<label for="username">Tên đăng nhập:</label>
															</td>
															<td>
																<input id="username" name="<%=cfgLoginForm.getProperty("user.username")%>" type="text" />
															</td>
														</tr>
														<tr class = "user-area-table">
															<td>
																<label for="password">Mật khẩu:</label>
															</td>
															<td>
																<input id="password" name="<%=cfgLoginForm.getProperty("user.password")%>" type="password" />
															</td>
														</tr>
														<tr class = "user-area-table">
															<td>
															</td>
															<td>
																<input type="submit" value="submit" />
																<input type="reset" value="reset"/>
															</td>
														</tr>
														<tr>
															<td></td>
															<td>
																<a href="#">Quên mật khẩu</a>
																<br/>
																<a href="<%=cfgLoginForm.getProperty("site.url")%>/a/auth/register" >Đăng ký</a>
															</td>
														</tr>
													</table>
												</form>