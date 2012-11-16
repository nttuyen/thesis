/**
 * 
 */
package com.nttuyen.web.core;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


/**
 * @author nttuyen
 *
 */
public interface Action {
	public String execute(HttpServletRequest request, HttpServletResponse response, String... param);
}
