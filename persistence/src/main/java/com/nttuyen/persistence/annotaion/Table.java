/**
 * 
 */
package com.nttuyen.persistence.annotaion;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * {@link Annotation} map a class of object with table in database
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface Table {
	/**
	 * Table name in database
	 * @return
	 */
	public String name();
}
