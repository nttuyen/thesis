/**
 * 
 */
package com.nttuyen.web.core;

import org.apache.log4j.Logger;

/**
 * @author nttuyen
 *
 */
public class ActionLoader {
	private static final Logger log = Logger.getLogger(ActionLoader.class);

	public static Action loadAction(String action) {
		Action a = null;
		try {
			a = (Action)Class.forName(action).newInstance();
		} catch (InstantiationException e) {
			log.error("InstantiationException", e);
			return null;
		} catch (IllegalAccessException e) {
			log.error("IllegalAccessException", e);
			return null;
		} catch (ClassNotFoundException e) {
			log.error("ClassNotFoundException", e);
			return null;
		}
		return a;
	}
}
