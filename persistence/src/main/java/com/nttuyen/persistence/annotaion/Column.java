/**
 * 
 */
package com.nttuyen.persistence.annotaion;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * {@link Annotation} to mapping a field of object with column in database
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface Column {
	/**
	 * Column name in database
	 * @return
	 */
	public String name();
}
