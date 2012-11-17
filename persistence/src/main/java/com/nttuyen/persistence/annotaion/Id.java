/**
 * 
 */
package com.nttuyen.persistence.annotaion;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * {@link Annotation} map an field of object with column in database,
 * and this column is primary key
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface Id {
	/**
	 * Name of primary key (column)
	 * @return
	 */
	String name() default "id";
}
