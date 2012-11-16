package com.nttuyen.web.core;

import java.io.IOException;
import java.util.Properties;
import java.util.regex.Pattern;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;

/**
 * Servlet implementation class ActionServlet
 */
public class ActionServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static final Logger log = Logger.getLogger(ActionServlet.class);
	private Properties config = null;
	private String actionPrefix = "";
	private String errorOutput = "";
	private String postfix = "";
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ActionServlet() {
        super();
    }

	/**
	 * @see javax.servlet.Servlet#init(ServletConfig)
	 */
	@Override
    public void init(ServletConfig conf) throws ServletException {
		// TODO init servlet
		super.init(conf);
		this.config = SystemLoader.systemConfig();
		this.actionPrefix = config.getProperty("action.prefix");
		this.errorOutput = config.getProperty("action.error.output");
		this.postfix = config.getProperty("action.postfix");
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		//String url = request.getRequestURL().toString();
		String uri = request.getRequestURI();
		//uri = url.replaceFirst(config.getProperty("site.url").trim(), "");
        uri = uri.substring(request.getContextPath().length());
		log.info("Request: " + uri);
		StringBuilder stringBuilder = new StringBuilder(uri);
		int last = stringBuilder.lastIndexOf("." + this.postfix);
		if(last > 0) {
			stringBuilder.replace(last, stringBuilder.length(), "");
			uri = stringBuilder.toString();
		}
		
		Pattern p = Pattern.compile("/");
		String[] elements = p.split(uri);
		String actionString = "";
		
		for(int i = 2; i < elements.length; i++) {
			actionString += "/" + elements[i];
		}
		String action = "";
		String[] param = new String[0];
		
		if(actionString.equals("")) {
			action = "default";
		} else {
			String[] actions = p.split(actionString);
			if(actions.length > 1) {
				action = actions[1];
			}
			if(actions.length > 2) {
				param = new String[actions.length - 2];
				int index = 0;
				for(int i = 2; i < actions.length; i++) {
					param[index++] = actions[i];
				}
			}
		}
		if(action.equals("")) {
			action = "default";
		}
		
		action = actionPrefix + "." + action;
		
		String actionClass = config.getProperty(action, null);
		if(actionClass == null) {
			log.error("Action " + action + " is not configured!");
			RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(this.errorOutput);
			dispatcher.forward(request, response);
			return;
		}
		
		Action act = ActionLoader.loadAction(actionClass);
		if(act != null) {
			String forward = act.execute(request, response, param);
			if(forward == null || forward == "") {
				forward = this.errorOutput;
			}
			forward = this.config.get("system.theme")  + forward;
			RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(forward);
			dispatcher.forward(request, response);
		} else {
			log.error("Action: '" + action + "' is NULL");
			RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(this.errorOutput);
			dispatcher.forward(request, response);
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}
