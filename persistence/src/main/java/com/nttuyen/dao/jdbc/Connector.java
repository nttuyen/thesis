/**
 * 
 */
package com.nttuyen.dao.jdbc;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * Manage connection!
 * 
 * @author nttuyen
 * @version 1.0
 * @since 09.09.2009
 */
public interface Connector {
	/**
	 * create Connection
	 * @return a connection
	 * @throws SQLException - if can't connect to DB or number connections is max!
	 */
	public Connection getConnection() throws SQLException;
	
	/**
	 * @return true if number connection is max. Else return false
	 */
	public boolean isFull();
}
