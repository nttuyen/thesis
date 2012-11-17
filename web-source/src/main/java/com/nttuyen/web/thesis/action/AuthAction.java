/**
 * 
 */
package com.nttuyen.web.thesis.action;

import java.util.LinkedList;
import java.util.Properties;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.nttuyen.persistence.PersistenceException;
import org.apache.log4j.Logger;
import com.nttuyen.persistence.Persistence;
import com.nttuyen.persistence.Persistences;
import com.nttuyen.thesis.model.User;
import com.nttuyen.thesis.recommendation.UserPersistence;
import com.nttuyen.thesis.util.Auth;
import com.nttuyen.web.core.Action;
import com.nttuyen.web.core.FormUtil;
import com.nttuyen.web.core.SystemLoader;

/**
 * @author nttuyen
 *
 */
public class AuthAction implements Action{
	Logger log = Logger.getLogger(AuthAction.class);
	
	
	public String execute(HttpServletRequest request,
			HttpServletResponse response, String... param) {
		// TODO Auto-generated method stub
		if(param.length < 1) {
			return null;
		}
		final Properties cfg = SystemLoader.systemConfig();
		String cmd = param[0];
		if("auth".equalsIgnoreCase(cmd)) {
			HttpSession session = request.getSession();
			System.out.println("SESSION: " + session.toString());
			Long userId = (Long)session.getAttribute(cfg.getProperty("session.user.id"));
			String userName = (String)session.getAttribute(cfg.getProperty("session.user.username"));
			if(userId != null && userName != null) {
				return "include_html_user_loged.jsp";
			}
		}
		if("login".equalsIgnoreCase(cmd)) {
			String userName = request.getParameter(cfg.getProperty("user.username"));
			String password = request.getParameter(cfg.getProperty("user.password"));
			log.info("login with username: '" + userName + "' and password: '" + password + "'");
			long id = 0;
			if((id = UserPersistence.login(userName, password)) != 0) {
				HttpSession session = request.getSession();
				session.setAttribute(cfg.getProperty("session.user.username"), userName);
				session.setAttribute(cfg.getProperty("session.user.id"), id);
				request.setAttribute(cfg.getProperty("request.completed.forward"), "Ban da dang nhap thanh cong");
				request.setAttribute(cfg.getProperty("html.title"), "Dang nhap thanh cong");
				return "forward.jsp";
			}
			return "include_html_login_form.jsp";
		}
		if("logout".equalsIgnoreCase(cmd)) {
			HttpSession session = request.getSession();
			session.removeAttribute(cfg.getProperty("session.user.username"));
			session.removeAttribute(cfg.getProperty("session.user.id"));
			request.setAttribute(cfg.getProperty("request.completed.forward"), "Ban da thoat khoi he thong");
			request.setAttribute(cfg.getProperty("html.title"), "logout");
			return "forward.jsp";
		}
		if("register".equalsIgnoreCase(cmd)) {
			return register(request, response);
		}
		
		if("profile".equalsIgnoreCase(cmd)) {
			return profile(request, response);
		}
		
		return "include_html_login_form.jsp";
	}
	
	private String profile(HttpServletRequest request, HttpServletResponse response) {
		final Properties cfg = SystemLoader.systemConfig();
		long userId = 0;
		String var = request.getParameter("id");
		try {
			userId = Long.parseLong(var);
		} catch(Exception e) {
			userId = 0;
		}
		if(userId == 0) {
			userId = Auth.user(request);
		}
		
		if(userId == 0) {
			return "include_html_login_form.jsp";
		}
		
		Persistence persistence = Persistences.getPersistence(cfg);
		if("GET".equalsIgnoreCase(request.getMethod())) {
			User user = persistence.getObjectByID(User.class, userId);
			request.setAttribute(cfg.getProperty("request.user.edit"), user);
			return "user_profile.jsp";
		}
		
		User user = new User();
		FormUtil.formToObject(request, user);
		
		user.setEmail2(user.getEmail());
		if("".equals(user.getPassword())) {
			User oldUser = persistence.getObjectByID(User.class, user.getId());
			user.setPassword(oldUser.getPassword());
			user.setPassword2(oldUser.getPassword());
		}
		String[] error = validateUser(user, true);
		if(error == null || error.length == 0) {
            try {
                persistence.save(user);
            } catch (PersistenceException e) {
                log.error("Save user exception", e);
            }

            request.setAttribute(cfg.getProperty("html.title"), "Edit profile completed");
			request.setAttribute(cfg.getProperty("request.completed.forward"), "Edit profile completed");
			return "forward.jsp";
		} else {
			request.setAttribute(cfg.getProperty("html.title"), "Profile");
			request.setAttribute(cfg.getProperty("request.user.register.error"), error);
			request.setAttribute(cfg.getProperty("request.user.edit"), user);
			return "user_profile.jsp";
		}
	}
	
	private String register(HttpServletRequest request, HttpServletResponse response) {
		String[] error = {};
		final Properties cfg = SystemLoader.systemConfig();
		System.out.println(cfg.getProperty("user.username"));
		String userName = (String)request.getParameter(cfg.getProperty("user.username"));
		if(userName == null) {
			request.setAttribute(cfg.getProperty("request.user.register.error"), error);
			return "user_register.jsp";
		}
		
		User user = new User();
		FormUtil.formToObject(request, user);
		System.out.println(user.getUserName());
		error = validateUser(user, false);
		if(error.length == 0) {
			
			Persistence persistence = Persistences.getPersistence(cfg);
            try {
                persistence.save(user);
            } catch (PersistenceException e) {
                log.error("Save user exception", e);
            }
			
			request.setAttribute(cfg.getProperty("html.title"), "Dang ky thanh cong");
			request.setAttribute(cfg.getProperty("request.completed.forward"), "Dang ky thanh cong");
			return "forward.jsp";
		} else {
			request.setAttribute(cfg.getProperty("html.title"), "Dang ky");
			request.setAttribute(cfg.getProperty("request.user.register.error"), error);
			request.setAttribute(cfg.getProperty("request.user.edit"), user);
			return "user_register.jsp";
		}
	}
	
	private String[] validateUser(User user, boolean isUpdate) {
		LinkedList<String> s = new LinkedList<String>();
		//Check userName
		String userName = user.getUserName();
		System.out.println(userName);
		if(!Pattern.matches("[A-Za-z0-9_]{6,30}", userName)) {
			s.add("username must only content: A-Z,a-z,0-9 and _");
		} else if(UserPersistence.checkUserNameExists(userName) && !isUpdate) {
			s.add("username is existed!");
		}
		
		//Check password
		String password1 = user.getPassword();
		String password2 = user.getPassword2();
		if(password1 == null || password1.length() < 6) {
			s.add("Your password must at least 6 character");
		} else if(!password1.equals(password2)) {
			s.add("password and repassword is not matches!");
		}
		
		//Check email
		String email1 = user.getEmail();
		String email2 = user.getEmail2();
		if(email1 == null) {
			s.add("You must enter email");
		} else if(email1 == null || !email1.equals(email2)) {
			s.add("Email not match");
		}
		
		if(s.size() > 0) {
			return s.toArray(new String[0]);
		}
		
		return new String[] {};
		
	}

}
