/**
 * 
 */
package com.nttuyen.dao.jdbc;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.*;

import org.apache.log4j.Logger;

/**
 * Use pool to implement {@link Connector}
 * This class use proxy to manage close method of connection!
 * @author nttuyen
 * @version 1.0
 * @since 29.01.2010
 */
public class ConnectionPool implements Connector {
	private static final Logger log = Logger.getLogger(ConnectionPool.class);
	
	/**
	 * Connections is used
	 */
	private final List<Connection> connections = new LinkedList<Connection>();
	/**
	 * Connections is queue to use
	 */
	private final List<Connection> free = new LinkedList<Connection>();
	/**
	 * Config object that contain all infomation that is used to open connection with database
	 * Config object contain:
	 * - database_driver
	 * - database_url
	 * - database_user
	 * - database_password
	 */
	private final Properties cfg;
	/**
	 * Max connection
	 */
	private final int max;
	//private final int timeout;
	
	//Map object config contain connection
	private static final Map<Properties, ConnectionPool> map = new HashMap<Properties, ConnectionPool>();
	
	/**
	 * Constructor
	 * @param cfg
	 */
	private ConnectionPool(Properties cfg) {
		if(cfg == null) {
			throw new NullPointerException();
		}
		this.cfg = cfg;
		try {
			//this.timeout = Integer.parseInt(cfg.get("database_timeout", "0"));
		} catch (Exception e) {
			throw new IllegalArgumentException("Config is not contain timeout");
		}
		try {
			this.max = Integer.parseInt(cfg.getProperty("database_max_connection", "20"));
		} catch (Exception e) {
			throw new IllegalArgumentException("Config is not contain max connection");
		}
	}

	/**
	 * Get a connection pool pool by cofig
	 * @param cfg
	 * @return
	 */
	public static ConnectionPool getInstance(Properties cfg) {
		if(map.get(cfg) != null) {
			return map.get(cfg);
		}
		ConnectionPool pool = new ConnectionPool(cfg);
		map.put(cfg, pool);
		return pool;
	}
	
	/**
	 * get Connection
	 * @see Connector
	 */
	public synchronized Connection getConnection() throws SQLException {
		//Check null connection or connection closed
		for(Connection con : connections) {
			if(con == null || con.isClosed()) {
				connections.remove(con);
			}
		}
		
		if(this.connections.size() > max && max > 0) {
			throw new SQLException("Too many connections");
		}
		
		Connection connection = null;
		if(free.size() > 0) {
			connection = free.get(0);
			free.remove(0);
		}
		if(connection == null || connection.isClosed()) {
			//Open new connection
			connection = connectDB();
		}
		
		if(connection == null) {
			throw new SQLException("Connectin failure");
		}
		
		connections.add(connection);
		log.info("No of connection: " + connections.size());
		
		InvocationHandler hander = new ConnectionHandler(connection);
		return (Connection)Proxy.newProxyInstance(Connection.class.getClassLoader(), new Class[] {Connection.class}, hander);
	}
	
	/**
	 * Connect to database server and open new connection
	 * @return
	 */
	private synchronized Connection connectDB() {
		try {
			Class.forName(cfg.getProperty("database_driver", "com.mysql.jdbc.Driver").trim()).newInstance();
			
			log.info("Connect to DB:" + cfg.get("database_url"));
			
			Connection connection = DriverManager.getConnection(cfg.getProperty("database_url", "jdbc:mysql://localhost/test").trim(), cfg.getProperty("database_user", "root").trim(), cfg.getProperty("database_password", "").trim());
			return connection;
		} catch (ClassNotFoundException e) {
			log.error("Driver Class not found", e);
		} catch (InstantiationException e) {
			log.error("Can't create instace of Driver class", e);
		} catch (IllegalAccessException e) {
			log.error("Elegal access exception in load Driver class", e);
		} catch (SQLException e) {
			log.error("Can't connecto to DB", e);
		}
		return null;
	}
	
	
	/**
	 * A Hander to manage close method of connection
	 * @author nttuyen
	 * @version 1.0
	 * @since 29.01.2010
	 */
	private class ConnectionHandler implements InvocationHandler {
		private Connection connection;
		private List<PreparedStatement> statements = new LinkedList<PreparedStatement>();
		public ConnectionHandler(Connection connection) {
			this.connection = connection;
		}
		
		public Object invoke(Object proxy, Method method, Object[] args)
				throws Throwable {
			if(method.getName().equalsIgnoreCase("close")) {
				//Free its PreparedStatement
				for(PreparedStatement stm : statements) {
					stm.close();
				}
				statements.clear();
				
				log.info("Free connection");
				connections.remove(this.connection);
				free.add(this.connection);
				return null;
			}
			if(method.getName().equalsIgnoreCase("prepareStatement")) {
				if(this.connection == null || this.connection.isClosed() || free.contains(this.connection)) {
					this.connection = getConnection();
				}
				PreparedStatement stm = (PreparedStatement) method.invoke(this.connection, args);
				statements.add(stm);
				return stm;
			}
			return method.invoke(this.connection, args);
		}
	}
	

	/**
	 * Check full connection
	 */
	public synchronized boolean isFull() {
		return (max > 0 && connections.size() >= max);
	}
}
