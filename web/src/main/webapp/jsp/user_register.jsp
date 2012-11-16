<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ include file="include_html_header.jsp" %>
<%@page import="com.nttuyen.thesis.model.User"%>
<%
User user = (User)request.getAttribute(cfg.getProperty("request.user.edit"));
if(user == null) {
	user = new User();
}
%>



<%@page import="java.util.Date"%><div style="margin: 0pt auto; width: 655px; padding-top: 15px;">
	<div class = "register_error">
		<%
		String[] errors = (String[])request.getAttribute(cfg.getProperty("request.user.register.error"));
		if(errors != null) {
			for(String error : errors) {
				%>
				<p><%=error%></p>
				<%
			}
		}
		%>
	</div>
	<div id="divItemMusic" class="divItemMusic">
		<form action="" method="get">
				<fieldset style="margin-left: 30pt; padding-left: 10pt;">
					<legend>Thông Tài khoản</legend>
					<div style="margin-left: 30pt;">
						<table>
							<tr>
								<td class = "register-left-column">
									Tên đăng nhập<span style="color:red;">*</span>:
								</td>
								<td>
									<input type = "text" name="<%=cfg.getProperty("user.username")%>" value="<%=user.getUserName() %>" class="input-text"/>
								</td>
							</tr>
							<tr>
								<td class = "register-left-column">
									Mật khẩu<span style="color:red;">*</span>:
								</td>
								<td>
									<input type="password" name="<%=cfg.getProperty("user.password")%>" value="" class="input-text"/>
								</td>
							</tr>
							<tr>
								<td class = "register-left-column">
									Nhập lại mật khẩu<span style="color:red;">*</span>:
								</td>
								<td>
									<input type="password" name="<%=cfg.getProperty("user.password")%>2" value="" class="input-text"/>
								</td>
							</tr>
							<tr>
								<td class = "register-left-column">
									Email<span style="color:red;">*</span>:
								</td>
								<td>
									<input type = "text" name="<%=cfg.getProperty("user.email")%>" value="<%=user.getEmail() %>" class="input-text"/>
								</td>
							</tr>
							<tr>
								<td class = "register-left-column">
									Nhập lạ email<span style="color:red;">*</span>:
								</td>
								<td>
									<input type = "text" name="<%=cfg.getProperty("user.email")%>2" value="<%=user.getEmail2() %>" class="input-text"/>
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
				<fieldset style="margin-left: 30pt;padding-left: 10pt;">
					<legend>Thông tin người dùng</legend>
					<div style="margin-left: 30pt;">
						<table>
							<tr>
								<td class = "register-left-column">
									Họ và tên:
								</td>
								<td>
									<input type = "text" name="<%=cfg.getProperty("user.name")%>" value="<%=user.getName() %>" class="input-text"/>
								</td>
							</tr>
							<tr>
								<td class = "register-left-column">
									Địa chỉ:
								</td>
								<td>
									<input type = "text" name="<%=cfg.getProperty("user.address")%>" value="<%=user.getAddress() %>" class="input-text"/>
								</td>
							</tr>
							<tr>
								<td class = "register-left-column">
									Ngày sinh:
								</td>
								<td>
									<input type = "text" name="<%=cfg.getProperty("user.birthday")%>" value="<%=new Date(user.getBirthday())%>" class="input-text"/>
								</td>
							</tr>
							<tr>
								<td class = "register-left-column">
									Điện thoại:
								</td>
								<td>
									<input type = "text" name="<%=cfg.getProperty("user.mobile")%>" value="<%=user.getMobile() %>" class="input-text"/>
								</td>
							</tr>
							<tr>
								<td class = "register-left-column" valign="top">
									Sở thích
								</td>
								<td>
									<textarea name="<%=cfg.getProperty("user.favorite")%>" rows="7" cols="50" class="input-text" style="width: 300pt;">
										<%=user.getFavorite() %>
									</textarea>
								</td>
							</tr>
							<tr>
								<td colspan="2">&nbsp;</td>
							</tr>
						</table>
					</div>
				</fieldset>
				<br/>
				<div style="text-align: center;">
					<input type="submit" />
					<input type="reset"/>
				</div>
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
<%@ include file="include_html_footer.jsp" %>