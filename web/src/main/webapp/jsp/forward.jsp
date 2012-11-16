<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<%@page import="java.util.Properties"%>
<%@page import="com.nttuyen.web.core.SystemLoader"%><html>
<%!
final Properties cfg = SystemLoader.systemConfig();
final String SITE_URL = cfg.getProperty("site.url");
%>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<%String forward =  (String)request.getAttribute(cfg.getProperty("request.site.forward"));
if(forward != null) {
	forward = ";url=" + forward;
} else {
	forward = ";url=" + SITE_URL;
}
%> 
<meta http-equiv="refresh" content="0<%=forward%>" />
<title><%=(String)request.getAttribute(cfg.getProperty("html.title"))%></title>
</head>
<body>
<%=(String)request.getAttribute(cfg.getProperty("request.completed.forward"))%>
</body>
</html>