/**
 * 
 */
package com.nttuyen.thesis.util;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import com.nttuyen.web.core.SystemLoader;

import java.util.Properties;

/**
 * @author nttuyen
 *
 */
public class Auth {
	public static final int VIEW_ROLE = 1;
	public static final int EDIT_ROLE = 2;
	public static final int DELETE_ROLE = 4;
	
	public static final int VIEW_PERMISSION = 1;
	public static final int EDIT_PERMISSION = 2;
	
	public static boolean isLogin(HttpServletRequest req) {
		final Properties cfg = SystemLoader.systemConfig();
		HttpSession session = req.getSession();
		Long userId = (Long)session.getAttribute(cfg.getProperty("session.user.id"));
		String userName = (String)session.getAttribute(cfg.getProperty("session.user.username"));
		if(userId != null && userName != null) {
			return true;
		}
		return false;
	}
	public static long user(HttpServletRequest req) {
		long id = 0;
		if(!isLogin(req)) {
			return 0;
		}
		final Properties cfg = SystemLoader.systemConfig();
		HttpSession session = req.getSession();
		id = (Long)session.getAttribute(cfg.getProperty("session.user.id"));
		
		return id;
	}
	public static String userLogged(HttpServletRequest req) {
		if(!isLogin(req)) {
			return null;
		}
		final Properties cfg = SystemLoader.systemConfig();
		HttpSession session = req.getSession();
		String userName = (String)session.getAttribute(cfg.getProperty("session.user.username"));
		return userName;
	}
	public static boolean hasPermission(HttpServletRequest req, int permission){
		if(!isLogin(req)) {
			return false;
		}
		
		return true;
	}
}
