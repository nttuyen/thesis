/**
 * 
 */
package com.nttuyen.persistence;

/**
 * @author nttuyen
 *
 */
public class PersistenceException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/**
	 * 
	 */
	public PersistenceException() {
	}

	/**
	 * @param arg0
	 */
	public PersistenceException(String arg0) {
		super(arg0);
	}

	/**
	 * @param arg0
	 */
	public PersistenceException(Throwable arg0) {
		super(arg0);
	}

	/**
	 * @param arg0
	 * @param arg1
	 */
	public PersistenceException(String arg0, Throwable arg1) {
		super(arg0, arg1);
	}

}
