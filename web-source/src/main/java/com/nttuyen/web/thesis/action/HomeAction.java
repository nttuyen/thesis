/**
 * 
 */
package com.nttuyen.web.thesis.action;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.nttuyen.web.core.Action;

/**
 * @author nttuyen
 *
 */
public class HomeAction implements Action{

	
	public String execute(HttpServletRequest request,
			HttpServletResponse response, String... param) {
		return "home.jsp";
	}
	
}
