/**
 * 
 */
package com.nttuyen.dao.query;

/**
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
public interface Restriction {
	public static final String WHERE = "where";
	public static final String ORDER = "order";
	public static final String GROUP_BY = "group_by";
	public static final String HAVING = "having";
	
	public String type();
	public String sql();
	public Object[] values();
}
