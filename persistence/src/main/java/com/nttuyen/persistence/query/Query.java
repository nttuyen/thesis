/**
 * 
 */
package com.nttuyen.persistence.query;

import java.sql.ResultSet;
import java.util.List;

/**
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
public interface Query {
	public <T> List<T> list(Class<T> c);
}
