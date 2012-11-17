/**
 * 
 */
package com.nttuyen.persistence.jdbc;

import java.util.Properties;

/**
 * Connector factory
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
public class ConnectorFactory {
	
	public static Connector createConnector(Properties cfg) {
		return ConnectionPool.getInstance(cfg);
	}
}
