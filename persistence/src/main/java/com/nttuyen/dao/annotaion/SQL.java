/**
 * 
 */
package com.nttuyen.dao.annotaion;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author nttuyen
 * @version 1.0
 * @since 30.01.2010
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface SQL {
	public static final int RETURN_VOID = 1;
	public static final int RETURN_OBJECT = 2;
	public static final int RETURN_LIST = 3;
	public String sql();
	public Class<?> retClass() default Object.class;
}
