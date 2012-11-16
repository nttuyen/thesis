/**
 * 
 */
package com.nttuyen.dao.query;

import java.util.List;

/**
 * Criteria
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
public interface Criteria {
	public static final String JOIN = "JOIN";
	public static final String INNER_JOIN = "INNER JOIN";
	public static final String LEFT_JOIN = "LEFT JOIN";
	public static final String RIGHT_JOIN = "RIGHT JOIN";
	public static final String FULL_JOIN = "FULL JOIN";
	
	public static final String ORDER_ASC = "ASC";
	public static final String ORDER_DESC = "DESC";
	
	public <T> List<T> list();
	
	public <T> List<T> list(Class<T> c);
	
	public Criteria addEntity(Class<?>... c);
	
	public Criteria joinEntity(Class<?> c, String type, String field1, String field2);
	
	public Criteria add(Restriction restriction);
	
	public Criteria limit(long start, int max);
}
